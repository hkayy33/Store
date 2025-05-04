import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
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
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();
  const { refreshCart, setCartItems, setCartCount } = useCart();

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
    setTimeout(async () => {
      setPaying(false);
      setSuccess(true);
      // Generate order details for receipt
      const today = new Date();
      let deliveryDays = delivery === 'express' ? 2 : 5;
      const expectedDate = new Date(today.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
      setOrderDetails({
        orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        date: today.toLocaleDateString(),
        expected: expectedDate.toLocaleDateString(),
        address,
        delivery,
        cart,
        total,
        card: `**** **** **** ${card.number.slice(-4)}`
      });
      // Clear cart after payment
      try {
        await fetch('/api/cart.php', { method: 'DELETE' });
        localStorage.removeItem('cart');
        setCart([]);
        setCartItems([]);
        setCartCount(0);
        refreshCart();
      } catch {}
    }, 1800);
  };

  const handleContinueShopping = () => {
    setCart([]);
    setCartItems([]);
    setCartCount(0);
    refreshCart();
    navigate('/');
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
                <div className="digital-receipt p-4 text-center animate__animated animate__fadeIn">
                  <h3 className="mb-3">Order Successful</h3>
                  <div className="receipt-box mx-auto mb-4 p-4 rounded shadow-sm bg-light" style={{maxWidth: 420}}>
                    <div className="mb-2 text-muted small">Order ID: <span className="fw-bold">{orderDetails?.orderId}</span></div>
                    <div className="mb-2">Date: <span className="fw-bold">{orderDetails?.date}</span></div>
                    <div className="mb-2">Expected Delivery: <span className="fw-bold text-success">{orderDetails?.expected}</span></div>
                    <hr />
                    <div className="mb-2 text-start">
                      <strong>Delivery Address:</strong><br />
                      {orderDetails?.address.name}<br />
                      {orderDetails?.address.address}<br />
                      {orderDetails?.address.city}, {orderDetails?.address.postcode}<br />
                      {orderDetails?.address.country}
                    </div>
                    <div className="mb-2 text-start">
                      <strong>Delivery Method:</strong> {orderDetails?.delivery === 'express' ? 'Express (1-2 days)' : 'Standard (3-5 days)'}
                    </div>
                    <hr />
                    <div className="mb-2 text-start">
                      <strong>Order Items:</strong>
                      <ul className="list-group mb-2">
                        {orderDetails?.cart.map(item => (
                          <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
                            <span>{item.name} <span className="text-muted">x{item.quantity}</span></span>
                            <span>£{(item.price * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mb-2 text-start">
                      <strong>Paid with:</strong> <span className="fw-bold">{orderDetails?.card}</span>
                    </div>
                    <div className="mb-2 text-end fs-5">
                      <strong>Total Paid: £{orderDetails?.total.toFixed(2)}</strong>
                    </div>
                  </div>
                  <button className="btn btn-primary mt-3" onClick={handleContinueShopping}>Continue Shopping</button>
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