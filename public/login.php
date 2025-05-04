<?php
// Login page: Handles user authentication and session management with security best practices
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

// Rate limiting: limit login attempts per session
if (!isset($_SESSION['login_attempts'])) $_SESSION['login_attempts'] = 0;
if ($_SESSION['login_attempts'] > 10) {
    $error = 'Too many login attempts. Please try again later.';
} else {
    // If the user is already logged in, redirect based on their role
    if (isset($_SESSION['user_id'])) {
        if ($_SESSION['role'] === 'admin') {
            header('Location: manager.php');
        } else {
            header('Location: index.php');
        }
        exit;
    }

    $error = '';

    // Handle login form submission
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // CSRF token check
        if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
            $error = 'Invalid session. Please refresh and try again.';
            $_SESSION['login_attempts']++;
        } else {
            $database = new Database();
            $db = $database->getConnection();

            // Retrieve and sanitise email and password from the form
            $email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
            $password = $_POST['password'] ?? '';

            // Validate input fields
            if (empty($email) || empty($password)) {
                $error = 'Please fill in all fields';
                $_SESSION['login_attempts']++;
            } else {
                // Look up the user by email
                try {
                    $stmt = $db->prepare("SELECT * FROM users WHERE email = :email");
                    $stmt->execute([':email' => $email]);
                    $user = $stmt->fetch(PDO::FETCH_ASSOC);
                } catch (PDOException $e) {
                    error_log($e->getMessage(), 3, __DIR__ . '/../logs/error.log');
                    $error = 'A server error occurred. Please try again later.';
                    $_SESSION['login_attempts']++;
                    $user = false;
                }

                // Verify the password using PHP's password_verify
                if ($user && password_verify($password, $user['password'])) {
                    // Regenerate session ID to prevent session fixation
                    session_regenerate_id(true);
                    // Set session variables for the logged-in user
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['username'] = $user['username'];
                    $_SESSION['role'] = $user['role'];
                    $_SESSION['login_attempts'] = 0; // Reset on success
                    // Redirect based on user role
                    if ($user['role'] === 'admin') {
                        header('Location: manager.php');
                    } else {
                        header('Location: index.php');
                    }
                    exit;
                } else {
                    $error = 'Invalid email or password';
                    $_SESSION['login_attempts']++;
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
    <title>Login - Grocery Store</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="css/style.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <div class="form-container">
            <h2 class="text-center mb-4">Login</h2>
            
            <?php if (!empty($error)): ?>
                <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>

            <!-- Login form for user authentication with CSRF protection -->
            <form method="POST" action="login.php">
                <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token']); ?>">
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" name="email" required>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" name="password" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">Login</button>
            </form>
            
            <div class="text-center mt-3">
                <p>Don't have an account? <a href="register.php">Register here</a></p>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html> 