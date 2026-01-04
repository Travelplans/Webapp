
import React, { useState, useEffect } from 'react';
import { User, UserRole, CustomRole } from '../../../shared/types';
import Button from '../../../shared/components/Button';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { updateUserPassword } from '../../../services/api/aiService';

interface UserFormProps {
  onClose: () => void;
  onSubmit: (user: any) => void;
  userToEdit?: User;
}

const UserForm: React.FC<UserFormProps> = ({ onClose, onSubmit, userToEdit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+971'); // Default to UAE
  const [contactNumber, setContactNumber] = useState('');
  const [useSameAsContact, setUseSameAsContact] = useState(true);
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('+971');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [password, setPassword] = useState('');
  const [updatePassword, setUpdatePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
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
        // Silently fail - custom roles are optional
        console.error('Error loading custom roles:', error);
        setCustomRoles([]);
      }
    };
    loadCustomRoles();
  }, []);

  // Sync WhatsApp country code with contact country code when useSameAsContact is true
  useEffect(() => {
    if (useSameAsContact) {
      setWhatsappCountryCode(countryCode);
    }
  }, [countryCode, useSameAsContact]);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setCountryCode(userToEdit.countryCode || '+971');
      setContactNumber(userToEdit.contactNumber || '');
      setUseSameAsContact(userToEdit.useSameAsContact !== false); // Default to true if not set
      setWhatsappCountryCode(userToEdit.whatsappCountryCode || userToEdit.countryCode || '+971');
      setWhatsappNumber(userToEdit.whatsappNumber || '');
      setPassword(''); // Don't show password for existing users
      setUpdatePassword(false);
      setNewPassword('');
      setRoles(userToEdit.roles || []);
      setSelectedCustomRoles(userToEdit.customRoles || []);
    } else {
      setName('');
      setEmail('');
      setCountryCode('+971');
      setContactNumber('');
      setUseSameAsContact(true);
      setWhatsappCountryCode('+971');
      setWhatsappNumber('');
      setPassword('');
      setUpdatePassword(false);
      setNewPassword('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation - Email is mandatory
    if (!email || !email.trim()) {
      alert('Email address is required.');
      return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      alert('Please enter a valid email address.');
      return;
    }
    
    // Validation - Contact number is mandatory
    if (!countryCode || !countryCode.trim()) {
      alert('Country code is required.');
      return;
    }
    if (!contactNumber || !contactNumber.trim()) {
      alert('Contact number is required.');
      return;
    }
    // Validate contact number format (digits only, reasonable length)
    const contactNumberDigits = contactNumber.replace(/\D/g, '');
    if (contactNumberDigits.length < 7 || contactNumberDigits.length > 15) {
      alert('Contact number must be between 7 and 15 digits.');
      return;
    }
    
    // Other validations
    if (roles.length === 0 && selectedCustomRoles.length === 0) {
      alert('A user must have at least one role (system or custom).');
      return;
    }
    if (!userToEdit && !password) {
      alert('Password is required for new users.');
      return;
    }
    if (!userToEdit && password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    
    // Validate password update for existing users
    if (userToEdit && updatePassword) {
      if (!newPassword || newPassword.length < 6) {
        alert('New password must be at least 6 characters long.');
        return;
      }
    }
    
    const userData: any = {
      ...userToEdit,
      name,
      email,
      countryCode: countryCode.trim(),
      contactNumber: contactNumberDigits, // Store only digits
      useSameAsContact,
      roles,
      customRoles: selectedCustomRoles,
    };
    
    // Handle WhatsApp number
    if (useSameAsContact) {
      // If using same as contact, don't include WhatsApp-specific fields
      // (Don't set to undefined - just omit them from the object)
      delete userData.whatsappCountryCode;
      delete userData.whatsappNumber;
    } else {
      // If different, validate and store WhatsApp number
      if (whatsappCountryCode && whatsappNumber) {
        const whatsappNumberDigits = whatsappNumber.replace(/\D/g, '');
        if (whatsappNumberDigits.length >= 7 && whatsappNumberDigits.length <= 15) {
          userData.whatsappCountryCode = whatsappCountryCode.trim();
          userData.whatsappNumber = whatsappNumberDigits;
        } else if (whatsappNumberDigits.length > 0) {
          alert('WhatsApp number must be between 7 and 15 digits.');
          return;
        } else {
          // If WhatsApp number is empty, don't include the fields
          delete userData.whatsappCountryCode;
          delete userData.whatsappNumber;
        }
      } else {
        // If WhatsApp fields are not provided, don't include them
        delete userData.whatsappCountryCode;
        delete userData.whatsappNumber;
      }
    }
    // Only include password for new users
    if (!userToEdit && password) {
      userData.password = password;
    }
    
    // Handle password update for existing users
    if (userToEdit && updatePassword && newPassword && userToEdit.id) {
      try {
        await updateUserPassword({
          userId: userToEdit.id,
          password: newPassword
        });
        // Password updated successfully, continue with user data update
      } catch (error) {
        console.error('Error updating password:', error);
        alert(error instanceof Error ? error.message : 'Failed to update password.');
        return;
      }
    }
    
    // Final cleanup: Remove any undefined or null values before submitting
    Object.keys(userData).forEach(key => {
      if (userData[key] === undefined || userData[key] === null) {
        delete userData[key];
      }
    });
    
    onSubmit(userData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 bg-white" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 bg-white" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="countryCode" className="block text-sm font-medium text-gray-700">Country Code *</label>
          <select
            id="countryCode"
            value={countryCode}
            onChange={e => setCountryCode(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 bg-white"
          >
            <option value="+971">+971 (UAE)</option>
            <option value="+1">+1 (US/Canada)</option>
            <option value="+44">+44 (UK)</option>
            <option value="+91">+91 (India)</option>
            <option value="+61">+61 (Australia)</option>
            <option value="+65">+65 (Singapore)</option>
            <option value="+966">+966 (Saudi Arabia)</option>
            <option value="+974">+974 (Qatar)</option>
            <option value="+973">+973 (Bahrain)</option>
            <option value="+968">+968 (Oman)</option>
            <option value="+965">+965 (Kuwait)</option>
            <option value="+20">+20 (Egypt)</option>
            <option value="+27">+27 (South Africa)</option>
            <option value="+33">+33 (France)</option>
            <option value="+49">+49 (Germany)</option>
            <option value="+81">+81 (Japan)</option>
            <option value="+86">+86 (China)</option>
            <option value="+82">+82 (South Korea)</option>
            <option value="+60">+60 (Malaysia)</option>
            <option value="+62">+62 (Indonesia)</option>
            <option value="+66">+66 (Thailand)</option>
            <option value="+84">+84 (Vietnam)</option>
            <option value="+63">+63 (Philippines)</option>
            <option value="+64">+64 (New Zealand)</option>
            <option value="+971">+971 (UAE)</option>
          </select>
        </div>
        <div>
          <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number *</label>
          <input
            type="tel"
            id="contactNumber"
            value={contactNumber}
            onChange={e => {
              // Allow only digits, spaces, hyphens, and parentheses
              const value = e.target.value.replace(/[^\d\s\-()]/g, '');
              setContactNumber(value);
            }}
            required
            placeholder="e.g., 501234567"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 bg-white"
          />
          <p className="mt-1 text-xs text-gray-500">Enter number without country code (7-15 digits)</p>
        </div>
      </div>
      
      {/* WhatsApp Number Section */}
      <div className="border-t pt-4">
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="useSameAsContact"
            checked={useSameAsContact}
            onChange={e => {
              setUseSameAsContact(e.target.checked);
              if (e.target.checked) {
                // When checked, sync WhatsApp country code with contact country code
                setWhatsappCountryCode(countryCode);
                setWhatsappNumber('');
              }
            }}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="useSameAsContact" className="ml-2 block text-sm font-medium text-gray-700">
            Use same number as contact for WhatsApp
          </label>
        </div>
        
        {!useSameAsContact && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div>
              <label htmlFor="whatsappCountryCode" className="block text-sm font-medium text-gray-700">WhatsApp Country Code</label>
              <select
                id="whatsappCountryCode"
                value={whatsappCountryCode}
                onChange={e => setWhatsappCountryCode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 bg-white"
              >
                <option value="+971">+971 (UAE)</option>
                <option value="+1">+1 (US/Canada)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+91">+91 (India)</option>
                <option value="+61">+61 (Australia)</option>
                <option value="+65">+65 (Singapore)</option>
                <option value="+966">+966 (Saudi Arabia)</option>
                <option value="+974">+974 (Qatar)</option>
                <option value="+973">+973 (Bahrain)</option>
                <option value="+968">+968 (Oman)</option>
                <option value="+965">+965 (Kuwait)</option>
                <option value="+20">+20 (Egypt)</option>
                <option value="+27">+27 (South Africa)</option>
                <option value="+33">+33 (France)</option>
                <option value="+49">+49 (Germany)</option>
                <option value="+81">+81 (Japan)</option>
                <option value="+86">+86 (China)</option>
                <option value="+82">+82 (South Korea)</option>
                <option value="+60">+60 (Malaysia)</option>
                <option value="+62">+62 (Indonesia)</option>
                <option value="+66">+66 (Thailand)</option>
                <option value="+84">+84 (Vietnam)</option>
                <option value="+63">+63 (Philippines)</option>
                <option value="+64">+64 (New Zealand)</option>
              </select>
            </div>
            <div>
              <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
              <input
                type="tel"
                id="whatsappNumber"
                value={whatsappNumber}
                onChange={e => {
                  // Allow only digits, spaces, hyphens, and parentheses
                  const value = e.target.value.replace(/[^\d\s\-()]/g, '');
                  setWhatsappNumber(value);
                }}
                placeholder="e.g., 501234567"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 bg-white"
              />
              <p className="mt-1 text-xs text-gray-500">Enter number without country code (7-15 digits, optional)</p>
            </div>
          </div>
        )}
      </div>
      
      {!userToEdit && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required={!userToEdit} minLength={6} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 bg-white" />
          <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
        </div>
      )}
      
      {userToEdit && (
        <div>
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="updatePassword"
              checked={updatePassword}
              onChange={e => {
                setUpdatePassword(e.target.checked);
                if (!e.target.checked) {
                  setNewPassword('');
                }
              }}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="updatePassword" className="ml-2 block text-sm text-gray-700">
              Update Password
            </label>
          </div>
          {updatePassword && (
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
              <input 
                type="password" 
                id="newPassword" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                minLength={6} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 bg-white" 
              />
              <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
            </div>
          )}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">System Roles</label>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-2 p-2 sm:p-3 border rounded-md">
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
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-2 p-2 sm:p-3 border rounded-md bg-gray-50">
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

      <div className="pt-5 flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button type="button" onClick={onClose} className="w-full sm:w-auto bg-white py-2.5 sm:py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Cancel</button>
        <Button type="submit" className="w-full sm:w-auto">{userToEdit ? 'Save Changes' : 'Create User'}</Button>
      </div>
    </form>
  );
};

export default UserForm;