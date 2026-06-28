export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-2xl font-bold text-text-primary">GangaMaxx</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-elevated p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
