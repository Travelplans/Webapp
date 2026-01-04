import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../../shared/components/DashboardLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { useData } from '../../../shared/hooks/useData';
import { useToast } from '../../../shared/hooks/useToast';
import { useAuth } from '../../../shared/hooks/useAuth';
import { User, UserRole } from '../../../shared/types';
import { sendWhatsApp, SendWhatsAppResponse } from '../../../services/api/aiService';

const WhatsAppMessagingPage: React.FC = () => {
  const { users } = useData();
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();
  
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendWhatsAppResponse | null>(null);

  // Filter out admins and users without WhatsApp numbers
  const availableUsers = useMemo(() => {
    return users.filter(user => {
      // Exclude admins
      if (user.roles.includes(UserRole.ADMIN)) {
        return false;
      }
      
      // Check if user has WhatsApp number
      if (user.useSameAsContact !== false) {
        // Using contact number for WhatsApp
        return !!(user.countryCode && user.contactNumber);
      } else {
        // Using separate WhatsApp number
        return !!(user.whatsappCountryCode && user.whatsappNumber);
      }
    });
  }, [users]);

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === availableUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(availableUsers.map(u => u.id));
    }
  };

  const handleSend = async () => {
    if (selectedUserIds.length === 0) {
      addToast('Please select at least one user', 'error');
      return;
    }

    if (!message.trim()) {
      addToast('Please enter a message', 'error');
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      const result = await sendWhatsApp({
        userIds: selectedUserIds,
        message: message.trim(),
      });

      setSendResult(result);
      
      if (result.failed === 0) {
        addToast(`Successfully sent WhatsApp messages to ${result.sent} user(s)`, 'success');
        setMessage('');
        setSelectedUserIds([]);
      } else {
        addToast(`Sent to ${result.sent} user(s), ${result.failed} failed`, 'warning');
      }
    } catch (error) {
      console.error('Error sending WhatsApp messages:', error);
      addToast(
        error instanceof Error ? error.message : 'Failed to send WhatsApp messages',
        'error'
      );
    } finally {
      setIsSending(false);
    }
  };

  // Check if current user is admin
  if (!currentUser || !currentUser.roles.includes(UserRole.ADMIN)) {
    return (
      <DashboardLayout>
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600">Access denied. Admin privileges required.</p>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">WhatsApp Messaging</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Send WhatsApp messages to users (excluding admins)</p>
        </div>

        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Recipients ({selectedUserIds.length} selected)
              </label>
              <div className="flex items-center mb-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-primary hover:text-primary-dark font-medium"
                >
                  {selectedUserIds.length === availableUsers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="border rounded-md max-h-64 overflow-y-auto">
                {availableUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No users available with WhatsApp numbers
                  </div>
                ) : (
                  <div className="divide-y">
                    {availableUsers.map(user => {
                      const whatsappNumber = user.useSameAsContact !== false
                        ? `${user.countryCode} ${user.contactNumber}`
                        : user.whatsappCountryCode && user.whatsappNumber
                        ? `${user.whatsappCountryCode} ${user.whatsappNumber}`
                        : 'N/A';
                      
                      return (
                        <label
                          key={user.id}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={() => handleUserToggle(user.id)}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-400">WhatsApp: {whatsappNumber}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={6}
                placeholder="Enter your WhatsApp message here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 bg-white"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {message.length} characters
              </p>
            </div>

            {sendResult && (
              <div className={`p-4 rounded-md ${
                sendResult.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="text-sm font-medium mb-2">
                  {sendResult.failed === 0 ? '✅ All messages sent successfully' : '⚠️ Some messages failed'}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  Sent: {sendResult.sent} | Failed: {sendResult.failed}
                </div>
                {sendResult.errors && sendResult.errors.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-gray-700 mb-1">Failed recipients:</div>
                    {sendResult.errors.map((error, idx) => (
                      <div key={idx} className="text-xs text-red-600">
                        {error.email}: {error.error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <Button
                onClick={handleSend}
                disabled={isSending || selectedUserIds.length === 0 || !message.trim()}
                className="w-full sm:w-auto"
              >
                {isSending ? 'Sending...' : `Send to ${selectedUserIds.length} User(s)`}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WhatsAppMessagingPage;

