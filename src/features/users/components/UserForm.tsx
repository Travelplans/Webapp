
import React, { useState, useEffect } from 'react';
import { User, UserRole, CustomRole } from '../../../shared/types';
import Button from '../../../shared/components/Button';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface UserFormProps {
  onClose: () => void;
  onSubmit: (user: any) => void;
  userToEdit?: User;
}

const UserForm: React.FC<UserFormProps> = ({ onClose, onSubmit, userToEdit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [selectedCustomRoles, setSelectedCustomRoles] = useState<string[]>([]);

  // Load custom roles from Firestore
  useEffect(() => {
    const loadCustomRoles = async () => {
      try {
        const rolesSnapshot = await getDocs(collection(db, 'customRoles'));
        const rolesData = rolesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as CustomRole[];
        setCustomRoles(rolesData);
      } catch (error) {
        console.error('Error loading custom roles:', error);
      }
    };
    loadCustomRoles();
  }, []);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setRoles(userToEdit.roles || []);
      setSelectedCustomRoles(userToEdit.customRoles || []);
    } else {
      setName('');
      setEmail('');
      setRoles([]);
      setSelectedCustomRoles([]);
    }
  }, [userToEdit]);

  const handleRoleChange = (role: UserRole) => {
    setRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleCustomRoleChange = (roleId: string) => {
    setSelectedCustomRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roles.length === 0 && selectedCustomRoles.length === 0) {
      alert('A user must have at least one role (system or custom).');
      return;
    }
    const userData = {
      ...userToEdit,
      name,
      email,
      roles,
      customRoles: selectedCustomRoles,
    };
    onSubmit(userData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">System Roles</label>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 p-2 border rounded-md">
          {Object.values(UserRole).map(role => (
            <div key={role} className="flex items-center">
              <input
                id={`role-${role}`}
                type="checkbox"
                checked={roles.includes(role)}
                onChange={() => handleRoleChange(role)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor={`role-${role}`} className="ml-2 block text-sm text-gray-900">{role}</label>
            </div>
          ))}
        </div>
      </div>

      {customRoles.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Custom Roles</label>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 p-2 border rounded-md bg-gray-50">
            {customRoles.map(role => (
              <div key={role.id} className="flex items-center">
                <input
                  id={`custom-role-${role.id}`}
                  type="checkbox"
                  checked={selectedCustomRoles.includes(role.id)}
                  onChange={() => handleCustomRoleChange(role.id)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor={`custom-role-${role.id}`} className="ml-2 block text-sm text-gray-900">
                  <span className="font-medium">{role.name}</span>
                  {role.description && (
                    <span className="text-xs text-gray-500 block">{role.description}</span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-5 flex justify-end space-x-3">
        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Cancel</button>
        <Button type="submit">{userToEdit ? 'Save Changes' : 'Create User'}</Button>
      </div>
    </form>
  );
};

export default UserForm;