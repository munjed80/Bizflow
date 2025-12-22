import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';

export default async function FormsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('../login');
  }

  const t = await getTranslations('forms');

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {t('createForm')}
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <p className="text-gray-500 text-center">
          Smart forms feature - Coming soon! This will allow you to create dynamic forms for data collection.
        </p>
      </div>
    </div>
  );
}
