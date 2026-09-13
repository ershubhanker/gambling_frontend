import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import AppLayout from './AppLayout';

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        return;
      }
      if (!currentPassword) {
        setError('Current password is required to change password');
        return;
      }
    }

    setLoading(true);
    try {
      await authAPI.updateSettings({
        email: email !== user.email ? email : undefined,
        currentPassword: newPassword ? currentPassword : undefined,
        newPassword: newPassword || undefined,
      });
      await refreshUser();
      setSuccess('✅ Settings updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="⚙️ Settings">
      <div className="welcome-card">
        <h2>Account Settings</h2>
        <p>Update your email or change your password.</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="settings-username">Username</label>
            <input
              id="settings-username"
              type="text"
              value={user?.username || ''}
              disabled
            />
            <small className="form-hint">
              Username cannot be changed. Contact an admin if needed.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="settings-email">Email</label>
            <input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <hr className="settings-divider" />
          <h3 className="settings-section-title">Change Password</h3>
          <p className="form-hint" style={{ marginBottom: 12 }}>
            Leave blank if you don't want to change your password.
          </p>

          <div className="form-group">
            <label htmlFor="settings-current-password">Current Password</label>
            <input
              id="settings-current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="settings-new-password">New Password</label>
            <input
              id="settings-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="settings-confirm-password">
              Confirm New Password
            </label>
            <input
              id="settings-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <button
          type="button"
          className="btn-link"
          onClick={() => navigate('/home')}
        >
          ← Back to Dashboard
        </button>
      </div>
    </AppLayout>
  );
};

export default Settings;