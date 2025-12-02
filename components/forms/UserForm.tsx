
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import Button from '../shared/Button';

interface UserFormProps {
  onClose: () => void;
  onSubmit: (user: any) => void;
  userToEdit?: User;
}

const UserForm: React.FC<UserFormProps> = ({ onClose, onSubmit, userToEdit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setRoles(userToEdit.roles || []);
    } else {
      setName('');
      setEmail('');
      setRoles([]);
    }
  }, [userToEdit]);

  const handleRoleChange = (role: UserRole) => {
    setRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roles.length === 0) {
      alert('A user must have at least one role.');
      return;
    }
    const userData = {
      ...userToEdit,
      name,
      email,
      roles,
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
        <label className="block text-sm font-medium text-gray-700">Roles</label>
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

      <div className="pt-5 flex justify-end space-x-3">
        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Cancel</button>
        <Button type="submit">{userToEdit ? 'Save Changes' : 'Create User'}</Button>
      </div>
    </form>
  );
};

export default UserForm;