<?php
// Registration page: Handles new user registration with security best practices
// Set HTTP security headers
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: no-referrer');

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '',
    'secure' => isset($_SERVER['HTTPS']), // Only send cookie over HTTPS
    'httponly' => true, // Prevent JavaScript access to session cookie
    'samesite' => 'Lax', // Mitigate CSRF
]);
session_start();
require_once '../src/config/database.php';

// Session timeout for inactivity (30 minutes)
$timeout = 1800;
if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > $timeout)) {
    session_unset();
    session_destroy();
    header('Location: login.php');
    exit;
}
$_SESSION['LAST_ACTIVITY'] = time();

// Generate a CSRF token if not present
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

if (isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit;
}

// Rate limiting: limit registration attempts per session
if (!isset($_SESSION['register_attempts'])) $_SESSION['register_attempts'] = 0;
if ($_SESSION['register_attempts'] > 10) {
    $error = 'Too many registration attempts. Please try again later.';
} else {
    $error = '';
    $success = '';

    // Handle registration form submission
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // CSRF token check
        if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
            $error = 'Invalid session. Please refresh and try again.';
            $_SESSION['register_attempts']++;
        } else {
            $database = new Database();
            $db = $database->getConnection();

            // Retrieve and sanitise input fields
            $username = trim(filter_var($_POST['username'] ?? '', FILTER_SANITIZE_STRING));
            $email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
            $password = $_POST['password'] ?? '';
            $confirm_password = $_POST['confirm_password'] ?? '';

            // Validate input fields
            if (empty($username) || empty($email) || empty($password) || empty($confirm_password)) {
                $error = 'Please fill in all fields';
                $_SESSION['register_attempts']++;
            } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $error = 'Invalid email address';
                $_SESSION['register_attempts']++;
            } elseif ($password !== $confirm_password) {
                $error = 'Passwords do not match';
                $_SESSION['register_attempts']++;
            } elseif (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\d]).{8,}$/', $password)) {
                $error = 'Password must be at least 8 characters and include upper/lowercase, a number, and a symbol.';
                $_SESSION['register_attempts']++;
            } else {
                // Check if the email or username already exists
                try {
                    $stmt = $db->prepare("SELECT id FROM users WHERE email = :email OR username = :username");
                    $stmt->execute([':email' => $email, ':username' => $username]);
                    if ($stmt->fetch()) {
                        $error = 'Email or username already exists';
                        $_SESSION['register_attempts']++;
                    } else {
                        // Hash the password securely
                        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                        // Insert the new user into the database
                        $stmt = $db->prepare("INSERT INTO users (username, email, password, role) VALUES (:username, :email, :password, 'user')");
                        $stmt->execute([
                            ':username' => $username,
                            ':email' => $email,
                            ':password' => $hashed_password
                        ]);
                        $success = 'Registration successful! You may now <a href="login.php">log in</a>.';
                        $_SESSION['register_attempts'] = 0;
                    }
                } catch (PDOException $e) {
                    error_log($e->getMessage(), 3, __DIR__ . '/../logs/error.log');
                    $error = 'A server error occurred. Please try again later.';
                    $_SESSION['register_attempts']++;
                }
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - Grocery Store</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="css/style.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <div class="form-container">
            <h2 class="text-center mb-4">Register</h2>
            
            <?php if ($error): ?>
                <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            
            <?php if ($success): ?>
                <div class="alert alert-success"><?php echo $success; ?></div>
            <?php endif; ?>

            <!-- Registration form with CSRF protection -->
            <form method="POST" action="register.php">
                <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token']); ?>">
                <div class="mb-3">
                    <label for="username" class="form-label">Username</label>
                    <input type="text" class="form-control" id="username" name="username" required>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" name="email" required>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" name="password" required>
                </div>
                <div class="mb-3">
                    <label for="confirm_password" class="form-label">Confirm Password</label>
                    <input type="password" class="form-control" id="confirm_password" name="confirm_password" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">Register</button>
            </form>
            
            <div class="text-center mt-3">
                <p>Already have an account? <a href="login.php">Login here</a></p>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html> 