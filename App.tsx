import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './hooks/useAuth';
import { useData } from './hooks/useData';
import { UserRole } from './types';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import ItineraryDetailPage from './pages/ItineraryDetail';
import CustomersPage from './pages/CustomersPage';
import UserManagementPage from './pages/UserManagementPage';
import ItinerariesPage from './pages/ItinerariesPage';
import CompliancePage from './pages/CompliancePage';
import DocumentsPage from './pages/DocumentsPage';
import BookingsPage from './pages/BookingsPage';
import GenerateItineraryPage from './pages/GenerateItineraryPage';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { loading: dataLoading } = useData();

  if (authLoading || dataLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" />} />
      <Route path="/" element={<DashboardPage />} />
      <Route path="/itinerary/:id" element={<ItineraryDetailPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route 
        path="/users" 
        element={
          user.roles.includes(UserRole.ADMIN) ? <UserManagementPage /> : <Navigate to="/" />
        } 
      />
      <Route path="/itineraries" element={<ItinerariesPage />} />
      <Route path="/compliance" element={<CompliancePage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/bookings" element={<BookingsPage />} />
      <Route 
        path="/generate-itinerary" 
        element={
          user.roles.includes(UserRole.ADMIN) ? <GenerateItineraryPage /> : <Navigate to="/" />
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <DataProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DataProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;