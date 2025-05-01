<?php
header('Content-Type: application/json');
require_once '../../src/config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT * FROM products";
    $params = [];

    if (isset($_GET['category']) && isset($_GET['subcategory'])) {
        $query .= " WHERE category = :category AND subcategory = :subcategory";
        $params[':category'] = $_GET['category'];
        $params[':subcategory'] = $_GET['subcategory'];
    }

    $stmt = $db->prepare($query);
    $stmt->execute($params);

    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert price to float
    foreach ($products as &$product) {
        $product['price'] = (float)$product['price'];
    }

    echo json_encode($products);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?> 