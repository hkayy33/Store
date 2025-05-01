<?php
session_start();
require_once '../src/config/database.php';

// Check if user is logged in and is an admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header('Location: ../login.php');
    exit;
}

$database = new Database();
$db = $database->getConnection();

$message = '';
$error = '';

// Handle product deletion
if (isset($_POST['delete_product'])) {
    $product_id = $_POST['product_id'];
    try {
        $stmt = $db->prepare("DELETE FROM products WHERE id = :id");
        $stmt->execute([':id' => $product_id]);
        $message = 'Product deleted successfully';
    } catch(PDOException $e) {
        $error = 'Error deleting product: ' . $e->getMessage();
    }
}

// Handle product addition/editing
if (isset($_POST['submit_product'])) {
    $name = $_POST['name'];
    $category = $_POST['category'];
    $subcategory = $_POST['subcategory'];
    $price = $_POST['price'];
    $stock = $_POST['stock_quantity'];
    $description = $_POST['description'];
    $image_url = $_POST['image_url'];
    $product_id = $_POST['product_id'] ?? null;

    try {
        if ($product_id) {
            // Update existing product
            $stmt = $db->prepare("
                UPDATE products 
                SET name = :name, category = :category, subcategory = :subcategory,
                    price = :price, stock_quantity = :stock, description = :description,
                    image_url = :image_url
                WHERE id = :id
            ");
            $stmt->execute([
                ':name' => $name,
                ':category' => $category,
                ':subcategory' => $subcategory,
                ':price' => $price,
                ':stock' => $stock,
                ':description' => $description,
                ':image_url' => $image_url,
                ':id' => $product_id
            ]);
            $message = 'Product updated successfully';
        } else {
            // Add new product
            $stmt = $db->prepare("
                INSERT INTO products (name, category, subcategory, price, stock_quantity, description, image_url)
                VALUES (:name, :category, :subcategory, :price, :stock, :description, :image_url)
            ");
            $stmt->execute([
                ':name' => $name,
                ':category' => $category,
                ':subcategory' => $subcategory,
                ':price' => $price,
                ':stock' => $stock,
                ':description' => $description,
                ':image_url' => $image_url
            ]);
            $message = 'Product added successfully';
        }
    } catch(PDOException $e) {
        $error = 'Error saving product: ' . $e->getMessage();
    }
}

// Get all products
$products = [];
try {
    $stmt = $db->query("SELECT * FROM products ORDER BY name");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    $error = 'Error fetching products: ' . $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Management - Grocery Store</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="../css/style.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="index.php">Admin Dashboard</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link active" href="products.php">Products</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="users.php">Users</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="orders.php">Orders</a>
                    </li>
                </ul>
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="../logout.php">Logout</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <h2>Product Management</h2>
        
        <?php if ($message): ?>
            <div class="alert alert-success"><?php echo htmlspecialchars($message); ?></div>
        <?php endif; ?>
        
        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <!-- Add/Edit Product Form -->
        <div class="card mb-4">
            <div class="card-header">
                <h4>Add/Edit Product</h4>
            </div>
            <div class="card-body">
                <form method="POST" action="products.php">
                    <input type="hidden" name="product_id" id="product_id">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="name" class="form-label">Product Name</label>
                                <input type="text" class="form-control" id="name" name="name" required>
                            </div>
                            <div class="mb-3">
                                <label for="category" class="form-label">Category</label>
                                <select class="form-select" id="category" name="category" required>
                                    <option value="Vegetables">Vegetables</option>
                                    <option value="Meat">Meat</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="subcategory" class="form-label">Subcategory</label>
                                <select class="form-select" id="subcategory" name="subcategory" required>
                                    <option value="Root Vegetables">Root Vegetables</option>
                                    <option value="Cruciferous">Cruciferous</option>
                                    <option value="Poultry">Poultry</option>
                                    <option value="Seafood">Seafood</option>
                                    <option value="Red Meat">Red Meat</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="price" class="form-label">Price</label>
                                <input type="number" step="0.01" class="form-control" id="price" name="price" required>
                            </div>
                            <div class="mb-3">
                                <label for="stock_quantity" class="form-label">Stock Quantity</label>
                                <input type="number" class="form-control" id="stock_quantity" name="stock_quantity" required>
                            </div>
                            <div class="mb-3">
                                <label for="image_url" class="form-label">Image URL</label>
                                <input type="text" class="form-control" id="image_url" name="image_url" required>
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="description" class="form-label">Description</label>
                        <textarea class="form-control" id="description" name="description" rows="3" required></textarea>
                    </div>
                    <button type="submit" name="submit_product" class="btn btn-primary">Save Product</button>
                </form>
            </div>
        </div>

        <!-- Products List -->
        <div class="card">
            <div class="card-header">
                <h4>Products List</h4>
            </div>
            <div class="card-body">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($products as $product): ?>
                            <tr>
                                <td><?php echo $product['id']; ?></td>
                                <td><?php echo htmlspecialchars($product['name']); ?></td>
                                <td><?php echo htmlspecialchars($product['category']); ?></td>
                                <td>$<?php echo number_format($product['price'], 2); ?></td>
                                <td><?php echo $product['stock_quantity']; ?></td>
                                <td>
                                    <button class="btn btn-sm btn-primary edit-product" 
                                            data-product='<?php echo htmlspecialchars(json_encode($product)); ?>'>
                                        Edit
                                    </button>
                                    <form method="POST" action="products.php" style="display: inline;">
                                        <input type="hidden" name="product_id" value="<?php echo $product['id']; ?>">
                                        <button type="submit" name="delete_product" class="btn btn-sm btn-danger" 
                                                onclick="return confirm('Are you sure you want to delete this product?')">
                                            Delete
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Handle edit button clicks
        document.querySelectorAll('.edit-product').forEach(button => {
            button.addEventListener('click', function() {
                const product = JSON.parse(this.dataset.product);
                document.getElementById('product_id').value = product.id;
                document.getElementById('name').value = product.name;
                document.getElementById('category').value = product.category;
                document.getElementById('subcategory').value = product.subcategory;
                document.getElementById('price').value = product.price;
                document.getElementById('stock_quantity').value = product.stock_quantity;
                document.getElementById('image_url').value = product.image_url;
                document.getElementById('description').value = product.description;
                
                // Scroll to form
                document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
            });
        });
    </script>
</body>
</html> 