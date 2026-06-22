import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { api } from '../../utils/api';
import AuthLayout from '../../layouts/AuthLayout';
import { Upload, Eye, EyeOff, CheckCircle } from 'lucide-react';

const COMPANY_TYPES = [
  'Proprietorship', 'Partnership', 'LLP', 'Private Limited', 'Public Limited',
  'Trust', 'Society', 'Government', 'Other',
];

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
  'Daman and Diu', 'Delhi', 'Lakshadweep', 'Puducherry', 'Jammu and Kashmir', 'Ladakh',
];

const DESIGNATIONS = [
  'Owner', 'Director', 'CEO', 'MD', 'CFO', 'Purchase Manager',
  'Store Manager', 'Admin Manager', 'Other',
];

export default function Register() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    company_name: '',
    company_type: '',
    gst_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    contact_person_name: '',
    designation: '',
    mobile_number: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const [files, setFiles] = useState({
    gst_certificate: null,
    business_registration: null,
    address_proof: null,
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleFileChange = (key) => (e) => {
    const file = e.target.files?.[0];
    if (file) setFiles((f) => ({ ...f, [key]: file }));
  };

  const validateStep1 = () => {
    if (!form.company_name || !form.company_type || !form.gst_number) {
      setError('Please fill all company details.'); return false;
    }
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gst_number)) {
      setError('Invalid GST number format.'); return false;
    }
    if (!form.address_line1 || !form.city || !form.state || !form.pincode) {
      setError('Please fill all address fields.'); return false;
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      setError('Pincode must be 6 digits.'); return false;
    }
    setError(''); return true;
  };

  const validateStep2 = () => {
    if (!form.contact_person_name || !form.designation || !form.mobile_number || !form.email) {
      setError('Please fill all contact details.'); return false;
    }
    if (!/^\d{10}$/.test(form.mobile_number)) {
      setError('Mobile number must be 10 digits.'); return false;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.'); return false;
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.'); return false;
    }
    if (!files.gst_certificate) {
      setError('GST Certificate is required.'); return false;
    }
    setError(''); return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== 'confirm_password') formData.append(k, v); });
      if (files.gst_certificate) formData.append('gst_certificate', files.gst_certificate);
      if (files.business_registration) formData.append('business_registration', files.business_registration);
      if (files.address_proof) formData.append('address_proof', files.address_proof);

      await fetch(`${import.meta.env.VITE_API_URL || '/api'}/customers/register`, {
        method: 'POST',
        body: formData,
      }).then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Registration failed');
        }
        return res.json();
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center py-4">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Application Submitted!</h2>
          <p className="text-sm text-text-secondary mb-6">
            Your business registration has been submitted successfully. You can now log in to track your application status.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Go to Login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex items-center gap-2 mb-6">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
              ${step >= s ? 'bg-brand-600 text-white' : 'bg-surface-100 text-text-muted'}`}>
              {s}
            </div>
            {s < 2 && <div className={`flex-1 h-0.5 w-8 ${step > s ? 'bg-brand-600' : 'bg-surface-200'}`} />}
          </div>
        ))}
        <span className="ml-2 text-sm text-text-secondary">
          {step === 1 ? 'Business Details' : 'Contact & Documents'}
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Business Information</h2>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Company Name *</label>
            <input type="text" required value={form.company_name} onChange={(e) => set('company_name', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="ABC Pvt Ltd" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Company Type *</label>
              <select value={form.company_type} onChange={(e) => set('company_type', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                <option value="">Select type</option>
                {COMPANY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">GST Number *</label>
              <input type="text" required value={form.gst_number} onChange={(e) => set('gst_number', e.target.value.toUpperCase())}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono uppercase"
                placeholder="22AAAAA0000A1Z5" maxLength={15} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Address Line 1 *</label>
            <input type="text" required value={form.address_line1} onChange={(e) => set('address_line1', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Street / Building / Plot" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Address Line 2</label>
            <input type="text" value={form.address_line2} onChange={(e) => set('address_line2', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Area / Locality (optional)" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">City *</label>
              <input type="text" required value={form.city} onChange={(e) => set('city', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">State *</label>
              <select value={form.state} onChange={(e) => set('state', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                <option value="">State</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Pincode *</label>
              <input type="text" required value={form.pincode} onChange={(e) => set('pincode', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                placeholder="400001" maxLength={6} />
            </div>
          </div>

          <button type="button" onClick={handleNext}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Contact & Credentials</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Contact Person *</label>
              <input type="text" required value={form.contact_person_name} onChange={(e) => set('contact_person_name', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Designation *</label>
              <select value={form.designation} onChange={(e) => set('designation', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                <option value="">Select</option>
                {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Mobile Number *</label>
            <input type="tel" required value={form.mobile_number} onChange={(e) => set('mobile_number', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              placeholder="9876543210" maxLength={10} />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Email Address *</label>
            <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="purchase@company.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Password *</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={(e) => set('password', e.target.value)}
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Min 8 characters" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Confirm Password *</label>
            <input type="password" required value={form.confirm_password} onChange={(e) => set('confirm_password', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>

          <div className="border-t border-surface-200 pt-4">
            <p className="text-sm font-medium text-text-primary mb-3">Documents</p>

            {[
              { key: 'gst_certificate', label: 'GST Certificate *', required: true },
              { key: 'business_registration', label: 'Business Registration Document', required: false },
              { key: 'address_proof', label: 'Address Proof', required: false },
            ].map(({ key, label, required }) => (
              <div key={key} className="mb-3">
                <label className="block text-sm font-medium text-text-primary mb-1.5">{label}</label>
                <label className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 border-dashed cursor-pointer transition-colors
                  ${files[key] ? 'border-emerald-300 bg-emerald-50' : 'border-surface-200 hover:border-brand-300 hover:bg-brand-50'}`}>
                  <Upload className="w-4 h-4 text-text-muted flex-shrink-0" />
                  <span className="text-sm text-text-secondary truncate">
                    {files[key] ? files[key].name : `Upload PDF or image${required ? '' : ' (optional)'}`}
                  </span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange(key)} className="hidden" />
                </label>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => { setStep(1); setError(''); }}
              className="flex-1 border border-surface-200 text-text-secondary hover:bg-surface-100 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Back
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
              {loading ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-sm text-text-secondary mt-4">
        Already registered?{' '}
        <Link href="/login"><a className="text-brand-600 font-medium hover:underline">Sign in</a></Link>
      </p>
    </AuthLayout>
  );
}
