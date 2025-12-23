'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { FormField, SmartForm } from '@/types';

interface FormBuilderProps {
  existingForms: SmartForm[];
  userEmail?: string | null;
}

const defaultField: FormField = {
  id: crypto.randomUUID(),
  name: 'field',
  label: 'Text',
  type: 'text',
  required: true
};

export default function FormBuilder({ existingForms, userEmail }: FormBuilderProps) {
  const t = useTranslations('forms');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([defaultField]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const formPreview = useMemo(
    () =>
      fields.map((field) => (
        <div key={field.id} className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            {field.label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          <input
            required={field.required}
            type={field.type === 'textarea' ? 'text' : field.type}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            placeholder={field.label}
            readOnly
          />
        </div>
      )),
    [fields]
  );

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields((prev) => prev.map((field) => (field.id === id ? { ...field, ...updates } : field)));
  };

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `field_${prev.length + 1}`,
        label: t('newFieldLabel', { index: prev.length + 1 }),
        type: 'text',
        required: false
      }
    ]);
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!supabaseUrl || !supabaseKey) {
      setError(t('missingEnv'));
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setError(t('authRequired'));
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('forms').insert({
      name,
      description,
      fields,
      user_id: userData.user.id
    });

    if (error) {
      setError(error.message);
    } else {
      setStatus(t('saved'));
      setName('');
      setDescription('');
      setFields([defaultField]);

      if (userEmail) {
        fetch('/api/automation/welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, name })
        }).catch(() => {});
      }
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('builderTitle')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('builderSubtitle')}</p>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100">
              {error}
            </div>
          )}
          {status && (
            <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-100">
              {status}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('formName')}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                placeholder={t('formNamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('formDescription')}</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                placeholder={t('formDescriptionPlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('fields')}</h3>
              <button
                type="button"
                onClick={addField}
                className="rounded-md bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-200 dark:hover:bg-indigo-900/60"
              >
                {t('addField')}
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/60 sm:grid-cols-4"
                >
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-200">{t('fieldLabel')}</label>
                    <input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-200">{t('fieldType')}</label>
                    <select
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value as FormField['type'] })}
                      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                      <option value="text">{t('text')}</option>
                      <option value="email">{t('email')}</option>
                      <option value="number">{t('number')}</option>
                      <option value="textarea">{t('textarea')}</option>
                    </select>
                  </div>
                  <div className="flex flex-col justify-between space-y-1 sm:items-end">
                    <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 dark:text-gray-200">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{t('required')}</span>
                    </label>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeField(field.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
                      >
                        {t('remove')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? t('saving') : t('saveForm')}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('preview')}</h3>
          <div className="grid gap-4 md:grid-cols-2">{formPreview}</div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('existingForms')}</h3>
        {existingForms.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{t('noForms')}</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-200 dark:divide-gray-700">
            {existingForms.map((form) => (
              <li key={form.id} className="py-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{form.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{form.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
