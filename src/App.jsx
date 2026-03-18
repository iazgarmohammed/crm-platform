import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InvestmentCRM from './pages/InvestmentCRM';
import EducationCRM from './pages/EducationCRM';
import UserAnalytics from './pages/UserAnalytics';
import CreatorCRM from './pages/CreatorCRM';
import MarketingFunnel from './pages/MarketingFunnel';
import Login from './pages/Login';
import Register from './pages/Register';
import useAuthStore from './store/authStore';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', exact: true },
  { path: '/investment', label: 'Investment CRM' },
  { path: '/education', label: 'Education CRM' },
  { path: '/analytics', label: 'User Analytics' },
  { path: '/creators', label: 'Creator CRM' },
  { path: '/marketing', label: 'Marketing Funnel' },
];

function Sidebar() {
  const location = useLocation();
  const { profile, logout } = useAuthStore();

  return (
    <div style={{
      width: '230px', minHeight: '100vh', background: '#111',
      display: 'flex', flexDirection: 'column', position: 'fixed',
      top: 0, left: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #222' }}>
        <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff', letterSpacing: '-0.3px' }}>
          SPREZOX
        </div>
        <div style={{ fontSize: '11px', color: '#555', marginTop: '4px', fontWeight: '500' }}>
          CRM Platform
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '10px 12px', borderRadius: '7px', marginBottom: '2px',
                textDecoration: 'none', fontSize: '13px',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? '#fff' : '#888',
                background: isActive ? '#222' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #222' }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
          {profile?.full_name || 'Intern'}
        </div>
        <div style={{ fontSize: '11px', color: '#555', marginBottom: '12px' }}>
  {profile?.role === 'admin' ? 'Admin' : 'User'}
</div>
        <button
          onClick={logout}
          style={{
            width: '100%', padding: '8px', background: '#1a1a1a',
            color: '#888', border: '1px solid #333', borderRadius: '6px',
            fontSize: '12px', cursor: 'pointer', textAlign: 'center',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

function ProtectedLayout() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: '230px', flex: 1, minHeight: '100vh', background: '#f7f7f7' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/investment" element={<InvestmentCRM />} />
          <Route path="/education" element={<EducationCRM />} />
          <Route path="/analytics" element={<UserAnalytics />} />
          <Route path="/creators" element={<CreatorCRM />} />
          <Route path="/marketing" element={<MarketingFunnel />} />
        </Routes>
      </main>
    </div>
  );
}

function AppRoutes() {
  const { init, loading, user } = useAuthStore();

  useEffect(() => { init(); }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f7' }}>
        <div style={{ fontSize: '14px', color: '#888' }}>Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}