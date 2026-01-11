'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AuthHighlights from '@/components/AuthHighlights';

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
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
            <AuthHighlights heading={t('loginTitle')} />
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
