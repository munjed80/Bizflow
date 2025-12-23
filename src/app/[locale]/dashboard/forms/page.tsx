import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import FormBuilder from '@/components/FormBuilder';
import type { SmartForm } from '@/types';

export default async function FormsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations('forms');

  const { data: forms } = await supabase
    .from('forms')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-wide text-indigo-600 dark:text-indigo-300">{t('title')}</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('builderTitle')}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">{t('comingSoon')}</p>
      </div>
      <FormBuilder existingForms={(forms as SmartForm[]) ?? []} userEmail={user.email} />
    </div>
  );
}
