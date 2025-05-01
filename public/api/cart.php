<?php
header('Content-Type: application/json');
session_start();
require_once '../../src/config/database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Get cart items
        try {
            $stmt = $db->prepare("
                SELECT c.id, c.quantity, p.name, p.price, p.image_url
                FROM cart c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = :user_id
            ");
            $stmt->execute([':user_id' => $_SESSION['user_id']]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($items);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error fetching cart items']);
        }
        break;

    case 'POST':
        // Add item to cart
        $data = json_decode(file_get_contents('php://input'), true);
        $productId = $data['productId'] ?? null;
        $quantity = $data['quantity'] ?? 1;

        if (!$productId) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID is required']);
            exit;
        }

        try {
            // Check if item already exists in cart
            $stmt = $db->prepare("
                SELECT id, quantity FROM cart 
                WHERE user_id = :user_id AND product_id = :product_id
            ");
            $stmt->execute([
                ':user_id' => $_SESSION['user_id'],
                ':product_id' => $productId
            ]);
            $existingItem = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($existingItem) {
                // Update quantity
                $stmt = $db->prepare("
                    UPDATE cart 
                    SET quantity = quantity + :quantity 
                    WHERE id = :id
                ");
                $stmt->execute([
                    ':quantity' => $quantity,
                    ':id' => $existingItem['id']
                ]);
            } else {
                // Add new item
                $stmt = $db->prepare("
                    INSERT INTO cart (user_id, product_id, quantity)
                    VALUES (:user_id, :product_id, :quantity)
                ");
                $stmt->execute([
                    ':user_id' => $_SESSION['user_id'],
                    ':product_id' => $productId,
                    ':quantity' => $quantity
                ]);
            }

            // Return updated cart
            $stmt = $db->prepare("
                SELECT c.id, c.quantity, p.name, p.price, p.image_url
                FROM cart c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = :user_id
            ");
            $stmt->execute([':user_id' => $_SESSION['user_id']]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($items);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error updating cart']);
        }
        break;

    case 'PUT':
        // Update item quantity
        $data = json_decode(file_get_contents('php://input'), true);
        $productId = $data['productId'] ?? null;
        $quantity = $data['quantity'] ?? 1;

        if (!$productId) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID is required']);
            exit;
        }

        try {
            $stmt = $db->prepare("
                UPDATE cart 
                SET quantity = :quantity 
                WHERE user_id = :user_id AND product_id = :product_id
            ");
            $stmt->execute([
                ':quantity' => $quantity,
                ':user_id' => $_SESSION['user_id'],
                ':product_id' => $productId
            ]);

            // Return updated cart
            $stmt = $db->prepare("
                SELECT c.id, c.quantity, p.name, p.price, p.image_url
                FROM cart c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = :user_id
            ");
            $stmt->execute([':user_id' => $_SESSION['user_id']]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($items);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error updating cart']);
        }
        break;

    case 'DELETE':
        // Remove item from cart
        $productId = $_GET['productId'] ?? null;

        if (!$productId) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID is required']);
            exit;
        }

        try {
            $stmt = $db->prepare("
                DELETE FROM cart 
                WHERE user_id = :user_id AND product_id = :product_id
            ");
            $stmt->execute([
                ':user_id' => $_SESSION['user_id'],
                ':product_id' => $productId
            ]);

            // Return updated cart
            $stmt = $db->prepare("
                SELECT c.id, c.quantity, p.name, p.price, p.image_url
                FROM cart c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = :user_id
            ");
            $stmt->execute([':user_id' => $_SESSION['user_id']]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
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