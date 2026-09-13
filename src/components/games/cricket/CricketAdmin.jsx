import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cricketAPI } from '../../../services/api';
import AppLayout from '../../AppLayout';
import './CricketAdmin.css';

const emptyForm = {
  team1: '',
  team2: '',
  match_date: '',
  odds_team1_back: '',
  odds_team1_lay: '',
  odds_draw_back: '',
  odds_draw_lay: '',
  odds_team2_back: '',
  odds_team2_lay: '',
  toss_team1_back: '',
  toss_team1_lay: '',
  toss_team2_back: '',
  toss_team2_lay: '',
  odds_odd_back: '',
  odds_odd_lay: '',
  odds_even_back: '',
  odds_even_lay: '',
};

const CricketAdmin = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await cricketAPI.getMatches();
      setMatches(data);
    } catch (err) {
      console.error('Failed to load matches:', err);
      setMessage({
        type: 'error',
        text: 'Failed to load matches: ' + (err.response?.data?.detail || err.message),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validate
    if (!form.team1.trim() || !form.team2.trim()) {
      setMessage({ type: 'error', text: 'Both team names are required.' });
      return;
    }
    if (!form.match_date) {
      setMessage({ type: 'error', text: 'Match date and time are required.' });
      return;
    }

    // Convert empty strings to null for the API
    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
    );

    setSubmitting(true);
    try {
      await cricketAPI.adminCreateMatch(payload);
      setMessage({ type: 'success', text: '✅ Match created successfully!' });
      setForm(emptyForm);
      await loadMatches();
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Failed to create match: ' + (err.response?.data?.detail || err.message),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, team1, team2) => {
    if (!window.confirm(`Delete match "${team1} v ${team2}"?`)) return;

    try {
      await cricketAPI.adminDeleteMatch(id);
      setMessage({ type: 'success', text: '🗑️ Match deleted' });
      await loadMatches();
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Failed to delete: ' + (err.response?.data?.detail || err.message),
      });
    }
  };

  return (
    <AppLayout title="🏏 Cricket Admin">
      <div className="cricket-admin-container">
        {/* Header with Back Button */}
        <div className="admin-page-header">
          <div>
            <h2>Manage Cricket Matches</h2>
            <p className="admin-page-subtitle">
              Create matches and set odds for Match Winner, Toss, and Odd/Even.
            </p>
          </div>
          <Link to="/admin" className="btn-secondary back-btn-link">
            ← Back to Admin Panel
          </Link>
        </div>

        {/* Status Message */}
        {message.text && (
          <div
            className={
              message.type === 'success' ? 'success-message' : 'error-message'
            }
          >
            {message.text}
          </div>
        )}

        {/* Create Match Form */}
        <form onSubmit={handleSubmit} className="admin-match-form">
          <h3>Create New Match</h3>

          <div className="form-section">
            <h4>Basic Info</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Team 1</label>
                <input
                  name="team1"
                  placeholder="e.g., Namibia"
                  value={form.team1}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Team 2</label>
                <input
                  name="team2"
                  placeholder="e.g., South Africa"
                  value={form.team2}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Match Date & Time</label>
                <input
                  type="datetime-local"
                  name="match_date"
                  value={form.match_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Match Winner Odds (1X2)</h4>
            <div className="odds-grid">
              <label>
                Team 1 Back
                <input type="number" step="0.01" name="odds_team1_back" value={form.odds_team1_back} onChange={handleChange} />
              </label>
              <label>
                Team 1 Lay
                <input type="number" step="0.01" name="odds_team1_lay" value={form.odds_team1_lay} onChange={handleChange} />
              </label>
              <label>
                Draw Back
                <input type="number" step="0.01" name="odds_draw_back" value={form.odds_draw_back} onChange={handleChange} />
              </label>
              <label>
                Draw Lay
                <input type="number" step="0.01" name="odds_draw_lay" value={form.odds_draw_lay} onChange={handleChange} />
              </label>
              <label>
                Team 2 Back
                <input type="number" step="0.01" name="odds_team2_back" value={form.odds_team2_back} onChange={handleChange} />
              </label>
              <label>
                Team 2 Lay
                <input type="number" step="0.01" name="odds_team2_lay" value={form.odds_team2_lay} onChange={handleChange} />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h4>Toss Winner Odds</h4>
            <div className="odds-grid">
              <label>
                Team 1 Back
                <input type="number" step="0.01" name="toss_team1_back" value={form.toss_team1_back} onChange={handleChange} />
              </label>
              <label>
                Team 1 Lay
                <input type="number" step="0.01" name="toss_team1_lay" value={form.toss_team1_lay} onChange={handleChange} />
              </label>
              <label>
                Team 2 Back
                <input type="number" step="0.01" name="toss_team2_back" value={form.toss_team2_back} onChange={handleChange} />
              </label>
              <label>
                Team 2 Lay
                <input type="number" step="0.01" name="toss_team2_lay" value={form.toss_team2_lay} onChange={handleChange} />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h4>Odd/Even Total Runs</h4>
            <div className="odds-grid">
              <label>
                Odd Back
                <input type="number" step="0.01" name="odds_odd_back" value={form.odds_odd_back} onChange={handleChange} />
              </label>
              <label>
                Odd Lay
                <input type="number" step="0.01" name="odds_odd_lay" value={form.odds_odd_lay} onChange={handleChange} />
              </label>
              <label>
                Even Back
                <input type="number" step="0.01" name="odds_even_back" value={form.odds_even_back} onChange={handleChange} />
              </label>
              <label>
                Even Lay
                <input type="number" step="0.01" name="odds_even_lay" value={form.odds_even_lay} onChange={handleChange} />
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setForm(emptyForm)}
              disabled={submitting}
            >
              Reset
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Match'}
            </button>
          </div>
        </form>

        {/* Existing Matches List */}
        <div className="match-list-admin">
          <div className="match-list-header">
            <h3>Existing Matches ({matches.length})</h3>
            <button
              type="button"
              className="btn-small btn-secondary"
              onClick={loadMatches}
              disabled={loading}
            >
              {loading ? 'Loading...' : '🔄 Refresh'}
            </button>
          </div>

          {loading ? (
            <p>Loading matches...</p>
          ) : matches.length === 0 ? (
            <p className="empty-state">No matches yet. Create one above.</p>
          ) : (
            <div className="match-list">
              {matches.map((m) => (
                <div key={m.id} className="admin-match-item">
                  <div className="match-item-info">
                    <span className="match-item-teams">
                      {m.team1} v {m.team2}
                    </span>
                    <span className="match-item-date">
                      {new Date(m.match_date).toLocaleString()}
                    </span>
                  </div>
                  <div className="match-item-right">
                    <span className={`status-badge status-${m.status.toLowerCase()}`}>
                      {m.status}
                    </span>
                    <button
                      type="button"
                      className="btn-small btn-danger"
                      onClick={() => handleDelete(m.id, m.team1, m.team2)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default CricketAdmin;