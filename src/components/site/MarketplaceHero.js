'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import SelectMenu from '@/components/ui/SelectMenu';
import {
  SearchIcon,
  ShieldCheckIcon,
  PackageIcon,
  UsersIcon,
  GavelIcon,
  TagIcon,
  WalletIcon,
} from '@/components/ui/Icons';

/**
 * MARKETPLACE HERO
 * ---------------------------------------------------------------------------
 * Ek photographic band jispe left me marketplace pitch (badge, heading,
 * description, trust pills) aur right me stats card baithta hai; search panel
 * band ke kinare pe halka overlap karta hai.
 *
 * Photo (`/hero-marketplace.jpg`) next/image `fill` se aati hai — CSS
 * background nahi — taaki Next ise resize karke AVIF/WebP me serve kar sake.
 *
 * Band ki HEIGHT content se nahi, viewport WIDTH se aati hai (`--hb-band`,
 * globals.css). Wajah: photo 2.42:1 hai aur usme machine lagbhag poori height
 * gherti hai, to `cover` machine ko viewport-width ke hisaab se scale karta hai.
 * Agar band ki height content decide karta, to machine ya to kat jaati ya hero
 * bahut lamba ho jaata. Ab dono width ke saath ek hi ratio me badalte hain.
 * ---------------------------------------------------------------------------
 */

const HERO_STATS = [
  { icon: PackageIcon, value: '20,000+', label: 'Equipment Listed' },
  { icon: UsersIcon, value: '5,000+', label: 'Verified Sellers' },
  { icon: GavelIcon, value: '2,500+', label: 'Live Auctions' },
  { icon: ShieldCheckIcon, value: '100%', label: 'Secure Transactions' },
];

const TRUST_POINTS = [
  { icon: TagIcon, title: 'Best Market Deals', description: 'Competitive prices' },
  { icon: ShieldCheckIcon, title: '100% Verified', description: 'Trusted sellers' },
  { icon: WalletIcon, title: 'Secure Payments', description: 'Safe & protected' },
];

