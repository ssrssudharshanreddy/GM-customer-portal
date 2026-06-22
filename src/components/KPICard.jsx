export default function KPICard({ label, value, sub, icon: Icon, color = 'brand', loading }) {
  const colorMap = {
    brand: 'text-brand-600 bg-brand-50',
    green: 'text-emerald-600 bg-emerald-50',
    red: 'text-red-600 bg-red-50',
    amber: 'text-amber-600 bg-amber-50',
    purple: 'text-purple-600 bg-purple-50',
    cyan: 'text-cyan-600 bg-cyan-50',
  };
  const iconClass = colorMap[color] || colorMap.brand;

  return (
    <div className="bg-white rounded-xl shadow-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {loading ? (
        <div className="h-7 w-24 bg-surface-100 animate-pulse rounded" />
      ) : (
        <div className="text-2xl font-semibold text-text-primary">{value ?? '—'}</div>
      )}
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </div>
  );
}
