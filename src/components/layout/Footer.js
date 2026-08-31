import Link from 'next/link';
import { ShieldCheckIcon } from '@/components/ui/Icons';
import Logo from './Logo';

const COLUMNS = [
  {
    title: 'Marketplace',
    links: [
      { href: '/listings', label: 'Browse Equipment' },
      { href: '/listings?listingType=auction', label: 'Live Auctions' },
      { href: '/listings?sort=newest', label: 'New Listings' },
    ],
  },
  {
    title: 'Selling',
    links: [
      { href: '/seller/listings/new', label: 'List Your Equipment' },
      { href: '/seller', label: 'Seller Dashboard' },
      { href: '/account/kyc', label: 'Seller Verification' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/account/support', label: 'Help & Support' },
      { href: '/account/support/new', label: 'Contact Us' },
      { href: '/account/orders', label: 'Track an Order' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/', label: 'About Heavy Bazar' },
      { href: '/', label: 'Terms of Service' },
      { href: '/', label: 'Privacy Policy' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-ink-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" aria-label="Heavy Bazar — home" className="inline-flex items-center">
              <Logo variant="onDark" className="h-6 w-auto" />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
              A trusted marketplace for buying and selling heavy construction equipment —
              directly or through live auctions.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-brand-700">
              <ShieldCheckIcon className="h-4 w-4" />
              Verified sellers, secure payments
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-slate-900">{col.title}</h3>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-brand-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Heavy Bazar. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600">
              Terms
            </Link>
            <Link href="/" className="hover:text-slate-600">
              Privacy
            </Link>
            <Link href="/" className="hover:text-slate-600">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
