import { useAuth } from '../context/AuthContext';
import AppLayout from './AppLayout';

const Home = () => {
  const { user } = useAuth();

  return (
    <AppLayout title="🏠 Home">
      <div className="welcome-card">
        <h2>Welcome, {user?.username}!</h2>
        <p>Your account at a glance.</p>

        <div className="balance-hero">
          <div className="balance-hero-label">Available Balance</div>
          <div className="balance-hero-value">
            ₹{Number(user?.balance ?? 0).toFixed(2)}
          </div>
        </div>

        <div className="user-info">
          <p>
            <strong>User ID:</strong> {user?.id}
          </p>
          <p>
            <strong>Username:</strong> {user?.username}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Role:</strong> {user?.is_admin ? 'Administrator' : 'User'}
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;