import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { withdrawAPI } from '../services/api';
import AppLayout from './AppLayout';
import './AdminWithdrawals.css';

const FILTERS = ['Pending', 'Approved', 'Rejected', 'All'];

const AdminWithdrawals = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [busyId, setBusyId] = useState(null);

  const loadRequests = async (statusFilter = filter) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await withdrawAPI.adminList(statusFilter);
      setRequests(data);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to load requests',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleAction = async (id, status) => {
    const verb = status === 'Approved' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${verb} this request?`)) return;

    setBusyId(id);
    setMessage({ type: '', text: '' });
    try {
      await withdrawAPI.adminUpdate(id, status);
      setMessage({
        type: 'success',
        text: `✅ Request ${status.toLowerCase()}`,
      });
      await loadRequests(filter);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to update request',
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AppLayout title="💰 Withdrawal Requests">
      <div className="admin-withdrawals-container">
        <div className="admin-page-header">
          <div>
            <h2>Withdrawal Requests</h2>
            <p className="admin-page-subtitle">
              Approve or reject withdrawal requests submitted by users.
            </p>
          </div>
          <Link to="/admin" className="btn-secondary back-link">
            ← Back to Admin Panel
          </Link>
        </div>

        {message.text && (
          <div
            className={
              message.type === 'success' ? 'success-message' : 'error-message'
            }
          >
            {message.text}
          </div>
        )}

        {/* Filter tabs */}
        <div className="withdraw-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
          <button
            type="button"
            className="filter-btn refresh"
            onClick={() => loadRequests(filter)}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <p className="loading-text">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="empty-state">No {filter.toLowerCase()} requests.</p>
        ) : (
          <div className="withdraw-table-wrapper">
            <table className="withdraw-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>UPI ID</th>
                  <th>Note</th>
                  <th>Requested</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td data-label="ID">{r.id}</td>
                    <td data-label="User">
                      <strong>{r.full_name || r.username || '—'}</strong>
                      <div className="muted">@{r.username}</div>
                    </td>
                    <td data-label="Phone">{r.phone || '—'}</td>
                    <td data-label="Amount">
                      <span className="balance-inline">
                        ₹{Number(r.amount).toFixed(2)}
                      </span>
                    </td>
                    <td data-label="UPI ID" className="upi-cell">
                      {r.upi_id}
                    </td>
                    <td data-label="Note">
                      {r.note || <span className="muted">—</span>}
                    </td>
                    <td data-label="Requested">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td data-label="Status">
                      <span
                        className={
                          r.status === 'Approved'
                            ? 'badge badge-active'
                            : r.status === 'Rejected'
                            ? 'badge badge-inactive'
                            : 'badge badge-admin'
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                    <td data-label="Actions" className="actions-cell">
                      {r.status === 'Pending' ? (
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="btn-small btn-success"
                            onClick={() => handleAction(r.id, 'Approved')}
                            disabled={busyId === r.id}
                          >
                            {busyId === r.id ? '...' : 'Approve'}
                          </button>
                          <button
                            type="button"
                            className="btn-small btn-danger"
                            onClick={() => handleAction(r.id, 'Rejected')}
                            disabled={busyId === r.id}
                          >
                            {busyId === r.id ? '...' : 'Reject'}
                          </button>
                        </div>
                      ) : (
                        <span className="muted">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminWithdrawals;