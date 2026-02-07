'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { BusinessProfile } from '@/types';

export default function BusinessProfileForm() {
  const t = useTranslations('zzp');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Partial<BusinessProfile>>({
    company_name: '',
    legal_name: '',
    kvk: '',
    btw_vat: '',
    email: '',
    phone: '',
    website: '',
    address_line1: '',
    address_line2: '',
    postal_code: '',
    city: '',
    country: 'NL',
    iban: '',
    bic: '',
    invoice_footer_note: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/v1/zzp/business-profile');
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setFormData({
            company_name: data.profile.company_name || '',
            legal_name: data.profile.legal_name || '',
            kvk: data.profile.kvk || '',
            btw_vat: data.profile.btw_vat || '',
            email: data.profile.email || '',
            phone: data.profile.phone || '',
            website: data.profile.website || '',
            address_line1: data.profile.address_line1 || '',
            address_line2: data.profile.address_line2 || '',
            postal_code: data.profile.postal_code || '',
            city: data.profile.city || '',
            country: data.profile.country || 'NL',
            iban: data.profile.iban || '',
            bic: data.profile.bic || '',
            invoice_footer_note: data.profile.invoice_footer_note || '',
          });
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    // Clear success message on edit
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    // Client-side validation
    if (!formData.company_name?.trim()) {
      setFieldErrors({ company_name: t('companyNameRequired') });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/v1/zzp/business-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.field) {
          setFieldErrors({ [data.field]: data.error });
        } else {
          setError(data.error || t('saveFailed'));
        }
        setSaving(false);
        return;
      }

      setSuccess(true);
      // Refresh the form with server data
      if (data.profile) {
        setFormData({
          company_name: data.profile.company_name || '',
          legal_name: data.profile.legal_name || '',
          kvk: data.profile.kvk || '',
          btw_vat: data.profile.btw_vat || '',
          email: data.profile.email || '',
          phone: data.profile.phone || '',
          website: data.profile.website || '',
          address_line1: data.profile.address_line1 || '',
          address_line2: data.profile.address_line2 || '',
          postal_code: data.profile.postal_code || '',
          city: data.profile.city || '',
          country: data.profile.country || 'NL',
          iban: data.profile.iban || '',
          bic: data.profile.bic || '',
          invoice_footer_note: data.profile.invoice_footer_note || '',
        });
      }
    } catch {
      setError(t('saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const InputField = ({ 
    id, 
    label, 
    type = 'text',
    required = false,
    placeholder = '',
    helpText = '',
  }: { 
    id: keyof typeof formData; 
    label: string; 
    type?: string;
    required?: boolean;
    placeholder?: string;
    helpText?: string;
  }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        value={formData[id] || ''}
        onChange={(e) => handleInputChange(id, e.target.value)}
        placeholder={placeholder}
        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
          fieldErrors[id] ? 'border-red-300' : 'border-gray-300'
        }`}
      />
      {helpText && !fieldErrors[id] && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
      {fieldErrors[id] && (
        <p className="mt-1 text-xs text-red-600">{fieldErrors[id]}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Success Toast */}
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t('profileSaved')}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Section: Bedrijfsgegevens (Company Details) */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{t('companyDetails')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('companyDetailsDescription')}</p>
        </div>
        <div className="px-4 py-5 sm:p-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <InputField 
            id="company_name" 
            label={t('companyName')} 
            required 
            placeholder={t('companyNamePlaceholder')}
          />
          <InputField 
            id="legal_name" 
            label={t('legalName')} 
            placeholder={t('legalNamePlaceholder')}
          />
          <InputField 
            id="kvk" 
            label={t('kvkNumber')} 
            placeholder="12345678"
            helpText={t('kvkHelp')}
          />
          <InputField 
            id="btw_vat" 
            label={t('btwNumber')} 
            placeholder="NL123456789B01"
            helpText={t('btwHelp')}
          />
        </div>
      </div>

      {/* Section: Contact */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{t('contactDetails')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('contactDetailsDescription')}</p>
        </div>
        <div className="px-4 py-5 sm:p-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <InputField 
            id="email" 
            label={t('email')} 
            type="email"
            placeholder="info@bedrijf.nl"
          />
          <InputField 
            id="phone" 
            label={t('phone')} 
            type="tel"
            placeholder="+31 6 12345678"
          />
          <div className="sm:col-span-2">
            <InputField 
              id="website" 
              label={t('website')} 
              type="url"
              placeholder="https://www.bedrijf.nl"
            />
          </div>
        </div>
      </div>

      {/* Section: Adres (Address) */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{t('addressDetails')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('addressDetailsDescription')}</p>
        </div>
        <div className="px-4 py-5 sm:p-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <InputField 
              id="address_line1" 
              label={t('addressLine1')} 
              placeholder={t('addressLine1Placeholder')}
            />
          </div>
          <div className="sm:col-span-2">
            <InputField 
              id="address_line2" 
              label={t('addressLine2')} 
              placeholder={t('addressLine2Placeholder')}
            />
          </div>
          <InputField 
            id="postal_code" 
            label={t('postalCode')} 
            placeholder="1234 AB"
          />
          <InputField 
            id="city" 
            label={t('city')} 
            placeholder="Amsterdam"
          />
          <InputField 
            id="country" 
            label={t('country')} 
            placeholder="NL"
          />
        </div>
      </div>

      {/* Section: Bank */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{t('bankDetails')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('bankDetailsDescription')}</p>
        </div>
        <div className="px-4 py-5 sm:p-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <InputField 
            id="iban" 
            label={t('iban')} 
            placeholder="NL91 ABNA 0417 1643 00"
          />
          <InputField 
            id="bic" 
            label={t('bic')} 
            placeholder="ABNANL2A"
          />
        </div>
      </div>

      {/* Section: Factuur tekst (Invoice footer) */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{t('invoiceSettings')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('invoiceSettingsDescription')}</p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div>
            <label htmlFor="invoice_footer_note" className="block text-sm font-medium text-gray-700">
              {t('invoiceFooterNote')}
            </label>
            <textarea
              id="invoice_footer_note"
              rows={4}
              value={formData.invoice_footer_note || ''}
              onChange={(e) => handleInputChange('invoice_footer_note', e.target.value)}
              placeholder={t('invoiceFooterNotePlaceholder')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">{t('invoiceFooterNoteHelp')}</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('saving')}
            </>
          ) : (
            t('saveProfile')
          )}
        </button>
      </div>
    </form>
  );
}
