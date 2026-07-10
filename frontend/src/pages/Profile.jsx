import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { User, Lock, CheckCircle, AlertTriangle, KeyRound } from 'lucide-react';

function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [ordersCount, setOrdersCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Profile Edit fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Change Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await api.get('/users/me');
        const data = response.data;
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        updateUser(data);
      } catch (err) {
        console.error('Failed to load user profile me details:', err);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await api.get('/orders');
        setOrdersCount(response.data.length || 0);
      } catch (err) {
        console.error('Failed to load user order stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user) {
      fetchProfileData();
      fetchStats();
    }
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setUpdatingProfile(true);
    try {
      const response = await api.put('/users/profile', {
        firstName,
        lastName,
        phone,
        email
      });
      setProfileSuccess('Profile details updated successfully.');
      updateUser(response.data.user, response.data.token);
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/users/change-password', {
        currentPassword,
        newPassword
      });
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Page Header */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">My Account</h1>
        <p className="mt-2 text-sm text-gray-600">Manage your profile, security settings, and track order histories.</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-extrabold text-2xl border-4 border-indigo-100 shadow-inner">
              {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
              {user.lastName ? user.lastName.charAt(0).toUpperCase() : ''}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mt-1">
                {user.roles && user.roles.includes('ROLE_ADMIN') ? 'Store Administrator' : 'Customer Account'}
              </p>
            </div>
            <div className="w-full pt-4 border-t border-gray-50 text-left text-sm text-gray-500 space-y-2">
              <div>
                <span className="block font-medium text-gray-900 text-xs uppercase tracking-wide text-gray-400">Email Address</span>
                <span className="text-gray-600">{user.email}</span>
              </div>
              <div>
                <span className="block font-medium text-gray-900 text-xs uppercase tracking-wide text-gray-400">Account ID</span>
                <span className="font-mono text-xs bg-gray-50 px-2 py-0.5 rounded text-gray-600">ID #{user.id}</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Panel */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/orders" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                View My Orders ({loadingStats ? '...' : ordersCount})
              </Link>
              {user.roles && user.roles.includes('ROLE_ADMIN') && (
                <Link to="/admin" className="text-sm font-semibold text-red-600 hover:text-red-800">
                  Open Admin Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left text-sm font-semibold text-red-500 hover:text-red-700 mt-2 pt-2 border-t border-gray-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Details & Actions Card */}
        <div className="md:col-span-2 space-y-6">
          {/* Quick Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-indigo-900 text-white p-5 shadow-md">
              <h3 className="text-sm font-medium text-indigo-200">Total Orders Placed</h3>
              <p className="mt-2 text-3xl font-extrabold">{loadingStats ? '...' : ordersCount}</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Security Clearance</h3>
              <div className="mt-2 flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <p className="text-lg font-bold text-gray-800">JWT Verified</p>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              <span>Profile Settings</span>
            </h3>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1234567890"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {updatingProfile ? 'Saving...' : 'Save Profile'}
                </button>

                {profileSuccess && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                    <CheckCircle className="h-4 w-4" /> {profileSuccess}
                  </span>
                )}
                {profileError && (
                  <span className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                    <AlertTriangle className="h-4 w-4" /> {profileError}
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-indigo-600" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>

                {passwordSuccess && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                    <CheckCircle className="h-4 w-4" /> {passwordSuccess}
                  </span>
                )}
                {passwordError && (
                  <span className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                    <AlertTriangle className="h-4 w-4" /> {passwordError}
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
