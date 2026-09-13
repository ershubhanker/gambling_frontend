import { Routes, Route } from 'react-router-dom';
import AppLayout from '../../AppLayout';
import CricketMatchList from './CricketMatchList';
import CricketMatchDetail from './CricketMatchDetail';

const Cricket = () => (
  <AppLayout title="🏏 Cricket">
    <Routes>
      {/* Relative paths — the parent route in App.jsx is "/cricket/*" */}
      <Route path="" element={<CricketMatchList />} />
      <Route path="match/:matchId" element={<CricketMatchDetail />} />
    </Routes>
  </AppLayout>
);

export default Cricket;