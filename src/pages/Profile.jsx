import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { 
  UserCircleIcon, 
  KeyIcon, 
  EnvelopeIcon,
  BellIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';
import { contactsService, tasksService, interactionsService } from '../services/databaseService';

export default function Profile() {
  const { user, updatePassword, updateEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('account'); // 'account', 'security', 'preferences'
  const [formData, setFormData] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    fullName: user?.fullName || '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en',
    emailNotifications: {
      taskReminders: true,
      followUpReminders: true,
      weeklyDigest: true,
      systemUpdates: false
    },
    theme: 'light'
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const navigate = useNavigate();

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    if (!formData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    
    setIsLoading(true);
    try {
      await updateEmail(formData.email);
      toast.success('Email updated successfully');
      setFormData(prev => ({ ...prev, currentPassword: '' }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      await updatePassword(formData.newPassword);
      toast.success('Password updated successfully');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesUpdate = (e) => {
    e.preventDefault();
    // Implement preferences update logic
    toast.success('Preferences updated successfully');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== user.email) {
      toast.error('Please type your email correctly to confirm');
      return;
    }

    setIsLoading(true);
    try {
      // First delete all user data
      await Promise.all([
        contactsService.deleteAll(),
        tasksService.deleteAll(),
        interactionsService.deleteAll()
      ]);

      // Then delete the user account
      const { error } = await supabase.auth.api.deleteUser(
        user.id,
        process.env.REACT_APP_SUPABASE_SERVICE_KEY
      );

      if (error) throw error;

      toast.success('Account deleted successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Error deleting account');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const TabButton = ({ tab, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center px-4 py-2 rounded-lg ${
        activeTab === tab
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className={`h-5 w-5 mr-2 ${
        activeTab === tab ? 'text-blue-600' : 'text-gray-400'
      }`} />
      {label}
    </button>
  );

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex flex-col space-y-1">
                <TabButton tab="account" label="Account" icon={UserCircleIcon} />
                <TabButton tab="security" label="Security" icon={ShieldCheckIcon} />
                <TabButton tab="preferences" label="Preferences" icon={GlobeAltIcon} />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9 space-y-6">
            {activeTab === 'account' && (
              <>
                {/* Profile Information */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <UserCircleIcon className="h-6 w-6 text-blue-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                  </div>
                  <div className="flex items-center mb-6">
                    <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-semibold mr-6">
                      {formData.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                  </div>
                  <form onSubmit={handleEmailUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="input w-full"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="input w-full"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Update Profile
                    </button>
                  </form>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <KeyIcon className="h-6 w-6 text-blue-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                  </div>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="input w-full"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="input w-full"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="input w-full"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Update Password
                    </button>
                  </form>
                </div>

                {/* Delete Account Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                  <div className="flex items-center mb-6">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Delete Account</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-700">
                        Warning: This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="btn bg-red-600 hover:bg-red-700 text-white w-full"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'preferences' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <GlobeAltIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
                </div>
                <form onSubmit={handlePreferencesUpdate} className="space-y-6">
                  {/* Language and Timezone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language
                      </label>
                      <select
                        className="input w-full"
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone
                      </label>
                      <select
                        className="input w-full"
                        value={formData.timezone}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>
                  </div>

                  {/* Theme Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
                          name="theme"
                          value="light"
                          checked={formData.theme === 'light'}
                          onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                        />
                        <span className="ml-2">Light</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
                          name="theme"
                          value="dark"
                          checked={formData.theme === 'dark'}
                          onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                        />
                        <span className="ml-2">Dark</span>
                      </label>
                    </div>
                  </div>

                  {/* Email Notifications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Notifications
                    </label>
                    <div className="space-y-2">
                      {Object.entries(formData.emailNotifications).map(([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            className="form-checkbox"
                            checked={value}
                            onChange={(e) => setFormData({
                              ...formData,
                              emailNotifications: {
                                ...formData.emailNotifications,
                                [key]: e.target.checked
                              }
                            })}
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {key.split(/(?=[A-Z])/).join(' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Save Preferences
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Dialog
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Delete Account Confirmation
                  </Dialog.Title>
                </div>

                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700 font-medium mb-2">
                      This action cannot be undone
                    </p>
                    <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                      <li>Your account will be permanently deleted</li>
                      <li>All your contacts will be removed</li>
                      <li>All your tasks will be deleted</li>
                      <li>All interaction history will be erased</li>
                      <li>You will lose access to all data immediately</li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Please type your email <span className="font-mono">{user.email}</span> to confirm:
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Enter your email to confirm"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="btn bg-red-600 hover:bg-red-700 text-white"
                    disabled={deleteConfirmText !== user.email}
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  );
} 