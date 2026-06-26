import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch, Redirect } from 'wouter';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ApplicationTracking from './pages/tracking/ApplicationTracking';
import Dashboard from './pages/dashboard/Dashboard';
import ProductCatalog from './pages/products/ProductCatalog';
import ProductDetail from './pages/products/ProductDetail';
import Cart from './pages/cart/Cart';
import Orders from './pages/orders/Orders';
import OrderDetail from './pages/orders/OrderDetail';
import Invoices from './pages/invoices/Invoices';
import InvoiceDetail from './pages/invoices/InvoiceDetail';
import Payments from './pages/payments/Payments';
import CreditAccount from './pages/credit/CreditAccount';
import Returns from './pages/returns/Returns';
import CreateReturn from './pages/returns/CreateReturn';
import Tickets from './pages/tickets/Tickets';
import CreateTicket from './pages/tickets/CreateTicket';
import TicketDetail from './pages/tickets/TicketDetail';
import Notifications from './pages/notifications/Notifications';
import Profile from './pages/profile/Profile';
import AppShell from './layouts/AppShell';

const ACTIVE_STATUSES = ['ACTIVE'];
const PRE_ACTIVATION_STATUSES = [
  'APPLICATION_SUBMITTED', 'PENDING_CRE_REVIEW', 'ACTION_REQUIRED',
  'PENDING_ACCOUNTS_REVIEW', 'CREDIT_SETUP_IN_PROGRESS', 'APPROVED',
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 2,
    },
  },
});

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  return children;
}

function RequireActive({ children }) {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  // We can't check status here without a query — redirect to tracking if not active
  // The tracking page itself will handle the logic
  return children;
}

function CustomerRouter() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route><Redirect to="/login" /></Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/login"><Redirect to="/" /></Route>
      <Route path="/register"><Redirect to="/" /></Route>
      <Route path="/forgot-password"><Redirect to="/" /></Route>

      {/* Application tracking — for all logged-in customers */}
      <Route path="/tracking" component={ApplicationTracking} />

      {/* Activated customer routes */}
      <Route path="/">
        <AppShell><Dashboard /></AppShell>
      </Route>
      <Route path="/products/:id">
        <AppShell><ProductDetail /></AppShell>
      </Route>
      <Route path="/products">
        <AppShell><ProductCatalog /></AppShell>
      </Route>
      <Route path="/cart">
        <AppShell><Cart /></AppShell>
      </Route>
      <Route path="/orders/:id">
        <AppShell><OrderDetail /></AppShell>
      </Route>
      <Route path="/orders">
        <AppShell><Orders /></AppShell>
      </Route>
      <Route path="/invoices/:id">
        <AppShell><InvoiceDetail /></AppShell>
      </Route>
      <Route path="/invoices">
        <AppShell><Invoices /></AppShell>
      </Route>
      <Route path="/payments">
        <AppShell><Payments /></AppShell>
      </Route>
      <Route path="/credit">
        <AppShell><CreditAccount /></AppShell>
      </Route>
      <Route path="/returns/new">
        <AppShell><CreateReturn /></AppShell>
      </Route>
      <Route path="/returns">
        <AppShell><Returns /></AppShell>
      </Route>
      <Route path="/tickets/new">
        <AppShell><CreateTicket /></AppShell>
      </Route>
      <Route path="/tickets/:id">
        <AppShell><TicketDetail /></AppShell>
      </Route>
      <Route path="/tickets">
        <AppShell><Tickets /></AppShell>
      </Route>
      <Route path="/notifications">
        <AppShell><Notifications /></AppShell>
      </Route>
      <Route path="/profile">
        <AppShell><Profile /></AppShell>
      </Route>
      <Route>
        <AppShell>
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Page Not Found</h2>
            <a href="/" className="text-brand-600 hover:underline text-sm">Go to Dashboard</a>
          </div>
        </AppShell>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <CustomerRouter />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
