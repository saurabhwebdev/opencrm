import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { UserCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    avatar_url: '',
    title: '',
    phone: '',
    company: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error loading profile');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          updated_at: new Date(),
          ...profile,
        });

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error uploading avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // Delete user's data first
      const { error: contactsError } = await supabase
        .from('contacts')
        .delete()
        .eq('user_id', user.id);

      if (contactsError) throw contactsError;

      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id);

      if (tasksError) throw tasksError;

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Finally, delete the user account
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) throw deleteError;

      toast.success('Account deleted successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Error deleting account');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h1>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="shrink-0">
                {profile.avatar_url ? (
                  <img
                    className="h-16 w-16 object-cover rounded-full"
                    src={profile.avatar_url}
                    alt={profile.full_name}
                  />
                ) : (
                  <UserCircleIcon className="h-16 w-16 text-gray-300" />
                )}
              </div>
              <label className="block">
                <span className="sr-only">Choose profile photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </label>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  className="input mt-1"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  className="input mt-1 bg-gray-50"
                  value={user?.email || ''}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Job Title
                </label>
                <input
                  type="text"
                  className="input mt-1"
                  value={profile.title || ''}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  className="input mt-1"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company
                </label>
                <input
                  type="text"
                  className="input mt-1"
                  value={profile.company || ''}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Timezone
                </label>
                <select
                  className="input mt-1"
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                >
                  {Intl.supportedValuesOf('timeZone').map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="mt-10">
          <div className="bg-red-50 rounded-lg p-6 border border-red-100">
            <h2 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h2>
            <p className="text-sm text-red-600 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Delete Account Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-6 border w-full max-w-md shadow-xl rounded-xl bg-white">
              <div className="mb-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete your account? All of your data will be permanently removed.
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 