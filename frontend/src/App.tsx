import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { VersionListingPage } from './pages/VersionListingPage';
import { AppLayout } from './components/layout/AppLayout';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/versions" element={<VersionListingPage />} />
            </Route>
          </Route>

          {/* Default Fallback Redirects to /versions */}
          <Route path="/" element={<Navigate to="/versions" replace />} />
          <Route path="*" element={<Navigate to="/versions" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
