<?php
require_once '../src/config/database.php';
$database = new Database();
$db = $database->getConnection();
$hashed_password = password_hash('pass', PASSWORD_DEFAULT);
$stmt = $db->prepare("UPDATE users SET password = :password WHERE email = :email");
$stmt->execute([':password' => $hashed_password, ':email' => 'admin@grocerystore.com']);
echo "Password updated!<br>";
echo "Hash used: " . $hashed_password;
?> 