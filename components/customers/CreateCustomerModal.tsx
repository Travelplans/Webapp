import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { addCustomer } = useData();
  const { addToast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');

  const clearForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setDob('');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        addToast("You must be logged in to create a customer.", 'error');
        return;
    }

    addCustomer({
        firstName,
        lastName,
        email,
        dob,
        registeredByAgentId: user.id,
    });
    
    addToast('Customer registered successfully!', 'success');
    clearForm();
    onClose();
  };
  
  const handleClose = () => {
    clearForm();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Customer">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input type="text" id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
            <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input type="text" id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
        </div>
        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input type="date" id="dob" value={dob} onChange={e => setDob(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
        </div>

        <div className="pt-5 flex justify-end space-x-3">
          <button type="button" onClick={handleClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Cancel
          </button>
          <Button type="submit">Save Customer</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCustomerModal;