<?php
session_start();
require_once '../../src/config/database.php';

header('Content-Type: application/json');

$response = [
    'authenticated' => false,
    'user' => null
];

if (isset($_SESSION['user_id'])) {
    try {
        $database = new Database();
        $db = $database->getConnection();

        $stmt = $db->prepare("SELECT id, username, email, role FROM users WHERE id = :id");
        $stmt->execute([':id' => $_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $response['authenticated'] = true;
            $response['user'] = $user;
        }
    } catch(PDOException $e) {
        // Log error but don't expose it to the client
    }
}

echo json_encode($response); 