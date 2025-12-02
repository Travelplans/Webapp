/**
 * Role Management Page - Admin Only
 * Allows admins to create and manage custom roles with granular permissions
 */

import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../../shared/components/DashboardLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Modal from '../../../shared/components/Modal';
import ConfirmationModal from '../../../shared/components/ConfirmationModal';
import { useAuth } from '../../../shared/hooks/useAuth';
import { useToast } from '../../../shared/hooks/useToast';
import { CustomRole, Permission, PermissionGroups, UserRole } from '../../../shared/types';
import { EditIcon, DeleteIcon } from '../../../shared/components/icons/Icons';
import { ShieldIcon } from '../../../shared/components/icons/Icons';
import { isAdmin } from '../../../shared/utils/permissions';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';

const RoleManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<CustomRole | undefined>(undefined);
  const [roleToDelete, setRoleToDelete] = useState<CustomRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  if (!user || !isAdmin(user)) {
    return (
      <DashboardLayout>
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600 font-semibold">Access Denied</p>
            <p className="text-gray-600 mt-2">Only administrators can access role management.</p>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  // Load roles from Firestore
  React.useEffect(() => {
    const loadRoles = async () => {
      try {
        const rolesSnapshot = await getDocs(collection(db, 'customRoles'));
        const rolesData = rolesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as CustomRole[];
        setRoles(rolesData);
      } catch (error) {
        console.error('Error loading roles:', error);
        addToast('Failed to load roles', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, [addToast]);

  const handleOpenCreateModal = () => {
    setRoleToEdit(undefined);
    setModalOpen(true);
  };

  const handleOpenEditModal = (role: CustomRole) => {
    setRoleToEdit(role);
    setModalOpen(true);
  };

  const handleOpenConfirmModal = (role: CustomRole) => {
    setRoleToDelete(role);
    setConfirmOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setRoleToEdit(undefined);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setRoleToDelete(null);
  };

  const handleFormSubmit = async (roleData: CustomRole) => {
    try {
      if (roleData.id) {
        // Update existing role
        const roleRef = doc(db, 'customRoles', roleData.id);
        await updateDoc(roleRef, {
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
          updatedAt: new Date().toISOString(),
        });
        setRoles(roles.map(r => r.id === roleData.id ? { ...roleData, updatedAt: new Date().toISOString() } : r));
        addToast('Role updated successfully!', 'success');
      } else {
        // Create new role
        const newRole = {
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
          isSystemRole: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const docRef = await addDoc(collection(db, 'customRoles'), newRole);
        setRoles([...roles, { ...newRole, id: docRef.id } as CustomRole]);
        addToast('Role created successfully!', 'success');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving role:', error);
      addToast('Failed to save role', 'error');
    }
  };

  const handleDelete = async () => {
    if (roleToDelete && !roleToDelete.isSystemRole) {
      try {
        await deleteDoc(doc(db, 'customRoles', roleToDelete.id));
        setRoles(roles.filter(r => r.id !== roleToDelete.id));
        addToast(`Role "${roleToDelete.name}" deleted successfully.`, 'success');
        handleCloseConfirm();
      } catch (error) {
        console.error('Error deleting role:', error);
        addToast('Failed to delete role', 'error');
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600">Loading roles...</p>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Role Management</h1>
            <p className="text-sm text-gray-600 mt-1">Create and manage custom roles with granular permissions</p>
          </div>
          <Button onClick={handleOpenCreateModal} className="mt-4 md:mt-0">
            <ShieldIcon className="w-4 h-4 mr-2 inline" />
            Create New Role
          </Button>
        </div>

        {/* Roles List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roles.map(role => (
                  <tr key={role.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{role.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{role.description || 'No description'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        role.isSystemRole 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {role.isSystemRole ? 'System' : 'Custom'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleOpenEditModal(role)} 
                        className="text-primary hover:text-primary-dark p-2 rounded-full hover:bg-gray-100"
                      >
                        <EditIcon/>
                      </button>
                      {!role.isSystemRole && (
                        <button 
                          onClick={() => handleOpenConfirmModal(role)} 
                          className="ml-2 text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-gray-100"
                        >
                          <DeleteIcon/>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {roles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No custom roles found. Create your first role to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={roleToEdit ? 'Edit Role' : 'Create New Role'}
      >
        <RoleForm 
          onClose={handleCloseModal} 
          onSubmit={handleFormSubmit} 
          roleToEdit={roleToEdit}
        />
      </Modal>

      {roleToDelete && (
        <ConfirmationModal 
          isOpen={isConfirmOpen}
          onClose={handleCloseConfirm}
          onConfirm={handleDelete}
          title="Delete Role"
          message={`Are you sure you want to delete the role "${roleToDelete.name}"? This action cannot be undone. Users with this role will lose these permissions.`}
        />
      )}
    </DashboardLayout>
  );
};

// Role Form Component
interface RoleFormProps {
  onClose: () => void;
  onSubmit: (role: CustomRole) => void;
  roleToEdit?: CustomRole;
}

const RoleForm: React.FC<RoleFormProps> = ({ onClose, onSubmit, roleToEdit }) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [selectedPermissions, setSelectedPermissions] = React.useState<Permission[]>([]);

  React.useEffect(() => {
    if (roleToEdit) {
      setName(roleToEdit.name);
      setDescription(roleToEdit.description);
      setSelectedPermissions(roleToEdit.permissions || []);
    } else {
      setName('');
      setDescription('');
      setSelectedPermissions([]);
    }
  }, [roleToEdit]);

  const handlePermissionToggle = (permission: Permission) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleGroupToggle = (groupPermissions: Permission[]) => {
    const allSelected = groupPermissions.every(p => selectedPermissions.includes(p));
    if (allSelected) {
      // Deselect all in group
      setSelectedPermissions(prev => prev.filter(p => !groupPermissions.includes(p)));
    } else {
      // Select all in group
      setSelectedPermissions(prev => [...new Set([...prev, ...groupPermissions])]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Role name is required');
      return;
    }
    if (selectedPermissions.length === 0) {
      alert('At least one permission must be selected');
      return;
    }

    const roleData: CustomRole = {
      id: roleToEdit?.id || '',
      name: name.trim(),
      description: description.trim(),
      permissions: selectedPermissions,
      isSystemRole: false,
      createdAt: roleToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(roleData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="role-name" className="block text-sm font-medium text-gray-700">
          Role Name *
        </label>
        <input
          type="text"
          id="role-name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          placeholder="e.g., Senior Agent, Sales Manager"
        />
      </div>

      <div>
        <label htmlFor="role-description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="role-description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          placeholder="Describe the role and its responsibilities"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Permissions * ({selectedPermissions.length} selected)
        </label>
        
        <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
          {Object.entries(PermissionGroups).map(([groupName, groupPermissions]) => {
            const allSelected = groupPermissions.every(p => selectedPermissions.includes(p));
            const someSelected = groupPermissions.some(p => selectedPermissions.includes(p));
            
            return (
              <div key={groupName} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-800 capitalize">
                    {groupName.replace('_', ' ')}
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleGroupToggle(groupPermissions)}
                    className="text-xs text-primary hover:text-primary-dark"
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-4">
                  {groupPermissions.map(permission => (
                    <label
                      key={permission}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission)}
                        onChange={() => handlePermissionToggle(permission)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-5 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Cancel
        </button>
        <Button type="submit">
          {roleToEdit ? 'Update Role' : 'Create Role'}
        </Button>
      </div>
    </form>
  );
};

export default RoleManagementPage;

