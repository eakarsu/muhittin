import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const fillDemo = () => { setEmail('demo@muhittin.com'); setPassword('demo123'); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await register(name, email, password, phone);
      } else {
        await login(email, password);
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Multiverse</h1>
        <p className="login-sub">Consulting Group — Admin Portal</p>
        <button className="demo-btn" onClick={fillDemo}>
          Fill Demo Credentials (demo@muhittin.com / demo123)
        </button>
        {error && <p style={{ color: '#ff4757', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label>Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 12, fontSize: 14 }}>
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#666' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span style={{ color: '#6c63ff', cursor: 'pointer' }} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Sign In' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  );
}
