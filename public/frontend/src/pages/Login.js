import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    captcha: ''
  });
  const [error, setError] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch new CAPTCHA when component mounts
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const response = await fetch('/api/auth/captcha.php');
      const data = await response.json();
      if (data.success) {
        setCaptchaImage(data.image);
        setFormData(prev => ({ ...prev, captcha: '' }));
      }
    } catch (error) {
      console.error('Error fetching CAPTCHA:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(formData.email, formData.password, formData.captcha);

    if (result.success) {
      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect') || '/';
      navigate(redirect);
    } else {
      setError(result.error || 'Login failed');
      // Refresh CAPTCHA on failed login
      fetchCaptcha();
    }
  };

  return (
    <div className="container mt-5">
      <div className="form-container">
        <h2 className="text-center mb-4">Login</h2>
        
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">CAPTCHA</label>
            <div className="d-flex align-items-center gap-2">
              <div className="captcha-display p-2 bg-light border rounded text-center" style={{ minWidth: '200px' }}>
                <img 
                  src={captchaImage} 
                  alt="CAPTCHA" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={fetchCaptcha}
              >
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
            <input
              type="text"
              className="form-control mt-2"
              id="captcha"
              name="captcha"
              value={formData.captcha}
              onChange={handleInputChange}
              required
              placeholder="Enter the code shown in the image"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
        
        <div className="text-center mt-3">
          <p>Don't have an account? <a href="/register">Register here</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login; 