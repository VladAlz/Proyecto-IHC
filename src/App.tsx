import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './components/templates/MainLayout/MainLayout';
import { ToastProvider } from './components/molecules/Toast/Toast';
import { DashboardPage } from './pages/Dashboard';
import { PlansPage } from './pages/Plans';
import { RegisterTestPage } from './pages/RegisterTest';
import { FindingsPage } from './pages/Findings';
import { AiAssistantPage } from './pages/AiAssistant';
import { ScrumPage } from './pages/Scrum';
import { ComparisonPage } from './pages/Comparison';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 15_000 },
  },
});

export const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="register" element={<RegisterTestPage />} />
            <Route path="findings" element={<FindingsPage />} />
            <Route path="ai-assistant" element={<AiAssistantPage />} />
            <Route path="scrum" element={<ScrumPage />} />
            <Route path="comparison" element={<ComparisonPage />} />
            {/* Rutas del Sprint 1 */}
            <Route path="redesign-evidence" element={<Navigate to="/comparison" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </QueryClientProvider>
);

export default App;
