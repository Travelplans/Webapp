import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Chatbot from './Chatbot';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  const showChatbot = user?.roles.includes(UserRole.AGENT) || user?.roles.includes(UserRole.CUSTOMER);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 md:p-8">
          {children}
        </main>
      </div>
      {showChatbot && <Chatbot />}
    </div>
  );
};

export default DashboardLayout;