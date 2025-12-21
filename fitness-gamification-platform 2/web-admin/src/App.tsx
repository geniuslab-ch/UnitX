import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';

// Pages
import DashboardPage from './pages/DashboardPage';
import ClubsPage from './pages/ClubsPage';
import MembersPage from './pages/MembersPage';
import SeasonsPage from './pages/SeasonsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import QRCodePage from './pages/QRCodePage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
        />

        {/* Protected routes */}
        {isAuthenticated ? (
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="clubs" element={<ClubsPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="seasons" element={<SeasonsPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="qr-code" element={<QRCodePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
