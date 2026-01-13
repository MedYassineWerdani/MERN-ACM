import { useState, useEffect } from 'react';
import LoginSignup from './components/LoginSignup';
import MemberDashboard from './components/MemberDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import OfficeDashboard from './components/OfficeDashboard';
import { getCurrentUser, logoutUser } from './api';

function App() {
  const [user, setUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for storage changes from other tabs/windows
    const handleStorageChange = () => {
      const updatedUser = getCurrentUser();
      setUser(updatedUser);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLoginSuccess = () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  // Show login if no user
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <LoginSignup onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Route to appropriate dashboard based on role
  if (user.role === 'manager') {
    return <ManagerDashboard user={user} onLogout={handleLogout} />;
  }

  if (user.role === 'office') {
    return <OfficeDashboard user={user} onLogout={handleLogout} />;
  }

  if (user.role === 'member') {
    return <MemberDashboard user={user} onLogout={handleLogout} />;
  }

  // Default for other roles
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontSize: '18px',
      color: '#6b7280'
    }}>
      <div style={{ textAlign: 'center' }}>
        <p>Dashboard for role "{user.role}" not yet configured</p>
        <button
          onClick={handleLogout}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default App;
