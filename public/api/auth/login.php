<?php
ini_set('session.gc_maxlifetime', 1800);
session_set_cookie_params(1800);
session_start();
require_once __DIR__ . '/../../../src/config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$captcha = $data['captcha'] ?? '';

if (empty($email) || empty($password) || empty($captcha)) {
    echo json_encode(['success' => false, 'error' => 'Email, password and CAPTCHA are required']);
    exit;
}

// Validate CAPTCHA
if (!isset($_SESSION['captcha']) || $captcha != $_SESSION['captcha']) {
    echo json_encode(['success' => false, 'error' => 'Invalid CAPTCHA']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $stmt = $db->prepare("SELECT id, name, phone, email, password, created_at FROM customers WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $customer = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($customer && password_verify($password, $customer['password'])) {
        $_SESSION['customer_id'] = $customer['id'];
        // Remove password from response
        unset($customer['password']);
        echo json_encode([
            'success' => true,
            'customer' => $customer
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid email or password']);
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'An error occurred during login']);
} 