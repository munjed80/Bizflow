import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import CustomerForm from '@/components/CustomerForm';
import { createClient } from '@/lib/supabase/server';

export default async function NewCustomerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations('customer');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-indigo-600 dark:text-indigo-300">{t('addCustomer')}</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('createCustomer')}</h1>
      </div>
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <CustomerForm locale={locale} />
      </div>
    </div>
  );
}
