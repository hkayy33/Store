import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateName = (name) => {
    if (!name) return 'Name is required';
    if (!/^[a-zA-Z\s]*$/.test(name)) return 'Name should only contain letters and spaces';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required';
    if (!/^\d{10}$/.test(phone)) return 'Phone number must be 10 digits';
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters long';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    return '';
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate the changed field
    let errorMessage = '';
    switch (name) {
      case 'name':
        errorMessage = validateName(value);
        break;
      case 'phone':
        errorMessage = validatePhone(value);
        break;
      case 'email':
        errorMessage = validateEmail(value);
        break;
      case 'password':
        errorMessage = validatePassword(value);
        break;
      case 'confirm_password':
        errorMessage = validateConfirmPassword(value, formData.password);
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const newErrors = {
      name: validateName(formData.name),
      phone: validatePhone(formData.phone),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirm_password: validateConfirmPassword(formData.confirm_password, formData.password)
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }

    try {
      const response = await fetch('/api/register_customer.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('An error occurred during registration');
    }
  };

  return (
    <div className="container mt-5">
      <div className="form-container">
        <h2 className="text-center mb-4">Register</h2>
        
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <input
              type="text"
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              maxLength="10"
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="confirm_password" className="form-label">Confirm Password</label>
            <input
              type="password"
              className={`form-control ${errors.confirm_password ? 'is-invalid' : ''}`}
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleInputChange}
              required
            />
            {errors.confirm_password && <div className="invalid-feedback">{errors.confirm_password}</div>}
          </div>
          <button type="submit" className="btn btn-primary w-100">Register</button>
        </form>
        
        <div className="text-center mt-3">
          <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register; 