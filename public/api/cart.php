<?php
header('Content-Type: application/json');
session_start();
require_once '../../src/config/database.php';

// Debug: log session and POST data
file_put_contents(__DIR__ . '/../cart_debug.log', "\n==== " . date('c') . " ====\n" . print_r([
    '_SESSION' => $_SESSION,
    '_POST' => $_POST,
    'php://input' => file_get_contents('php://input')
], true), FILE_APPEND);

// Initialize session cart if not exists
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

$database = new Database();
$db = $database->getConnection();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Get cart items from session
        try {
            $items = [];
            foreach ($_SESSION['cart'] as $productId => $quantity) {
                $stmt = $db->prepare("SELECT id, name, price, image_url FROM products WHERE id = :id");
                $stmt->execute([':id' => $productId]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($product) {
                    $items[] = [
                        'id' => $product['id'],
                        'quantity' => $quantity,
                        'name' => $product['name'],
                        'price' => $product['price'],
                        'image_url' => $product['image_url']
                    ];
                }
            }
            echo json_encode($items);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error fetching cart items']);
        }
        break;

    case 'POST':
        // Add item to cart in session
        $data = json_decode(file_get_contents('php://input'), true);
        $productId = $data['productId'] ?? null;
        $quantity = $data['quantity'] ?? 1;

        if (!$productId) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID is required']);
            exit;
        }

        try {
            if (isset($_SESSION['cart'][$productId])) {
                $_SESSION['cart'][$productId] += $quantity;
            } else {
                $_SESSION['cart'][$productId] = $quantity;
            }

            // Return updated cart
            $items = [];
            foreach ($_SESSION['cart'] as $productId => $quantity) {
                $stmt = $db->prepare("SELECT id, name, price, image_url FROM products WHERE id = :id");
                $stmt->execute([':id' => $productId]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($product) {
                    $items[] = [
                        'id' => $product['id'],
                        'quantity' => $quantity,
                        'name' => $product['name'],
                        'price' => $product['price'],
                        'image_url' => $product['image_url']
                    ];
                }
            }
            echo json_encode($items);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error updating cart']);
        }
        break;

    case 'PUT':
        // Update item quantity in session
        $data = json_decode(file_get_contents('php://input'), true);
        $productId = $data['productId'] ?? null;
        $quantity = $data['quantity'] ?? 1;

        if (!$productId) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID is required']);
            exit;
        }

        try {
            $_SESSION['cart'][$productId] = $quantity;

            // Return updated cart
            $items = [];
            foreach ($_SESSION['cart'] as $productId => $quantity) {
                $stmt = $db->prepare("SELECT id, name, price, image_url FROM products WHERE id = :id");
                $stmt->execute([':id' => $productId]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($product) {
                    $items[] = [
                        'id' => $product['id'],
                        'quantity' => $quantity,
                        'name' => $product['name'],
                        'price' => $product['price'],
                        'image_url' => $product['image_url']
                    ];
                }
            }
            echo json_encode($items);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error updating cart']);
        }
        break;

    case 'DELETE':
        // Remove item from cart in session
        $productId = $_GET['productId'] ?? null;

        if (!$productId) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID is required']);
            exit;
        }

        try {
            unset($_SESSION['cart'][$productId]);

            // Return updated cart
            $items = [];
            foreach ($_SESSION['cart'] as $productId => $quantity) {
                $stmt = $db->prepare("SELECT id, name, price, image_url FROM products WHERE id = :id");
                $stmt->execute([':id' => $productId]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($product) {
                    $items[] = [
                        'id' => $product['id'],
                        'quantity' => $quantity,
                        'name' => $product['name'],
                        'price' => $product['price'],
                        'image_url' => $product['image_url']
                    ];
                }
            }
            echo json_encode($items);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error removing item from cart']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?> 