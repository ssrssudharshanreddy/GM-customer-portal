import { useState } from 'react';
import { Link } from 'wouter';
import { api } from '../../utils/api';
import AuthLayout from '../../layouts/AuthLayout';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {sent ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-600 text-xl font-bold">✓</span>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Check your email</h2>
          <p className="text-sm text-text-secondary mb-6">
            If an account exists for <strong>{email}</strong>, you will receive a password reset link.
          </p>
          <Link href="/login" className="text-brand-600 font-medium hover:underline text-sm">
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-text-primary mb-1">Forgot password?</h2>
          <p className="text-sm text-text-secondary mb-6">Enter your email and we'll send you a reset link.</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="you@company.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-brand-600 font-medium hover:underline">
              Back to sign in
            </Link>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
