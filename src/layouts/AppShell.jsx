import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useCartStore } from '../store/cartStore';
import {
  LayoutDashboard, Package, ShoppingCart, FileText, CreditCard,
  RotateCcw, MessageSquare, Bell, User, LogOut, Menu, X, ChevronRight,
  TrendingUp, Home
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'My Orders', href: '/orders', icon: ShoppingCart },
  { label: 'Invoices', href: '/invoices', icon: FileText },
  { label: 'Payments', href: '/payments', icon: CreditCard },
  { label: 'Credit Account', href: '/credit', icon: TrendingUp },
  { label: 'Returns', href: '/returns', icon: RotateCcw },
  { label: 'Support Tickets', href: '/tickets', icon: MessageSquare },
  { label: 'Notifications', href: '/notifications', icon: Bell },
];

function NavItem({ href, label, icon: Icon, onClick }) {
  const [location] = useLocation();
  const active = location === href || (href !== '/' && location.startsWith(href));
  return (
    <Link href={href}>
      <a
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
          ${active
            ? 'bg-brand-50 text-brand-700'
            : 'text-text-secondary hover:bg-surface-100 hover:text-text-primary'
          }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {label}
        {active && <ChevronRight className="w-4 h-4 ml-auto text-brand-400" />}
      </a>
    </Link>
  );
}

function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-surface-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <span className="font-bold text-text-primary">GangaMaxx</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 rounded text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} onClick={onClose} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-surface-200 p-3 space-y-1">
        <Link href="/profile">
          <a onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-surface-100 hover:text-text-primary transition-colors">
            <User className="w-5 h-5" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-text-primary truncate">{user?.email}</div>
              <div className="text-xs text-text-muted">My Profile</div>
            </div>
          </a>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { items } = useCartStore();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-surface-200 flex flex-col transition-transform duration-200
          lg:static lg:z-auto lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-surface-200 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-text-muted hover:bg-surface-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <Link href="/cart">
              <a className="relative p-2 rounded-lg text-text-secondary hover:bg-surface-100 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </a>
            </Link>
            <Link href="/notifications">
              <a className="p-2 rounded-lg text-text-secondary hover:bg-surface-100 transition-colors">
                <Bell className="w-5 h-5" />
              </a>
            </Link>
            <Link href="/profile">
              <a className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-semibold text-sm">
                <User className="w-4 h-4" />
              </a>
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
