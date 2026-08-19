'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/ui/Spinner';

const TABS = [
  { href: '/account', label: 'Profile' },
  { href: '/account/kyc', label: 'KYC' },
  { href: '/account/orders', label: 'Orders' },
  { href: '/account/bids', label: 'My Bids' },
  { href: '/account/wallet', label: 'Wallet' },
  { href: '/account/wishlist', label: 'Wishlist' },
  { href: '/account/notifications', label: 'Notifications' },
  { href: '/account/support', label: 'Support' },
];

export default function AccountLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) return <Spinner className="min-h-[70vh]" />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">My Account</h1>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm ${
              pathname === tab.href
                ? 'border-emerald-700 font-medium text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
