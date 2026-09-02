# Remove Watermark from Photo

A Next.js application for removing watermarks and logos from photos using AI technology.

## Features

- AI-powered watermark and logo removal
- Multi-language support (English/Chinese)
- User authentication with Google (Supabase)
- Subscription system with Creem payment integration
- Responsive design for PC and mobile
- SEO optimized
- User profile with order and conversion history

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Tencent Cloud
TENCENT_SECRET_ID=your_tencent_secret_id
TENCENT_SECRET_KEY=your_tencent_secret_key
TENCENT_REGION=ap-shanghai
TENCENT_COS_BUCKET=your_bucket_name
TENCENT_COS_REGION=ap-shanghai
TENCENT_COS_UPLOAD_DIR=/uploads/

# Creem Payment
CREEM_API_KEY=your_creem_api_key
CREEM_WEBHOOK_SECRET=your_creem_webhook_secret
CREEM_API_URL=https://api.creem.io
APP_BASE_URL=http://localhost:3000

# Creem Product IDs
CREEM_PRODUCT_BASIC_ID=prod_xxx
CREEM_PRODUCT_STANDARD_ID=prod_xxx
CREEM_PRODUCT_PREMIUM_ID=prod_xxx

# Client-side Product IDs (must have NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_CREEM_PRODUCT_BASIC_ID=prod_xxx
NEXT_PUBLIC_CREEM_PRODUCT_STANDARD_ID=prod_xxx
NEXT_PUBLIC_CREEM_PRODUCT_PREMIUM_ID=prod_xxx
```

### 3. Database Setup

Run the SQL script in `supabase_schema.sql` in your Supabase project to create the necessary tables.

### 4. Generate Favicon

Replace `public/favicon.ico` with your actual favicon file. You can generate one at https://favicon.io/

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── profile/           # User profile page
│   ├── subscribe/         # Subscription page
│   ├── remove-watermark/  # Main watermark removal page
│   └── [legal-pages]/    # Privacy, Terms, etc.
├── components/            # React components
├── contexts/             # React contexts
├── lib/                  # Utility functions
├── public/               # Static assets
└── supabase_schema.sql   # Database schema
```

## Key Features Implementation

### Watermark Removal
- Uses Tencent Cloud API for image processing
- Uploads images to Tencent COS
- Processes images and returns results

### Authentication
- Google OAuth via Supabase
- Email/password authentication
- Password reset functionality
- User session management
- Protected routes

### Subscription System
- Three subscription tiers (Basic, Standard, Premium)
- Creem payment integration
- Webhook handling for payment confirmation
- Credit system

### SEO
- Sitemap generation
- Robots.txt
- Meta tags
- Canonical URLs
- Open Graph tags

## Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy to your hosting platform (Vercel, Netlify, etc.)

3. Set environment variables in your hosting platform

4. Configure webhook URL in Creem dashboard:
   - URL: `https://yourdomain.com/api/creem/webhook`

## Notes

- Make sure to configure Google OAuth in Supabase dashboard
- Update the domain in `next.config.js` and `app/sitemap.ts` for production
- The watermark removal API implementation needs to be completed based on Tencent Cloud documentation
