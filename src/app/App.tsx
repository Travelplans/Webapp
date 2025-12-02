import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../shared/context/AuthContext';
import { DataProvider } from '../shared/context/DataContext';
import { ToastProvider } from '../shared/context/ToastContext';
import { QueryProvider } from '../shared/context/QueryProvider';
import { LoadingProvider } from '../shared/context/LoadingContext';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { useAuth } from '../shared/hooks/useAuth';
import { useData } from '../shared/hooks/useData';
import { UserRole } from '../shared/types';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('../features/auth/pages/Login'));
const DashboardPage = lazy(() => import('../features/dashboard/pages/Dashboard'));
const ItineraryDetailPage = lazy(() => import('../features/itineraries/pages/ItineraryDetail'));
const CustomersPage = lazy(() => import('../features/customers/pages/CustomersPage'));
const UserManagementPage = lazy(() => import('../features/users/pages/UserManagementPage'));
const RoleManagementPage = lazy(() => import('../features/users/pages/RoleManagementPage'));
const ItinerariesPage = lazy(() => import('../features/itineraries/pages/ItinerariesPage'));
const CompliancePage = lazy(() => import('../features/compliance/pages/CompliancePage'));
const DocumentsPage = lazy(() => import('../features/customers/pages/DocumentsPage'));
const BookingsPage = lazy(() => import('../features/bookings/pages/BookingsPage'));
const GenerateItineraryPage = lazy(() => import('../features/ai/pages/GenerateItineraryPage'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex h-screen w-screen items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { loading: dataLoading } = useData();

  // Only show loading spinner for auth, not data (data can load in background)
  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
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
        <Route 
          path="/roles" 
          element={
            user.roles.includes(UserRole.ADMIN) ? <RoleManagementPage /> : <Navigate to="/" />
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
    </Suspense>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <LoadingProvider>
          <AuthProvider>
            <ToastProvider>
              <DataProvider>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </DataProvider>
            </ToastProvider>
          </AuthProvider>
        </LoadingProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;

