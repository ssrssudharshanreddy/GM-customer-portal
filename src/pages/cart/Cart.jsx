import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { formatCurrency } from '../../utils/format';
import { useCartStore } from '../../store/cartStore';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, AlertCircle } from 'lucide-react';

export default function Cart() {
  const [, navigate] = useLocation();
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const [orderError, setOrderError] = useState('');
  const [placing, setPlacing] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const gstTotal = items.reduce((s, i) => s + (i.price * i.quantity * (i.gst_percent || 0)) / 100, 0);
  const grandTotal = subtotal + gstTotal;

  const { data: creditData } = useQuery({
    queryKey: ['my-credit'],
    queryFn: () => api.get('/credit-accounts/my'),
    enabled: items.length > 0,
  });
  const credit = creditData?.credit_account || creditData || {};
  const hasCredit = !credit.credit_limit || credit.available_credit >= grandTotal;

  const { data: profileData } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/customers/my/profile'),
    enabled: items.length > 0,
  });
  const profile = profileData?.profile || profileData || {};

  const placeOrder = async () => {
    if (items.length === 0) return;
    if (!hasCredit) { setOrderError('Insufficient credit limit for this order.'); return; }
    setPlacing(true);
    setOrderError('');
    try {
      const payload = {
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        delivery_address: {
          line1: profile.address_line1 || 'Company Address',
          line2: profile.address_line2 || '',
          city: profile.city || 'City',
          state: profile.state || 'State',
          pincode: profile.pincode || '000000',
        },
        special_instructions: '',
      };
      const result = await api.post('/orders', payload);
      clearCart();
      const orderId = typeof result === 'string' ? result : (result.order?.id || result.id);
      navigate(`/orders/${orderId}`);
    } catch (err) {
      setOrderError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Cart" />
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse the product catalog and add items to your cart."
          action={
            <Link href="/products" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                <ArrowRight className="w-4 h-4" /> Browse Products
              </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Cart"
        subtitle={`${items.length} item${items.length !== 1 ? 's' : ''}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.product_id} className="bg-white rounded-xl shadow-card p-4 flex gap-4">
              <div className="w-16 h-16 bg-surface-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <ShoppingCart className="w-6 h-6 text-surface-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-muted">{item.code}</p>
                <p className="text-sm font-semibold text-text-primary line-clamp-1">{item.name}</p>
                <p className="text-sm font-bold text-brand-600 mt-1">
                  {formatCurrency(item.price)} / {item.unit}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => removeItem(item.product_id)}
                  className="text-text-muted hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center hover:bg-surface-100 transition-colors">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={item.quantity}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      if (val === '' || val === '0') {
                        updateQuantity(item.product_id, 0); // will remove if store handles 0
                      } else {
                        updateQuantity(item.product_id, parseInt(val, 10));
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!val || val < 1) updateQuantity(item.product_id, 1);
                    }}
                    className="w-10 h-7 text-center text-sm font-semibold border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                  <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center hover:bg-surface-100 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm font-semibold text-text-primary">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>GST</span>
                <span>{formatCurrency(gstTotal)}</span>
              </div>
              <div className="border-t border-surface-200 pt-2 flex justify-between font-semibold text-text-primary">
                <span>Grand Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {credit.credit_limit > 0 && (
            <div className={`rounded-xl p-4 border ${hasCredit ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`text-xs font-medium ${hasCredit ? 'text-emerald-700' : 'text-red-700'}`}>
                Available Credit: {formatCurrency(credit.available_credit)}
              </p>
              {!hasCredit && (
                <p className="text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                  Insufficient credit for this order.
                </p>
              )}
            </div>
          )}

          {orderError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {orderError}
            </div>
          )}

          <button
            onClick={placeOrder}
            disabled={placing || !hasCredit}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors"
          >
            {placing ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            {placing ? 'Placing Order…' : 'Place Order'}
          </button>

          <Link href="/products" className="block text-center text-sm text-brand-600 hover:underline">
              Continue Purchasing...
            </Link>
        </div>
      </div>
    </div>
  );
}
