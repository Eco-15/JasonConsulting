# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server on localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

No test framework is configured.

## Architecture

**Stack:** Next.js 15 (App Router) + TypeScript + Supabase + Tailwind CSS + Shadcn UI, deployed on Netlify.

### Route Groups

The app uses Next.js route groups to separate concerns:

- `app/(marketing)/` — Public pages (home, contact, demo, newsletter)
- `app/(auth)/` — Login page
- `app/(admin)/` — Admin portal (Jason's management interface)
- `app/(dashboard)/` — Client portal (booking + meeting history)

Each group has its own `layout.tsx` that handles authentication and role enforcement. The `(dashboard)/layout.tsx` redirects admins to `/admin`; the `(admin)/layout.tsx` redirects non-admins to `/dashboard`.

### Authentication & Middleware

`middleware.ts` → `lib/supabase/middleware.ts` handles session validation on every request. It:
- Refreshes the Supabase session cookie
- Protects `/dashboard/*` and `/admin/*` routes
- Redirects authenticated users away from `/login` based on role

`lib/supabase/auth-helpers.ts` provides `getCurrentUserProfile()`, used in layouts to load the authenticated user's profile and role (`admin` | `client`).

Two Supabase clients:
- `lib/supabase/server.ts` — Cookie-based client for Server Components and Server Actions
- `lib/supabase/client.ts` — Browser client for OAuth and client-side queries

### Server Actions

All data mutations live in `lib/actions/`:
- `auth.ts` — `signOut()`
- `meetings.ts` — Booking, cancellation, status updates, availability conflict checking
- `admin.ts` — Dashboard stats (upcoming meetings, revenue, client count)
- `availability.ts` — Managing Jason's weekly schedule and blocked dates
- `pricing.ts` — Pricing tier CRUD

Server actions use `'use server'` and validate inputs with Zod schemas from `lib/validations/meetings.ts`.

### Database Schema (Supabase/PostgreSQL)

Key tables:
- `profiles` — Extends Supabase auth users; has `role` field (`admin` | `client`)
- `meetings` — Coaching sessions; status: `scheduled` | `completed` | `cancelled` | `no_show`
- `pricing_tiers` — Configurable session durations and prices
- `availability` — Weekly schedule by `day_of_week` (0–6)
- `blocked_dates` — Specific unavailable dates

TypeScript interfaces for all tables are in `lib/types/database.ts`.

### UI Components

Shadcn UI components (New York style, RSC-enabled) live in `components/ui/`. Custom components like `components/dashboard/sidebar.tsx` are shared between admin and client portals with role-specific nav items.

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
