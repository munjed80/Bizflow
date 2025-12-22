import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import CustomerForm from '@/components/CustomerForm';

export default async function EditCustomerPage({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}) {
  const { locale, id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations('customer');

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!customer) {
    redirect(`/${locale}/dashboard/customers`);
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('editCustomer')}</h1>
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <CustomerForm customer={customer} locale={locale} />
        </div>
      </div>
    </div>
  );
}
