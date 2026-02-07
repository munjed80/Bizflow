export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  company_name: string;
  legal_name?: string;
  kvk?: string;
  btw_vat?: string;
  iban?: string;
  bic?: string;
  address_line1?: string;
  address_line2?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
  invoice_footer_note?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  customer_id?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  notes?: string;
  // Seller snapshot fields (copied from business profile at creation time)
  seller_company_name?: string;
  seller_legal_name?: string;
  seller_kvk?: string;
  seller_btw_vat?: string;
  seller_iban?: string;
  seller_bic?: string;
  seller_address_line1?: string;
  seller_address_line2?: string;
  seller_postal_code?: string;
  seller_city?: string;
  seller_country?: string;
  seller_email?: string;
  seller_phone?: string;
  seller_website?: string;
  seller_invoice_footer_note?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select';
  required: boolean;
  options?: string[];
}

export interface SmartForm {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  user_id: string;
  created_at: string;
}
