import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import AppLayout from './AppLayout';
import AddCoinsModal from './AddCoinsModal';
import './AdminPanel.css';

const emptyForm = {
  full_name: '',
  username: '',
  phone: '',
  email: '',
  password: '',
  is_admin: false,
};

const AdminPanel = () => {
  const { user, refreshUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [coinsUser, setCoinsUser] = useState(null);

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await authAPI.adminListUsers();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const runSearch = async (q) => {
    if (!q.trim()) {
      await loadUsers();
      return;
    }
    try {
      setSearching(true);
      const data = await authAPI.adminSearchUsers(q.trim());
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      runSearch(query);
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.full_name.trim()) return setError('Full name is required');
    if (!form.username.trim()) return setError('Username is required');
    if (!form.phone.trim()) return setError('Phone number is required');
    if (!form.password || form.password.length < 6)
      return setError('Password must be at least 6 characters');

    setSubmitting(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        username: form.username.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() ? form.email.trim() : null,
        password: form.password,
        is_admin: form.is_admin,
      };
      const created = await authAPI.adminCreateUser(payload);
      setSuccess(`✅ User '${created.username}' created successfully`);
      setForm(emptyForm);
      if (query.trim()) await runSearch(query);
      else await loadUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Delete user '${username}'?`)) return;
    setError('');
    setSuccess('');
    try {
      await authAPI.adminDeleteUser(id);
      setSuccess(`🗑️ User '${username}' deleted`);
      if (query.trim()) await runSearch(query);
      else await loadUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleToggleActive = async (id) => {
    setError('');
    setSuccess('');
    try {
      await authAPI.adminToggleActive(id);
      if (query.trim()) await runSearch(query);
      else await loadUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleCoinsSuccess = async (amount) => {
    setSuccess(`💰 Added ₹${amount.toFixed(2)} to '${coinsUser.username}'`);
    if (query.trim()) await runSearch(query);
    else await loadUsers();
    if (coinsUser.id === user.id) await refreshUser();
  };

  const clearSearch = () => setQuery('');

  return (
    <AppLayout title="🛡️ Admin Panel">
      <div className="welcome-card">
        <h2>Create New User</h2>
        <Link to="/admin/cricket" className="btn-primary" style={{ textDecoration: 'none' }}>
        🏏 Manage Cricket Matches
        </Link>
        <Link to="/admin/withdrawals" className="btn-primary" style={{ textDecoration: 'none', marginLeft: 8 }}>
        💰 Withdrawal Requests
        </Link>
        <p>Full name, username, and phone are required. Email is optional.</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleCreate} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="new-full-name">
                Full Name <span className="required-mark">*</span>
              </label>
              <input
                id="new-full-name"
                name="full_name"
                type="text"
                value={form.full_name}
                onChange={handleChange}
                placeholder="e.g., John Doe"
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-username">
                Username <span className="required-mark">*</span>
              </label>
              <input
                id="new-username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="e.g., john_doe"
                required
                minLength={3}
                maxLength={50}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="new-phone">
                Phone Number <span className="required-mark">*</span>
              </label>
              <input
                id="new-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g., +91 98765 43210"
                required
                inputMode="tel"
                maxLength={20}
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-email">
                Email <span className="optional-mark">(optional)</span>
              </label>
              <input
                id="new-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g., john@example.com"
                maxLength={100}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="new-password">
              Password <span className="required-mark">*</span>
            </label>
            <input
              id="new-password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_admin"
                checked={form.is_admin}
                onChange={handleChange}
              />
              <span>Grant admin privileges</span>
            </label>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>

      <div className="users-section">
        <div className="users-section-header">
          <h3>
            {query.trim() ? 'Search Results' : 'All Users'} ({users.length})
          </h3>
        </div>

        <div className="search-bar">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, username, or phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search users"
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
          {searching && <span className="search-spinner" aria-hidden="true" />}
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p className="empty-state">
            {query.trim()
              ? `No users match "${query}".`
              : 'No users yet. Create one above.'}
          </p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Username</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Balance</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td data-label="ID">{u.id}</td>
                  <td data-label="Full Name">{u.full_name}</td>
                  <td data-label="Username">{u.username}</td>
                  <td data-label="Phone">{u.phone}</td>
                  <td data-label="Email">
                    {u.email ? u.email : <span className="muted">—</span>}
                  </td>
                  <td data-label="Balance">
                    <span className="balance-inline">
                      💰 ₹{Number(u.balance).toFixed(2)}
                    </span>
                  </td>
                  <td data-label="Role">
                    {u.is_admin ? (
                      <span className="badge badge-admin">Admin</span>
                    ) : (
                      <span className="badge badge-user">User</span>
                    )}
                  </td>
                  <td data-label="Status">
                    <span
                      className={
                        u.is_active
                          ? 'badge badge-active'
                          : 'badge badge-inactive'
                      }
                    >
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      type="button"
                      onClick={() => setCoinsUser(u)}
                      className="btn-small btn-success"
                    >
                      + Add Coins
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u.id)}
                      disabled={u.id === user.id}
                      className="btn-small btn-secondary"
                    >
                      {u.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(u.id, u.username)}
                      disabled={u.id === user.id}
                      className="btn-small btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {coinsUser && (
        <AddCoinsModal
          user={coinsUser}
          onClose={() => setCoinsUser(null)}
          onSuccess={handleCoinsSuccess}
        />
      )}
    </AppLayout>
  );
};

export default AdminPanel;