import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import AppLayout from './AppLayout';

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

const Deposit = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setError('Enter a valid amount greater than 0');
      return;
    }

    setLoading(true);
    try {
      const txn = await authAPI.deposit(value, note || null);
      await refreshUser();
      setSuccess(
        `✅ Deposited ₹${txn.amount.toFixed(2)}. New balance: ₹${txn.balance_after.toFixed(2)}`
      );
      setAmount('');
      setNote('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="⬇️ Deposit">
      <div className="welcome-card">
        <h2>Deposit Amount</h2>
        <p>Add funds to your account balance.</p>

        <div className="balance-display">
          Current Balance:{' '}
          <strong>₹{Number(user?.balance ?? 0).toFixed(2)}</strong>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="money-form">
          <div className="form-group">
            <label htmlFor="deposit-amount">Amount (₹)</label>
            <input
              id="deposit-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              autoFocus
              inputMode="decimal"
            />
          </div>

          <div className="quick-amounts">
            {QUICK_AMOUNTS.map((v) => (
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
            <label htmlFor="deposit-note">Note (optional)</label>
            <input
              id="deposit-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Top-up"
              maxLength={200}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Processing...' : 'Deposit'}
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

export default Deposit;