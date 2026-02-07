# Testing Guide

## ZZP Business Profile Feature

### Manual QA Checklist

#### 1. Business Profile Creation
- [ ] Navigate to `/[locale]/zzp/settings/business-profile`
- [ ] Verify the form loads with empty fields for a new user
- [ ] Fill in required field (Company Name)
- [ ] Fill in optional fields (KVK, BTW, IBAN, etc.)
- [ ] Click "Save Profile" button
- [ ] Verify loading spinner appears during save
- [ ] Verify success toast appears after save
- [ ] Refresh page and verify data persists

#### 2. Business Profile Validation
- [ ] Try saving without Company Name → should show error
- [ ] Try saving with invalid KVK (not 8 digits) → should show error
- [ ] Try saving with invalid BTW format → should show error
- [ ] Try saving with invalid IBAN format → should show error

#### 3. Invoice Creation with Profile
- [ ] Complete business profile first
- [ ] Navigate to `/[locale]/zzp/invoices/new`
- [ ] Fill in invoice details
- [ ] Click "Create Invoice"
- [ ] Verify invoice is created successfully
- [ ] Check database: invoice should have seller_* snapshot fields populated

#### 4. Invoice Creation Guard (No Profile)
- [ ] Delete/clear business profile from database
- [ ] Navigate to `/[locale]/zzp/invoices/new`
- [ ] Try to create an invoice
- [ ] Verify modal appears: "Business Profile Required"
- [ ] Click "Go to Business Profile settings"
- [ ] Verify navigation to business profile page

#### 5. Invoice Snapshot Consistency
- [ ] Create a business profile with Company Name "Test Corp"
- [ ] Create an invoice
- [ ] Update business profile to Company Name "New Corp"
- [ ] View the old invoice
- [ ] Verify old invoice still shows "Test Corp" (snapshot preserved)

### Database Schema Verification

#### business_profiles table
```sql
-- Required columns
id, user_id, company_name, created_at, updated_at

-- Optional columns
legal_name, kvk, btw_vat, iban, bic,
address_line1, address_line2, postal_code, city, country,
email, phone, website, invoice_footer_note

-- Constraints
- user_id should be UNIQUE (one profile per user)
- user_id should be FK to auth.users
```

#### invoices table seller snapshot columns
```sql
seller_company_name, seller_legal_name, seller_kvk, seller_btw_vat,
seller_iban, seller_bic, seller_address_line1, seller_address_line2,
seller_postal_code, seller_city, seller_country, seller_email,
seller_phone, seller_website, seller_invoice_footer_note
```

### API Endpoint Tests

#### GET /api/v1/zzp/business-profile
- Returns 401 if not authenticated
- Returns 404 if no profile exists
- Returns profile object if exists

#### PUT /api/v1/zzp/business-profile
- Returns 401 if not authenticated
- Returns 400 if company_name is missing
- Returns 400 if KVK format is invalid (must be 8 digits)
- Returns 400 if BTW format is invalid (must be NL123456789B01)
- Returns 400 if IBAN format is invalid
- Creates new profile if none exists
- Updates existing profile if exists

#### POST /api/v1/zzp/invoices
- Returns 401 if not authenticated
- Returns 400 with code "BUSINESS_PROFILE_REQUIRED" if no profile
- Returns 400 if invoice_number is missing
- Creates invoice with seller snapshot fields from business profile

### Supabase SQL Setup

Run these SQL statements in your Supabase SQL Editor:

```sql
-- Create business_profiles table
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  legal_name TEXT,
  kvk TEXT,
  btw_vat TEXT,
  iban TEXT,
  bic TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'NL',
  email TEXT,
  phone TEXT,
  website TEXT,
  invoice_footer_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_profiles
CREATE POLICY "Users can view own business profile" ON business_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business profile" ON business_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business profile" ON business_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own business profile" ON business_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create invoices table with seller snapshot fields
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL,
  customer_id UUID,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  -- Seller snapshot fields (copied from business profile at creation time)
  seller_company_name TEXT,
  seller_legal_name TEXT,
  seller_kvk TEXT,
  seller_btw_vat TEXT,
  seller_iban TEXT,
  seller_bic TEXT,
  seller_address_line1 TEXT,
  seller_address_line2 TEXT,
  seller_postal_code TEXT,
  seller_city TEXT,
  seller_country TEXT,
  seller_email TEXT,
  seller_phone TEXT,
  seller_website TEXT,
  seller_invoice_footer_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS policies for invoices
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
```
