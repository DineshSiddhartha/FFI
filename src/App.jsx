import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';

import LoginScreen from './screens/LoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import QuotesListScreen from './screens/QuotesListScreen';
import Step1CustomerInfo from './screens/Step1CustomerInfo';
import Step2SystemConfig from './screens/Step2SystemConfig';
import Step3EditableDraft from './screens/Step3EditableDraft';
import QuoteDetailScreen from './screens/QuoteDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';

function RequireAuth({ children }) {
  const { isAuthenticated } = useStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function RequireOnboarding({ children }) {
  const { isOnboarded } = useStore();
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  const { isOnboarded } = useStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginScreen />} />

        {/* Auth required but no onboarding yet */}
        <Route path="/onboarding" element={
          <RequireAuth><OnboardingScreen /></RequireAuth>
        } />

        {/* Auth + Onboarding required */}
        <Route path="/" element={
          <RequireAuth><RequireOnboarding><HomeScreen /></RequireOnboarding></RequireAuth>
        } />
        <Route path="/quotes" element={
          <RequireAuth><RequireOnboarding><QuotesListScreen /></RequireOnboarding></RequireAuth>
        } />
        <Route path="/new-quote/step1" element={
          <RequireAuth><RequireOnboarding><Step1CustomerInfo /></RequireOnboarding></RequireAuth>
        } />
        <Route path="/new-quote/step2" element={
          <RequireAuth><RequireOnboarding><Step2SystemConfig /></RequireOnboarding></RequireAuth>
        } />
        <Route path="/new-quote/step3" element={
          <RequireAuth><RequireOnboarding><Step3EditableDraft /></RequireOnboarding></RequireAuth>
        } />
        <Route path="/quote/:id" element={
          <RequireAuth><RequireOnboarding><QuoteDetailScreen /></RequireOnboarding></RequireAuth>
        } />
        <Route path="/settings" element={
          <RequireAuth><RequireOnboarding><SettingsScreen /></RequireOnboarding></RequireAuth>
        } />
        <Route path="/leaderboard" element={
          <RequireAuth><RequireOnboarding><LeaderboardScreen /></RequireOnboarding></RequireAuth>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={isOnboarded ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
