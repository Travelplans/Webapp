import React from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { UserRole } from '../../../shared/types';
import DashboardLayout from '../../../shared/components/DashboardLayout';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import AgentDashboard from '../components/dashboards/AgentDashboard';
import CustomerDashboard from '../components/dashboards/CustomerDashboard';
import RelationshipManagerDashboard from '../components/dashboards/RelationshipManagerDashboard';

const DashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Redirect to login if not authenticated (though App.tsx should handle this)
  if (!user) {
    return (
      <DashboardLayout>
        <div className="p-4">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            Please login to access the dashboard.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const renderDashboard = () => {
    // Prioritize dashboards based on role hierarchy
    if (user.roles.includes(UserRole.ADMIN)) {
      return <AdminDashboard />;
    }
    if (user.roles.includes(UserRole.AGENT)) {
      return <AgentDashboard />;
    }
    if (user.roles.includes(UserRole.RELATIONSHIP_MANAGER)) {
      return <RelationshipManagerDashboard />;
    }
    if (user.roles.includes(UserRole.CUSTOMER)) {
      return <CustomerDashboard />;
    }
    
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Invalid Role: No dashboard available for your role.
        </div>
      </div>
    );
  };

  return <DashboardLayout>{renderDashboard()}</DashboardLayout>;
};

export default DashboardPage;