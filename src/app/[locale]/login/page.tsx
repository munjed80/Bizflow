'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const tDashboard = useTranslations('dashboard');
  const tCustomer = useTranslations('customer');
  const tForms = useTranslations('forms');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { locale } = await params;
        router.replace(`/${locale}/dashboard`);
      }
    });
  }, [params, router, supabaseKey, supabaseUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!supabaseUrl || !supabaseKey) {
      setError(t('missingEnv'));
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      const { locale } = await params;
      router.push(`/${locale}/dashboard`);
      router.refresh();
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-indigo-200 blur-3xl" />
        <div className="absolute right-[-3rem] top-10 h-72 w-72 rounded-full bg-purple-200 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="hidden lg:block">
            <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-8 text-white shadow-2xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-100">{tCommon('appName')}</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight">{t('loginTitle')}</h2>
              <p className="mt-3 max-w-xl text-sm text-indigo-100/90">{tCommon('tagline')}</p>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12l4-4m-4 4 4 4" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-semibold">{tDashboard('title')}</p>
                    <p className="text-indigo-100/80">{tDashboard('stats')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-semibold">{tCustomer('title')}</p>
                    <p className="text-indigo-100/80">{tCustomer('description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-semibold">{tForms('title')}</p>
                    <p className="text-indigo-100/80">{tForms('builderSubtitle')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/80 p-8 shadow-xl backdrop-blur dark:bg-gray-900/80">
            <div className="mb-6 space-y-2 text-center">
              <p className="text-sm font-semibold text-indigo-600">{tCommon('welcome')}</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('loginTitle')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{tCommon('tagline')}</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {t('email')}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none ring-0 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/60"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {t('password')}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none ring-0 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/60"
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
              >
                {loading ? '...' : t('signIn')}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                {t('noAccount')}{' '}
                <Link href="./register" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">
                  {t('signUp')}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
