import React, { useState } from 'react';
import { apiRequest } from '../utils/api';

interface AuthProps {
  onAuthSuccess: (user: any, token: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const data = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        onAuthSuccess(data.user, data.token);
      } else {
        await apiRequest('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ username, email, password }),
        });
        alert('Registration successful! Please log in.');
        setIsLogin(true);
        setUsername('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-icon-mark">
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M2 3h10M2 7h6M2 11h8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="auth-heading">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="auth-subheading">
          {isLogin ? 'Sign in to join the discussion' : 'Get started — it only takes a second'}
        </p>

        {error && (
          <div className="auth-error">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="6.5" cy="6.5" r="6" stroke="#c0392b" strokeWidth="1" />
              <path d="M6.5 3.5v3.5M6.5 9h.01" stroke="#c0392b" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="auth-field">
              <label className="auth-label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="ujjwal_dev"
                className="auth-input"
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="auth-input"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="auth-input"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">or</span>
          <div className="auth-divider-line" />
        </div>

        <p className="auth-switch-text">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={switchMode} className="auth-switch-btn">
            {isLogin ? 'Register' : 'Sign in'}
          </button>
        </p>

      </div>
    </div>
  );
};