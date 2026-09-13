import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.username?.[0]?.toUpperCase() || '?';

  const styles = {
    wrapper: {
      position: 'relative',
      display: 'inline-block',
      zIndex: 1000,
    },
    trigger: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 12px',
      background: 'transparent',
      border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: 20,
      color: 'inherit',
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: '#4f46e5',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontSize: '0.85rem',
      textTransform: 'uppercase',
      flexShrink: 0,
    },
    username: {
      maxWidth: 120,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    caret: {
      fontSize: '0.7rem',
      opacity: 0.7,
      transition: 'transform 0.2s',
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
    },
    menu: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      minWidth: 240,
      background: '#ffffff',
      color: '#1f2937',
      borderRadius: 10,
      boxShadow: '0 10px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      zIndex: 9999,
      overflow: 'hidden',
    },
    header: {
      padding: '12px 16px',
      borderBottom: '1px solid #f3f4f6',
    },
    headerName: {
      fontWeight: 600,
      fontSize: '0.95rem',
      color: '#111827',
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    headerEmail: {
      fontSize: '0.78rem',
      color: '#6b7280',
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: '100%',
      padding: '10px 16px',
      background: 'transparent',
      border: 'none',
      textAlign: 'left',
      fontSize: '0.9rem',
      color: '#374151',
      cursor: 'pointer',
      textDecoration: 'none',
      boxSizing: 'border-box',
    },
    itemDanger: {
      color: '#dc2626',
    },
    divider: {
      height: 1,
      background: '#f3f4f6',
      margin: '4px 0',
      border: 'none',
    },
    icon: {
      fontSize: '1rem',
      width: 18,
      textAlign: 'center',
      flexShrink: 0,
    },
  };

  return (
    <div style={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        style={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span style={styles.avatar}>{initial}</span>
        <span style={styles.username}>{user?.username}</span>
        <span style={styles.caret}>▼</span>
      </button>

      {open && (
        <div style={styles.menu} role="menu">
          <div style={styles.header}>
            <p style={styles.headerName}>
              {user?.full_name || user?.username}
            </p>
            <p style={styles.headerEmail}>{user?.email || 'No email'}</p>
          </div>

          {/* NOTE: Dashboard / Home link removed */}

          <Link
            to="/settings"
            style={styles.item}
            onClick={() => setOpen(false)}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={styles.icon}>⚙️</span>
            Settings
          </Link>

          <Link
            to="/transactions"
            style={styles.item}
            onClick={() => setOpen(false)}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={styles.icon}>📜</span>
            Transactions
          </Link>

          <Link
            to="/deposit"
            style={styles.item}
            onClick={() => setOpen(false)}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={styles.icon}>💰</span>
            Deposit
          </Link>

          <Link
            to="/withdraw"
            style={styles.item}
            onClick={() => setOpen(false)}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={styles.icon}>🏦</span>
            Withdraw
          </Link>

          <hr style={styles.divider} />

          <button
            type="button"
            style={{ ...styles.item, ...styles.itemDanger }}
            onClick={handleLogout}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={styles.icon}>🚪</span>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;