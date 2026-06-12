import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';

import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import QuotesListScreen from './screens/QuotesListScreen';
import Step1CustomerInfo from './screens/Step1CustomerInfo';
import Step2SystemConfig from './screens/Step2SystemConfig';
import Step3EditableDraft from './screens/Step3EditableDraft';
import QuoteDetailScreen from './screens/QuoteDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';

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
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/" element={
          <RequireOnboarding><HomeScreen /></RequireOnboarding>
        } />
        <Route path="/quotes" element={
          <RequireOnboarding><QuotesListScreen /></RequireOnboarding>
        } />
        <Route path="/new-quote/step1" element={
          <RequireOnboarding><Step1CustomerInfo /></RequireOnboarding>
        } />
        <Route path="/new-quote/step2" element={
          <RequireOnboarding><Step2SystemConfig /></RequireOnboarding>
        } />
        <Route path="/new-quote/step3" element={
          <RequireOnboarding><Step3EditableDraft /></RequireOnboarding>
        } />
        <Route path="/quote/:id" element={
          <RequireOnboarding><QuoteDetailScreen /></RequireOnboarding>
        } />
        <Route path="/settings" element={
          <RequireOnboarding><SettingsScreen /></RequireOnboarding>
        } />
        <Route path="/leaderboard" element={
          <RequireOnboarding><LeaderboardScreen /></RequireOnboarding>
        } />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to={isOnboarded ? '/' : '/onboarding'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
