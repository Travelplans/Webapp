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
import { isAdmin, DEFAULT_SYSTEM_ROLE_PERMISSIONS } from '../../../shared/utils/permissions';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';

const RoleManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [systemRoles, setSystemRoles] = useState<Array<CustomRole & { isSystemRole: true }>>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<CustomRole | undefined>(undefined);
  const [roleToDelete, setRoleToDelete] = useState<CustomRole | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Combine system and custom roles for display
  const allRoles = useMemo(() => {
    const combined = [...systemRoles, ...customRoles];
    console.log('[RoleManagementPage] Combined roles:', {
      systemRolesCount: systemRoles.length,
      customRolesCount: customRoles.length,
      totalCount: combined.length,
      systemRoles: systemRoles.map(r => r.name),
      customRoles: customRoles.map(r => r.name),
    });
    return combined;
  }, [systemRoles, customRoles]);

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

  // Load system roles and custom roles
  React.useEffect(() => {
    const loadRoles = async () => {
      try {
        // Load system roles from Firestore or use defaults
        const systemRolesList: Array<CustomRole & { isSystemRole: true }> = [];
        const systemRoleDescriptions: Record<UserRole, string> = {
          [UserRole.ADMIN]: 'Full system access with all permissions',
          [UserRole.AGENT]: 'Can manage customers, bookings, and assigned itineraries',
          [UserRole.CUSTOMER]: 'Can view itineraries, bookings, and manage own documents',
          [UserRole.RELATIONSHIP_MANAGER]: 'Can view and manage customer relationships',
        };
        
        // Try to load system roles from Firestore
        try {
          const systemRolesSnapshot = await getDocs(collection(db, 'systemRoles'));
          const systemRolesMap = new Map<UserRole, { permissions: Permission[], description?: string }>();
          
          systemRolesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const roleName = data.name as UserRole;
            if (roleName && data.permissions && Array.isArray(data.permissions)) {
              systemRolesMap.set(roleName, {
                permissions: data.permissions as Permission[],
                description: data.description,
              });
            }
          });
          
          // Build system roles list from Firestore or defaults
          for (const roleName of Object.values(UserRole)) {
            const storedRole = systemRolesMap.get(roleName);
            const permissions = storedRole?.permissions || DEFAULT_SYSTEM_ROLE_PERMISSIONS[roleName] || [];
            systemRolesList.push({
              id: `system-${roleName}`,
              name: roleName,
              description: storedRole?.description || systemRoleDescriptions[roleName] || `System role: ${roleName}`,
              permissions: permissions,
              isSystemRole: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.warn('[RoleManagementPage] Error loading system roles from Firestore, using defaults:', error);
          // Fallback to defaults
          for (const roleName of Object.values(UserRole)) {
            const permissions = DEFAULT_SYSTEM_ROLE_PERMISSIONS[roleName] || [];
            systemRolesList.push({
              id: `system-${roleName}`,
              name: roleName,
              description: systemRoleDescriptions[roleName] || `System role: ${roleName}`,
              permissions: permissions,
              isSystemRole: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
        
        console.log('[RoleManagementPage] Loaded system roles:', systemRolesList);
        setSystemRoles(systemRolesList);
        
        // Load custom roles from Firestore
        const rolesSnapshot = await getDocs(collection(db, 'customRoles'));
        const rolesData = rolesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as CustomRole[];
        console.log('[RoleManagementPage] Loaded custom roles:', rolesData);
        setCustomRoles(rolesData);
      } catch (error) {
        console.error('[RoleManagementPage] Error loading roles:', error);
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
        // Check if this is a system role
        const isSystemRole = roleData.id.startsWith('system-');
        
        if (isSystemRole) {
          // Update system role in Firestore
          const roleName = roleData.name as UserRole;
          if (roleName === UserRole.ADMIN) {
            addToast('Cannot edit Admin role permissions', 'error');
            return;
          }
          
          // Find or create system role document
          const systemRolesSnapshot = await getDocs(
            query(collection(db, 'systemRoles'), where('name', '==', roleName))
          );
          
          const updateData: any = {
            name: roleName,
            permissions: roleData.permissions,
            updatedAt: new Date().toISOString(),
          };
          
          if (roleData.description && roleData.description.trim()) {
            updateData.description = roleData.description.trim();
          }
          
          if (systemRolesSnapshot.empty) {
            // Create new system role document
            await addDoc(collection(db, 'systemRoles'), {
              ...updateData,
              createdAt: new Date().toISOString(),
            });
          } else {
            // Update existing system role document
            const roleDoc = systemRolesSnapshot.docs[0];
            await updateDoc(doc(db, 'systemRoles', roleDoc.id), updateData);
          }
          
          // Update local state
          setSystemRoles(systemRoles.map(r => 
            r.id === roleData.id 
              ? { ...roleData, updatedAt: new Date().toISOString() } 
              : r
          ));
          
          // Clear cache to force reload
          const { clearSystemRolesCache } = await import('../../../shared/utils/permissions');
          clearSystemRolesCache();
          
          addToast('System role updated successfully!', 'success');
        } else {
          // Update custom role
          const roleRef = doc(db, 'customRoles', roleData.id);
          const updateData: any = {
            name: roleData.name,
            permissions: roleData.permissions,
            updatedAt: new Date().toISOString(),
          };
          // Only include description if it has a value
          if (roleData.description && roleData.description.trim()) {
            updateData.description = roleData.description.trim();
          }
          await updateDoc(roleRef, updateData);
          setCustomRoles(customRoles.map(r => r.id === roleData.id ? { ...roleData, updatedAt: new Date().toISOString() } : r));
          addToast('Role updated successfully!', 'success');
        }
      } else {
        // Create new role - explicitly construct object to avoid undefined values
        const newRole: any = {
          name: roleData.name.trim(),
          permissions: roleData.permissions,
          isSystemRole: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        // Only include description if it has a value
        if (roleData.description && roleData.description.trim()) {
          newRole.description = roleData.description.trim();
        }
        // Remove any undefined values
        Object.keys(newRole).forEach(key => {
          if (newRole[key] === undefined || newRole[key] === null) {
            delete newRole[key];
          }
        });
        console.log('Creating new role:', newRole);
        const docRef = await addDoc(collection(db, 'customRoles'), newRole);
        setCustomRoles([...customRoles, { ...newRole, id: docRef.id } as CustomRole]);
        addToast('Role created successfully!', 'success');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving role:', error);
      addToast(`Failed to save role: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleDelete = async () => {
    if (roleToDelete && !roleToDelete.isSystemRole) {
      try {
        await deleteDoc(doc(db, 'customRoles', roleToDelete.id));
        setCustomRoles(customRoles.filter(r => r.id !== roleToDelete.id));
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Role Management</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Create and manage custom roles with granular permissions</p>
          </div>
          <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto mt-4 sm:mt-0">
            <ShieldIcon className="w-4 h-4 mr-2 inline" />
            Create New Role
          </Button>
        </div>

        {/* Roles List */}
        <Card>
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Description</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Permissions</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allRoles.map(role => (
                  <tr key={role.id}>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="text-sm font-medium text-gray-900">{role.name}</div>
                      <div className="text-xs text-gray-500 sm:hidden mt-1">{role.description || 'No description'}</div>
                      <div className="text-xs text-gray-400 sm:hidden mt-1">
                        {role.permissions?.length || 0} permission{(role.permissions?.length || 0) !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <div className="text-sm text-gray-500">{role.description || 'No description'}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                      <div className="text-sm text-gray-500">
                        {role.permissions?.length || 0} permission{(role.permissions?.length || 0) !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        role.isSystemRole 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {role.isSystemRole ? 'System' : 'Custom'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                      {role.isSystemRole ? (
                        // Allow editing system roles except Admin
                        role.name === UserRole.ADMIN ? (
                          <span className="text-xs text-gray-400 italic">Admin role cannot be edited</span>
                        ) : (
                          <button 
                            onClick={() => handleOpenEditModal(role)} 
                            className="text-primary hover:text-primary-dark p-1.5 sm:p-2 rounded-full hover:bg-gray-100 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center touch-manipulation"
                            title="Edit system role permissions"
                          >
                            <EditIcon/>
                          </button>
                        )
                      ) : (
                        <>
                          <button 
                            onClick={() => handleOpenEditModal(role)} 
                            className="text-primary hover:text-primary-dark p-1.5 sm:p-2 rounded-full hover:bg-gray-100 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center touch-manipulation"
                          >
                            <EditIcon/>
                          </button>
                          <button 
                            onClick={() => handleOpenConfirmModal(role)} 
                            className="ml-1 sm:ml-2 text-red-600 hover:text-red-800 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center touch-manipulation"
                          >
                            <DeleteIcon/>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {allRoles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No roles found.
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

    // Prevent editing Admin role
    if (roleToEdit?.isSystemRole && roleToEdit?.name === UserRole.ADMIN) {
      alert('Cannot edit Admin role permissions');
      return;
    }

    const roleData: CustomRole = {
      id: roleToEdit?.id || '',
      name: name.trim(),
      description: description.trim() || '', // Ensure it's never undefined
      permissions: selectedPermissions,
      isSystemRole: roleToEdit?.isSystemRole || false,
      createdAt: roleToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(roleData);
  };

  const isSystemRole = roleToEdit?.isSystemRole || false;
  const isAdminRole = roleToEdit?.name === UserRole.ADMIN;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isSystemRole && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            <strong>System Role:</strong> This is a system role. You can modify its permissions but not its name.
          </p>
        </div>
      )}
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
          disabled={isSystemRole}
          className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
            isSystemRole ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'text-gray-900 bg-white'
          }`}
          placeholder="e.g., Senior Agent, Sales Manager"
        />
        {isSystemRole && (
          <p className="mt-1 text-xs text-gray-500">System role names cannot be changed</p>
        )}
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
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 bg-white"
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

