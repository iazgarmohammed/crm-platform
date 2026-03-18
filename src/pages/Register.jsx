import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    const result = await register(email, password, fullName);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f7f7f7',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '40px',
        width: '400px', border: '1px solid #eee',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#111' }}>
            Create Account
          </div>
          <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
            Register to access the CRM platform
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <div style={{ fontSize: '13px', color: '#ef4444', background: '#fff8f8', border: '1px solid #fca5a5', borderRadius: '6px', padding: '10px 12px' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={loading}
            style={{
              padding: '11px', background: loading ? '#888' : '#111',
              color: '#fff', border: 'none', borderRadius: '6px',
              fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '4px',
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '13px', color: '#888' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#111', fontWeight: '600', textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}