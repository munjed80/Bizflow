import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { locales } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'
});

export async function middleware(request: NextRequest) {
  // Update Supabase session
  const supabaseResponse = await updateSession(request);

  // Apply i18n middleware and merge Supabase cookies
  const intlResponse = intlMiddleware(request);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
