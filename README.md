# BizFlow

A multi-language SaaS platform with Simple CRM, Smart Forms, and Basic Workflow Automation.

## Features

- 🌍 **Multi-language Support** - English (EN), Arabic (AR), Dutch (NL)
- 🔄 **RTL/LTR Support** - Automatic direction switching for Arabic
- 👥 **Simple CRM** - Customer management with CRUD operations
- 📝 **Smart Forms** - Dynamic form builder (coming soon)
- 🤖 **Workflow Automation** - Basic email automation
- 🔐 **User Authentication** - Secure login and registration with Supabase
- 📊 **Dashboard** - Overview with statistics and recent customers

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **Internationalization**: next-intl
- **Forms**: React Hook Form, Zod
- **Email**: Nodemailer

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works fine)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/munjed80/Bizflow.git
cd Bizflow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup

1. Create a new project in [Supabase](https://supabase.com)

2. In the SQL Editor, run the following SQL to create the necessary tables:

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

3. (Optional) For email automation, configure SMTP settings in `.env.local`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@bizflow.app
```

If SMTP is not configured, emails will be logged to the console instead.

### Running the Application

Development mode:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Build for production:
```bash
npm run build
npm start
```

## Project Structure

```
Bizflow/
├── src/
│   ├── app/
│   │   ├── [locale]/           # Internationalized routes
│   │   │   ├── dashboard/      # Dashboard pages
│   │   │   │   ├── customers/  # Customer management
│   │   │   │   └── forms/      # Smart forms
│   │   │   ├── login/          # Login page
│   │   │   ├── register/       # Registration page
│   │   │   ├── layout.tsx      # Locale-specific layout
│   │   │   └── page.tsx        # Home page
│   │   ├── api/                # API routes
│   │   │   └── automation/     # Automation endpoints
│   │   ├── globals.css         # Global styles
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   ├── lib/
│   │   └── supabase/           # Supabase client utilities
│   ├── types/                  # TypeScript type definitions
│   ├── i18n.ts                 # i18n configuration
│   └── middleware.ts           # Next.js middleware
├── messages/                   # Translation files
│   ├── en.json                 # English translations
│   ├── ar.json                 # Arabic translations
│   └── nl.json                 # Dutch translations
└── public/                     # Static assets
```

## Language Support

The application supports three languages:
- **English (en)** - Default, LTR
- **Arabic (ar)** - RTL layout
- **Dutch (nl)** - LTR

Access different languages via URL:
- `/en/` - English
- `/ar/` - Arabic (RTL)
- `/nl/` - Dutch

## Features Overview

### Authentication
- User registration with email/password
- Secure login
- Session management with Supabase Auth
- Protected routes

### Customer Management (CRM)
- Create, read, update customers
- Customer status tracking (active/inactive)
- Search and filter capabilities
- Customer details view

### Dashboard
- Statistics overview (total customers, active customers)
- Recent customers list
- Quick navigation to features

### Workflow Automation
- Welcome email on customer creation
- Email logging (when SMTP not configured)
- Extensible automation system

### Smart Forms (Coming Soon)
- Dynamic form builder
- Custom field types
- Form validation
- Response collection

## Development

### Linting
```bash
npm run lint
```

### Type Checking
TypeScript is configured for strict type checking. Run:
```bash
npx tsc --noEmit
```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean
- AWS

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.