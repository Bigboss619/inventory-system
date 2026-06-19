import React, { useState, useEffect } from 'react';
import { FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { updateUser, getUserById } from '../services/api';
import {
  ProfileHeader,
  ProfileCard,
  ProfileDetails,
  ProfileForm,
  PasswordForm,
  NotificationSettings
} from '../components/profile';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [userId, setUserId] = useState(null);

  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    department_id: null,
    department: '',
    created_at: '',
    profileImage: null
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    department_id: null,
    department: '',
    created_at: '',
    profileImage: null
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
      fetchUserData(user.id);
    } else {
      setFetching(false);
    }
  }, []);

  const fetchUserData = async (id) => {
    setFetching(true);
    try {
      const response = await getUserById(id);
      if (response) {
        const userProfileData = {
          firstName: response.first_name || '',
          lastName: response.last_name || '',
          email: response.email || '',
          phone: response.phone || '',
          address: response.address || '',
          role: response.role || '',
          department_id: response.department_id || null,
          department: '',
          created_at: response.created_at ? new Date(response.created_at).toLocaleDateString() : '',
          profileImage: response.profile_image || null
        };
        setUserData(userProfileData);
        setFormData(userProfileData);
      }
    } catch (error) {
      toast.error('Failed to fetch user data');
    } finally {
      setFetching(false);
    }
  };

  const handleEdit = () => {
    setFormData(userData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address
      };

      // Super Admin can also update email
      if (userData.role === 'Super Admin') {
        updateData.email = formData.email;
      }

      const response = await updateUser(userId, updateData);

      if (response.message) {
        toast.success('Profile updated successfully');
        setUserData(formData);

        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          email: formData.email
        }));

        setIsEditing(false);
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdatePassword = async () => {
    if (!userId) return;

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await updateUser(userId, {
        password: passwordData.newPassword
      });

      if (response.message) {
        toast.success('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(response.message || 'Failed to update password');
      }
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ProfileHeader isEditing={isEditing} onEdit={handleEdit} />

      {/* Loading State */}
      {fetching ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex items-center justify-center">
          <FiLoader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-500">Loading profile...</span>
        </div>
      ) : (
        <>
          {/* Profile Card */}
          <ProfileCard userData={userData} />

          {/* Profile Details or Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              {isEditing ? (
                <ProfileForm
                  formData={formData}
                  loading={loading}
                  onChange={handleChange}
                  onCancel={handleCancel}
                  onSave={handleSave}
                  userRole={userData.role}
                />
              ) : (
                <ProfileDetails userData={userData} />
              )}
            </div>
          </div>
        </>
      )}

      <PasswordForm
        passwordData={passwordData}
        loading={passwordLoading}
        onChange={handlePasswordChange}
        onUpdate={handleUpdatePassword}
      />

      <NotificationSettings />
    </div>
  );
};

export default Profile;