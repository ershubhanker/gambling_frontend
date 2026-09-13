import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cricketAPI, fancyAPI } from '../../../services/api';
import './CricketMatchDetail.css';

// Build a 3-tier ladder from a single base odd value
const buildLadder = (base) => {
  if (!base || Number(base) <= 0) return [];
  const b = Number(base);
  return [b, Number((b + 0.2).toFixed(2)), Number((b + 0.4).toFixed(2))];
};

const FANCY_TABS = [
  { key: 'ALL', label: 'ALL' },
  { key: 'SESSIONS', label: 'SESSIONS' },
  { key: 'W/P', label: 'W/P MARKET' },
  { key: 'ODD/EVEN', label: 'ODD/EVEN' },
  { key: 'XTRA', label: 'XTRA MARKET' },
];

const CricketMatchDetail = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [fancyMarkets, setFancyMarkets] = useState([]);
  const [fancyLoading, setFancyLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  const [slip, setSlip] = useState(null);
  const [stake, setStake] = useState(5000);
  const [placing, setPlacing] = useState(false);
  const [betMessage, setBetMessage] = useState({ type: '', text: '' });

  // ---------- Fetch match ----------
  useEffect(() => {
    const fetchMatch = async () => {
      setLoading(true);
      try {
        const data = await cricketAPI.getMatchDetails(matchId);
        setMatch(data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load match');
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [matchId]);

  // ---------- Fetch fancy markets ----------
  useEffect(() => {
    const fetchFancy = async () => {
      setFancyLoading(true);
      try {
        const data = await fancyAPI.listByMatch(matchId, 'ALL');
        setFancyMarkets(data || []);
      } catch (err) {
        console.error('Fancy fetch failed:', err);
        setFancyMarkets([]);
      } finally {
        setFancyLoading(false);
      }
    };
    fetchFancy();
  }, [matchId]);

  const handleBack = () => navigate('/cricket');

  // Filter fancy markets by active tab
  const visibleFancy = useMemo(() => {
    if (activeTab === 'ALL') return fancyMarkets;
    return fancyMarkets.filter((m) => m.category === activeTab);
  }, [fancyMarkets, activeTab]);

  if (loading) return <div className="cmd-loading">Loading match…</div>;
  if (error || !match) {
    return (
      <div className="cmd-page">
        <button className="cmd-back" onClick={handleBack}>← Back</button>
        <div className="cmd-error">{error || 'Match not found.'}</div>
      </div>
    );
  }

  // ---------- Build market runners ----------
  const matchWinnerMarkets = {
    id: 'match-winner',
    title: 'Match Odds',
    subtitle: '1X2',
    runners: [
      {
        name: match.team1,
        back: buildLadder(match.odds_team1_back),
        lay: buildLadder(match.odds_team1_lay),
      },
      {
        name: 'Draw',
        back: buildLadder(match.odds_draw_back),
        lay: buildLadder(match.odds_draw_lay),
      },
      {
        name: match.team2,
        back: buildLadder(match.odds_team2_back),
        lay: buildLadder(match.odds_team2_lay),
      },
    ],
  };

  const tossMarkets = {
    id: 'toss',
    title: 'Toss',
    subtitle: 'Who wins the toss',
    runners: [
      {
        name: match.team1,
        back: buildLadder(match.toss_team1_back),
        lay: buildLadder(match.toss_team1_lay),
      },
      {
        name: match.team2,
        back: buildLadder(match.toss_team2_back),
        lay: buildLadder(match.toss_team2_lay),
      },
    ],
  };

  const oddEvenMarkets = {
    id: 'odd-even',
    title: 'Odd/Even Total Runs',
    subtitle: 'Total match runs',
    runners: [
      {
        name: 'Odd',
        back: buildLadder(match.odds_odd_back),
        lay: buildLadder(match.odds_odd_lay),
      },
      {
        name: 'Even',
        back: buildLadder(match.odds_even_back),
        lay: buildLadder(match.odds_even_lay),
      },
    ],
  };

  const onSelectMatchOdd = (market, runner, type, odd) => {
    setSlip({
      kind: 'match',
      title: market.title,
      selection: `${runner.name} - ${type.toUpperCase()}`,
      type,
      odds: odd,
    });
    setBetMessage({ type: '', text: '' });
  };

  const onSelectFancyOdd = (market, selection) => {
    const oddValue = selection === 'No' ? market.no_price : market.yes_price;
    if (!oddValue) return;
    setSlip({
      kind: 'fancy',
      marketId: market.id,
      title: market.title,
      selection,
      odds: oddValue,
      minStake: market.min_stake,
      maxStake: market.max_stake,
    });
    setBetMessage({ type: '', text: '' });
  };

  const handlePlaceBet = async () => {
    if (!slip) {
      setBetMessage({ type: 'error', text: 'Please select an odd first.' });
      return;
    }
    setPlacing(true);
    setBetMessage({ type: '', text: '' });

    try {
      if (slip.kind === 'match') {
        await cricketAPI.placeBet({
          match_id: match.id,
          market: slip.title,
          selection: slip.selection,
          bet_type: slip.type,
          odds: Number(slip.odds),
          stake: Number(stake),
          potential_profit: Number(stake) * (Number(slip.odds) - 1),
        });
      } else {
        await fancyAPI.placeBet({
          market_id: slip.marketId,
          selection: slip.selection,
          odds: Number(slip.odds),
          stake: Number(stake),
          potential_profit: Number(stake) * (Number(slip.odds) - 1),
        });
      }
      setBetMessage({ type: 'success', text: '✅ Bet placed successfully!' });
      setSlip(null);
    } catch (err) {
      setBetMessage({
        type: 'error',
        text: 'Failed: ' + (err.response?.data?.detail || err.message),
      });
    } finally {
      setPlacing(false);
    }
  };

  const potentialProfit = slip
    ? (Number(stake) * (Number(slip.odds) - 1)).toFixed(2)
    : '0.00';

  return (
    <div className="cmd-page">
      {/* ---------- Top bar ---------- */}
      <div className="cmd-topbar">
        <button className="cmd-back" onClick={handleBack}>←</button>
        <div className="cmd-topbar-title">
          <span className="cmd-topbar-teams">
            {match.team1} v {match.team2}
          </span>
          <span className="cmd-topbar-date">
            {new Date(match.match_date).toLocaleString('en-IN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </span>
        </div>
        <span className={`cmd-status status-${(match.status || '').toLowerCase()}`}>
          {match.status}
        </span>
      </div>

      {/* ---------- Layout ---------- */}
      <div className="cmd-layout">
        {/* LEFT: All market sections */}
        <div className="cmd-markets">
          {/* Match Odds (Back/Lay ladder) */}
          <MarketSection
            market={matchWinnerMarkets}
            onSelect={onSelectMatchOdd}
          />

          {/* Toss (Back/Lay ladder) */}
          <MarketSection
            market={tossMarkets}
            onSelect={onSelectMatchOdd}
          />

          {/* Odd/Even Total Runs (Back/Lay ladder) */}
          <MarketSection
            market={oddEvenMarkets}
            onSelect={onSelectMatchOdd}
          />

          {/* FANCY SECTION */}
          <div className="cmd-fancy-wrapper">
            <div className="cmd-fancy-tabs">
              {FANCY_TABS.map((t) => (
                <button
                  key={t.key}
                  className={`cmd-fancy-tab ${activeTab === t.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {fancyLoading ? (
              <div className="cmd-fancy-empty">Loading fancy markets…</div>
            ) : visibleFancy.length === 0 ? (
              <div className="cmd-fancy-empty">No markets in this category.</div>
            ) : activeTab === 'ALL' ? (
              <AllCategoriesView markets={visibleFancy} onSelect={onSelectFancyOdd} />
            ) : (
              <CategoryTable
                markets={visibleFancy}
                category={activeTab}
                onSelect={onSelectFancyOdd}
              />
            )}
          </div>
        </div>

        {/* RIGHT: Bet slip */}
        <div className="cmd-slip">
          <div className="cmd-slip-header">Place Bet</div>
          <div className="cmd-slip-body">
            <div className="cmd-slip-row">
              <div className="cmd-slip-label">(Bet for)</div>
              <div className="cmd-slip-label">Odds</div>
              <div className="cmd-slip-label">Stake</div>
              <div className="cmd-slip-label">Profit</div>
            </div>

            <div className="cmd-slip-row cmd-slip-inputs">
              <div className="cmd-slip-selection">
                {slip ? (
                  <>
                    <button
                      type="button"
                      className="cmd-slip-remove"
                      onClick={() => setSlip(null)}
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                    <span title={slip.title}>
                      {slip.selection} @ {Number(slip.odds).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="cmd-slip-empty">No selection</span>
                )}
              </div>
              <input
                className="cmd-slip-input"
                value={slip ? Number(slip.odds).toFixed(2) : ''}
                readOnly
              />
              <input
                className="cmd-slip-input"
                type="number"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
              />
              <input className="cmd-slip-input" value={potentialProfit} readOnly />
            </div>

            <div className="cmd-quick-stakes">
              {[100, 5000, 500, 25000, 50000].map((v) => (
                <button
                  key={v}
                  type="button"
                  className="cmd-quick-btn"
                  onClick={() => setStake(v)}
                >
                  {v}
                </button>
              ))}
            </div>

            {betMessage.text && (
              <div className={`cmd-message ${betMessage.type}`}>
                {betMessage.text}
              </div>
            )}

            <div className="cmd-slip-actions">
              <button
                type="button"
                className="cmd-btn edit"
                onClick={() => setSlip(null)}
                disabled={!slip}
              >
                EDIT STAKE
              </button>
              <button
                type="button"
                className="cmd-btn clear"
                onClick={() => {
                  setSlip(null);
                  setBetMessage({ type: '', text: '' });
                }}
              >
                CLEAR
              </button>
            </div>
            <div className="cmd-slip-actions">
              <button
                type="button"
                className="cmd-btn reset"
                onClick={() => setStake(5000)}
              >
                Reset
              </button>
              <button
                type="button"
                className="cmd-btn submit"
                onClick={handlePlaceBet}
                disabled={placing || !slip}
              >
                {placing ? 'Placing…' : 'Submit'}
              </button>
            </div>
          </div>
          <div className="cmd-my-bet">
            <div className="cmd-my-bet-header">My Bet</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==================== Sub-components ==================== */

/* Market section with BACK / LAY ladder */
const MarketSection = ({ market, onSelect }) => {
  return (
    <div className="cmd-market">
      <div className="cmd-market-header">
        <span className="cmd-market-title">{market.title}</span>
        {market.subtitle && (
          <span className="cmd-market-sub">{market.subtitle}</span>
        )}
        <span className="cmd-market-info">ⓘ</span>
      </div>

      <div className="cmd-market-body">
        {/* Column labels */}
        <div className="cmd-col-labels">
          <div className="cmd-col-label-left"></div>
          <div className="cmd-col-label back">BACK</div>
          <div className="cmd-col-label lay">LAY</div>
        </div>

        {/* Runner rows */}
        {market.runners.map((runner) => (
          <div className="cmd-runner" key={runner.name}>
            <div className="cmd-runner-name">{runner.name}</div>

            {/* BACK column */}
            <div className="cmd-ladder back">
              {runner.back.length === 0 ? (
                <div className="cmd-odd-cell empty">
                  <span className="cmd-odd-price">-</span>
                  <span className="cmd-odd-vol">0.0</span>
                </div>
              ) : (
                runner.back.map((odd, i) => (
                  <div
                    key={'b' + i}
                    className="cmd-odd-cell back"
                    onClick={() => onSelect(market, runner, 'back', odd)}
                  >
                    <span className="cmd-odd-price">{odd.toFixed(2)}</span>
                    <span className="cmd-odd-vol">
                      {(Math.random() * 100).toFixed(2)}k
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* LAY column */}
            <div className="cmd-ladder lay">
              {runner.lay.length === 0 ? (
                <div className="cmd-odd-cell empty">
                  <span className="cmd-odd-price">-</span>
                  <span className="cmd-odd-vol">0.0</span>
                </div>
              ) : (
                runner.lay.map((odd, i) => (
                  <div
                    key={'l' + i}
                    className="cmd-odd-cell lay"
                    onClick={() => onSelect(market, runner, 'lay', odd)}
                  >
                    <span className="cmd-odd-price">{odd.toFixed(2)}</span>
                    <span className="cmd-odd-vol">
                      {(Math.random() * 100).toFixed(2)}k
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* Groups fancy markets by category (for "ALL" view) */
const AllCategoriesView = ({ markets, onSelect }) => {
  const grouped = useMemo(() => {
    const g = {};
    markets.forEach((m) => {
      if (!g[m.category]) g[m.category] = [];
      g[m.category].push(m);
    });
    return g;
  }, [markets]);

  return (
    <>
      {['SESSIONS', 'W/P', 'ODD/EVEN', 'XTRA'].map((cat) =>
        grouped[cat] && grouped[cat].length > 0 ? (
          <CategoryTable
            key={cat}
            markets={grouped[cat]}
            category={cat}
            onSelect={onSelect}
          />
        ) : null
      )}
    </>
  );
};

/* Single fancy table for a category */
const CategoryTable = ({ markets, category, onSelect }) => {
  const titleMap = {
    SESSIONS: 'Sessions',
    'W/P': 'W/P Market',
    'ODD/EVEN': 'Odd/Even',
    XTRA: 'Xtra Market',
  };

  return (
    <div className="cmd-fancy-table">
      <div className="cmd-fancy-table-header">
        <span>{titleMap[category] || category}</span>
        <span className="cmd-fancy-table-info">ⓘ</span>
      </div>

      <div className="cmd-fancy-table-cols">
        <div className="cmd-fancy-col-title"></div>
        <div className="cmd-fancy-col-head no">No</div>
        <div className="cmd-fancy-col-head yes">Yes</div>
        <div className="cmd-fancy-col-limits">Min/Max</div>
      </div>

      {markets.map((m) => (
        <div className="cmd-fancy-row" key={m.id}>
          <div className="cmd-fancy-row-title" title={m.title}>
            {m.title}
          </div>

          {/* NO */}
          <div className="cmd-fancy-odd-cell no">
            {m.status !== 'Open' ? (
              <span className="cmd-fancy-suspended">
                {m.status === 'Settled' ? `Settled (${m.result})` : m.status}
              </span>
            ) : (
              <button
                type="button"
                className="cmd-fancy-odd-btn"
                onClick={() => onSelect(m, 'No')}
                disabled={!m.no_price}
              >
                <span className="cmd-fancy-price">
                  {m.no_price ? Number(m.no_price).toFixed(2) : '-'}
                </span>
                <span className="cmd-fancy-vol">
                  {Number(m.no_volume || 0).toFixed(0)}
                </span>
              </button>
            )}
          </div>

          {/* YES */}
          <div className="cmd-fancy-odd-cell yes">
            {m.status !== 'Open' ? (
              <span className="cmd-fancy-suspended">
                {m.status === 'Settled' ? `Settled (${m.result})` : m.status}
              </span>
            ) : (
              <button
                type="button"
                className="cmd-fancy-odd-btn"
                onClick={() => onSelect(m, 'Yes')}
                disabled={!m.yes_price}
              >
                <span className="cmd-fancy-price">
                  {m.yes_price ? Number(m.yes_price).toFixed(2) : '-'}
                </span>
                <span className="cmd-fancy-vol">
                  {Number(m.yes_volume || 0).toFixed(0)}
                </span>
              </button>
            )}
          </div>

          <div className="cmd-fancy-row-limits">
            Min: {m.min_stake} Max: {m.max_stake}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CricketMatchDetail;