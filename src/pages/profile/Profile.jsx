import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import LoadingSpinner from '../../components/LoadingSpinner';
import { User, Building, MapPin, Phone, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState('profile');
  const [passwordForm, setPasswordForm] = useState({ new_password: '', confirm_password: '' });
  const [showPass, setShowPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/auth/me'),
  });

  const profile = data?.profile || data;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordForm.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters.'); return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('Passwords do not match.'); return;
    }
    setSavingPassword(true);
    try {
      await api.put('/auth/me/password', { new_password: passwordForm.new_password });
      setPasswordSuccess(true);
      setPasswordForm({ new_password: '', confirm_password: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your account information" />

      <div className="flex gap-1 mb-6 bg-surface-100 rounded-xl p-1 w-fit">
        {['profile', 'security'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize
              ${tab === t ? 'bg-white shadow-sm text-text-primary' : 'text-text-muted hover:text-text-primary'}`}>
            {t === 'profile' ? 'Company Profile' : 'Security'}
          </button>
        ))}
      </div>

      {tab === 'profile' && profile && (
        <div className="max-w-lg space-y-4">
          {/* Status */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">Account Status</h2>
              <StatusChip status={profile.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-text-muted text-xs mb-0.5">Member Since</p>
                <p className="font-medium text-text-primary">{formatDate(profile.created_at)}</p>
              </div>
              <div>
                {/* customer_code is not tracked in the database, omitting. */}
              </div>
            </div>
          </div>

          {/* Company */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-4 h-4 text-text-muted" />
              <h2 className="text-sm font-semibold text-text-primary">Company Information</h2>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Company Name', profile.company_name],
                ['Company Type', profile.business_type],
                ['GST Number', profile.gst_number],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-text-muted text-xs mb-0.5">{label}</p>
                  <p className="font-medium text-text-primary">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-text-muted" />
              <h2 className="text-sm font-semibold text-text-primary">Address</h2>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {[profile.address_line1, profile.address_line2, profile.city, profile.state, profile.pincode].filter(Boolean).join(', ')}
            </p>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-text-muted" />
              <h2 className="text-sm font-semibold text-text-primary">Contact Person</h2>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Name', profile.contact_person],
                ['Designation', profile.designation],
                ['Mobile', profile.phone],
                ['Email', profile.email || user?.email],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center gap-2">
                  <p className="text-text-muted w-24 text-xs">{label}</p>
                  <p className="font-medium text-text-primary">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="max-w-md">
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lock className="w-4 h-4 text-text-muted" />
              <h2 className="text-sm font-semibold text-text-primary">Change Password</h2>
            </div>

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Password changed successfully.
              </div>
            )}
            {passwordError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{passwordError}</div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">New Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, new_password: e.target.value }))}
                    className="w-full px-3 py-2.5 pr-10 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Min 8 characters" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Confirm New Password</label>
                <input type="password" required
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, confirm_password: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <button type="submit" disabled={savingPassword}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                {savingPassword ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
