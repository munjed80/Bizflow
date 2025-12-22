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
