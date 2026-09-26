import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './components/templates/MainLayout/MainLayout';
import { DashboardPage } from './pages/Dashboard';
import { RegisterTestPage } from './pages/RegisterTest';
import { AiAssistantPage } from './pages/AiAssistant';
import { RedesignEvidencePage } from './pages/RedesignEvidence';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="register" element={<RegisterTestPage />} />
            <Route path="ai-assistant" element={<AiAssistantPage />} />
            <Route path="redesign-evidence" element={<RedesignEvidencePage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
