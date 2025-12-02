import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogoutIcon, UserCircleIcon } from './icons/Icons';
import UserProfileModal from './UserProfileModal';
import { UserRole } from '../types';

// Define role-specific colors for better visual distinction
const roleColors: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500',
  [UserRole.AGENT]: 'bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-blue-500',
  [UserRole.CUSTOMER]: 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500',
  [UserRole.RELATIONSHIP_MANAGER]: 'bg-orange-100 text-orange-800 hover:bg-orange-200 focus:ring-orange-500',
};

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const isAdmin = user.roles.includes(UserRole.ADMIN);

  const handleRoleClick = (role: UserRole) => {
    navigate(`/users?role=${encodeURIComponent(role)}`);
  };

  return (
    <>
      <header className="flex justify-between items-center p-3 sm:p-4 bg-white border-b-2 border-gray-200">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden text-gray-600 hover:text-gray-800 focus:outline-none"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <h1 className="text-base sm:text-xl font-semibold text-gray-800 hidden sm:block">Welcome, {user.name}</h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div 
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg p-1 cursor-pointer"
          >
              <div className="relative flex-shrink-0">
                <UserCircleIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              </div>
              <div className="ml-2 sm:ml-3">
                 <p className="text-sm sm:text-md font-semibold text-gray-800 group-hover:text-primary transition-colors hidden sm:block">{user.name}</p>
                 <div className="flex flex-wrap items-center gap-1 sm:mt-1">
                    {user.roles.map(role => (
                        <span 
                          key={role} 
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent modal from opening when clicking a role
                            if (isAdmin) {
                              handleRoleClick(role);
                            }
                          }}
                          className={`px-1.5 sm:px-2 py-0.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${isAdmin ? 'cursor-pointer' : 'cursor-default'} ${roleColors[role] || 'bg-gray-100 text-gray-800'} ${!isAdmin ? 'opacity-70' : ''}`}
                          title={isAdmin ? `Filter users by role: ${role}` : role}
                        >
                          {role}
                        </span>
                    ))}
                 </div>
              </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-primary transition-colors p-1 sm:p-0"
            title="Logout"
          >
            <LogoutIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="ml-1 sm:ml-2 hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      {isProfileModalOpen && (
        <UserProfileModal 
          user={user} 
          isOpen={isProfileModalOpen} 
          onClose={() => setProfileModalOpen(false)} 
        />
      )}
    </>
  );
};

export default Header;