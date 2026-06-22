import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatDateTime } from '../../utils/format';
import StatusChip from '../../components/StatusChip';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CheckCircle, Circle, Clock, AlertCircle, Upload, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';

const STEPS = [
  { key: 'APPLICATION_SUBMITTED', label: 'Application Submitted', desc: 'Your application has been received.' },
  { key: 'PENDING_CRE_REVIEW', label: 'CRE Review', desc: 'Being reviewed by our Customer Relationship team.' },
  { key: 'PENDING_ACCOUNTS_REVIEW', label: 'Accounts Review', desc: 'Financial eligibility check in progress.' },
  { key: 'CREDIT_SETUP_IN_PROGRESS', label: 'Credit Assignment', desc: 'Credit limit is being assigned to your account.' },
  { key: 'ACTIVE', label: 'Portal Activated', desc: 'Your account is fully activated. You can place orders.' },
];

const STATUS_ORDER = [
  'APPLICATION_SUBMITTED', 'PENDING_CRE_REVIEW', 'ACTION_REQUIRED',
  'PENDING_ACCOUNTS_REVIEW', 'CREDIT_SETUP_IN_PROGRESS', 'APPROVED', 'ACTIVE',
];

function getStepStatus(stepKey, currentStatus) {
  const stepIdx = STEPS.findIndex((s) => s.key === stepKey);
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  if (currentStatus === 'ACTION_REQUIRED' && stepKey === 'PENDING_CRE_REVIEW') return 'action';
  const stepStatusIdx = STATUS_ORDER.indexOf(stepKey);
  if (stepStatusIdx < currentIdx) return 'completed';
  if (stepKey === currentStatus) return 'current';
  return 'pending';
}

export default function ApplicationTracking() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-application'],
    queryFn: () => api.get('/applications/my'),
    refetchInterval: 30000,
  });

  const { data: notesData } = useQuery({
    queryKey: ['application-notes'],
    queryFn: () => api.get('/applications/my/notes'),
  });

  const profile = data?.profile || data;
  const notes = notesData?.notes || notesData?.data || [];
  const currentStatus = profile?.status || 'APPLICATION_SUBMITTED';

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', 'ADDITIONAL');
      await api.upload('/applications/my/documents', formData);
      setUploadSuccess(true);
      refetch();
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <div className="bg-white border-b border-surface-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-text-primary">GangaMaxx</span>
          </div>
          <div className="flex items-center gap-3">
            <StatusChip status={currentStatus} />
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-text-primary mb-1">Application Tracking</h1>
        <p className="text-sm text-text-secondary mb-6">
          Welcome, <strong>{profile?.contact_person_name}</strong>. Track your onboarding progress below.
        </p>

        {/* Action Required Banner */}
        {currentStatus === 'ACTION_REQUIRED' && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Action Required</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Additional information or documents have been requested. Please upload the required documents below.
              </p>
            </div>
          </div>
        )}

        {/* Status Timeline */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-5">Onboarding Progress</h2>
          <div className="space-y-0">
            {STEPS.map((step, idx) => {
              const status = getStepStatus(step.key, currentStatus);
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${status === 'completed' ? 'bg-emerald-100' : status === 'current' ? 'bg-brand-100' : status === 'action' ? 'bg-amber-100' : 'bg-surface-100'}`}>
                      {status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : status === 'action' ? (
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      ) : status === 'current' ? (
                        <Clock className="w-4 h-4 text-brand-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-surface-300" />
                      )}
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`w-0.5 h-10 mt-1 ${status === 'completed' ? 'bg-emerald-200' : 'bg-surface-200'}`} />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className={`text-sm font-medium ${status === 'pending' ? 'text-text-muted' : 'text-text-primary'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes from Team */}
        {notes.length > 0 && (
          <div className="bg-white rounded-xl shadow-card p-6 mb-6">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Messages from Our Team</h2>
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="p-3 rounded-lg bg-surface-50 border border-surface-200">
                  <p className="text-sm text-text-primary">{note.note}</p>
                  <p className="text-xs text-text-muted mt-1">{formatDateTime(note.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Upload */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-2">Upload Documents</h2>
          <p className="text-xs text-text-secondary mb-4">
            Upload any additional documents requested by our team.
          </p>

          {uploadSuccess && (
            <div className="mb-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
              Document uploaded successfully.
            </div>
          )}
          {uploadError && (
            <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {uploadError}
            </div>
          )}

          <label className="flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed border-surface-200 hover:border-brand-300 hover:bg-brand-50 cursor-pointer transition-colors">
            <Upload className="w-5 h-5 text-text-muted" />
            <span className="text-sm text-text-secondary">
              {uploading ? 'Uploading…' : 'Click to upload a document (PDF, JPG, PNG)'}
            </span>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>
    </div>
  );
}
