<?php
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header('Location: login.php');
    exit;
}
require_once '../src/config/database.php';
$database = new Database();
$db = $database->getConnection();

// Fetch all orders with customer info
$orders = [];
try {
    $stmt = $db->prepare("SELECT o.*, u.username, u.email FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.order_date DESC");
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $orders = [];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manager Dashboard - Order Management</title>
    <link rel="stylesheet" href="css/styles.css">
    <style>
        .order-container {
            max-width: 1200px;
            margin: 20px auto;
            padding: 20px;
        }
        .orders-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .orders-table th, .orders-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .orders-table th {
            background: #f4f4f4;
        }
        .orders-table tr:hover {
            background: #f1f1f1;
        }
        .search-box {
            margin-bottom: 20px;
        }
        .search-box input {
            padding: 8px;
            width: 300px;
            margin-right: 10px;
        }
        .search-box button {
            padding: 8px 15px;
            background-color: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
        }
        .order-details {
            border: 1px solid #ddd;
            padding: 20px;
            margin-bottom: 20px;
            display: none;
        }
        .order-items {
            margin-top: 20px;
        }
        .order-item {
            border-bottom: 1px solid #eee;
            padding: 10px 0;
        }
        .error-message {
            color: red;
            margin: 10px 0;
        }
        .clickable-row { cursor: pointer; }
    </style>
</head>
<body>
    <div class="order-container">
        <h1>Order Management</h1>
        <h2>All Orders</h2>
        <table class="orders-table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($orders as $order): ?>
                <tr class="clickable-row" onclick="fetchOrderDetails(<?php echo $order['id']; ?>)">
                    <td><?php echo htmlspecialchars($order['id']); ?></td>
                    <td><?php echo htmlspecialchars($order['username']); ?></td>
                    <td><?php echo htmlspecialchars($order['email']); ?></td>
                    <td><?php echo htmlspecialchars($order['order_date']); ?></td>
                    <td><?php echo htmlspecialchars($order['status']); ?></td>
                    <td>$<?php echo htmlspecialchars($order['total_amount']); ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <div class="search-box">
            <input type="number" id="orderId" placeholder="Enter Order ID">
            <button onclick="fetchOrderDetails()">Search Order</button>
        </div>
        <div id="errorMessage" class="error-message"></div>
        <div id="orderDetails" class="order-details">
            <h2>Order Information</h2>
            <div id="orderInfo"></div>
            <div class="order-items">
                <h3>Order Items</h3>
                <div id="orderItems"></div>
            </div>
        </div>
    </div>

    <script>
        function fetchOrderDetails(orderIdFromRow) {
            const orderId = orderIdFromRow || document.getElementById('orderId').value;
            const errorMessage = document.getElementById('errorMessage');
            const orderDetails = document.getElementById('orderDetails');
            const orderInfo = document.getElementById('orderInfo');
            const orderItems = document.getElementById('orderItems');

            if (!orderId) {
                errorMessage.textContent = 'Please enter an Order ID';
                orderDetails.style.display = 'none';
                return;
            }

            fetch(`/api/orders.php?id=${orderId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Order not found or access denied');
                    }
                    return response.json();
                })
                .then(data => {
                    errorMessage.textContent = '';
                    orderDetails.style.display = 'block';

                    // Display order information
                    orderInfo.innerHTML = `
                        <p><strong>Order ID:</strong> ${data.order.id}</p>
                        <p><strong>Customer:</strong> ${data.order.username} (${data.order.email})</p>
                        <p><strong>Order Date:</strong> ${new Date(data.order.order_date).toLocaleString()}</p>
                        <p><strong>Status:</strong> ${data.order.status}</p>
                        <p><strong>Total Amount:</strong> $${data.order.total_amount}</p>
                    `;

                    // Display order items
                    orderItems.innerHTML = data.items.map(item => `
                        <div class="order-item">
                            <p><strong>Product:</strong> ${item.product_name}</p>
                            <p><strong>Category:</strong> ${item.category} - ${item.subcategory}</p>
                            <p><strong>Quantity:</strong> ${item.quantity}</p>
                            <p><strong>Price:</strong> $${item.price}</p>
                            <p><strong>Subtotal:</strong> $${(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                    `).join('');
                })
                .catch(error => {
                    errorMessage.textContent = error.message;
                    orderDetails.style.display = 'none';
                });
        }
    </script>
</body>
</html> 