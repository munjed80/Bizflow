import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BusinessProfile } from '@/types';

// Basic validation helpers
function validateKvk(kvk: string | undefined): boolean {
  if (!kvk) return true; // optional
  // KVK number is 8 digits
  return /^\d{8}$/.test(kvk);
}

function validateBtwVat(btw: string | undefined): boolean {
  if (!btw) return true; // optional
  // Dutch BTW format: NL + 9 chars + B + 2 digits (e.g., NL123456789B01)
  // Note: Input is normalized to uppercase before validation and storage
  return /^NL\d{9}B\d{2}$/.test(btw.toUpperCase());
}

function validateIban(iban: string | undefined): boolean {
  if (!iban) return true; // optional
  // Basic IBAN format check (2 letters + 2 digits + up to 30 alphanumeric)
  // Note: Input is normalized to uppercase and spaces removed before validation and storage
  return /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(iban.toUpperCase().replace(/\s/g, ''));
}

// GET - Retrieve the business profile for current user
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

    const { data: profile, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found - return 404 with helpful message
        return NextResponse.json(
          { error: 'Business profile not found', exists: false },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ profile, exists: true });
  } catch (error) {
    console.error('Error fetching business profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business profile' },
      { status: 500 }
    );
  }
}

// PUT - Create or update business profile (upsert)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.company_name || body.company_name.trim() === '') {
      return NextResponse.json(
        { error: 'Company name is required', field: 'company_name' },
        { status: 400 }
      );
    }

    // Validate optional format fields
    if (!validateKvk(body.kvk)) {
      return NextResponse.json(
        { error: 'KVK number must be 8 digits', field: 'kvk' },
        { status: 400 }
      );
    }

    if (!validateBtwVat(body.btw_vat)) {
      return NextResponse.json(
        { error: 'BTW number must be in format NL123456789B01', field: 'btw_vat' },
        { status: 400 }
      );
    }

    if (!validateIban(body.iban)) {
      return NextResponse.json(
        { error: 'Invalid IBAN format', field: 'iban' },
        { status: 400 }
      );
    }

    const profileData: Partial<BusinessProfile> = {
      user_id: user.id,
      company_name: body.company_name.trim(),
      legal_name: body.legal_name?.trim() || null,
      kvk: body.kvk?.trim() || null,
      btw_vat: body.btw_vat?.trim().toUpperCase() || null,
      iban: body.iban?.trim().toUpperCase().replace(/\s/g, '') || null,
      bic: body.bic?.trim().toUpperCase() || null,
      address_line1: body.address_line1?.trim() || null,
      address_line2: body.address_line2?.trim() || null,
      postal_code: body.postal_code?.trim() || null,
      city: body.city?.trim() || null,
      country: body.country?.trim() || 'NL',
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      website: body.website?.trim() || null,
      invoice_footer_note: body.invoice_footer_note?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('business_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();
    } else {
      // Create new profile
      result = await supabase
        .from('business_profiles')
        .insert({
          ...profileData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({ 
      profile: result.data, 
      created: !existingProfile 
    });
  } catch (error) {
    console.error('Error saving business profile:', error);
    return NextResponse.json(
      { error: 'Failed to save business profile' },
      { status: 500 }
    );
  }
}
