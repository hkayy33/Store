<?php
ini_set('session.gc_maxlifetime', 1800);
session_set_cookie_params(1800);
session_start();
require_once __DIR__ . '/../../../src/config/database.php';

header('Content-Type: application/json');

$response = [
    'authenticated' => false,
    'user' => null
];

if (isset($_SESSION['customer_id'])) {
    try {
        $database = new Database();
        $db = $database->getConnection();

        $stmt = $db->prepare("SELECT id, name, phone, email, created_at FROM customers WHERE id = :id");
        $stmt->execute([':id' => $_SESSION['customer_id']]);
        $customer = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($customer) {
            $response['authenticated'] = true;
            $response['user'] = $customer;
        }
    } catch(PDOException $e) {
        // Log error but don't expose it to the client
    }
}

echo json_encode($response); 