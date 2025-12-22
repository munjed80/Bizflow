'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface NavbarProps {
  locale: string;
}

export default function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('common');
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, [supabaseKey, supabaseUrl]);

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
        <div className="flex items-center space-x-4">
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
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          {userEmail ? (
            <>
              <span className="hidden text-sm text-gray-600 dark:text-gray-300 sm:inline">{userEmail}</span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {t('logout')}
              </button>
            </>
          ) : (
            <div className="hidden items-center space-x-2 sm:flex">
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
        </div>
      </div>
    </header>
  );
}
