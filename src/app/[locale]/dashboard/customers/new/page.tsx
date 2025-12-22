import { getTranslations } from 'next-intl/server';
import CustomerForm from '@/components/CustomerForm';

export default async function NewCustomerPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = await getTranslations('customer');
  const { locale } = await params;

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('addCustomer')}</h1>
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <CustomerForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
