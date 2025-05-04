import React, { createContext, useContext, useState, useEffect } from 'react';

const SESSION_DURATION_MINUTES = 30; // Set session duration here
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session expiry on load and every minute
  useEffect(() => {
    const checkSession = () => {
      const expiry = localStorage.getItem('session_expiry');
      if (expiry && Date.now() > Number(expiry)) {
        logout();
      }
    };
    checkSession();
    const interval = setInterval(checkSession, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check.php');
        const data = await response.json();
        
        if (data.authenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password, captcha) => {
    try {
      const response = await fetch('/api/auth/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, captcha }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.customer);
        // Set session expiry
        const expiry = Date.now() + SESSION_DURATION_MINUTES * 60 * 1000;
        localStorage.setItem('session_expiry', expiry);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint
      await fetch('/logout.php');
      // Clear frontend state
      setUser(null);
      localStorage.removeItem('session_expiry');
      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 