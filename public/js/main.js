document.addEventListener('DOMContentLoaded', function() {
    // Load products based on URL parameters or show all products
    loadProducts();

    // Handle category/subcategory changes
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const subcategory = urlParams.get('subcategory');

    if (category && subcategory) {
        loadProducts(category, subcategory);
    }
});

function loadProducts(category = null, subcategory = null) {
    const container = document.getElementById('product-container');
    let url = 'api/products.php';

    if (category && subcategory) {
        url += `?category=${category}&subcategory=${subcategory}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(products => {
            container.innerHTML = '';
            products.forEach(product => {
                const productCard = createProductCard(product);
                container.appendChild(productCard);
            });
        })
        .catch(error => console.error('Error loading products:', error));
}

function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col-md-4 col-sm-6';

    col.innerHTML = `
        <div class="card product-card">
            <img src="${product.image_url}" class="card-img-top product-image" alt="${product.name}">
            <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">${product.description}</p>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                    Add to Cart
                </button>
            </div>
        </div>
    `;

    // Add event listener for the Add to Cart button
    col.querySelector('.add-to-cart').addEventListener('click', function() {
        addToCart(product.id);
    });

    return col;
}

function addToCart(productId) {
    fetch('/api/cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            productId: productId,
            quantity: 1
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            showAlert(data.error, 'danger');
        } else {
            showAlert('Product added to cart!', 'success');
            // Update cart count in navbar if it exists
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                const currentCount = parseInt(cartCount.textContent) || 0;
                cartCount.textContent = currentCount + 1;
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Error adding product to cart', 'danger');
    });
}

function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to document
    document.body.appendChild(alertDiv);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
} 