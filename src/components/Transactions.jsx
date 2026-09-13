import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import AppLayout from './AppLayout';

const Transactions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await authAPI.getMyTransactions(100);
        setTxns(data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AppLayout title="📜 Transactions">
      <div className="welcome-card">
        <h2>Transaction History</h2>
        <div className="balance-display">
          Current Balance:{' '}
          <strong>₹{Number(user?.balance ?? 0).toFixed(2)}</strong>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p>Loading...</p>
        ) : txns.length === 0 ? (
          <p className="empty-state">No transactions yet.</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance After</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id}>
                  <td data-label="Date">
                    {t.created_at
                      ? new Date(t.created_at).toLocaleString()
                      : '—'}
                  </td>
                  <td data-label="Type">
                    <span
                      className={
                        t.type === 'deposit'
                          ? 'badge badge-active'
                          : 'badge badge-inactive'
                      }
                    >
                      {t.type === 'deposit' ? '⬇️ Deposit' : '⬆️ Withdraw'}
                    </span>
                  </td>
                  <td data-label="Amount">
                    {t.type === 'deposit' ? '+' : '−'}₹
                    {Number(t.amount).toFixed(2)}
                  </td>
                  <td data-label="Balance After">
                    ₹{Number(t.balance_after).toFixed(2)}
                  </td>
                  <td data-label="Note">{t.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

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

export default Transactions;