import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { withdrawAPI } from '../services/api';
import AppLayout from './AppLayout';

const Withdraw = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const balance = Number(user?.balance ?? 0);

  // Live validation: disable the button if amount is invalid or exceeds balance
  const parsedAmount = parseFloat(amount);
  const amountTooHigh = !Number.isNaN(parsedAmount) && parsedAmount > balance;
  const amountInvalid =
    amount !== '' && (Number.isNaN(parsedAmount) || parsedAmount <= 0);

  const isDisabled = useMemo(() => {
    if (loading) return true;
    if (balance <= 0) return true;
    if (!amount) return true;
    if (amountInvalid) return true;
    if (amountTooHigh) return true;
    if (!upiId.trim() || upiId.trim().length < 3) return true;
    return false;
  }, [loading, balance, amount, amountInvalid, amountTooHigh, upiId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (amountInvalid) {
      setError('Enter a valid amount greater than 0');
      return;
    }
    if (amountTooHigh) {
      setError(`Insufficient balance. Available: ₹${balance.toFixed(2)}`);
      return;
    }
    if (!upiId.trim()) {
      setError('UPI ID is required');
      return;
    }

    setLoading(true);
    try {
      const req = await withdrawAPI.create({
        amount: parsedAmount,
        upi_id: upiId.trim(),
        note: note.trim() || null,
      });
      setSuccess(
        `✅ Withdrawal request of ₹${req.amount.toFixed(2)} submitted. ` +
          `Your request is pending admin approval.`
      );
      setAmount('');
      setNote('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Withdrawal request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="⬆️ Withdraw">
      <div className="welcome-card">
        <h2>Withdraw Amount</h2>
        <p>Submit a withdrawal request — an admin will approve it.</p>

        <div className="balance-display">
          Available Balance: <strong>₹{balance.toFixed(2)}</strong>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="money-form">
          <div className="form-group">
            <label htmlFor="withdraw-amount">Amount (₹)</label>
            <input
              id="withdraw-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
              inputMode="decimal"
            />
            {amountTooHigh && (
              <span className="field-error">
                Exceeds available balance (₹{balance.toFixed(2)})
              </span>
            )}
          </div>

          <div className="quick-amounts">
            <button
              type="button"
              className="chip"
              onClick={() => setAmount(String(balance.toFixed(2)))}
              disabled={balance <= 0}
            >
              Max (₹{balance.toFixed(2)})
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="upi-id">
              UPI ID <span className="required-mark">*</span>
            </label>
            <input
              id="upi-id"
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g., yourname@okhdfcbank"
              required
              minLength={3}
              maxLength={100}
            />
            <span className="field-hint">
              Funds will be sent to this UPI ID after approval.
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="withdraw-note">Note (optional)</label>
            <input
              id="withdraw-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Rent"
              maxLength={200}
            />
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className="btn-primary"
          >
            {loading ? 'Submitting...' : 'Request Withdrawal'}
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

export default Withdraw;