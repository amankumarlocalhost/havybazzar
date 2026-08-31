'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import {
  MenuIcon,
  CloseIcon,
  UserIcon,
  HeartIcon,
  BellIcon,
  StoreIcon,
  PackageIcon,
  LogoutIcon,
  ChevronDownIcon,
  GavelIcon,
  SettingsIcon,
} from '@/components/ui/Icons';

const NAV_LINKS = [
  { href: '/listings', label: 'Browse Equipment' },
  { href: '/listings?listingType=auction', label: 'Auctions', matchPrefix: '/listings?listingType=auction' },
];

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isSeller = user?.roles?.includes('seller');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close menus on route change
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sellHref = isSeller ? '/seller' : user ? '/account' : '/login';
  const sellLabel = isSeller ? 'Seller Dashboard' : 'Sell Equipment';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-ink-900/95 backdrop-blur supports-[backdrop-filter]:bg-ink-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-brand-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-ink-900">
            HB
          </span>
          Heavy Bazar
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden items-center gap-2 lg:flex">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
          ) : user ? (
            <>
              <Link
                href="/account/wishlist"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-700"
                aria-label="Saved equipment"
              >
                <HeartIcon className="h-5 w-5" />
              </Link>
              <Link
                href="/account/notifications"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-700"
                aria-label="Notifications"
              >
                <BellIcon className="h-5 w-5" />
              </Link>

              <Link href={sellHref}>
                <Button variant="secondary" size="sm">
                  {isSeller ? <StoreIcon className="h-4 w-4" /> : null}
                  {sellLabel}
                </Button>
              </Link>

              <div className="relative ml-1" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
                    {user.fullName?.charAt(0)?.toUpperCase() || <UserIcon className="h-4 w-4" />}
                  </span>
                  <span className="max-w-[9rem] truncate">{user.fullName}</span>
                  <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-surface py-1.5 shadow-lg">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-slate-900">{user.fullName}</p>
                      <p className="truncate text-xs text-slate-500">{user.email || user.phone}</p>
                    </div>
                    <MenuLink href="/account" icon={UserIcon}>
                      Profile
                    </MenuLink>
                    {isSeller && (
                      <MenuLink href="/seller/listings" icon={PackageIcon}>
                        My Listings
                      </MenuLink>
                    )}
                    <MenuLink href="/account/wishlist" icon={HeartIcon}>
                      Saved Equipment
                    </MenuLink>
                    <MenuLink href="/account/bids" icon={GavelIcon}>
                      My Bids
                    </MenuLink>
                    {isSeller ? (
                      <MenuLink href="/seller" icon={StoreIcon}>
                        Seller Dashboard
                      </MenuLink>
                    ) : (
                      <MenuLink href="/account" icon={StoreIcon}>
                        Become a Seller
                      </MenuLink>
                    )}
                    <MenuLink href="/account" icon={SettingsIcon}>
                      Account Settings
                    </MenuLink>
                    <div className="mt-1 border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogoutIcon className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-surface px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 border-t border-slate-100 pt-3">
            {loading ? null : user ? (
              <div className="flex flex-col gap-0.5">
                <div className="mb-1 flex items-center gap-2.5 px-3 py-1.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
                    {user.fullName?.charAt(0)?.toUpperCase() || <UserIcon className="h-4 w-4" />}
                  </span>
                  <p className="truncate text-sm font-semibold text-slate-900">{user.fullName}</p>
                </div>
                <MenuLink href="/account" icon={UserIcon}>
                  Profile
                </MenuLink>
                {isSeller && (
                  <MenuLink href="/seller/listings" icon={PackageIcon}>
                    My Listings
                  </MenuLink>
                )}
                <MenuLink href="/account/wishlist" icon={HeartIcon}>
                  Saved Equipment
                </MenuLink>
                <MenuLink href="/account/notifications" icon={BellIcon}>
                  Notifications
                </MenuLink>
                <MenuLink href={sellHref} icon={StoreIcon}>
                  {sellLabel}
                </MenuLink>
                <button
                  type="button"
                  onClick={logout}
                  className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogoutIcon className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2 px-1">
                <Link href="/login" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button className="w-full">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({ href, icon: Icon, children }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand-800"
    >
      <Icon className="h-4 w-4 text-slate-400" />
      {children}
    </Link>
  );
}
