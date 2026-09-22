import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudyProvider } from './context/StudyContext';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationPreferencesModal } from './components/notifications/NotificationPreferences';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PageLoader } from './components/common/LoadingStates';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { isClientAuthenticated } from './services/apiClient';

// Static load for immediate entry pages
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { TogetherPage } from './pages/TogetherPage';
import { StreaksPage } from './pages/StreaksPage';
import { FunBreaksPage } from './pages/FunBreaksPage';
import { LoginPage } from './pages/LoginPage';

// Lazy loading for heavier pages
const StudyRoomPage = React.lazy(() =>
  import('./pages/StudyRoomPage').then((m) => ({ default: m.StudyRoomPage }))
);
const ProgressPage = React.lazy(() =>
  import('./pages/ProgressPage').then((m) => ({ default: m.ProgressPage }))
);
const TomorrowPage = React.lazy(() =>
  import('./pages/TomorrowPage').then((m) => ({ default: m.TomorrowPage }))
);
const SettingsPage = React.lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

export function App() {
  const authenticated = isClientAuthenticated();

  return (
    <ErrorBoundary>
      <StudyProvider>
        <NotificationProvider>
          <NotificationPreferencesModal />
          <BrowserRouter>
            <Suspense fallback={<PageLoader message="Loading study companion..." />}>
              <Routes>
                {/* Authentication Route: if already logged in, go straight to dashboard */}
                <Route
                  path="/login"
                  element={authenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
                />

                {/* Protected Authenticated Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/together" element={<TogetherPage />} />
                    <Route path="/study-room" element={<StudyRoomPage />} />
                    <Route path="/progress" element={<ProgressPage />} />
                    <Route path="/streaks" element={<StreaksPage />} />
                    <Route path="/tomorrow" element={<TomorrowPage />} />
                    <Route path="/fun" element={<FunBreaksPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>

                {/* Fallback Redirects */}
                <Route
                  path="/"
                  element={<Navigate to={authenticated ? '/dashboard' : '/login'} replace />}
                />
                <Route
                  path="*"
                  element={<Navigate to={authenticated ? '/dashboard' : '/login'} replace />}
                />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </NotificationProvider>
      </StudyProvider>
    </ErrorBoundary>
  );
}

export default App;
