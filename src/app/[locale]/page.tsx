import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const t = useTranslations('common');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-white mb-4">
            {t('welcome')} to {t('appName')}
          </h1>
          <p className="text-xl text-indigo-100 mb-8">
            Multi-language SaaS Platform - Simple CRM + Smart Forms + Workflow Automation
          </p>
          <div className="space-x-4">
            <Link
              href="./login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
            >
              {t('login')}
            </Link>
            <Link
              href="./register"
              className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-indigo-700"
            >
              {t('register')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
