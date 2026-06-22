import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { api } from '../../utils/api';
import { formatCurrency } from '../../utils/format';
import { useCartStore } from '../../store/cartStore';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Package, ShoppingCart, ChevronLeft, Plus, Minus, Check } from 'lucide-react';

export default function ProductDetail() {
  const [, params] = useRoute('/products/:id');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const { data, isLoading } = useQuery({
    queryKey: ['product', params.id],
    queryFn: () => api.get(`/products/${params.id}`),
    enabled: !!params.id,
  });

  const product = data?.product || data;

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!product) return <div className="text-center py-16 text-text-muted">Product not found.</div>;

  const gstAmount = (product.price * qty * (product.gst_percent || 0)) / 100;
  const total = product.price * qty + gstAmount;

  return (
    <div>
      <Link href="/products">
        <a className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Catalog
        </a>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square bg-surface-100 rounded-xl flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="w-24 h-24 text-surface-300" />
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-text-muted mb-1">{product.category_name} · {product.product_code}</p>
          <h1 className="text-2xl font-semibold text-text-primary mb-4">{product.name}</h1>

          <div className="bg-surface-50 rounded-xl p-4 mb-6">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold text-text-primary">{formatCurrency(product.price)}</span>
              <span className="text-sm text-text-muted">per {product.unit}</span>
            </div>
            <p className="text-xs text-text-muted">+ {product.gst_percent}% GST</p>
          </div>

          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-6 ${
            product.is_in_stock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {product.is_in_stock ? '● In Stock' : '● Out of Stock'}
          </div>

          {product.is_in_stock && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-medium text-text-primary">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-8 h-8 rounded-lg border border-surface-200 flex items-center justify-center hover:bg-surface-100 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-semibold">{qty}</span>
                  <button onClick={() => setQty(qty + 1)}
                    className="w-8 h-8 rounded-lg border border-surface-200 flex items-center justify-center hover:bg-surface-100 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-sm text-text-secondary mb-4">
                Subtotal: <strong className="text-text-primary">{formatCurrency(product.price * qty)}</strong>
                {' '}+ GST: <strong>{formatCurrency(gstAmount)}</strong>
                {' '}= <strong className="text-brand-700">{formatCurrency(total)}</strong>
              </div>

              <div className="flex gap-3">
                <button onClick={handleAdd}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors
                    ${added ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-600 hover:bg-brand-700 text-white'}`}>
                  {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                  {added ? 'Added to Cart!' : 'Add to Cart'}
                </button>
                <Link href="/cart">
                  <a className="px-6 py-3 rounded-xl border border-brand-600 text-brand-600 hover:bg-brand-50 font-medium transition-colors">
                    View Cart
                  </a>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-8 bg-white rounded-xl shadow-card p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Description</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* Specifications */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="mt-4 bg-white rounded-xl shadow-card p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Specifications</h2>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(product.specifications).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-xs text-text-muted capitalize">{k.replace(/_/g, ' ')}:</span>
                <span className="text-xs text-text-primary font-medium">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
