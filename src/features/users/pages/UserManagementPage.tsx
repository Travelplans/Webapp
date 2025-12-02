import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../../shared/components/DashboardLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Modal from '../../../shared/components/Modal';
import ConfirmationModal from '../../../shared/components/ConfirmationModal';
import UserForm from '../components/UserForm';
import { useData } from '../../../shared/hooks/useData';
import { useToast } from '../../../shared/hooks/useToast';
import { User, UserRole } from '../../../shared/types';
import { EditIcon, DeleteIcon, UserCircleIcon } from '../../../shared/components/icons/Icons';

const UserManagementPage: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useData();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | UserRole>('All');
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | undefined>(undefined);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    const roleFromQuery = searchParams.get('role');
    if (roleFromQuery && Object.values(UserRole).includes(roleFromQuery as UserRole)) {
        setRoleFilter(roleFromQuery as UserRole);
    } else {
        setRoleFilter('All');
    }
  }, [searchParams]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchMatch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const roleMatch = roleFilter === 'All' || user.roles.includes(roleFilter as UserRole);
      return searchMatch && roleMatch;
    });
  }, [searchQuery, roleFilter, users]);
  
  const handleOpenCreateModal = () => {
    setUserToEdit(undefined);
    setModalOpen(true);
  };
  
  const handleOpenEditModal = (user: User) => {
    setUserToEdit(user);
    setModalOpen(true);
  };

  const handleOpenConfirmModal = (user: User) => {
    setUserToDelete(user);
    setConfirmOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setUserToEdit(undefined);
  };
  
  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleFormSubmit = (user: User) => {
    if (user.id) {
      updateUser(user);
      addToast('User updated successfully!', 'success');
    } else {
      addUser(user);
      addToast('User created successfully!', 'success');
    }
    handleCloseModal();
  };

  const handleDelete = () => {
    if(userToDelete) {
        deleteUser(userToDelete.id);
        addToast(`User "${userToDelete.name}" deleted successfully.`, 'success');
        handleCloseConfirm();
    }
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as 'All' | UserRole;
    setRoleFilter(newRole);
    if (newRole === 'All') {
        searchParams.delete('role');
    } else {
        searchParams.set('role', newRole);
    }
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">User Management</h1>
            <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto">Create New User</Button>
        </div>

        {/* Filter Controls */}
        <Card>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full sm:max-w-xs pl-3 sm:pl-4 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <label htmlFor="role-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by role:</label>
                <select id="role-filter" onChange={handleRoleFilterChange} value={roleFilter} className="w-full sm:w-auto pl-3 pr-8 sm:pr-10 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md">
                  <option value="All">All Roles</option>
                  {Object.values(UserRole).map(role => (
                      <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
          </div>
        </Card>

        {/* User Table */}
        <Card>
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500 sm:hidden mt-1">{user.email}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{user.email}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map(role => (
                          <span key={role} className="px-1.5 sm:px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleOpenEditModal(user)} className="text-primary hover:text-primary-dark p-1.5 sm:p-2 rounded-full hover:bg-gray-100"><EditIcon/></button>
                      <button onClick={() => handleOpenConfirmModal(user)} className="ml-1 sm:ml-2 text-red-600 hover:text-red-800 p-1.5 sm:p-2 rounded-full hover:bg-gray-100"><DeleteIcon/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={userToEdit ? 'Edit User' : 'Create New User'}>
        <UserForm onClose={handleCloseModal} onSubmit={handleFormSubmit} userToEdit={userToEdit} />
      </Modal>

      {userToDelete && (
        <ConfirmationModal 
          isOpen={isConfirmOpen}
          onClose={handleCloseConfirm}
          onConfirm={handleDelete}
          title="Delete User"
          message={`Are you sure you want to delete the user "${userToDelete.name}"? This action cannot be undone.`}
        />
      )}
    </DashboardLayout>
  );
};

export default UserManagementPage;