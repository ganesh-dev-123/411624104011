import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import ModeIcon from '../components/common/ModeIcon';
import ModeText from '../components/common/ModeText';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, isAuthenticated } = useAuth();
  const { isDark, isKid } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = isKid ? 'Please add a username!' : 'Username is required';
    if (formData.username.length < 3) newErrors.username = isKid ? 'Username needs 3+ letters!' : 'Username must be at least 3 characters';
    if (!formData.email.trim()) newErrors.email = isKid ? 'Please add your email!' : 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = isKid ? 'That\'s not a valid email!' : 'Invalid email format';
    if (!formData.password) newErrors.password = isKid ? 'Please add a password!' : 'Password is required';
    if (formData.password.length < 8) newErrors.password = isKid ? 'Password needs 8+ characters!' : 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(formData.password)) newErrors.password = isKid ? 'Add a BIG letter!' : 'Password must contain uppercase letter';
    if (!/[a-z]/.test(formData.password)) newErrors.password = isKid ? 'Add a small letter!' : 'Password must contain lowercase letter';
    if (!/[0-9]/.test(formData.password)) newErrors.password = isKid ? 'Add a number!' : 'Password must contain a number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) newErrors.password = isKid ? 'Add a special character!' : 'Password must contain special character';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    const result = await register(formData);
    setLoading(false);
    
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <div className={`auth-container ${isDark ? 'auth-dark' : ''} ${isKid ? 'auth-kid' : ''}`}>
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <h1><ModeIcon name="brand" /> TaskNest</h1>
          <p><ModeText name="register-success" fallback="Create your account 🚀" /></p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <Input
              type="text"
              name="username"
              placeholder={isKid ? "Pick a username (3+ chars)" : "Username (3+ characters)"}
              value={formData.username}
              onChange={handleChange}
              icon={<FaUser />}
              error={errors.username}
            />
          </div>

          <div className="form-group">
            <Input
              type="email"
              name="email"
              placeholder={isKid ? "Your email" : "Email"}
              value={formData.email}
              onChange={handleChange}
              icon={<FaEnvelope />}
              error={errors.email}
            />
          </div>

          <div className="form-group">
            <Input
              type="text"
              name="full_name"
              placeholder={isKid ? "Your name (optional)" : "Full Name (Optional)"}
              value={formData.full_name}
              onChange={handleChange}
              icon={<FaUser />}
            />
          </div>

          <div className="form-group">
            <div className="password-input-wrapper">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder={isKid ? "Make a strong password" : "Password"}
                value={formData.password}
                onChange={handleChange}
                icon={<FaLock />}
                error={errors.password}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
          >
            {isKid ? 'Join TaskNest!' : 'Sign Up'}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            {isKid ? "Already have an account? " : "Already have an account? "}<Link to="/login">{isKid ? 'Sign In!' : 'Sign In'}</Link>
          </p>
        </div>

        <div className="auth-features">
          <span><ModeIcon name="create" /> {isKid ? 'Free Forever!' : 'Free Forever'}</span>
          <span><ModeIcon name="streak" /> {isKid ? 'Smart Features!' : 'Smart Features'}</span>
          <span><ModeIcon name="mode" /> {isKid ? 'Kid Friendly! 🌟' : 'Kid Friendly'}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;