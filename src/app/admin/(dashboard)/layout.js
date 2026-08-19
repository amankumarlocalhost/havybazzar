'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/kyc', label: 'KYC Review', permission: 'kyc:view' },
  { href: '/admin/listings', label: 'Listings', permission: 'listings:view' },
  { href: '/admin/users', label: 'Users', permission: 'users:view' },
  { href: '/admin/categories', label: 'Categories', permission: 'categories:manage' },
  { href: '/admin/cms', label: 'CMS Pages', permission: 'cms:manage' },
  { href: '/admin/tickets', label: 'Support Tickets', permission: 'support:manage' },
  { href: '/admin/withdrawals', label: 'Withdrawals', permission: 'withdrawals:approve' },
  { href: '/admin/reports', label: 'Reports', permission: 'reports:view' },
  { href: '/admin/sub-admins', label: 'Sub-Admins', superAdminOnly: true },
];

export default function AdminDashboardLayout({ children }) {
  const { admin, loading, logout, hasPermission } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !admin) {
      router.push('/admin/login');
    }
  }, [loading, admin, router]);

  if (loading || !admin) return <Spinner className="min-h-screen" />;

  const visibleNav = NAV_ITEMS.filter((item) => {
    if (item.superAdminOnly) return admin.role === 'super_admin';
    if (item.permission) return hasPermission(item.permission);
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Heavy Bazar Admin</h1>
          <p className="text-xs text-gray-500">
            {admin.fullName} — {admin.role === 'super_admin' ? 'Super Admin' : 'Sub Admin'}
          </p>
        </div>
        <Button variant="secondary" onClick={logout}>
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[180px_1fr]">
        <aside>
          <nav className="space-y-1">
            {visibleNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  pathname === item.href
                    ? 'bg-emerald-50 font-medium text-emerald-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
