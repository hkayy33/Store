import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const navigate = useNavigate();

  const categories = {
    vegetables: [
      { id: 1, name: 'Potato', price: 1.99, image: '/images/potato.jpg' },
      { id: 2, name: 'Carrots', price: 0.99, image: '/images/carrots.jpg' },
      { id: 3, name: 'Broccoli', price: 1.49, image: '/images/broccoli.jpg' }
    ],
    meats: [
      { id: 4, name: 'Chicken', price: 3.99, image: '/images/chicken.jpg' },
      { id: 5, name: 'Fish', price: 5.99, image: '/images/fish.jpg' },
      { id: 6, name: 'Pork', price: 4.99, image: '/images/pork.jpg' },
      { id: 7, name: 'Beef', price: 6.99, image: '/images/beef.jpg' }
    ]
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product.id}`);
  };

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
                  {categories.vegetables.map(product => (
                    <button
                      key={product.id}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="rounded me-3"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                        <span>{product.name}</span>
                      </div>
                      <span className="badge bg-primary rounded-pill">£{product.price.toFixed(2)}</span>
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
                  {categories.meats.map(product => (
                    <button
                      key={product.id}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="rounded me-3"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                        <span>{product.name}</span>
                      </div>
                      <span className="badge bg-primary rounded-pill">£{product.price.toFixed(2)}</span>
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