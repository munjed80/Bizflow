import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import CustomerForm from '@/components/CustomerForm';
import { createClient } from '@/lib/supabase/server';
import type { Customer } from '@/types';

export default async function EditCustomerPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!customer) {
    redirect(`/${locale}/dashboard/customers`);
  }

  const t = await getTranslations('customer');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-indigo-600 dark:text-indigo-300">{t('editCustomer')}</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('updateCustomer')}</h1>
      </div>
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <CustomerForm locale={locale} customer={customer as Customer} />
      </div>
    </div>
  );
}
