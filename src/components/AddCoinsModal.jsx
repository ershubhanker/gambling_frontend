import { useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const QUICK = [100, 500, 1000, 5000];

const AddCoinsModal = ({ user, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
    };
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setError('Enter a valid amount greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      await authAPI.adminAdjustBalance(user.id, value, note || null);
      onSuccess(value);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add coins');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h3>Add Coins</h3>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-user-preview">
            <div className="profile-avatar large">
              {(user.full_name || user.username || '?').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="modal-username">{user.full_name}</div>
              <div className="modal-user-meta">
                @{user.username} · {user.phone}
                {user.email ? ` · ${user.email}` : ''}
              </div>
              <div className="modal-user-meta">
                Current: ₹{Number(user.balance).toFixed(2)}
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="add-coins-amount">Amount (₹)</label>
              <input
                id="add-coins-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                inputMode="decimal"
                required
              />
            </div>

            <div className="quick-amounts">
              {QUICK.map((v) => (
                <button
                  key={v}
                  type="button"
                  className="chip"
                  onClick={() => setAmount(String(v))}
                >
                  ₹{v}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label htmlFor="add-coins-note">Note (optional)</label>
              <input
                id="add-coins-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Welcome bonus"
                maxLength={200}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary btn-small"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Coins'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCoinsModal;