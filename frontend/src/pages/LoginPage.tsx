import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, GitBranch, KeyRound, Loader2, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('admin@university.edu');
  const [password, setPassword] = useState<string>('Password123!');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    try {
      await login({ email: email.trim(), password: password.trim() });
      navigate('/versions', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Invalid email or password. Please verify your credentials.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card-container">
        <div className="login-brand-header">
          <div className="brand-badge-icon">
            <GitBranch size={32} />
          </div>
          <h1>Version Control System</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="alert alert-danger" role="alert">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="admin@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary btn-block btn-lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <KeyRound size={18} />
                <span>Login to Workspace</span>
              </>
            )}
          </button>

          <div className="login-demo-notice">
            <p>
              <strong>Demo Hint:</strong> Enter any email & password to test the application interface if local backend is offline.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
