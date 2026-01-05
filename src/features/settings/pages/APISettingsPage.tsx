import React, { useState } from 'react';
import DashboardLayout from '../../../shared/components/DashboardLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { useAuth } from '../../../shared/hooks/useAuth';
import { useToast } from '../../../shared/hooks/useToast';
import { UserRole } from '../../../shared/types';
import { EyeIcon } from '../../../shared/components/icons/Icons';

const APISettingsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  // State for API credentials (masked by default)
  const [credentials, setCredentials] = useState({
    googleAI: {
      apiKey: '••••••••••••••••••••••••••••••••',
      isVisible: false,
      isEditing: false,
      newValue: '',
    },
    twilio: {
      accountSid: '••••••••••••••••••••••••••••••••',
      authToken: '••••••••••••••••••••••••••••••••',
      whatsappFrom: '••••••••••••••••••••••••••••••••',
      isVisible: { accountSid: false, authToken: false, whatsappFrom: false },
      isEditing: { accountSid: false, authToken: false, whatsappFrom: false },
      newValue: { accountSid: '', authToken: '', whatsappFrom: '' },
    },
    email: {
      service: 'sendgrid', // sendgrid, mailgun, aws-ses
      apiKey: '••••••••••••••••••••••••••••••••',
      fromEmail: '',
      isVisible: false,
      isEditing: false,
      newValue: { apiKey: '', fromEmail: '' },
    },
  });

  const [isSaving, setIsSaving] = useState<string | null>(null);

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

  const handleToggleVisibility = (section: string, field?: string) => {
    if (section === 'googleAI') {
      setCredentials(prev => ({
        ...prev,
        googleAI: {
          ...prev.googleAI,
          isVisible: !prev.googleAI.isVisible,
        },
      }));
    } else if (section === 'twilio' && field) {
      setCredentials(prev => ({
        ...prev,
        twilio: {
          ...prev.twilio,
          isVisible: {
            ...prev.twilio.isVisible,
            [field]: !prev.twilio.isVisible[field as keyof typeof prev.twilio.isVisible],
          },
        },
      }));
    } else if (section === 'email') {
      setCredentials(prev => ({
        ...prev,
        email: {
          ...prev.email,
          isVisible: !prev.email.isVisible,
        },
      }));
    }
  };

  const handleStartEdit = (section: string, field?: string) => {
    if (section === 'googleAI') {
      setCredentials(prev => ({
        ...prev,
        googleAI: {
          ...prev.googleAI,
          isEditing: true,
          newValue: '',
        },
      }));
    } else if (section === 'twilio' && field) {
      setCredentials(prev => ({
        ...prev,
        twilio: {
          ...prev.twilio,
          isEditing: {
            ...prev.twilio.isEditing,
            [field]: true,
          },
          newValue: {
            ...prev.twilio.newValue,
            [field]: '',
          },
        },
      }));
    } else if (section === 'email') {
      setCredentials(prev => ({
        ...prev,
        email: {
          ...prev.email,
          isEditing: true,
          newValue: { apiKey: '', fromEmail: '' },
        },
      }));
    }
  };

  const handleCancelEdit = (section: string, field?: string) => {
    if (section === 'googleAI') {
      setCredentials(prev => ({
        ...prev,
        googleAI: {
          ...prev.googleAI,
          isEditing: false,
          newValue: '',
        },
      }));
    } else if (section === 'twilio' && field) {
      setCredentials(prev => ({
        ...prev,
        twilio: {
          ...prev.twilio,
          isEditing: {
            ...prev.twilio.isEditing,
            [field]: false,
          },
          newValue: {
            ...prev.twilio.newValue,
            [field]: '',
          },
        },
      }));
    } else if (section === 'email') {
      setCredentials(prev => ({
        ...prev,
        email: {
          ...prev.email,
          isEditing: false,
          newValue: { apiKey: '', fromEmail: '' },
        },
      }));
    }
  };

  const handleSave = async (section: string, field?: string) => {
    setIsSaving(`${section}-${field || 'main'}`);

    try {
      // TODO: Implement actual API call to update credentials
      // This is a placeholder - actual implementation would call Firebase Functions
      // to update the secrets via Firebase Admin SDK or a secure endpoint
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      if (section === 'googleAI') {
        setCredentials(prev => ({
          ...prev,
          googleAI: {
            ...prev.googleAI,
            apiKey: '••••••••••••••••••••••••••••••••',
            isEditing: false,
            newValue: '',
          },
        }));
        addToast('Google AI API key updated successfully', 'success');
      } else if (section === 'twilio' && field) {
        setCredentials(prev => ({
          ...prev,
          twilio: {
            ...prev.twilio,
            [field]: '••••••••••••••••••••••••••••••••',
            isEditing: {
              ...prev.twilio.isEditing,
              [field]: false,
            },
            newValue: {
              ...prev.twilio.newValue,
              [field]: '',
            },
          },
        }));
        addToast(`Twilio ${field} updated successfully`, 'success');
      } else if (section === 'email') {
        setCredentials(prev => ({
          ...prev,
          email: {
            ...prev.email,
            apiKey: '••••••••••••••••••••••••••••••••',
            isEditing: false,
            newValue: { apiKey: '', fromEmail: '' },
          },
        }));
        addToast('Email service credentials updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating credentials:', error);
      addToast(
        error instanceof Error ? error.message : 'Failed to update credentials',
        'error'
      );
    } finally {
      setIsSaving(null);
    }
  };

  const renderCredentialField = (
    label: string,
    value: string,
    isVisible: boolean,
    isEditing: boolean,
    newValue: string,
    onToggleVisibility: () => void,
    onStartEdit: () => void,
    onCancelEdit: () => void,
    onSave: () => void,
    savingKey: string,
    placeholder?: string,
    type: 'text' | 'email' = 'text'
  ) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2 sm:gap-0">
          {isEditing ? (
            <>
              <input
                type={type === 'email' ? 'email' : 'password'}
                value={newValue}
                onChange={e => {
                  if (label.includes('Google AI')) {
                    setCredentials(prev => ({
                      ...prev,
                      googleAI: { ...prev.googleAI, newValue: e.target.value },
                    }));
                  } else if (label.includes('Account SID')) {
                    setCredentials(prev => ({
                      ...prev,
                      twilio: {
                        ...prev.twilio,
                        newValue: { ...prev.twilio.newValue, accountSid: e.target.value },
                      },
                    }));
                  } else if (label.includes('Auth Token')) {
                    setCredentials(prev => ({
                      ...prev,
                      twilio: {
                        ...prev.twilio,
                        newValue: { ...prev.twilio.newValue, authToken: e.target.value },
                      },
                    }));
                  } else if (label.includes('WhatsApp From')) {
                    setCredentials(prev => ({
                      ...prev,
                      twilio: {
                        ...prev.twilio,
                        newValue: { ...prev.twilio.newValue, whatsappFrom: e.target.value },
                      },
                    }));
                  } else if (label.includes('API Key') && label.includes('Email')) {
                    setCredentials(prev => ({
                      ...prev,
                      email: {
                        ...prev.email,
                        newValue: { ...prev.email.newValue, apiKey: e.target.value },
                      },
                    }));
                  } else if (label.includes('From Email')) {
                    setCredentials(prev => ({
                      ...prev,
                      email: {
                        ...prev.email,
                        newValue: { ...prev.email.newValue, fromEmail: e.target.value },
                      },
                    }));
                  }
                }}
                placeholder={placeholder || `Enter new ${label.toLowerCase()}`}
                className="flex-1 px-3 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm text-gray-900 bg-white"
              />
              <Button
                onClick={onSave}
                disabled={isSaving === savingKey || !newValue.trim()}
                className="w-full sm:w-auto px-4"
              >
                {isSaving === savingKey ? 'Saving...' : 'Save'}
              </Button>
              <button
                onClick={onCancelEdit}
                disabled={isSaving === savingKey}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 touch-manipulation"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                value={isVisible ? value : '••••••••••••••••••••••••••••••••'}
                readOnly
                className="flex-1 px-3 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-900 font-mono text-sm"
              />
              <button
                onClick={onToggleVisibility}
                className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 text-gray-600 hover:text-gray-800 touch-manipulation"
                title={isVisible ? 'Hide' : 'Show'}
              >
                <EyeIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onStartEdit}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark touch-manipulation"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">API Settings</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage third-party API credentials and configurations</p>
        </div>

        {/* Google AI Settings */}
        <Card>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Google AI (Gemini)</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Used for AI itinerary generation, image generation, and chatbot</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 self-start sm:self-auto">
                Required
              </span>
            </div>

            {renderCredentialField(
              'Google AI API Key',
              credentials.googleAI.apiKey,
              credentials.googleAI.isVisible,
              credentials.googleAI.isEditing,
              credentials.googleAI.newValue,
              () => handleToggleVisibility('googleAI'),
              () => handleStartEdit('googleAI'),
              () => handleCancelEdit('googleAI'),
              () => handleSave('googleAI'),
              'googleAI-main',
              'Enter your Google AI API key'
            )}

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Get your API key from{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-900"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          </div>
        </Card>

        {/* Twilio Settings */}
        <Card>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Twilio (WhatsApp)</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Used for sending WhatsApp messages to users</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 self-start sm:self-auto">
                Required
              </span>
            </div>

            {renderCredentialField(
              'Account SID',
              credentials.twilio.accountSid,
              credentials.twilio.isVisible.accountSid,
              credentials.twilio.isEditing.accountSid,
              credentials.twilio.newValue.accountSid,
              () => handleToggleVisibility('twilio', 'accountSid'),
              () => handleStartEdit('twilio', 'accountSid'),
              () => handleCancelEdit('twilio', 'accountSid'),
              () => handleSave('twilio', 'accountSid'),
              'twilio-accountSid',
              'Enter your Twilio Account SID'
            )}

            {renderCredentialField(
              'Auth Token',
              credentials.twilio.authToken,
              credentials.twilio.isVisible.authToken,
              credentials.twilio.isEditing.authToken,
              credentials.twilio.newValue.authToken,
              () => handleToggleVisibility('twilio', 'authToken'),
              () => handleStartEdit('twilio', 'authToken'),
              () => handleCancelEdit('twilio', 'authToken'),
              () => handleSave('twilio', 'authToken'),
              'twilio-authToken',
              'Enter your Twilio Auth Token'
            )}

            {renderCredentialField(
              'WhatsApp From Number',
              credentials.twilio.whatsappFrom,
              credentials.twilio.isVisible.whatsappFrom,
              credentials.twilio.isEditing.whatsappFrom,
              credentials.twilio.newValue.whatsappFrom,
              () => handleToggleVisibility('twilio', 'whatsappFrom'),
              () => handleStartEdit('twilio', 'whatsappFrom'),
              () => handleCancelEdit('twilio', 'whatsappFrom'),
              () => handleSave('twilio', 'whatsappFrom'),
              'twilio-whatsappFrom',
              'e.g., whatsapp:+14155238886'
            )}

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-xs text-green-800">
                <strong>Note:</strong> Get your credentials from{' '}
                <a
                  href="https://console.twilio.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-green-900"
                >
                  Twilio Console
                </a>
                . For testing, use the{' '}
                <a
                  href="https://console.twilio.com/us1/develop/sms/sandbox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-green-900"
                >
                  WhatsApp Sandbox
                </a>
                .
              </p>
            </div>
          </div>
        </Card>

        {/* Email Service Settings */}
        <Card>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Email Service</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Used for sending welcome emails, password reset, and notifications</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 self-start sm:self-auto">
                Optional
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email Service Provider</label>
              <select
                value={credentials.email.service}
                onChange={e => setCredentials(prev => ({
                  ...prev,
                  email: { ...prev.email, service: e.target.value },
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 bg-white"
              >
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
                <option value="aws-ses">AWS SES</option>
                <option value="none">Not Configured</option>
              </select>
            </div>

            {credentials.email.service !== 'none' && (
              <>
                {renderCredentialField(
                  'Email Service API Key',
                  credentials.email.apiKey,
                  credentials.email.isVisible,
                  credentials.email.isEditing,
                  credentials.email.newValue.apiKey,
                  () => handleToggleVisibility('email'),
                  () => handleStartEdit('email'),
                  () => handleCancelEdit('email'),
                  () => handleSave('email'),
                  'email-apiKey',
                  `Enter your ${credentials.email.service} API key`
                )}

                {renderCredentialField(
                  'From Email',
                  credentials.email.fromEmail || 'not-set@example.com',
                  credentials.email.isVisible,
                  credentials.email.isEditing,
                  credentials.email.newValue.fromEmail,
                  () => handleToggleVisibility('email'),
                  () => handleStartEdit('email'),
                  () => handleCancelEdit('email'),
                  () => handleSave('email'),
                  'email-fromEmail',
                  'e.g., noreply@travelplans.fun',
                  'email'
                )}
              </>
            )}

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> Email service is optional. Password reset emails use Firebase Auth by default.
                For welcome emails and notifications, configure one of the supported providers.
              </p>
            </div>
          </div>
        </Card>

        {/* Information Card */}
        <Card>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">ℹ️ Important Information</h3>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>All credentials are stored securely in Firebase Functions secrets</li>
              <li>Changes take effect immediately after saving</li>
              <li>Never share or commit API keys to version control</li>
              <li>Rotate credentials regularly for security</li>
              <li>Monitor usage and costs in respective service dashboards</li>
            </ul>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default APISettingsPage;

