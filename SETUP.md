# BizFlow Setup Guide

This guide will walk you through setting up BizFlow on your local machine.

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed ([Download](https://nodejs.org/))
- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Git installed on your machine

## Step 1: Clone the Repository

```bash
git clone https://github.com/munjed80/Bizflow.git
cd Bizflow
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all necessary packages including:
- Next.js 14+ with App Router
- React 19
- Tailwind CSS
- Supabase client libraries
- next-intl for internationalization
- And more...

## Step 3: Set Up Supabase

### 3.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the project details:
   - Name: BizFlow
   - Database Password: (create a strong password)
   - Region: (choose closest to your location)
5. Click "Create new project"

### 3.2 Get Your Project Credentials

Once your project is created:

1. Go to Project Settings → API
2. Copy the following values:
   - `Project URL` (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - `anon public` key (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### 3.3 Set Up the Database

1. In your Supabase dashboard, go to the SQL Editor
2. Click "New Query"
3. Copy and paste the following SQL script:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customers table
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forms table (for future smart forms feature)
CREATE TABLE forms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Create policies for customers table
CREATE POLICY "Users can view their own customers"
  ON customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own customers"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers"
  ON customers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers"
  ON customers FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for forms table
CREATE POLICY "Users can view their own forms"
  ON forms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own forms"
  ON forms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms"
  ON forms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forms"
  ON forms FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. Click "Run" to execute the query

### 3.4 Configure Email Authentication

1. Go to Authentication → Providers
2. Make sure "Email" is enabled
3. (Optional) Configure email templates under Authentication → Email Templates

## Step 4: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Optional: Email Configuration

If you want to enable email automation:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@bizflow.app
```

**Note:** If SMTP is not configured, emails will be logged to the console instead.

For Gmail:
1. Enable 2-factor authentication on your Google account
2. Generate an App Password (Account Settings → Security → App Passwords)
3. Use the app password in `SMTP_PASS`

## Step 5: Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 6: Test the Application

### 6.1 Register a New Account

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Click "Register"
3. Fill in your email and password
4. Click "Sign Up"
5. Check your email for a confirmation link (or check Supabase Auth → Users if using development mode)

### 6.2 Login

1. After registration, you'll be redirected to the login page
2. Enter your credentials
3. Click "Sign In"

### 6.3 Test Multi-Language Support

Test the application in different languages:

- English: [http://localhost:3000/en/dashboard](http://localhost:3000/en/dashboard)
- Arabic (RTL): [http://localhost:3000/ar/dashboard](http://localhost:3000/ar/dashboard)
- Dutch: [http://localhost:3000/nl/dashboard](http://localhost:3000/nl/dashboard)

Notice how the Arabic version displays in right-to-left (RTL) layout.

### 6.4 Test Customer Management

1. Go to the Customers page
2. Click "Add Customer"
3. Fill in the customer details:
   - Name
   - Email
   - Phone
   - Company
   - Status (Active/Inactive)
4. Click "Save"
5. You should see the customer in the list
6. Try editing and viewing the customer

## Project Structure

```
Bizflow/
├── src/
│   ├── app/
│   │   ├── [locale]/              # Internationalized routes
│   │   │   ├── dashboard/         # Dashboard and protected pages
│   │   │   │   ├── customers/     # Customer management
│   │   │   │   └── forms/         # Smart forms (placeholder)
│   │   │   ├── login/             # Login page
│   │   │   ├── register/          # Registration page
│   │   │   └── page.tsx           # Home page
│   │   ├── api/                   # API routes
│   │   │   └── automation/        # Automation endpoints
│   │   └── globals.css            # Global styles
│   ├── components/                # Reusable React components
│   ├── lib/
│   │   └── supabase/              # Supabase client utilities
│   ├── types/                     # TypeScript type definitions
│   ├── i18n.ts                    # i18n configuration
│   └── middleware.ts              # Next.js middleware
├── messages/                      # Translation files
│   ├── en.json                    # English translations
│   ├── ar.json                    # Arabic translations
│   └── nl.json                    # Dutch translations
├── .env.example                   # Environment variables template
└── README.md                      # Main documentation
```

## Features Implemented

### ✅ Multi-Language Support
- English (LTR)
- Arabic (RTL) - automatically switches layout direction
- Dutch (LTR)
- Language switcher in all pages

### ✅ Authentication
- Email/password registration
- Secure login
- Session management
- Protected routes
- Logout functionality

### ✅ Customer Management (CRM)
- Create customers
- View customer list
- Edit customers
- Customer status tracking (active/inactive)
- Dashboard statistics

### ✅ Dashboard
- Total customers count
- Active customers count
- Recent customers list
- Statistics cards

### ✅ Basic Automation
- Welcome email on customer creation
- Email logging (when SMTP not configured)
- API endpoint for email automation

### 🔜 Coming Soon
- Smart Forms (dynamic form builder)
- Advanced workflow automation
- Analytics and reporting
- Customer import/export

## Common Issues and Troubleshooting

### Issue: Build fails with Tailwind errors

**Solution:** Make sure `@tailwindcss/postcss` is installed:
```bash
npm install -D @tailwindcss/postcss
```

### Issue: Supabase connection errors

**Solution:** 
1. Check that your `.env.local` file has the correct credentials
2. Verify the Supabase URL format: `https://your-project-id.supabase.co`
3. Make sure you're using the anon/public key, not the service role key

### Issue: Authentication not working

**Solution:**
1. Check Supabase Auth settings are enabled
2. Verify Row Level Security policies are set up correctly
3. Check browser console for errors

### Issue: Language switching not working

**Solution:**
1. Make sure all translation files exist in `/messages/`
2. Check the middleware configuration in `src/middleware.ts`
3. Clear your browser cache and restart the dev server

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - (Optional) SMTP settings
6. Click "Deploy"

### Other Platforms

BizFlow can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify
- Self-hosted with Docker

## Support

For issues or questions:
1. Check this setup guide
2. Check the main README.md
3. Open an issue on GitHub

## Next Steps

1. Customize the branding and colors
2. Add more customer fields as needed
3. Implement the smart forms feature
4. Add more automation workflows
5. Integrate with external services
6. Add analytics and reporting

Enjoy building with BizFlow! 🚀
