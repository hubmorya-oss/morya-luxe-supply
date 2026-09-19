# Morya Luxe Supply (B2B Barber & Salon Wholesale Platform)

An enterprise-grade B2B wholesale e-commerce platform built for barbers, salon owners, and grooming academies across India.

- **Client Hotline & WhatsApp Bridge**: `+91 88055 89150`
- **Tech Stack**: Next.js 16 (App Router, TypeScript), Modern Vanilla CSS, Supabase (PostgreSQL), Razorpay, Vercel Edge.

---

## Key Features

1. **Wholesale Volume Tier Pricing**:
   - Automatic volume discounts (Single unit vs Salon 3-6 Pack vs Master Crate 12-24 units).
   - Live salon profit margin calculator.
2. **Dual Checkout Gateway**:
   - **Razorpay Online Checkout**: UPI (Google Pay, PhonePe, Paytm), Debit/Credit cards, NetBanking.
   - **1-Click WhatsApp B2B Quotation**: Itemized invoice breakdown sent directly to `+91 88055 89150`.
3. **Resilient Database Architecture**:
   - Connected to **Supabase** with automated fallback to the curated wholesale catalog if credentials are not yet set.
4. **B2B Trust Pillars**:
   - GST tax invoice generation for Input Tax Credit (ITC).
   - Pan-India 48hr express logistics.
   - Commercial salon warranties.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

---

## 1-Click Vercel Deployment Guide

1. Push this project to your GitHub repository.
2. Log into [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your repository. Vercel will automatically detect Next.js with zero configuration.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` (from Supabase)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from Supabase)
   - `RAZORPAY_KEY_ID` (from Razorpay Dashboard)
   - `RAZORPAY_KEY_SECRET` (from Razorpay Dashboard)
5. Click **Deploy**. Your website will be live globally on Vercel's Edge Network with a free `.vercel.app` domain and free SSL.

---

## Supabase Database Setup

1. Create a free account at [Supabase](https://supabase.com).
2. Create a new project.
3. Open the **SQL Editor** tab in Supabase.
4. Copy and paste the contents of `supabase/schema.sql` and click **Run**.
5. Go to **Project Settings -> API** to get your URL and Anon Key.

---

## Razorpay Payment Setup

1. Sign up on [Razorpay](https://dashboard.razorpay.com).
2. Navigate to **Account & Settings -> API Keys**.
3. Generate your `Key ID` and `Key Secret`.
4. Add them to your `.env.local` or Vercel Environment Variables.
