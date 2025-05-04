<?php
// Orders API endpoint: Handles order creation (POST) and order detail retrieval (GET for admin)
header('Content-Type: application/json');
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: no-referrer');

session_start();
$database = new Database();
$db = $database->getConnection();

// Rate limiting: limit order placement attempts per session
if (!isset($_SESSION['order_attempts'])) $_SESSION['order_attempts'] = 0;

// Handle order creation (POST) for logged-in users
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Only allow logged-in users to place orders
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Please log in to place an order']);
        exit;
    }
    // Block if too many attempts
    if ($_SESSION['order_attempts'] > 20) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many order attempts. Please try again later.']);
        exit;
    }
    $user_id = $_SESSION['user_id'];
    $data = json_decode(file_get_contents('php://input'), true);
    $cart = $data['cart'] ?? [];
    $total = $data['total'] ?? 0;
    $address = $data['address'] ?? null;
    $delivery = $data['delivery'] ?? 'standard';

    // Validate required fields
    if (empty($cart) || !$address) {
        http_response_code(400);
        echo json_encode(['error' => 'Cart and address are required']);
        $_SESSION['order_attempts']++;
        exit;
    }

    try {
        // Insert the order into the orders table
        $stmt = $db->prepare("INSERT INTO orders (user_id, order_date, status, total_amount) VALUES (?, NOW(), 'pending', ?)");
        $stmt->execute([$user_id, $total]);
        $order_id = $db->lastInsertId();

        // Insert each item in the cart into the order_items table
        $itemStmt = $db->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
        foreach ($cart as $item) {
            $itemStmt->execute([$order_id, $item['id'], $item['quantity'], $item['price']]);
        }

        // Note: Address and delivery info could be saved in a separate table or as JSON if needed

        echo json_encode(['success' => true, 'order_id' => $order_id]);
        $_SESSION['order_attempts'] = 0; // Reset on success
    } catch (PDOException $e) {
        error_log($e->getMessage(), 3, __DIR__ . '/../logs/error.log');
        http_response_code(500);
        echo json_encode(['error' => 'Database error: Please try again later.']);
        $_SESSION['order_attempts']++;
    }
    exit;
}

// Handle order detail retrieval (GET) for admin users
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized access']);
        exit;
    }
    // Get order ID from query parameters
    $order_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($order_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid order ID']);
        exit;
    }

    try {
        // Fetch order details
        $stmt = $db->prepare("
            SELECT o.*, u.username, u.email 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            WHERE o.id = ?
        ");
        $stmt->execute([$order_id]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found']);
            exit;
        }

        // Fetch order items
        $stmt = $db->prepare("
            SELECT oi.*, p.name as product_name, p.category, p.subcategory 
            FROM order_items oi 
            JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id = ?
        ");
        $stmt->execute([$order_id]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Combine order and items data
        $response = [
            'order' => $order,
            'items' => $items
        ];

        echo json_encode($response);
    } catch (PDOException $e) {
        error_log($e->getMessage(), 3, __DIR__ . '/../logs/error.log');
        http_response_code(500);
        echo json_encode(['error' => 'Database error: Please try again later.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} 