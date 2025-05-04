<?php
require_once '../src/config/database.php';

$database = new Database();
$db = $database->getConnection();

// Admin credentials
$admin_username = "admin";
$admin_email = "admin@grocerystore.com";
$admin_password = "pass"; // This will be hashed
$admin_role = "admin";

try {
    // Delete any existing admin with this email
    $stmt = $db->prepare("DELETE FROM users WHERE email = :email");
    $stmt->execute([':email' => $admin_email]);

    // Create admin user
    $hashed_password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // hash for 'pass'
    $stmt = $db->prepare("
        INSERT INTO users (username, email, password, role) 
        VALUES (:username, :email, :password, :role)
    ");
    $stmt->execute([
        ':username' => $admin_username,
        ':email' => $admin_email,
        ':password' => $hashed_password,
        ':role' => $admin_role
    ]);
    
    echo "Admin account created successfully!<br>";
    echo "Email: " . $admin_email . "<br>";
    echo "Password: " . $admin_password . "<br>";
    echo "<a href='login.php'>Go to Login</a>";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?> 