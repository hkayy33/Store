import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Payment.css';

const deliveryOptions = [
  { label: 'Standard Delivery (3-5 days)', value: 'standard', price: 0 },
  { label: 'Express Delivery (1-2 days)', value: 'express', price: 4.99 },
];

const Payment = () => {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [delivery, setDelivery] = useState('standard');
  const [address, setAddress] = useState({
    name: '',
    address: '',
    city: '',
    postcode: '',
    country: ''
  });
  const [card, setCard] = useState({
    name: '',
    number: '',
    expiry: '',
    cvc: ''
  });
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Try to fetch cart from backend, fallback to localStorage
    const fetchCart = async () => {
      try {
        const res = await fetch('/api/cart.php');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCart(data);
        } else {
          // fallback to localStorage for guests
          const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
          setCart(localCart);
        }
      } catch {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(localCart);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0) +
    (delivery === 'express' ? 4.99 : 0);

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleDeliveryChange = (e) => {
    setDelivery(e.target.value);
  };

  const handleCardChange = (e) => {
    setCard({ ...card, [e.target.name]: e.target.value });
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handlePay = (e) => {
    e.preventDefault();
    setError('');
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    }, 1800);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <h2 className="mb-4 text-center">Payment</h2>
              {loading ? (
                <div className="text-center">Loading...</div>
              ) : success ? (
                <div className="alert alert-success text-center">
                  Payment successful! Thank you for your order.<br />Redirecting to home...
                </div>
              ) : (
                <div className="checkout-steps">
                  <div className={`checkout-step${step === 1 ? ' active' : ''}`}
                    style={{
                      transform: step === 1 ? 'translateX(0)' : 'translateX(-120%)',
                      opacity: step === 1 ? 1 : 0,
                      zIndex: step === 1 ? 2 : 1,
                      transition: 'all 0.5s cubic-bezier(.77,0,.18,1)',
                      position: step === 1 ? 'relative' : 'absolute',
                      width: '100%'
                    }}>
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
                        <strong>Delivery</strong>
                        <span>{delivery === 'express' ? 'Express (£4.99)' : 'Standard (Free)'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <strong>Total</strong>
                        <strong>£{total.toFixed(2)}</strong>
                      </li>
                    </ul>
                    <h4 className="mb-3">Delivery Method</h4>
                    <div className="mb-3">
                      {deliveryOptions.map(opt => (
                        <div className="form-check form-check-inline" key={opt.value}>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="delivery"
                            id={opt.value}
                            value={opt.value}
                            checked={delivery === opt.value}
                            onChange={handleDeliveryChange}
                          />
                          <label className="form-check-label" htmlFor={opt.value}>{opt.label}</label>
                        </div>
                      ))}
                    </div>
                    <h4 className="mb-3">Shipping Address</h4>
                    <form onSubmit={handleContinue} autoComplete="off">
                      <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input type="text" className="form-control" name="name" value={address.name} onChange={handleAddressChange} required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Address</label>
                        <input type="text" className="form-control" name="address" value={address.address} onChange={handleAddressChange} required />
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">City</label>
                          <input type="text" className="form-control" name="city" value={address.city} onChange={handleAddressChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Postcode</label>
                          <input type="text" className="form-control" name="postcode" value={address.postcode} onChange={handleAddressChange} required />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="form-label">Country</label>
                        <input type="text" className="form-control" name="country" value={address.country} onChange={handleAddressChange} required />
                      </div>
                      <button type="submit" className="btn btn-primary w-100">
                        Continue to Payment
                      </button>
                    </form>
                  </div>
                  <div className={`checkout-step${step === 2 ? ' active' : ''}`}
                    style={{
                      transform: step === 2 ? 'translateX(0)' : 'translateX(120%)',
                      opacity: step === 2 ? 1 : 0,
                      zIndex: step === 2 ? 2 : 1,
                      transition: 'all 0.5s cubic-bezier(.77,0,.18,1)',
                      position: step === 2 ? 'relative' : 'absolute',
                      width: '100%'
                    }}>
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
                        <strong>Delivery</strong>
                        <span>{delivery === 'express' ? 'Express (£4.99)' : 'Standard (Free)'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <strong>Total</strong>
                        <strong>£{total.toFixed(2)}</strong>
                      </li>
                    </ul>
                    <h4 className="mb-3">Card Details</h4>
                    <form onSubmit={handlePay} autoComplete="off">
                      <div className="mb-3">
                        <label className="form-label">Name on Card</label>
                        <input type="text" className="form-control" name="name" value={card.name} onChange={handleCardChange} required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Card Number</label>
                        <input type="text" className="form-control" name="number" value={card.number} onChange={handleCardChange} required maxLength={19} placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Expiry</label>
                          <input type="text" className="form-control" name="expiry" value={card.expiry} onChange={handleCardChange} required placeholder="MM/YY" maxLength={5} />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">CVC</label>
                          <input type="text" className="form-control" name="cvc" value={card.cvc} onChange={handleCardChange} required maxLength={4} />
                        </div>
                      </div>
                      <div className="d-flex justify-content-between">
                        <button type="button" className="btn btn-outline-secondary" onClick={handleBack}>
                          Back
                        </button>
                        <button type="submit" className="btn btn-success" disabled={paying}>
                          {paying ? 'Processing...' : 'Pay Now'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment; 