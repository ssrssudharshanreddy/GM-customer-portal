import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { api } from '../../utils/api';
import { formatCurrency } from '../../utils/format';
import { useCartStore } from '../../store/cartStore';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Search, Package, ShoppingCart, Filter, Check } from 'lucide-react';

function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const inCart = items.some((i) => i.product_id === product.id);
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/products/${product.id}`}>
      <a className="bg-white rounded-xl shadow-card hover:shadow-elevated transition-shadow block group overflow-hidden">
        <div className="aspect-square bg-surface-100 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <Package className="w-12 h-12 text-surface-300" />
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-text-muted mb-1">{product.category_name} · {product.product_code}</p>
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-600 line-clamp-2 mb-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-sm font-bold text-text-primary">{formatCurrency(product.price)}</span>
            <span className="text-xs text-text-muted">/{product.unit}</span>
          </div>
          <p className="text-xs text-text-muted mb-3">+ {product.gst_percent}% GST</p>

          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              product.is_in_stock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              {product.is_in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
            {product.is_in_stock && (
              <button
                onClick={handleAdd}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${added ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-600 hover:bg-brand-700 text-white'}`}
              >
                {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                {added ? 'Added' : 'Add'}
              </button>
            )}
          </div>
        </div>
      </a>
    </Link>
  );
}

export default function ProductCatalog() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories', { active_only: true }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, categoryId, page],
    queryFn: () => api.get('/products', {
      search: search || undefined,
      category_id: categoryId || undefined,
      page,
      limit: 20,
      active_only: true,
    }),
    keepPreviousData: true,
  });

  const products = data?.products || data?.data || [];
  const total = data?.total || 0;
  const categories = catData?.categories || catData?.data || [];
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  return (
    <div>
      <PageHeader
        title="Product Catalog"
        subtitle="Browse our range of cleaning and hygiene products"
        action={
          <Link href="/cart">
            <a className="relative flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <ShoppingCart className="w-4 h-4" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </a>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search products by name or code…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white min-w-[160px]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title="No products found" description="Try adjusting your search or filters." />
      ) : (
        <>
          <p className="text-xs text-text-muted mb-4">{total} product{total !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          {total > 20 && (
            <div className="flex justify-center gap-2 mt-8">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-lg border border-surface-200 text-sm disabled:opacity-40 hover:bg-surface-100">
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-text-secondary">Page {page}</span>
              <button disabled={products.length < 20} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-lg border border-surface-200 text-sm disabled:opacity-40 hover:bg-surface-100">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
