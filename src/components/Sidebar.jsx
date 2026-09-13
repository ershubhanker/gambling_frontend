import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SPORTS = [
  { to: '/cricket', label: 'Cricket', icon: '🏏' },
  { to: '/tennis', label: 'Tennis', icon: '🎾' },
  { to: '/football', label: 'Football', icon: '⚽' },
  { to: '/hockey', label: 'Hockey', icon: '🏒' },
];

const Sidebar = ({ open, onClose, collapsed, onToggleCollapse }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  // Auto-close drawer on mobile when route changes
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const initial = (user?.username || '?').charAt(0).toUpperCase();

  return (
    <>
      <div
        className={`sidebar-backdrop ${open ? 'show' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`sidebar ${open ? 'open' : ''} ${
          collapsed ? 'collapsed' : ''
        }`}
      >
        {/* -------- Header: brand + collapse toggle -------- */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-brand-icon">💼</span>
            {!collapsed && (
              <span className="sidebar-brand-text">WalletApp</span>
            )}
          </div>

          {/* Collapse toggle (desktop) */}
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {collapsed ? (
                <polyline points="9 18 15 12 9 6" />
              ) : (
                <polyline points="15 18 9 12 15 6" />
              )}
            </svg>
          </button>

          {/* Close button (mobile) */}
          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {/* -------- User card -------- */}
        {/* <div className="sidebar-user">
          <div className="sidebar-avatar" title={user?.username}>
            {initial}
          </div>
          {!collapsed && (
            <div className="sidebar-userinfo">
              <div className="sidebar-username">{user?.username}</div>
              <div className="sidebar-userrole">
                {isAdmin ? 'Administrator' : 'User'}
              </div>
            </div>
          )}
        </div> */}

        {/* -------- Nav -------- */}
        <nav className="sidebar-nav">
          {/* Sports as direct items */}
          {SPORTS.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
              title={s.label}
            >
              <span className="sidebar-item-icon">{s.icon}</span>
              {!collapsed && (
                <span className="sidebar-item-label">{s.label}</span>
              )}
            </NavLink>
          ))}

          {/* Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
            title="Settings"
          >
            <span className="sidebar-item-icon">⚙️</span>
            {!collapsed && <span className="sidebar-item-label">Settings</span>}
          </NavLink>
        </nav>

        {/* -------- Footer -------- */}
        <div className="sidebar-footer">
          {!collapsed && (
            <div className="sidebar-footer-text">
              © {new Date().getFullYear()} WalletApp
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;