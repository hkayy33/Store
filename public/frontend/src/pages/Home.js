import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'; // Grocery store hero
const VEGETABLES_IMAGE = 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80';
const MEAT_IMAGE = 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=600&q=80';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { refreshCart } = useCart();

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
      {/* Modern Grocery Button Styles */}
      <style>{`
        .grocery-btn-row {
          display: flex;
          gap: 32px;
          justify-content: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .grocery-btn {
          flex: 1 1 220px;
          min-width: 220px;
          max-width: 340px;
          margin-bottom: 0;
        }
        .grocery-btn {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          padding: 32px 32px;
          font-size: 2.2rem;
          font-weight: 600;
          border-radius: 18px;
          border: 2.5px solid #e0e0e0;
          background: #fff;
          box-shadow: 0 2px 12px rgba(60,60,60,0.06);
          transition: box-shadow 0.2s, border-color 0.2s, background 0.2s;
          cursor: pointer;
          gap: 24px;
        }
        .grocery-btn:hover, .grocery-btn.active-veg, .grocery-btn.active-meat {
          box-shadow: 0 4px 24px rgba(60,60,60,0.13);
          border-color: #4CAF50;
          background: linear-gradient(90deg, #e8f5e9 0%, #fff 100%);
        }
        .grocery-btn.active-meat {
          border-color: #e53935;
          background: linear-gradient(90deg, #ffebee 0%, #fff 100%);
        }
        .grocery-emoji {
          font-size: 2.5rem;
          margin-right: 18px;
        }
        .grocery-label {
          font-size: 2.2rem;
          font-weight: 600;
          color: #333;
        }
      `}</style>
      {/* Hero Section */}
      <div className="row align-items-center mb-5" style={{background: `url(${HERO_IMAGE}) center/cover`, borderRadius: 20, minHeight: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.08)'}}>
        <div className="col-md-7 p-5 text-white" style={{background: 'rgba(0,0,0,0.45)', borderRadius: 20}}>
          <h1 className="display-3 fw-bold mb-3">Fresh Groceries Delivered</h1>
          <p className="lead mb-4">Shop the best selection of fresh produce, meats, and more. Fast delivery, great prices, and quality you can trust!</p>
          <button className="btn btn-lg btn-success shadow" onClick={() => window.scrollTo({top: 400, behavior: 'smooth'})}>
            Start Shopping
          </button>
        </div>
        <div className="col-md-5 d-none d-md-block"></div>
      </div>

      <div className="text-center mb-5">
        <h2 className="mb-4">Browse by Category</h2>
        <p className="lead text-muted">Choose a category to explore our fresh products</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="grocery-btn-row">
            <button
              className={`grocery-btn ${activeCategory === 'Vegetables' ? 'active-veg' : ''}`}
              onClick={() => setActiveCategory(activeCategory === 'Vegetables' ? null : 'Vegetables')}
            >
              <span role="img" aria-label="vegetables" className="grocery-emoji">🥦</span>
              <span className="grocery-label">Vegetables</span>
            </button>
            <button
              className={`grocery-btn ${activeCategory === 'Meat' ? 'active-meat' : ''}`}
              onClick={() => setActiveCategory(activeCategory === 'Meat' ? null : 'Meat')}
            >
              <span role="img" aria-label="meat" className="grocery-emoji">🥩</span>
              <span className="grocery-label">Meats</span>
            </button>
          </div>
        </div>
      </div>

      {activeCategory === 'Vegetables' && (
        <div className="category-dropdown fade-in">
          <div className="list-group">
            {(categories['Vegetables'] || []).map(product => (
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
                <button type="button" className="modern-cart-badge" onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const response = await fetch('/api/cart.php', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ productId: product.id, quantity: 1 })
                    });
                    if (!response.ok) throw new Error('Failed to add to cart');
                    const data = await response.json();
                    if (data.error) {
                      alert(data.error);
                    } else {
                      refreshCart();
                      const alertDiv = document.createElement('div');
                      alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
                      alertDiv.style.zIndex = '9999';
                      alertDiv.innerHTML = `Product added to cart!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
                      document.body.appendChild(alertDiv);
                      setTimeout(() => alertDiv.remove(), 3000);
                    }
                  } catch (error) {
                    alert('Error adding product to cart');
                  }
                }}>
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

      {activeCategory === 'Meat' && (
        <div className="category-dropdown fade-in">
          <div className="list-group">
            {(categories['Meat'] || []).map(product => (
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
                <button type="button" className="modern-cart-badge" onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const response = await fetch('/api/cart.php', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ productId: product.id, quantity: 1 })
                    });
                    if (!response.ok) throw new Error('Failed to add to cart');
                    const data = await response.json();
                    if (data.error) {
                      alert(data.error);
                    } else {
                      refreshCart();
                      const alertDiv = document.createElement('div');
                      alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
                      alertDiv.style.zIndex = '9999';
                      alertDiv.innerHTML = `Product added to cart!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
                      document.body.appendChild(alertDiv);
                      setTimeout(() => alertDiv.remove(), 3000);
                    }
                  } catch (error) {
                    alert('Error adding product to cart');
                  }
                }}>
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
  );
};

export default Home; 