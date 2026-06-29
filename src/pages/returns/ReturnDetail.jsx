import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import StatusTimeline from '../../components/StatusTimeline';
import { formatDate } from '../../utils/format';
import { ChevronLeft } from 'lucide-react';

const STEPS = [
  { status: 'RETURN_REQUESTED', label: 'Requested' },
  { status: 'UNDER_REVIEW', label: 'Under Review' },
  { status: 'RETURN_APPROVED', label: 'Approved' },
  { status: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled' },
  { status: 'COLLECTED', label: 'Collected' },
  { status: 'RETURNED_TO_WAREHOUSE', label: 'Received at Warehouse' },
  { status: 'RETURN_COMPLETED', label: 'Completed' },
];

export default function ReturnDetail() {
  const [, params] = useRoute('/returns/:id');
  const id = params?.id;

  const { data: ret, isLoading } = useQuery({
    queryKey: ['return', id],
    queryFn: () => api.get(`/returns/${id}`).then(res => res.return || res),
    enabled: !!id,
  });

  if (isLoading) return <div className="animate-pulse"><div className="h-64 bg-surface-100 rounded-lg" /></div>;
  if (!ret) return <div className="text-center py-12 text-text-muted">Return not found</div>;

  return (
    <div>
      <Link href="/returns" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Returns
      </Link>
      
      <PageHeader
        title={ret.return_number}
        subtitle={`Requested on ${formatDate(ret.created_at)}`}
        actions={<StatusChip status={ret.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold mb-4">Return Items</h2>
            {(ret.items || []).length === 0 ? (
              <p className="text-sm text-text-muted">No items found</p>
            ) : (
              <div className="divide-y divide-surface-200">
                {(ret.items || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{item.product_name}</p>
                      <p className="text-xs font-mono text-text-muted">{item.product_code}</p>
                      <p className="text-xs text-text-muted mt-1">Reason: {item.reason}</p>
                    </div>
                    <span className="text-sm">×{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            )}

            {ret.notes && (
              <div className="mt-4 pt-4 border-t border-surface-200">
                <p className="text-xs font-medium mb-1">Your Description</p>
                <p className="text-sm text-text-secondary">{ret.notes}</p>
              </div>
            )}
            
            {(ret.proof_urls || []).length > 0 && (
              <div className="mt-4 pt-4 border-t border-surface-200">
                <p className="text-xs font-medium mb-2">Attached Proofs</p>
                <div className="flex gap-2 overflow-x-auto">
                  {ret.proof_urls.map((url, idx) => (
                    <a key={idx} href={url} target="_blank" rel="noreferrer" className="block shrink-0">
                      <img src={url} alt={`Proof ${idx + 1}`} className="h-20 w-20 object-cover rounded border border-surface-200 hover:border-brand-300" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-card p-5">
            <h2 className="text-sm font-semibold mb-4">Tracking</h2>
            <StatusTimeline steps={STEPS} currentStatus={ret.status} />
            
            {ret.status === 'RETURN_REJECTED' && ret.rejection_reason && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100">
                <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-700">{ret.rejection_reason}</p>
              </div>
            )}

            {ret.active_pin && (['PICKUP_SCHEDULED', 'OUT_FOR_PICKUP'].includes(ret.status)) && (
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-100 text-center">
                <p className="text-xs font-medium text-orange-800 mb-1">Return PIN</p>
                <p className="text-2xl font-mono font-bold tracking-widest text-orange-600">{ret.active_pin}</p>
                <p className="text-xs text-orange-700 mt-2">Provide this PIN to the pickup executive</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
