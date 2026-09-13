import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cricketAPI } from '../../../services/api';
import './CricketMatchList.css';

const CricketMatchList = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await cricketAPI.getMatches();

        // Extra safety: filter out finished/cancelled matches
        const activeMatches = (data || []).filter(
          (m) => m.status === 'Upcoming' || m.status === 'Live'
        );

        setMatches(activeMatches);
      } catch (error) {
        console.error('Failed to fetch matches', error);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  // Format date + time nicely
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '';

    const date = d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const time = d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return { date, time };
  };

  if (loading) {
    return (
      <div className="match-list-container">
        <div className="loading-state">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className="match-list-container">
      {/* Header Row — must match grid columns of rows */}
      <div className="match-list-header">
        <span className="header-game">Game</span>
        <span className="header-col">1</span>
        <span className="header-col">X</span>
        <span className="header-col">2</span>
      </div>

      {/* Scrollable Match List */}
      <div className="match-list-body">
        {matches.length === 0 ? (
          <div className="empty-state">No upcoming or live matches.</div>
        ) : (
          matches.map((match) => {
            const dt = formatDateTime(match.match_date);
            const isLive = match.status === 'Live';

            return (
              <div
                key={match.id}
                className="match-row"
                onClick={() => navigate(`/cricket/match/${match.id}`)}
              >
                {/* Game Info */}
                <div className="match-info">
                  <div className="match-teams-row">
                    <span className="match-teams">
                      {match.team1} v {match.team2}
                    </span>
                    {isLive && <span className="live-badge">LIVE</span>}
                  </div>
                  {dt && (
                    <span className="match-date">
                      {dt.date} • {dt.time}
                    </span>
                  )}
                </div>

                {/* Column 1 */}
                <div className="match-odds">
                  <span className="odds-btn back">-</span>
                  <span className="odds-btn lay">-</span>
                </div>

                {/* Column X */}
                <div className="match-odds">
                  <span className="odds-btn back">-</span>
                  <span className="odds-btn lay">-</span>
                </div>

                {/* Column 2 */}
                <div className="match-odds">
                  <span className="odds-btn back">-</span>
                  <span className="odds-btn lay">-</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CricketMatchList;