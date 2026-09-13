import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Home from './components/Home';
import AdminPanel from './components/AdminPanel';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';
import Transactions from './components/Transactions';
import Settings from './components/Settings';
import Cricket from './components/games/cricket/Cricket';
import Tennis from './components/games/Tennis';
import Football from './components/games/Football';
import Hockey from './components/games/Hockey';
import ProtectedRoute from './components/ProtectedRoute';
import CricketAdmin from './components/games/cricket/CricketAdmin';
import AdminWithdrawals from './components/AdminWithdrawals';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* User pages */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposit"
            element={
              <ProtectedRoute>
                <Deposit />
              </ProtectedRoute>
            }
          />

          <Route
            path="/withdraw"
            element={
              <ProtectedRoute>
                <Withdraw />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Sports pages
              NOTE: These use /* so that nested routes (like /cricket/match/:id)
              work inside each game component. */}
          <Route
            path="/cricket/*"
            element={
              <ProtectedRoute>
                <Cricket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tennis/*"
            element={
              <ProtectedRoute>
                <Tennis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/football/*"
            element={
              <ProtectedRoute>
                <Football />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hockey/*"
            element={
              <ProtectedRoute>
                <Hockey />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cricket"
            element={
              <ProtectedRoute adminOnly>
                <CricketAdmin />
              </ProtectedRoute>
            }
          />
          <Route
          path="/admin/withdrawals"
          element={
            <ProtectedRoute adminOnly>
              <AdminWithdrawals />
            </ProtectedRoute>
          }
        />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;