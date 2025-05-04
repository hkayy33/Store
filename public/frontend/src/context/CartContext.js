import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const response = await fetch('/api/cart.php');
      const data = await response.json();
      setCartItems(Array.isArray(data) ? data : []);
      setCartCount(Array.isArray(data) ? data.reduce((sum, item) => sum + item.quantity, 0) : 0);
    } catch {
      setCartItems([]);
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, cartCount, setCartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext); 