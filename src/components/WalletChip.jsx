import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const WalletChip = () => {
  const { user } = useAuth();
  const balance = Number(user?.balance ?? 0).toFixed(2);

  const styles = {
    group: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    },
    homeIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 36,
      height: 36,
      borderRadius: '50%',
      color: '#ffffff',
      background: 'rgba(255, 255, 255, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      textDecoration: 'none',
      transition: 'background 0.15s',
      flexShrink: 0,
    },
    walletChip: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 14px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#ffffff',
      borderRadius: 20,
      fontWeight: 600,
      fontSize: '0.875rem',
      textDecoration: 'none',
      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
      transition: 'transform 0.15s',
    },
    walletIcon: {
      fontSize: '1rem',
    },
    walletAmount: {
      letterSpacing: 0.3,
    },
  };

  return (
    <div style={styles.group}>
      {/* Home / Dashboard icon */}
      <Link
        to="/home"
        style={styles.homeIcon}
        aria-label="Go to Dashboard"
        title="Dashboard"
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </Link>

      {/* Wallet balance chip → links to /deposit */}
      <Link
        to="/deposit"
        style={styles.walletChip}
        title="Add funds"
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        <span style={styles.walletIcon}>💰</span>
        <span style={styles.walletAmount}>₹{balance}</span>
      </Link>
    </div>
  );
};

export default WalletChip;