'use client';

import { useTranslations } from 'next-intl';

interface AuthHighlightsProps {
  heading: string;
}

export default function AuthHighlights({ heading }: AuthHighlightsProps) {
  const tCommon = useTranslations('common');
  const tDashboard = useTranslations('dashboard');
  const tCustomer = useTranslations('customer');
  const tForms = useTranslations('forms');

  return (
    <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-8 text-white shadow-2xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-100">{tCommon('appName')}</p>
      <h2 className="mt-3 text-3xl font-bold leading-tight">{heading}</h2>
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
  );
}
