'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import ListingCard from '@/components/listings/ListingCard';
import { ListingGridSkeleton } from '@/components/ui/Skeleton';
import { SearchIcon, FilterIcon } from '@/components/ui/Icons';

const PAGE_SIZE = 12;

const CONDITIONS = [
  { value: '', label: 'Any condition' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

const LISTING_TYPES = [
  { value: '', label: 'All listings' },
  { value: 'fixed_price', label: 'Fixed price' },
  { value: 'auction', label: 'Auction' },
];

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = searchParams.get('categoryId') || '';

  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [listingType, setListingType] = useState(searchParams.get('listingType') || '');
  const [condition, setCondition] = useState('');
  const [state, setState] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    api.get('/categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    async function loadListings() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ sort: 'newest', limit: '60' });
        if (categoryId) params.set('categoryId', categoryId);
        if (search) params.set('search', search);

        const result = await api.get(`/listings/browse?${params.toString()}`);
        setListings(result.items);
      } catch {
        setError('Unable to load listings.');
      } finally {
        setLoading(false);
      }
    }
    loadListings();
  }, [categoryId, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset pagination when filters change
    setPage(1);
  }, [listingType, condition, state, minPrice, maxPrice, sort, search, categoryId]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set('search', search);
    else params.delete('search');
    router.push(`/listings?${params.toString()}`);
  }

  const filtered = useMemo(() => {
    let items = [...listings];

    if (listingType) items = items.filter((l) => l.listingType === listingType);
    if (condition) items = items.filter((l) => l.condition === condition);
    if (state) {
      const q = state.trim().toLowerCase();
      items = items.filter((l) => l.location?.state?.toLowerCase().includes(q));
    }
    if (minPrice) {
      const min = Number(minPrice) * 100;
      items = items.filter((l) => l.listingType !== 'fixed_price' || (l.fixedPricePaise ?? 0) >= min);
    }
    if (maxPrice) {
      const max = Number(maxPrice) * 100;
      items = items.filter((l) => l.listingType !== 'fixed_price' || (l.fixedPricePaise ?? 0) <= max);
    }

    if (sort === 'price_asc' || sort === 'price_desc') {
      items.sort((a, b) => {
        const av = a.fixedPricePaise ?? Number.POSITIVE_INFINITY;
        const bv = b.fixedPricePaise ?? Number.POSITIVE_INFINITY;
        return sort === 'price_asc' ? av - bv : bv - av;
      });
    }

    return items;
  }, [listings, listingType, condition, state, minPrice, maxPrice, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetFilters() {
    setListingType('');
    setCondition('');
    setState('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
  }

  const filterForm = (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Category
        </h3>
        <Select value={categoryId} onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.value) params.set('categoryId', e.target.value);
          else params.delete('categoryId');
          router.push(`/listings?${params.toString()}`);
        }}>
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name?.en}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Listing type
        </h3>
        <Select value={listingType} onChange={(e) => setListingType(e.target.value)}>
          {LISTING_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Condition
        </h3>
        <Select value={condition} onChange={(e) => setCondition(e.target.value)}>
          {CONDITIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Location
        </h3>
        <Input
          placeholder="e.g. Assam"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Price range (₹)
        </h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span className="text-slate-300">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      <Button variant="secondary" className="w-full" onClick={resetFilters}>
        Reset filters
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Browse Equipment</h1>
        <p className="mt-1 text-sm text-slate-500">
          Explore verified listings from sellers across the country.
        </p>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-6 flex max-w-xl gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search — e.g. excavator, JCB"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-900">Filters</h2>
            {filterForm}
          </div>
        </aside>

        <div>
          {/* Sort + mobile filter bar */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {loading ? 'Loading…' : `${filtered.length} result${filtered.length === 1 ? '' : 's'}`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <FilterIcon className="h-4 w-4" />
                Filters
              </Button>
              <Select value={sort} onChange={(e) => setSort(e.target.value)} className="!py-2 text-xs sm:text-sm">
                {SORTS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {loading && <ListingGridSkeleton count={9} />}
          {!loading && error && <Alert tone="error">{error}</Alert>}
          {!loading && !error && filtered.length === 0 && (
            <EmptyState
              icon={SearchIcon}
              title="No listings found"
              description="Try adjusting your filters or search terms."
              action={
                <Button variant="secondary" onClick={resetFilters}>
                  Reset filters
                </Button>
              }
            />
          )}

          {!loading && pageItems.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {pageItems.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} className="mt-8" />
            </>
          )}
        </div>
      </div>

      <Modal
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filters"
        footer={
          <Button className="w-full" onClick={() => setMobileFiltersOpen(false)}>
            Show {filtered.length} results
          </Button>
        }
      >
        {filterForm}
      </Modal>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<ListingGridSkeleton count={9} />}>
      <BrowseContent />
    </Suspense>
  );
}
