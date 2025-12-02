
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import DashboardLayout from '../components/shared/DashboardLayout';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import AgentDashboard from '../components/dashboards/AgentDashboard';
import CustomerDashboard from '../components/dashboards/CustomerDashboard';
import RelationshipManagerDashboard from '../components/dashboards/RelationshipManagerDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    if (!user) return <div>Invalid Role</div>;

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
    
    return <div>Invalid Role</div>;
  };

  return <DashboardLayout>{renderDashboard()}</DashboardLayout>;
};

export default DashboardPage;