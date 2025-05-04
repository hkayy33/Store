import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, setCartItems, refreshCart } = useCart();

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await fetch('/api/cart.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCartItems(updatedCart);
        refreshCart();
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await fetch(`/api/cart.php?productId=${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCartItems(updatedCart);
        refreshCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/payment');
      return;
    }
    navigate('/payment');
  };

  const total = Array.isArray(cartItems) ? cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;

  return (
    <div className="container mt-4">
      <h2>Shopping Cart</h2>
      {Array.isArray(cartItems) && cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(cartItems) && cartItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>£{item.price}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      className="form-control"
                      style={{ width: '70px' }}
                    />
                  </td>
                  <td>£{(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                <td><strong>£{total.toFixed(2)}</strong></td>
                <td>
                  <button 
                    className="btn btn-primary"
                    onClick={handleCheckout}
                  >
                    Checkout
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default Cart; 