import { Check } from 'lucide-react';
import { formatDateTime } from '../utils/format';

export default function StatusTimeline({ steps = [], currentStatus }) {
  return (
    <ol className="relative space-y-4">
      {steps.map((step, i) => {
        const done = step.completed || (currentStatus && steps.slice(0, i + 1).some(s => s.status === currentStatus));
        const current = step.status === currentStatus;
        return (
          <li key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                done
                  ? 'bg-brand-600 border-brand-600'
                  : current
                    ? 'bg-white border-brand-600'
                    : 'bg-white border-surface-200'
              }`}>
                {done ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <span className={`text-xs font-bold ${current ? 'text-brand-600' : 'text-text-muted'}`}>{i + 1}</span>
                )}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-0.5 flex-1 my-1 ${done ? 'bg-brand-600' : 'bg-surface-200'}`} style={{ minHeight: 16 }} />
              )}
            </div>
            <div className="pb-4">
              <p className={`text-sm font-medium ${current ? 'text-brand-700' : done ? 'text-text-primary' : 'text-text-muted'}`}>
                {step.label}
              </p>
              {step.actor && <p className="text-xs text-text-muted">{step.actor}</p>}
              {step.timestamp && <p className="text-xs text-text-muted mt-0.5">{formatDateTime(step.timestamp)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
