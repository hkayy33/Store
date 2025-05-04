import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shipping, setShipping] = useState({
    name: '',
    address: '',
    city: '',
    postcode: '',
    country: ''
  });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch('/api/cart.php');
        const data = await res.json();
        setCart(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load cart data.');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleInputChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();
    navigate('/payment');
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <h2 className="mb-4 text-center">Checkout</h2>
              {loading ? (
                <div className="text-center">Loading...</div>
              ) : orderSuccess ? (
                <div className="alert alert-success text-center">
                  Order placed successfully! Redirecting to home...
                </div>
              ) : (
                <>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <h4 className="mb-3">Order Summary</h4>
                  <ul className="list-group mb-4">
                    {cart.length === 0 && <li className="list-group-item">Your cart is empty.</li>}
                    {cart.map(item => (
                      <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{item.name}</strong> <span className="text-muted">x{item.quantity}</span>
                        </div>
                        <span>£{(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <strong>Total</strong>
                      <strong>£{total.toFixed(2)}</strong>
                    </li>
                  </ul>
                  <h4 className="mb-3">Shipping Information</h4>
                  <form onSubmit={handleContinueToPayment} autoComplete="off">
                    <div className="mb-3">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-control" name="name" value={shipping.name} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <input type="text" className="form-control" name="address" value={shipping.address} onChange={handleInputChange} required />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">City</label>
                        <input type="text" className="form-control" name="city" value={shipping.city} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Postcode</label>
                        <input type="text" className="form-control" name="postcode" value={shipping.postcode} onChange={handleInputChange} required />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="form-label">Country</label>
                      <input type="text" className="form-control" name="country" value={shipping.country} onChange={handleInputChange} required />
                    </div>
                    <button type="submit" className="btn btn-success w-100">
                      Continue to Payment
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 