const CONDITIONS = [
  { value: '', label: 'Any Condition' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

const STATE_NAMES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const LOCATIONS = [
  { value: '', label: 'All India' },
  ...STATE_NAMES.map((name) => ({ value: name, label: name })),
];

export default function MarketplaceHero({ categories = [] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [state, setState] = useState('');
  const [condition, setCondition] = useState('');

  // Categories API se aati hain, isliye options har render pe nayi array na banein
  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'All Categories' },
      ...categories.map((cat) => ({ value: cat._id, label: cat.name?.en })),
    ],
    [categories]
  );

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (categoryId) params.set('categoryId', categoryId);
    if (state) params.set('state', state);
    if (condition) params.set('condition', condition);
    const qs = params.toString();
    router.push(qs ? `/listings?${qs}` : '/listings');
  }

  return (
    /*
      overflow-x-clip (overflow-hidden nahi): stats card ka negative margin
      horizontally clip hona chahiye, par search panel ke dropdowns ko section
      se NEECHE nikalna hota hai — `hidden` dono axis clip kar deta.
      z-20 isliye ki khula hua menu neeche wale sections ke UPAR paint ho
      (navbar z-40 pe hai, wo phir bhi upar rehta hai).
    */
    <section className="hb-hero relative isolate z-20 overflow-x-clip">
      <div className="hb-hero-band pointer-events-none absolute inset-x-0 top-0 select-none">
        <Image
          src="/hero-marketplace.jpg"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[85%_55%] lg:object-[50%_28%]"
        />

        {/* Veil — mobile pe upar se, desktop pe left se. Photo ko blur nahi karta,
            sirf uske upar warm-white wash daalta hai jahan text baithta hai. Left side ka
            wash jaan-boojh kar halka rakha hai — photo ka sunset saaf dikhna chahiye,
            aur dark heading utni alpha pe bhi aaram se padhi jaati hai. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,253,248,0.93)_0%,rgba(255,253,248,0.86)_24%,rgba(255,252,244,0.55)_44%,rgba(255,250,238,0.26)_66%,rgba(255,250,238,0.2)_100%)] lg:bg-[linear-gradient(100deg,rgba(255,253,248,0.84)_0%,rgba(255,253,248,0.76)_26%,rgba(255,252,244,0.46)_44%,rgba(255,250,238,0.14)_62%,rgba(255,248,232,0.03)_100%)]" />

        {/* Neeche wala fade SIRF narrow screens pe — wahan band content se chhota hai
            to uska kinara blend karna padta hai. Desktop pe band section ke barabar
            hai, isliye fade hata diya gaya: photo poori dikhti hai, uske upar koi
            safed dhundhlapan nahi. */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_bottom,transparent,rgba(255,253,248,0.5)_50%,var(--background))] lg:hidden" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-5 pt-10 sm:px-6 sm:pt-12 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left: marketplace pitch */}
          <div className="hb-hero-lead animate-fade-in-up lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800 shadow-sm backdrop-blur-sm">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-brand-600" />
              Verified heavy equipment marketplace
            </span>

            <h1 className="mt-5 text-[2.25rem] font-bold leading-[1.05] tracking-[-0.025em] text-slate-900 sm:text-[2.75rem] lg:text-[3.25rem]">
              Buy. Sell. Bid.
              <br />
              {/* Accent INLINE hai (inline-block nahi) taaki heading normally wrap
                  ho; box-decoration-clone se har line ko poora gradient milta hai. */}
              <span className="hb-metal-text box-decoration-clone">Heavy</span> Equipment.
            </h1>

            <p className="mt-3.5 max-w-md text-base leading-relaxed text-slate-600">
              Excavators, cranes, loaders &amp; more — from verified sellers across India.
            </p>

            {/* Trust pills — chhote aur subtle, heading se compete na karein */}
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {TRUST_POINTS.map((item) => (
                <li
                  key={item.title}
                  className="flex items-center gap-2.5 rounded-xl border border-white/70 bg-white/70 px-3 py-2 shadow-sm backdrop-blur-sm"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-700 ring-1 ring-brand-500/25">
                    <item.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold leading-tight text-slate-900">
                      {item.title}
                    </span>
                    <span className="block text-[11px] leading-tight text-slate-500">
                      {item.description}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: trust stats. Card container ke right padding se thoda BAHAR
              nikalta hai (negative margin) taaki wo photo pe tairta lage, text
              column ke grid se chipka hua nahi. Section pe overflow-hidden hai,
              isliye ye kabhi viewport se bahar nahi jaata.
              DARK glass card — is photo ka right side bright
              sunset hai, jahan light card ghul jaata tha; dark surface pe gold
              icons aur white text dono saaf padhe jaate hain. */}
          <div className="animate-fade-in lg:col-span-5 lg:pl-6">
            <div className="hb-glass-dark ml-auto rounded-2xl p-4 shadow-[0_22px_60px_-24px_rgba(0,0,0,0.75)] sm:p-5 lg:-mr-4 lg:max-w-[14.5rem] lg:p-3.5 2xl:-mr-10">
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4 lg:grid-cols-1 lg:gap-y-2.5">
                {HERO_STATS.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3 lg:gap-2.5">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/30 lg:h-8 lg:w-8">
                      <stat.icon className="h-4 w-4 lg:h-3.5 lg:w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-base font-bold leading-tight text-white lg:text-[0.9375rem]">
                        {stat.value}
                      </p>
                      <p className="text-xs font-medium leading-tight text-slate-300 lg:text-[11px]">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search + filter panel — hero ka primary interaction. Band ke kinare pe
            halka overlap karta hai (dekhein .hb-hero-lead ki min-height). */}
        <form
          onSubmit={handleSearch}
          role="search"
          className="animate-fade-in-up animate-fade-in-up-delay-1 mt-8 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_22px_60px_-26px_rgba(15,23,42,0.6)] sm:mt-10 lg:mt-6"
        >
          {/* Mobile: stacked. Tablet: 2-up (query aur button poori chaudai).
              Desktop: ek hi horizontal bar. */}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
            <div className="relative flex items-center rounded-xl border border-slate-200 sm:col-span-2 lg:col-span-1">
              <SearchIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search equipment, brand, model..."
                aria-label="Search equipment, brand or model"
                className="w-full bg-transparent py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <SelectMenu
              label="Category"
              value={categoryId}
              onChange={setCategoryId}
              options={categoryOptions}
            />

            <SelectMenu
              label="Location"
              value={state}
              onChange={setState}
              options={LOCATIONS}
            />

            <SelectMenu
              label="Condition"
              value={condition}
              onChange={setCondition}
              options={CONDITIONS}
            />

            <Button type="submit" size="lg" className="w-full whitespace-nowrap px-7 lg:w-auto">
              <SearchIcon className="h-4 w-4" />
              Search Equipment
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
