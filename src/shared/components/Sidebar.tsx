import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { HomeIcon, UsersIcon, BriefcaseIcon, UserCheckIcon, FileTextIcon, CheckCircleIcon, DollarSignIcon, SparklesIcon, ShieldIcon, WhatsAppIcon, SettingsIcon } from './icons/Icons';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getNavLinks = () => {
    if (!user) return [];

    // Prioritize nav links based on role hierarchy
    if (user.roles.includes(UserRole.ADMIN)) {
      return [
        { icon: <HomeIcon />, label: 'Dashboard', path: '/' },
        { icon: <UsersIcon />, label: 'User Management', path: '/users' },
        { icon: <ShieldIcon />, label: 'Role Management', path: '/roles' },
        { icon: <UsersIcon />, label: 'All Customers', path: '/customers' },
        { icon: <BriefcaseIcon />, label: 'Itineraries', path: '/itineraries' },
        { icon: <DollarSignIcon />, label: 'Bookings', path: '/bookings' },
        { icon: <SparklesIcon />, label: 'AI Itinerary Generator', path: '/generate-itinerary' },
        { icon: <WhatsAppIcon />, label: 'WhatsApp Messaging', path: '/whatsapp' },
        { icon: <CheckCircleIcon />, label: 'Compliance', path: '/compliance' },
        { icon: <SettingsIcon />, label: 'API Settings', path: '/settings' },
      ];
    }
    if (user.roles.includes(UserRole.AGENT)) {
      return [
        { icon: <HomeIcon />, label: 'Dashboard', path: '/' },
        { icon: <UsersIcon />, label: 'Customers', path: '/customers' },
        { icon: <BriefcaseIcon />, label: 'Itineraries', path: '/itineraries' },
        { icon: <DollarSignIcon />, label: 'Bookings', path: '/bookings' },
      ];
    }
    if (user.roles.includes(UserRole.RELATIONSHIP_MANAGER)) {
      return [
        { icon: <HomeIcon />, label: 'Dashboard', path: '/' },
        { icon: <UserCheckIcon />, label: 'Assigned Customers', path: '/customers' },
      ];
    }
    if (user.roles.includes(UserRole.CUSTOMER)) {
      return [
        { icon: <HomeIcon />, label: 'My Dashboard', path: '/' },
        { icon: <FileTextIcon />, label: 'Documents', path: '/documents' },
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex flex-col w-64 bg-sidebar text-gray-800 border-r border-gray-200 h-full">
      <div className="flex items-center justify-between h-20 px-4 border-b border-gray-200">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Travelplans.fun</h1>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-gray-600 hover:text-gray-800"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="mt-6">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              onClick={onClose}
              className={`flex items-center mt-2 py-3 px-4 sm:px-6 text-gray-600 hover:bg-sidebar-accent hover:text-primary transition-colors rounded-lg mx-2 ${location.pathname === link.path ? 'bg-sidebar-accent text-primary font-semibold' : ''}`}
            >
              {link.icon}
              <span className="mx-2 sm:mx-3 text-sm sm:text-base">{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;