import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import BusinessProfileForm from '@/components/BusinessProfileForm';

export default async function BusinessProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations('zzp');

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('businessProfile')}</h1>
        <p className="mt-2 text-sm text-gray-600">{t('businessProfileDescription')}</p>
      </div>
      
      <BusinessProfileForm />
    </div>
  );
}
