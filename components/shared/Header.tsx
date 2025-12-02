import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogoutIcon, UserCircleIcon } from './icons/Icons';
import UserProfileModal from './UserProfileModal';
import { UserRole } from '../../types';

// Define role-specific colors for better visual distinction
const roleColors: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500',
  [UserRole.AGENT]: 'bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-blue-500',
  [UserRole.CUSTOMER]: 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500',
  [UserRole.RELATIONSHIP_MANAGER]: 'bg-orange-100 text-orange-800 hover:bg-orange-200 focus:ring-orange-500',
};

const Header: React.FC = () => {
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
      <header className="flex justify-between items-center p-4 bg-white border-b-2 border-gray-200">
        <div>
           <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">Welcome, {user.name}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg p-1"
          >
              <div className="relative flex-shrink-0">
                <UserCircleIcon className="h-12 w-12 text-gray-400" />
              </div>
              <div className="ml-3">
                 <p className="text-md font-semibold text-gray-800 group-hover:text-primary transition-colors hidden sm:block">{user.name}</p>
                 <div className="flex flex-wrap items-center gap-1 sm:mt-1">
                    {user.roles.map(role => (
                        <button 
                          key={role} 
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent modal from opening when clicking a role
                            if (isAdmin) {
                              handleRoleClick(role);
                            }
                          }}
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full transition-colors focus:outline-none focus:ring-2 ${roleColors[role] || 'bg-gray-100 text-gray-800'} disabled:opacity-70 disabled:cursor-not-allowed`}
                          title={isAdmin ? `Filter users by role: ${role}` : role}
                          disabled={!isAdmin}
                        >
                          {role}
                        </button>
                    ))}
                 </div>
              </div>
          </button>
          <button
            onClick={logout}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            title="Logout"
          >
            <LogoutIcon />
            <span className="ml-2 hidden md:inline">Logout</span>
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