'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

export default function LanguageSwitcher() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const router = useRouter();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
    { code: 'nl', name: 'Nederlands' },
  ];

  const currentLocale = pathname?.split('/')[1] || 'en';

  useEffect(() => {
    if (!pathname) return;

    const storedLocale = typeof window !== 'undefined' ? localStorage.getItem('bizflow_locale') : null;
    if (storedLocale && storedLocale !== currentLocale) {
      const pathWithoutLocale = pathname.replace(/^\/[a-zA-Z]{2}/, '') || '';
      router.replace(`/${storedLocale}${pathWithoutLocale}`);
    }
  }, [currentLocale, pathname, router]);

  const handleLanguageChange = (newLocale: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bizflow_locale', newLocale);
    }

    const newPathname = pathname?.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPathname || `/${newLocale}`);
  };

  return (
    <div className="relative inline-block text-left">
      <select
        value={currentLocale}
        onChange={(e) => handleLanguageChange(e.target.value)}
        aria-label={t('language')}
        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
