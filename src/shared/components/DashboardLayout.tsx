import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Chatbot from './Chatbot';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const showChatbot = user?.roles.includes(UserRole.AGENT) || user?.roles.includes(UserRole.CUSTOMER);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar - Mobile responsive */}
      <div className={`fixed md:static inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden w-full md:w-auto">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-3 sm:p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
      {showChatbot && <Chatbot />}
    </div>
  );
};

export default DashboardLayout;