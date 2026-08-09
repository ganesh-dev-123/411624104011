import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import ModeIcon from '../components/common/ModeIcon';
import ModeText from '../components/common/ModeText';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import './Auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, isAuthenticated } = useAuth();
  const { isDark, isKid } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = isKid ? 'Please add your username!' : 'Username is required';
    if (username.length < 3) newErrors.username = isKid ? 'Username needs 3+ letters!' : 'Username must be at least 3 characters';
    if (!password) newErrors.password = isKid ? 'Please add your password!' : 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    
    if (result.success) {
      navigate('/');
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
          <p><ModeText name="welcome" /></p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <Input
              type="text"
              placeholder={isKid ? "What's your username?" : "Username or Email (3+ chars)"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<FaUser />}
              error={errors.username}
            />
          </div>

          <div className="form-group">
            <div className="password-input-wrapper">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={isKid ? "What's your password?" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {isKid ? 'Let\'s Go!' : 'Sign In'}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            {isKid ? "Don't have an account? " : "Don't have an account? "}<Link to="/register">{isKid ? 'Sign Up!' : 'Sign Up'}</Link>
          </p>
        </div>

        <div className="auth-features">
          <span><ModeIcon name="create" /> {isKid ? 'Smart & Fun!' : 'Smart Todo Manager'}</span>
          <span><ModeIcon name="streak" /> {isKid ? 'Get Things Done!' : 'Productivity Tools'}</span>
          <span><ModeIcon name="mode" /> {isKid ? 'Kid Friendly! 🌟' : 'Kid Friendly'}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;