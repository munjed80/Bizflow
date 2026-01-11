'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface NavbarProps {
  locale: string;
}

export default function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('common');
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const previousPathRef = useRef<string | null>(null);
  const mobileOpenRef = useRef(false);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, [supabaseKey, supabaseUrl]);

  useEffect(() => {
    mobileOpenRef.current = mobileOpen;
  }, [mobileOpen]);

  useEffect(() => {
    if (previousPathRef.current === pathname) return;
    previousPathRef.current = pathname;

    if (mobileOpenRef.current) {
      setMobileOpen(false);
      mobileToggleRef.current?.focus();
    }
  }, [pathname]);

  const navItems = useMemo(
    () => [
      { href: `/${locale}/dashboard`, label: t('dashboard') },
      { href: `/${locale}/dashboard/customers`, label: t('customers') },
      { href: `/${locale}/dashboard/forms`, label: t('forms') }
    ],
    [locale, t]
  );

  const handleLogout = async () => {
    if (!supabaseUrl || !supabaseKey) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push(`/${locale}/login`);
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/70 backdrop-blur shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/dashboard`} className="text-xl font-bold text-indigo-600 dark:text-indigo-300">
            {t('appName')}
          </Link>
          <nav className="hidden gap-4 text-sm font-medium text-gray-700 dark:text-gray-200 sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 transition ${
                  pathname === item.href
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200'
                    : 'hover:bg-indigo-50 dark:hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {userEmail ? (
            <>
              <span className="hidden text-sm text-gray-600 dark:text-gray-300 sm:inline">{userEmail}</span>
              <button
                onClick={handleLogout}
                className="hidden rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 sm:inline"
              >
                {t('logout')}
              </button>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href={`/${locale}/login`}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {t('login')}
              </Link>
              <Link
                href={`/${locale}/register`}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                {t('register')}
              </Link>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
            aria-controls="mobile-nav"
            ref={mobileToggleRef}
            className="inline-flex items-center justify-center rounded-md border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100 sm:hidden dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="sm:hidden border-t border-gray-200 bg-white/90 px-4 pb-4 shadow-inner dark:border-gray-800 dark:bg-gray-900/90"
        >
          <nav className="flex flex-col gap-2 py-3 text-sm font-medium text-gray-700 dark:text-gray-200">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 transition ${
                  pathname === item.href
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200'
                    : 'hover:bg-indigo-50 dark:hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2">
            {userEmail ? (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-300">{userEmail}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/login`}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  {t('login')}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
