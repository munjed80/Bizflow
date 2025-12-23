import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import CustomersTable from '@/components/CustomersTable';
import type { Customer } from '@/types';

export default async function CustomersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations('customer');

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-indigo-600 dark:text-indigo-300">{t('title')}</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('manageCustomers')}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">{t('description')}</p>
        </div>
        <Link
          href={`/${locale}/dashboard/customers/new`}
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          {t('addCustomer')}
        </Link>
      </div>

      <CustomersTable initialCustomers={(customers as Customer[]) ?? []} locale={locale} />
    </div>
  );
}
