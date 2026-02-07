'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useState, use } from 'react';

export default function ZZPLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const t = useTranslations('common');
  const tZzp = useTranslations('zzp');
  const pathname = usePathname();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { locale } = use(params);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
  };

  const navigation = [
    { name: t('dashboard'), href: `/${locale}/zzp` },
    { name: tZzp('invoices'), href: `/${locale}/zzp/invoices` },
    { name: t('customers'), href: `/${locale}/zzp/customers` },
  ];

  const settingsItems = [
    { name: tZzp('businessProfile'), href: `/${locale}/zzp/settings/business-profile` },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}/zzp` && pathname === `/${locale}/zzp`) {
      return true;
    }
    if (href !== `/${locale}/zzp` && pathname?.startsWith(href)) {
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">{t('appName')} <span className="text-sm font-normal text-gray-500">ZZP</span></h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive(item.href)
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
                {/* Settings dropdown */}
                <div className="relative inline-flex items-center">
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className={`${
                      pathname?.includes('/settings')
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {t('settings')}
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {settingsOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        {settingsItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setSettingsOpen(false)}
                            className={`${
                              isActive(item.href)
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700 hover:bg-gray-50'
                            } block px-4 py-2 text-sm`}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Click outside to close dropdown */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSettingsOpen(false)}
        />
      )}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
