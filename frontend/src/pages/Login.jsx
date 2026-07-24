import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch (loginError) {
      setError(loginError.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Multiverse</h1>
        <p className="login-sub">Consulting Group — Staff Portal</p>
        {error && <p style={{ color: '#ff4757', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="staff-email">Email</label>
            <input id="staff-email" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="username" maxLength="255" required />
          </div>
          <div className="form-group">
            <label htmlFor="staff-password">Password</label>
            <input id="staff-password" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" maxLength="128" required />
          </div>
          <button
            type="button"
            onClick={() => { setEmail(import.meta.env.VITE_DEMO_EMAIL || ''); setPassword(import.meta.env.VITE_DEMO_PASSWORD || ''); }}
            disabled={!import.meta.env.VITE_DEMO_EMAIL || !import.meta.env.VITE_DEMO_PASSWORD}
            aria-label="Auto Fill Demo Credentials"
            style={{ width: '100%', marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid currentColor', background: 'transparent', cursor: 'pointer' }}
          >
            Auto Fill Demo Credentials
          </button>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 12, fontSize: 14 }}>Sign In</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#666' }}>Accounts are provisioned by an administrator. Public registration is disabled by default.</p>
      </div>
    </div>
  );
}
