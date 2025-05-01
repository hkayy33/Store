import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/products.php')
      .then(res => res.json())
      .then(data => {
        if (data.success) setProducts(data.products);
        setLoading(false);
      });
  }, []);

  // Group products by category
  const categories = products.reduce((acc, product) => {
    acc[product.category] = acc[product.category] || [];
    acc[product.category].push(product);
    return acc;
  }, {});

  const handleProductClick = (product) => {
    navigate(`/products/${product.id}`);
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-5">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-4">Welcome to Grocery Store</h1>
        <p className="lead text-muted">Choose a category to browse our products</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="d-grid gap-3">
            <button
              className={`btn btn-lg ${activeCategory === 'vegetables' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveCategory(activeCategory === 'vegetables' ? null : 'vegetables')}
            >
              <i className="bi bi-egg me-2"></i>
              Vegetables
            </button>

            {activeCategory === 'vegetables' && (
              <div className="category-dropdown fade-in">
                <div className="list-group">
                  {(categories.vegetables || []).map(product => (
                    <button
                      key={product.id}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="d-flex align-items-center">
                        <div className="product-image-container me-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="product-image"
                          />
                        </div>
                        <span className="product-name">{product.name}</span>
                      </div>
                      <button type="button" className="modern-cart-badge">
                        <span className="price">£{Number(product.price).toFixed(2)}</span>
                        <span className="cart-action">
                          <i className="bi bi-cart-plus me-1"></i>
                          Add to Cart
                        </span>
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              className={`btn btn-lg ${activeCategory === 'meats' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveCategory(activeCategory === 'meats' ? null : 'meats')}
            >
              <i className="bi bi-basket me-2"></i>
              Meats
            </button>

            {activeCategory === 'meats' && (
              <div className="category-dropdown fade-in">
                <div className="list-group">
                  {(categories.meats || []).map(product => (
                    <button
                      key={product.id}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="d-flex align-items-center">
                        <div className="product-image-container me-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="product-image"
                          />
                        </div>
                        <span className="product-name">{product.name}</span>
                      </div>
                      <button type="button" className="modern-cart-badge">
                        <span className="price">£{Number(product.price).toFixed(2)}</span>
                        <span className="cart-action">
                          <i className="bi bi-cart-plus me-1"></i>
                          Add to Cart
                        </span>
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 