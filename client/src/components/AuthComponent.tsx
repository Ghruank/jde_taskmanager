import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import '../styles/AuthComponent.css';

interface AuthProps {
  onLogin: (token: string, username: string) => void;
  isLoggedIn: boolean;
  username: string;
  onLogout: () => void;
}

const AuthComponent: React.FC<AuthProps> = ({ onLogin, isLoggedIn, username, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    // Reset form when toggling the panel
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setSignupUsername('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const response = await axios.post('https://jde-taskmanager.onrender.com/auth/register', { // Updated URL
          email,
          password,
          username: signupUsername
        });

        if (response.data.error) {
          setError('Registration failed. Email might already be in use.');
        } else {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('username', response.data.username);
          onLogin(response.data.token, response.data.username);
          handleToggle();
        }
      } else {
        // Login
        const response = await axios.post('https://jde-taskmanager.onrender.com/auth/login', { // Updated URL
          email,
          password
        });

        if (response.data.error) {
          setError('Invalid credentials');
        } else {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('username', response.data.username);
          onLogin(response.data.token, response.data.username);
          handleToggle();
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    onLogout();
  };

  const handleContinueAsGuest = () => {
    localStorage.setItem('guestMode', 'true');
    onLogin('', 'Guest'); // Set token as empty and username as 'Guest'
    handleToggle();
  };

  // Close auth panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const authPanel = document.querySelector('.auth-panel');
      const authButton = document.querySelector('.auth-button');
      
      if (isOpen && authPanel && authButton && 
          !authPanel.contains(event.target as Node) && 
          !authButton.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="auth-container">
      {!isLoggedIn ? (
        <div className="auth-buttons">
          <button onClick={handleToggle} className="auth-button">
            {isOpen ? 'Close' : 'Login / Sign Up'}
          </button>
          <button onClick={handleContinueAsGuest} className="guest-button">
            Continue as Guest
          </button>
        </div>
      ) : (
        <div className="user-info">
          <span>Welcome, {username}</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      )}

      <AnimatePresence>
        {isOpen && !isLoggedIn && (
          <>
            {/* Backdrop with higher z-index */}
            <motion.div 
              className="auth-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Simplified animation for better mobile performance */}
            <motion.div
              className="auth-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="auth-header">
                <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
                <div className="auth-tabs">
                  <button 
                    className={!isSignUp ? 'active' : ''} 
                    onClick={() => setIsSignUp(false)}
                  >
                    Login
                  </button>
                  <button 
                    className={isSignUp ? 'active' : ''} 
                    onClick={() => setIsSignUp(true)}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {isSignUp && (
                  <>
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="username">Username</label>
                      <input
                        type="text"
                        id="username"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthComponent;
