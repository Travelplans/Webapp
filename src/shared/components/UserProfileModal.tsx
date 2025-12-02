
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import Modal from './Modal';
import { UserCircleIcon } from './icons/Icons';

// Define role-specific colors for better visual distinction and consistency with the Header
const roleColors: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900 focus:ring-red-500',
  [UserRole.AGENT]: 'bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900 focus:ring-blue-500',
  [UserRole.CUSTOMER]: 'bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900 focus:ring-green-500',
  [UserRole.RELATIONSHIP_MANAGER]: 'bg-orange-100 text-orange-800 hover:bg-orange-200 hover:text-orange-900 focus:ring-orange-500',
};

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRoleClick = (role: UserRole) => {
    onClose(); // Close the modal first
    navigate(`/users?role=${encodeURIComponent(role)}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Profile">
      <div className="flex flex-col items-center text-center p-4">
        <div className="relative">
          <UserCircleIcon className="h-24 w-24 text-gray-400" />
        </div>
        <h3 className="mt-4 text-2xl font-bold text-gray-900">{user.name}</h3>
        <p className="mt-1 text-md text-gray-500">{user.email}</p>
        <div className="mt-4 border-t w-full pt-4">
          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Roles</h4>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {user.roles.map(role => (
              <button 
                key={role} 
                onClick={() => handleRoleClick(role)}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors focus:outline-none focus:ring-2 ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}
                title={`Filter users by role: ${role}`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UserProfileModal;