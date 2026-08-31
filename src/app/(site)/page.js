'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import ListingCard from '@/components/listings/ListingCard';
import { ListingGridSkeleton } from '@/components/ui/Skeleton';
import HeroMachineryArt from '@/components/site/HeroMachineryArt';
import {
  SearchIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  GavelIcon,
  TruckIcon,
  ClockIcon,
  InboxIcon,
  LayersIcon,
} from '@/components/ui/Icons';

const VALUE_PROPS = [
  {
    icon: ShieldCheckIcon,
    title: 'Verified sellers',
    description: 'Every seller completes a KYC and business verification before listing equipment.',
  },
  {
    icon: GavelIcon,
    title: 'Transparent auctions',
    description: 'Live bidding with real-time updates, EMD protection, and a clear reserve process.',
  },
  {
    icon: TruckIcon,
    title: 'Nationwide reach',
    description: 'Browse and buy equipment from sellers across the country, delivered to your site.',
  },
  {
    icon: ClockIcon,
    title: 'Fast transactions',
    description: 'Secure payments and instant order confirmation — no back-and-forth negotiations.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [categoriesData, listingsData] = await Promise.all([
          api.get('/categories'),
          api.get('/listings/browse?sort=newest&limit=8'),
        ]);
        setCategories(categoriesData);
        setListings(listingsData.items);
      } catch {
        setError('Unable to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    router.push(search ? `/listings?search=${encodeURIComponent(search)}` : '/listings');
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-brand-500)_0%,_transparent_55%)] opacity-15" />
        <HeroMachineryArt
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] [mask-image:linear-gradient(to_right,transparent,black_18%)] lg:block"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 ring-1 ring-white/20">
              Trusted B2B marketplace
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              The trusted marketplace for heavy equipment
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-500">
              Excavators, cranes, and construction equipment — buy directly or bid in a live
              auction, from verified sellers nationwide.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex max-w-lg gap-2">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search excavators, cranes, JCB..."
                  className="w-full rounded-xl border border-slate-300 bg-surface py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <Button type="submit" size="lg">
                Search
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/listings">
                <Button variant="secondary" size="lg">
                  Browse equipment
                </Button>
              </Link>
              <Link href="/seller/listings/new">
                <Button variant="outlineOnDark" size="lg">
                  Sell your equipment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {/* Categories */}
        {categories.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Browse by category
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Find the right equipment for your project.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/listings?categoryId=${cat._id}`}
                  className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-800 hover:shadow-md"
                >
                  <LayersIcon className="h-4 w-4 text-slate-400 group-hover:text-brand-600" />
                  {cat.name?.en}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Latest listings */}
        <section className="mb-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Latest listings</h2>
              <p className="mt-1 text-sm text-slate-500">
                Freshly added equipment from verified sellers.
              </p>
            </div>
            <Link
              href="/listings"
              className="hidden items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800 sm:flex"
            >
              View all
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {loading && <ListingGridSkeleton count={8} />}

          {!loading && error && <Alert tone="error">{error}</Alert>}

          {!loading && !error && listings.length === 0 && (
            <EmptyState
              icon={InboxIcon}
              title="No listings available right now"
              description="Check back soon — new equipment is added regularly."
              action={
                <Link href="/seller/listings/new">
                  <Button variant="secondary">List your equipment</Button>
                </Link>
              }
            />
          )}

          {!loading && listings.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>
          )}
        </section>

        {/* Why Heavy Bazar */}
        <section className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Why choose Heavy Bazar
            </h2>
            <p className="mx-auto mt-1 max-w-xl text-sm text-slate-500">
              Built for buyers and sellers who need a reliable way to trade heavy equipment.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PROPS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-surface p-6 text-center shadow-sm"
              >
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Seller CTA */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-surface px-8 py-12 text-center sm:px-14">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Have equipment to sell?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-300">
            List your equipment for a fixed price or start a live auction — reach verified buyers
            across the country in minutes.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/seller/listings/new">
              <Button size="lg">Start selling</Button>
            </Link>
            <Link href="/account">
              <Button variant="outlineOnDark" size="lg">
                Learn more
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
