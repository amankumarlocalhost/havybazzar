'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import ListingCard from '@/components/listings/ListingCard';
import { ListingGridSkeleton } from '@/components/ui/Skeleton';
import {
  SearchIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  GavelIcon,
  TruckIcon,
  ClockIcon,
  WalletIcon,
  InboxIcon,
  LayersIcon,
} from '@/components/ui/Icons';

const TRUST_POINTS = [
  { icon: ShieldCheckIcon, label: 'Verified Sellers' },
  { icon: GavelIcon, label: 'Live Auctions' },
  { icon: TruckIcon, label: 'Nationwide Equipment' },
  { icon: WalletIcon, label: 'Secure Transactions' },
];

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
        // BrandIntro ko batao ki homepage ka critical data aa gaya — isse
        // intro data ka wait karta hai, apni koi extra request nahi karta.
        window.dispatchEvent(new Event('hb:app-ready'));
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
      {/* Champagne wash + do gold glow: ek headline ke peeche, ek badi ambient
          machine ke peeche. Dono pointer-events-none hain. */}
      <section className="hb-hero-bg relative overflow-hidden">
        {/* Asli quarry photo poore hero ke peeche. next/image fill use kiya hai
            (CSS background nahi) taaki ye optimize ho ke, sahi size me aaye. */}
        <Image
          src="/hero-bg.png"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="pointer-events-none select-none object-cover object-center"
        />
        {/* Champagne wash — photo ko itna halka karta hai ki dark headline aur
            slate paragraph dono readable rahein. Left side (jahan text hai)
            zyada opaque, right side halka taaki machine ke peeche quarry dikhe. */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(255,251,240,0.94)_0%,rgba(255,251,240,0.87)_36%,rgba(255,248,231,0.64)_62%,rgba(255,245,222,0.52)_100%)]" />
        {/* Neeche wale section me smooth blend — photo ki hard edge nahi dikhti */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#fffdf8]" />
        <div className="pointer-events-none absolute left-[6%] top-[18%] h-[420px] w-[520px] -translate-x-1/4 rounded-full bg-brand-500/20 blur-[110px]" />
        <div className="pointer-events-none absolute right-[-8%] top-1/2 h-[680px] w-[680px] -translate-y-1/2 rounded-full bg-brand-500/25 blur-[130px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: content */}
            <div className="animate-fade-in-up">
              {/* Warm bronze-gold metal pill with a thin gold hairline */}
              <span className="hb-metal-dark inline-flex items-center gap-2 rounded-full border border-brand-500/45 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-200 shadow-sm shadow-slate-900/20">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-brand-400" />
                Verified heavy equipment marketplace
              </span>

              <h1 className="mt-6 text-[2.75rem] font-bold leading-[1.05] tracking-[-0.02em] text-slate-900 sm:text-5xl lg:text-[3.25rem]">
                The trusted marketplace for{' '}
                {/* Accent: wahi bold sans, par metallic gold gradient text.
                    INLINE rakha hai (inline-block nahi) taaki ye baaki heading ke
                    saath normally wrap ho — inline-block ek atoot block ban jaata
                    hai aur "heavy equipment" poora agli line pe chala jaata hai.
                    box-decoration-clone se har line ko poora gradient milta hai,
                    warna pehli line light aur doosri dark nikalti. */}
                <span className="hb-metal-text box-decoration-clone">heavy equipment</span>.
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-500">
                Excavators, cranes, and construction equipment — buy directly or bid in a live
                auction, from verified sellers nationwide.
              </p>

              <form onSubmit={handleSearch} className="mt-9 flex max-w-xl gap-2.5">
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search excavators, cranes, JCB..."
                    className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-11 pr-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm shadow-slate-900/5 transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
                {/* Metallic gold CTA — shared Button chheda nahi, sirf hero me
                    `hb-metal` finish lagayi hai (inner highlight + bronze base). */}
                <Button type="submit" size="lg" className="hb-metal rounded-2xl border border-brand-800/30 px-7 shadow-md shadow-brand-500/30">
                  Search
                </Button>
              </form>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/listings">
                  <Button variant="dark" size="lg" className="rounded-2xl border-transparent px-7">
                    Browse Equipment
                  </Button>
                </Link>
                <Link href="/seller/listings/new">
                  <Button variant="dark" size="lg" className="rounded-2xl border-transparent px-7">
                    Sell Your Equipment
                  </Button>
                </Link>
              </div>

              {/* Trust strip — restrained, not cards */}
              <div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-slate-200 pt-7">
                {TRUST_POINTS.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm text-slate-600">
                    <item.icon className="h-4 w-4 text-brand-600" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: equipment showcase (mobile pe content ke neeche, lg se side-by-side).
                Machine ka background cut kiya hua hai (transparent PNG) aur uska
                ground shadow image me hi baked hai — peeche sirf ek glowing gold
                stage hai, jisse machine bahar nikalti hui lagti hai. */}
            <div className="animate-fade-in relative [animation-delay:150ms] mt-4 lg:mt-0">
              {/* Showcase stage — patli glowing gold border, machine iske
                  aage nikalti hai (overflow visible), isliye frame me chipki
                  hui nahi lagti. */}
              <div className="pointer-events-none absolute inset-x-2 bottom-8 top-6 rounded-[2rem] border border-brand-400/50 bg-gradient-to-b from-white/70 to-brand-50/30 shadow-[0_0_70px_-14px_rgba(255,180,0,0.65)] lg:inset-x-6" />

              {/* Machine (badge ke saath) thoda upar uthi hui hai — stage aur
                  glow apni jagah rehte hain, isliye wo bahar nikalti hui lagti
                  hai. Layout pe koi asar nahi kyunki ye transform hai. */}
              <div className="relative mx-auto w-full max-w-[34rem] -translate-y-3 lg:max-w-none lg:w-[112%] lg:-mr-[12%] lg:-translate-y-8">
                <Image
                  src="/hero-machine.png"
                  alt="Heavy Bazar S-700R wheel loader emerging from a tablet showing a live construction site"
                  width={1216}
                  height={797}
                  priority
                  sizes="(min-width: 1024px) 58vw, (min-width: 640px) 90vw, 100vw"
                  className="h-auto w-full select-none"
                />

                {/* Trust card — wahi metallic gold finish, upar saaf dark text */}
                <div className="hb-metal absolute -bottom-2 left-0 flex items-center gap-2.5 rounded-2xl border border-white/50 px-4 py-3 shadow-lg shadow-brand-800/30 sm:bottom-2 lg:bottom-6 lg:left-4">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-ink-900/85 text-brand-400">
                    <ShieldCheckIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-ink-900">Inspected &amp; verified</p>
                    <p className="text-[11px] font-medium text-ink-900/70">
                      Every listing checked before going live
                    </p>
                  </div>
                </div>
              </div>
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
        <section className="overflow-hidden rounded-2xl bg-ink-900 px-8 py-12 text-center sm:px-14">
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
