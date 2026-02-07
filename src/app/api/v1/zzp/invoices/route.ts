import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BusinessProfile, Invoice } from '@/types';

// Helper: Load business profile for the given user, returns null if not found
async function getBusinessProfile(userId: string, supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never) {
  const { data: profile, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile as BusinessProfile;
}

// GET - List invoices for current user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ invoices: invoices || [] });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST - Create new invoice with business profile snapshot
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Load business profile - REQUIRED before creating invoices
    const profile = await getBusinessProfile(user.id, supabase);
    
    if (!profile) {
      return NextResponse.json(
        { 
          error: 'Business profile is required before creating invoices.',
          code: 'BUSINESS_PROFILE_REQUIRED'
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required invoice fields
    if (!body.invoice_number) {
      return NextResponse.json(
        { error: 'Invoice number is required', field: 'invoice_number' },
        { status: 400 }
      );
    }

    // Create invoice with seller snapshot from business profile
    const invoiceData: Partial<Invoice> = {
      user_id: user.id,
      invoice_number: body.invoice_number,
      customer_id: body.customer_id || null,
      status: body.status || 'draft',
      issue_date: body.issue_date || new Date().toISOString().split('T')[0],
      due_date: body.due_date || null,
      subtotal: body.subtotal || 0,
      tax_amount: body.tax_amount || 0,
      total: body.total || 0,
      notes: body.notes || null,
      // Snapshot seller data from business profile
      seller_company_name: profile.company_name,
      seller_legal_name: profile.legal_name,
      seller_kvk: profile.kvk,
      seller_btw_vat: profile.btw_vat,
      seller_iban: profile.iban,
      seller_bic: profile.bic,
      seller_address_line1: profile.address_line1,
      seller_address_line2: profile.address_line2,
      seller_postal_code: profile.postal_code,
      seller_city: profile.city,
      seller_country: profile.country,
      seller_email: profile.email,
      seller_phone: profile.phone,
      seller_website: profile.website,
      seller_invoice_footer_note: profile.invoice_footer_note,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
