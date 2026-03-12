# LinkedBoost — Full System Documentation

**Project**: LinkedBoost — LinkedIn Automation SaaS  
**Version**: 0.1.0 (Phase 1 Complete)  
**Stack**: Next.js 16.1.6 + React 19 + TypeScript 5 + Tailwind CSS v4 + MongoDB (Mongoose 9) + NextAuth.js v5 + Chrome Extension (Manifest V3)  
**Deployment Target**: Self-hosted VPS (Docker)  
**Monetization**: Free forever (BYOK — users bring their own AI API keys)  
**Last Updated**: March 2026  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Folder Structure](#2-folder-structure)
3. [Tech Stack & Dependencies](#3-tech-stack--dependencies)
4. [Authentication System](#4-authentication-system)
5. [Middleware & Route Protection](#5-middleware--route-protection)
6. [Database Schema & Models](#6-database-schema--models)
7. [API Routes](#7-api-routes)
8. [UI Design System](#8-ui-design-system)
9. [Landing Page](#9-landing-page)
10. [Dashboard Layout & Features](#10-dashboard-layout--features)
11. [Chrome Extension](#11-chrome-extension)
12. [Anti-Detection Engine](#12-anti-detection-engine)
13. [Security Implementation](#13-security-implementation)
14. [SEO Implementation](#14-seo-implementation)
15. [Performance Optimizations](#15-performance-optimizations)
16. [State Management](#16-state-management)
17. [Validation Layer](#17-validation-layer)
18. [Build Configuration](#18-build-configuration)
19. [Environment Variables](#19-environment-variables)
20. [Module Completion Status](#20-module-completion-status)
21. [Known Issues & Warnings](#21-known-issues--warnings)

---

## 1. Project Overview

LinkedBoost is a LinkedIn automation platform with three core pillars:

1. **Smart Auto-Apply** — AI-tailored resume generation and automated LinkedIn Easy Apply job submissions
2. **Become a Hero** — AI-powered LinkedIn content creation, group engagement, and personal brand building
3. **Data Scraper** — LinkedIn scraping for leads, posts, and profiles with automated personalized outreach

The system consists of two main components:
- **Next.js Web App** — Dashboard for configuration, monitoring, and analytics
- **Chrome Extension** (Manifest V3) — Executes LinkedIn actions in the user's browser via content scripts

Communication between the web app and extension happens via WebSocket (Socket.IO) with message passing through Chrome's `chrome.runtime.sendMessage` API.

### Architecture Flow

```
User ──▶ Next.js Dashboard ──▶ WebSocket Server ──▶ Chrome Extension Background Worker
                                                            │
                                                            ▼
                                                    Content Script (LinkedIn DOM)
```

---

## 2. Folder Structure

```
linkkdenjobapply/
├── auth.config.ts              # Edge-compatible auth config (used by middleware)
├── auth.ts                     # Full NextAuth config with Node.js deps (bcrypt, mongoose)
├── middleware.ts                # Route protection middleware (edge runtime)
├── next.config.ts              # Next.js configuration with bundle analyzer
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript strict configuration
├── eslint.config.mjs           # ESLint 9 flat config
├── postcss.config.mjs          # PostCSS with Tailwind v4
├── DOCUMENTATION.md            # This file
├── Plan.txt                    # Full 19-module development plan
│
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata, Providers)
│   ├── page.tsx                # Landing page (static, with JSON-LD)
│   ├── globals.css             # Tailwind v4 theme + custom utilities
│   ├── robots.ts               # Dynamic robots.txt generation
│   ├── sitemap.ts              # Dynamic sitemap.xml generation
│   │
│   ├── (auth)/                 # Auth route group
│   │   ├── layout.tsx          # Auth layout (centered card + gradient bg)
│   │   ├── login/page.tsx      # Login page (client component)
│   │   └── register/page.tsx   # Register page (client component)
│   │
│   ├── (dashboard)/            # Dashboard route group (protected)
│   │   ├── layout.tsx          # Dashboard layout (server: auth check → DashboardShell)
│   │   └── dashboard/
│   │       ├── page.tsx        # Dashboard home (server component, Suspense boundaries)
│   │       ├── jobs/page.tsx   # Job Automation placeholder
│   │       ├── hero/page.tsx   # Become a Hero placeholder
│   │       ├── scraper/page.tsx # Data Scraper placeholder
│   │       ├── analytics/page.tsx # Analytics placeholder
│   │       └── settings/page.tsx  # Settings placeholder
│   │
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts  # NextAuth API route handler
│       │   └── register/route.ts       # Registration endpoint (rate limited)
│       ├── health/route.ts             # Health check endpoint
│       ├── jobs/route.ts               # Jobs API (placeholder)
│       ├── hero/route.ts               # Hero API (placeholder)
│       └── scraper/route.ts            # Scraper API (placeholder)
│
├── components/
│   ├── providers.tsx           # SessionProvider + Toaster (sonner)
│   ├── dashboard/
│   │   ├── dashboard-shell.tsx # Main dashboard layout (sidebar + topbar + content)
│   │   ├── stats-cards.tsx     # Stats overview cards (4 metrics)
│   │   ├── quick-start-cards.tsx # Feature quick-start navigation cards
│   │   ├── recent-activity.tsx # Activity feed (empty state ready)
│   │   └── getting-started.tsx # Onboarding checklist (4 steps)
│   ├── layout/
│   │   ├── sidebar.tsx         # Collapsible sidebar with Framer Motion animations
│   │   └── topbar.tsx          # Top bar with title, extension status, notifications
│   └── ui/
│       ├── button.tsx          # Button with CVA variants
│       ├── card.tsx            # Card family (Card, Header, Title, Description, Content, Footer)
│       ├── input.tsx           # Styled input component
│       ├── label.tsx           # Radix UI label
│       ├── badge.tsx           # Badge with 5 variants
│       └── spinner.tsx         # Spinner, LoadingSkeleton, CardSkeleton
│
├── lib/
│   ├── anti-detection/
│   │   └── human-simulator.ts  # Gaussian delays, reading pause, daily limits, cooldowns
│   ├── db/
│   │   ├── connection.ts       # MongoDB singleton connection (pooled, max 10)
│   │   └── models/
│   │       ├── index.ts        # Barrel export for all models
│   │       ├── user.ts         # User model (11 fields, hashedPassword select:false)
│   │       ├── resume.ts       # Resume model (structured resume data)
│   │       ├── job-search.ts   # Job search configuration model
│   │       ├── job-application.ts # Job application tracking model (9 statuses)
│   │       ├── hero-profile.ts # Hero mode configuration model
│   │       ├── post.ts         # LinkedIn post tracking model
│   │       ├── scraped-data.ts # Scraped data model (flexible schema)
│   │       ├── scraper-config.ts # Scraper configuration model
│   │       ├── activity-log.ts # Activity log with 90-day TTL
│   │       └── daily-usage.ts  # Daily usage tracking model
│   ├── hooks/
│   │   └── use-stores.ts       # Zustand stores (sidebar, extension status)
│   ├── utils/
│   │   ├── index.ts            # cn(), formatDate(), formatRelativeTime(), sleep(), generateId()
│   │   ├── encryption.ts       # AES-256-GCM encryption (native Node.js crypto)
│   │   └── rate-limit.ts       # Rate limiter (auth: 5/min, API: 100/min)
│   └── validators/
│       └── index.ts            # Zod schemas (login, register, jobSearch, heroProfile, scraperConfig, etc.)
│
├── extension/
│   ├── manifest.json           # Chrome Extension Manifest V3
│   ├── build.js                # Build script (copies to dist/, generates SVG icons)
│   ├── package.json            # Extension package.json
│   ├── background/
│   │   └── service-worker.js   # WebSocket client, message relay, command queue
│   ├── content/
│   │   └── content-script.js   # LinkedIn DOM interaction, page detection, action executors
│   ├── popup/
│   │   ├── popup.html          # Extension popup UI (styled, dark theme)
│   │   └── popup.js            # Popup logic (status display, login prompt)
│   └── utils/
│       └── helpers.js          # Shared utilities (randomDelay, generateActionId, logMessage)
│
├── public/                     # Static assets (currently empty)
└── types/
    └── next-auth.d.ts          # NextAuth type augmentation (Session.user.id, JWT.id)
```

---

## 3. Tech Stack & Dependencies

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.6 | App Router, SSR/SSG, API routes, Turbopack |
| react | 19.2.3 | UI library with server components |
| typescript | ^5 | Strict type checking |
| tailwindcss | ^4 | Styling with v4 CSS-first configuration |

### Authentication & Database
| Package | Version | Purpose |
|---------|---------|---------|
| next-auth | 5.0.0-beta.30 | Authentication (JWT strategy) |
| mongoose | 9.3.0 | MongoDB ODM with connection pooling |
| mongodb | 6.21.0 | MongoDB driver |
| @auth/mongodb-adapter | 3.11.1 | NextAuth MongoDB adapter |
| bcryptjs | 3.0.3 | Password hashing (12 salt rounds) |

### UI & Components
| Package | Version | Purpose |
|---------|---------|---------|
| @radix-ui/react-* | Various | Headless, accessible UI primitives (accordion, avatar, dialog, dropdown, label, separator, slot, switch, tabs, tooltip) |
| framer-motion | 12.35.2 | Animations (sidebar, active states) |
| lucide-react | 0.577.0 | Icons (tree-shakeable) |
| recharts | 3.8.0 | Charts (for analytics, Phase 2+) |
| class-variance-authority | 0.7.1 | Component variant management |
| clsx + tailwind-merge | 2.1.1 + 3.5.0 | Conditional class merging |
| sonner | 2.0.7 | Toast notifications |

### Forms & Validation
| Package | Version | Purpose |
|---------|---------|---------|
| zod | 4.3.6 | Schema validation |
| react-hook-form | 7.71.2 | Form state management |
| @hookform/resolvers | 5.2.2 | Zod resolver for react-hook-form |

### State & Real-time
| Package | Version | Purpose |
|---------|---------|---------|
| zustand | 5.0.11 | Lightweight state management (2KB) |
| socket.io | 4.8.3 | WebSocket server |
| socket.io-client | 4.8.3 | WebSocket client |

### Security & Rate Limiting
| Package | Version | Purpose |
|---------|---------|---------|
| rate-limiter-flexible | 9.1.1 | In-memory rate limiting |
| Node.js crypto (native) | — | AES-256-GCM encryption for API keys |

### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| @next/bundle-analyzer | 16.1.6 | Bundle size analysis (ANALYZE=true) |
| @tailwindcss/postcss | ^4 | Tailwind v4 PostCSS plugin |
| eslint + eslint-config-next | 9 + 16.1.6 | Linting |

### Notable: Removed Dependencies
- `crypto-js` — Replaced with native Node.js `crypto` module for AES-256-GCM encryption (was using weaker CBC mode)
- `@types/crypto-js` — No longer needed

---

## 4. Authentication System

### Architecture: Split Auth Config

The auth system is split into two files to support Next.js 16's edge runtime in middleware:

#### `auth.config.ts` — Edge-Compatible Config
- **Runtime**: Edge (no Node.js modules)
- **Used by**: `middleware.ts`
- **Contains**:
  - Provider declarations (Credentials shell, Google, GitHub) — without `authorize` implementation
  - JWT session strategy (30-day maxAge)
  - Custom pages configuration (`/login`, `/login` for errors)
  - `authorized` callback — handles route protection logic directly
  - `jwt` callback — attaches user ID to token, handles session updates
  - `session` callback — maps token.id to session.user.id

```
Why split? The middleware runs in the edge runtime which cannot import Node.js 
modules (mongoose, bcryptjs). The authorize callback needs these, so it lives 
in auth.ts which only runs in the Node.js runtime.
```

#### `auth.ts` — Full Node.js Config
- **Runtime**: Node.js only
- **Used by**: API routes, server components, dashboard layout
- **Extends**: `auth.config.ts` via spread (`...authConfig`)
- **Adds**:
  - Credentials `authorize` callback with bcrypt password verification and MongoDB lookup
  - `signIn` callback — auto-creates user document for OAuth sign-ins (Google/GitHub)
  - Exports: `handlers`, `signIn`, `signOut`, `auth`

### Authentication Providers

| Provider | Status | Notes |
|----------|--------|-------|
| Credentials (Email + Password) | Active | bcrypt hash (12 rounds), Zod validation |
| Google OAuth | Conditional | Only enabled if `GOOGLE_CLIENT_ID` is set |
| GitHub OAuth | Conditional | Only enabled if `GITHUB_CLIENT_ID` is set |

### Auth Flow

#### Registration (`POST /api/auth/register`)
1. Rate limit check (5 attempts/min per IP)
2. Zod schema validation (name, email, password with complexity rules, confirmPassword match)
3. Check if email already exists (case-insensitive)
4. Hash password with bcrypt (12 rounds)
5. Create user document in MongoDB
6. Return user ID, name, email (status 201)

#### Login (Credentials)
1. NextAuth calls `authorize()` in `auth.ts`
2. Connect to MongoDB
3. Find user by email (lowercase), select `+hashedPassword`
4. Compare password with bcrypt
5. Return user object → JWT token created with user.id
6. Redirect to `/dashboard` or callbackUrl

#### OAuth Login (Google/GitHub)
1. OAuth flow handled by NextAuth
2. `signIn` callback checks if user exists in MongoDB
3. If new user → auto-create with name, email, image, emailVerified
4. JWT token created, session established

### Session Strategy
- **Type**: JWT (stateless, no DB sessions)
- **Max Age**: 30 days
- **Token Contents**: `id`, `name`, `email`, `image`
- **Update Trigger**: `session.update({ name, image })` re-signs token

### Type Augmentation (`types/next-auth.d.ts`)
```typescript
Session.user.id: string  // Added to default session type
JWT.id: string           // Added to default JWT type
```

---

## 5. Middleware & Route Protection

### File: `middleware.ts`

The middleware uses the edge-compatible auth config to protect routes:

```typescript
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);
export default auth;

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
```

### Protection Logic (in `auth.config.ts` → `authorized` callback)

| Route Pattern | Unauthenticated User | Authenticated User |
|---------------|---------------------|--------------------|
| `/dashboard/*` | Redirected to `/login` (NextAuth default) | Allowed through |
| `/login` | Allowed through | Redirected to `/dashboard` |
| `/register` | Allowed through | Redirected to `/dashboard` |
| All other routes | No middleware (not in matcher) | No middleware |

### Additional Server-Side Protection

The dashboard layout (`app/(dashboard)/layout.tsx`) has a second layer of protection:
```typescript
const session = await auth();
if (!session?.user) {
  redirect("/login");
}
```
This ensures protection even if middleware is bypassed.

### Current Status
- The middleware uses the Next.js 16 deprecated `middleware` convention (shows a deprecation warning)
- It still functions correctly — Next.js 16 treats it as `ƒ Proxy (Middleware)` in the build output
- Migration to the new `proxy` convention is planned for a future update

---

## 6. Database Schema & Models

### Connection (`lib/db/connection.ts`)
- Singleton pattern using `global.mongooseCache`
- Connection pooling: `maxPoolSize: 10`
- `bufferCommands: false` for immediate error on no connection
- Connection is reused across hot reloads in development

### Models (10 collections)

#### 1. User (`lib/db/models/user.ts`)
| Field | Type | Notes |
|-------|------|-------|
| name | String | Required |
| email | String | Required, unique, indexed |
| image | String | Optional (OAuth profile picture) |
| hashedPassword | String | **`select: false`** — excluded from queries by default |
| emailVerified | Date | Set on OAuth sign-up |
| linkedinProfile | Object | { name, headline, url, profilePicUrl } |
| aiApiKeys | Array | [{ provider: enum, encryptedKey, isValid }] |
| settings | Object | timezone, language, notificationPrefs, dailyLimits |
| subscription | Object | { plan: "free", startDate } |
| stats | Object | { totalApplied, totalPosts, totalScraped, successRate } |
| timestamps | Auto | createdAt, updatedAt |

**Indexes**: `email` (unique), `createdAt`  
**Security**: `hashedPassword` has `select: false` — must use `.select("+hashedPassword")` to access

#### 2. Resume (`lib/db/models/resume.ts`)
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | Ref → User |
| name | String | Resume name/version |
| isDefault | Boolean | Default resume flag |
| contactInfo | Object | phone, email, location, linkedin, github, portfolio |
| summary | String | Professional summary |
| experience | Array | [{ company, title, dates, description, highlights }] |
| education | Array | [{ school, degree, field, dates, gpa }] |
| skills | Array | String array |
| certifications | Array | [{ name, issuer, date }] |
| projects | Array | [{ name, description, url, tech[] }] |
| rawText | String | Original parsed resume text |
| pdfUrl | String | Stored PDF link |

**Indexes**: `userId`, compound `userId + isDefault`

#### 3. JobSearch (`lib/db/models/job-search.ts`)
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | Ref → User |
| name, keywords, location | String | Search parameters |
| remote | Boolean | Remote filter |
| experienceLevel | Array | enum: internship, entry, associate, mid-senior, director, executive |
| datePosted | String | enum: any, past-24h, past-week, past-month |
| easyApplyOnly | Boolean | Default: true |
| salary | Object | { min, max } |
| excludeCompanies, excludeKeywords | Array | Exclusion filters |
| isActive | Boolean | Active/inactive toggle |
| schedule | String | Cron expression for recurring |

**Indexes**: `userId`, compound `userId + isActive`

#### 4. JobApplication (`lib/db/models/job-application.ts`)
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | Ref → User |
| jobSearchId | ObjectId | Ref → JobSearch (optional) |
| jobTitle, company, location | String | Job details |
| jobUrl, jobDescription | String | LinkedIn URL and description |
| status | String | **9 statuses**: found → tailoring → applying → applied → failed → skipped → interview → rejected → offered |
| tailoredResume | Object | AI-generated { summary, skills[], highlights[] } |
| formAnswers | Array | [{ question, answer, fieldType }] |
| appliedAt | Date | When application was submitted |
| matchScore | Number | AI-calculated job-resume match % |

**Indexes**: compound `userId + status`, `appliedAt` (descending), `company`

#### 5. HeroProfile (`lib/db/models/hero-profile.ts`)
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | Ref → User |
| niche | String | User's content niche |
| targetAudience | String | Target audience description |
| contentPillars | Array | 3-5 themes to post about |
| postingSchedule | Object | { days[], timesPerWeek, preferredTimes[] } |
| groups | Array | [{ groupId, name, url, joined, joinedAt }] |
| hashtags | Array | Tracked hashtags |
| voiceTone | String | enum: professional, casual, inspirational, educational, humorous |
| contentQueue | Array | [{ content, scheduledFor, status }] |

**Indexes**: `userId`

#### 6. Post (`lib/db/models/post.ts`)
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | Ref → User |
| heroProfileId | ObjectId | Ref → HeroProfile (optional) |
| content | String | Post text content |
| type | String | enum: text, image, carousel, poll, video, article |
| hashtags, targetGroups | Array | Post metadata |
| status | String | enum: draft, scheduled, posting, posted, failed |
| scheduledFor, postedAt | Date | Scheduling dates |
| engagement | Object | { views, likes, comments, shares, impressions } |
| linkedinPostUrl | String | URL of published post |

**Indexes**: compound `userId + status`, `scheduledFor`

#### 7. ScrapedData (`lib/db/models/scraped-data.ts`)
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | Ref → User |
| scraperConfigId | ObjectId | Ref → ScraperConfig (optional) |
| type | String | enum: post, profile, company, job |
| data | Mixed | Flexible schema for scraped content |
| source | Object | { url, scrapedAt } |
| tags | Array | Categorization tags |
| actions | Array | [{ type: commented/reached_out/saved/dismissed, at, content }] |

**Indexes**: compound `userId + type`, `source.scrapedAt` (descending), `tags`

#### 8. ScraperConfig (`lib/db/models/scraper-config.ts`)
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | Ref → User |
| name | String | Config name |
| type | String | enum: posts, profiles, companies |
| keywords | Array | Search keywords |
| filters | Mixed | Flexible filter configuration |
| schedule | String | Cron expression |
| isActive | Boolean | Active/inactive |
| maxResults | Number | Default: 50 |

**Indexes**: `userId`, compound `userId + isActive`

#### 9. ActivityLog (`lib/db/models/activity-log.ts`)
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | Ref → User |
| action | String | Action description |
| module | String | enum: jobs, hero, scraper |
| details | Mixed | Action details |
| status | String | enum: success, failure, skipped |
| linkedinUrl | String | Related LinkedIn URL |
| timestamp | Date | Default: now |

**Indexes**: compound `userId + module`, `timestamp` (descending)  
**TTL Index**: `timestamp` — auto-deletes after **90 days**

#### 10. DailyUsage (`lib/db/models/daily-usage.ts`)
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | Ref → User |
| date | String | YYYY-MM-DD format |
| actions | Object | { applies, posts, scrapes, profileViews, messages } — all Number, default 0 |

**Indexes**: compound unique `userId + date`

### Barrel Export (`lib/db/models/index.ts`)
All models and their TypeScript interfaces are re-exported from a single index file for clean imports:
```typescript
import { User, Resume, JobApplication } from "@/lib/db/models";
```

---

## 7. API Routes

### `GET /api/health`
- Tests MongoDB connection
- Returns `{ status: "healthy", timestamp }` (200) or `{ status: "unhealthy" }` (503)

### `POST /api/auth/register`
- **Rate Limited**: 5 attempts per minute per IP (429 with `Retry-After` header)
- **Validation**: Zod `registerSchema` (name, email, password complexity, confirmPassword)
- **Flow**: Validate → check duplicate email → bcrypt hash → create User → return user data (201)
- **Error Handling**: 400 (validation), 409 (duplicate), 429 (rate limit), 500 (server error)

### `GET/POST /api/auth/[...nextauth]`
- NextAuth.js catch-all route handler
- Delegates to `handlers` exported from `auth.ts`
- Handles: `/api/auth/session`, `/api/auth/signin`, `/api/auth/signout`, callback URLs

### `GET /api/jobs`
- Placeholder: returns `{ message: "Jobs API — coming in Module 9" }`

### `GET /api/hero`
- Placeholder: returns `{ message: "Hero API — coming in Module 10" }`

### `GET /api/scraper`
- Placeholder: returns `{ message: "Scraper API — coming in Module 11" }`

---

## 8. UI Design System

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#0A0F1C` | Deep navy — all page backgrounds |
| Primary | `#3B82F6` | Electric blue — buttons, active states, links |
| Primary Hover | `#60A5FA` | Light blue — hover states |
| Text Primary | `#F8FAFC` | Soft white — headings, primary text |
| Text Secondary | `rgba(255,255,255,0.5)` | 50% white — descriptions, labels |
| Text Muted | `rgba(255,255,255,0.4)` | 40% white — secondary descriptions |
| Card Background | `rgba(255,255,255,0.05)` | 5% white — card backgrounds |
| Card Border | `rgba(255,255,255,0.1)` | 10% white — card borders |

### Feature Accent Colors
| Feature | Color | Hex |
|---------|-------|-----|
| Job Automation | Blue | `#3B82F6` / `blue-400/500` |
| Become a Hero | Purple | `#A855F7` / `purple-400/500` |
| Data Scraper | Amber | `#F59E0B` / `amber-400/500` |
| Analytics | Emerald | `#10B981` / `emerald-400/500` |
| Success states | Emerald | `#22C55E` / `emerald-400/500` |
| Error states | Red | `#EF4444` / `red-400/500` |
| Warning states | Amber | `#EAB308` / `amber-400/500` |

### Theme Mode
- **Dark mode only** by default (`<html lang="en" className="dark">`)
- Background: `bg-[#0A0F1C]` across all pages
- Text: white family with opacity for hierarchy

### Typography
- **Primary Font**: Geist Sans (variable: `--font-geist-sans`)
- **Mono Font**: Geist Mono (variable: `--font-geist-mono`)
- Both loaded via `next/font/google` with CSS variable strategy

### Design Language
- **Glassmorphism**: Cards use `bg-white/5 backdrop-blur-xl border-white/10`
- **Elevation**: Shadows via `shadow-lg shadow-blue-600/20` on primary elements
- **Border Radius**: 
  - Cards: `rounded-xl` (12px) / `rounded-2xl` (16px)
  - Buttons: `rounded-lg` (8px)
  - Inputs: `rounded-lg` (8px)
  - Avatar circles: `rounded-full`
  - Badges: `rounded-full`
- **Spacing Grid**: Tailwind default (4px base)
- **Micro-interactions**: 
  - Buttons: `hover:scale-[1.02] active:scale-[0.98]`
  - Cards: `hover:scale-[1.02]` + border color change
  - Focus rings: `focus-visible:ring-2 focus-visible:ring-blue-500`
- **Transitions**: `transition-all duration-200` as standard

### UI Component Library

#### Button (`components/ui/button.tsx`)
Built with `class-variance-authority` (CVA) and `@radix-ui/react-slot` for polymorphism.

| Variant | Appearance |
|---------|------------|
| `default` | Blue 600 bg, white text, blue shadow |
| `destructive` | Red 600 bg, white text, red shadow |
| `outline` | Transparent bg, white/10 border, white text |
| `secondary` | White/10 bg, white text |
| `ghost` | Transparent bg, white/70 text, white/5 hover |
| `link` | Blue 400 text, underline on hover |

| Size | Dimensions |
|------|------------|
| `default` | h-10, px-4 |
| `sm` | h-8, px-3, text-xs |
| `lg` | h-12, px-6, text-base |
| `icon` | h-10, w-10 |

#### Card (`components/ui/card.tsx`)
Compound component pattern:
- `Card` — outer container with glassmorphism
- `CardHeader` — p-6, flex column, space-y-1.5
- `CardTitle` — h3, text-lg, font-semibold, white
- `CardDescription` — text-sm, white/50
- `CardContent` — p-6 pt-0
- `CardFooter` — flex, p-6 pt-0

#### Input (`components/ui/input.tsx`)
- Dark transparent background (`bg-white/5`)
- White/10 border, blue-500 focus ring
- White text, white/40 placeholder

#### Badge (`components/ui/badge.tsx`)
5 variants: `default`, `success`, `warning`, `error`, `info`
Each with matching background/text/border color combinations.

#### Spinner (`components/ui/spinner.tsx`)
- `Spinner` — animated Loader2 icon (sm/md/lg sizes)
- `LoadingSkeleton` — animated pulse placeholder
- `CardSkeleton` — full card skeleton loader

### Custom CSS Utilities (`globals.css`)
- `.glass` — glassmorphism preset (bg-white/5, blur-24px, border-white/10)
- `.sidebar-transition` — cubic-bezier width/padding transition (0.3s)
- `.gradient-primary` — 135deg blue→purple gradient
- `.gradient-card` — 135deg blue/10→purple/5 gradient
- Custom scrollbar styling (thin, white/10 thumb)

---

## 9. Landing Page

### File: `app/page.tsx`
**Rendering**: Static (SSG) — prerendered at build time  
**Type**: Server Component

### Sections (top to bottom)

1. **Navigation Bar**
   - LinkedBoost logo (⚡ icon + text)
   - "Sign in" (ghost button) + "Get Started Free" (primary button)
   - Full-width, max-w-6xl center, border-b

2. **Hero Section**
   - Radial gradient background (blue/20 at top)
   - BYOK badge ("100% Free — Bring Your Own AI Key")
   - Headline: "LinkedIn Automation **That Goes Viral**" (gradient text)
   - Subtitle: value proposition description
   - Two CTAs: "Start Automating" (primary) + "See Features" (outline)

3. **Features Section** (3 pillars)
   - "Three Pillars of LinkedIn Domination" heading
   - 3-column grid with hover animations:
     - **Smart Auto-Apply** (blue, Briefcase icon)
     - **Become a Hero** (purple, Trophy icon)
     - **Smart Scraper** (amber, Database icon)
   - Each card: icon, title, description, hover border color change

4. **How It Works** (3 steps)
   - "Up and Running in 3 Steps" heading
   - Step 01: Add Your AI Key
   - Step 02: Upload Your Resume
   - Step 03: Install Extension & Go

5. **Trust Signals** (3 columns)
   - Anti-Detection Built In (Shield icon, emerald)
   - BYOK — Your Keys, Your Data (Key icon, blue)
   - Free Forever (GitHub icon, purple)

6. **CTA Section**
   - "Ready to Dominate LinkedIn?" heading
   - "Get Started Free" button

7. **Footer**
   - Logo + copyright notice
   - "Free and open source" tagline

### JSON-LD Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "LinkedBoost",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "..."
}
```

---

## 10. Dashboard Layout & Features

### Dashboard Shell (`components/dashboard/dashboard-shell.tsx`)
```
┌──────────────────────────────────────────────────────┐
│ Sidebar          │  Topbar                            │
│  (collapsible)   │──────────────────────────────────│
│                  │                                    │
│  Navigation      │  Main Content Area                │
│  - Dashboard     │  (scrollable, p-4/p-6)            │
│  - Jobs          │                                    │
│  - Hero          │                                    │
│  - Scraper       │                                    │
│  - Analytics     │                                    │
│  - Settings      │                                    │
│                  │                                    │
│  User Profile    │                                    │
│  (bottom)        │                                    │
└──────────────────────────────────────────────────────┘
```

### Sidebar (`components/layout/sidebar.tsx`)
- **Collapsible**: Toggle between expanded (w-70 / 280px) and collapsed (w-18 / 72px) modes
- **Mobile**: Hidden by default, slides in with overlay when hamburger tapped
- **Active State**: Animated pill indicator using Framer Motion `layoutId` (spring animation)
- **User Section**: Avatar (or User icon), name, email, logout button
- **Logo**: ⚡ icon + "LinkedBoost" text (text hides when collapsed)
- **Animations**: All text uses `AnimatePresence` for smooth opacity/width transitions

Navigation items:
| Label | Route | Icon |
|-------|-------|------|
| Dashboard | /dashboard | LayoutDashboard |
| Job Automation | /dashboard/jobs | Briefcase |
| Become a Hero | /dashboard/hero | Trophy |
| Data Scraper | /dashboard/scraper | Database |
| Analytics | /dashboard/analytics | BarChart3 |
| Settings | /dashboard/settings | Settings |

### Topbar (`components/layout/topbar.tsx`)
- **Title**: Dynamic page title based on current route
- **Extension Status**: Green pill ("Extension Connected") or gray pill ("Extension Offline") with PlugZap/Plug icons
- **Notifications**: Bell icon button (placeholder — no notification system yet)
- **Mobile Menu**: Hamburger button (visible on mobile) opens sidebar
- **Sticky**: Fixed at top with backdrop blur

### Dashboard Home (`app/(dashboard)/dashboard/page.tsx`)
**Type**: Server Component (async — calls `auth()` server-side)

Sections:
1. **Welcome Banner**: "Welcome back, {first name}" + overview subtitle
2. **Stats Cards** (4 cards in grid):
   - Total Applied (blue) — 0
   - Success Rate (emerald) — 0%
   - Posts This Week (purple) — 0
   - Leads Found (amber) — 0
   - All show placeholder values — will connect to DB in Phase 2
3. **Getting Started Checklist** (expandable):
   - Add your AI API key → Settings
   - Upload your resume → Settings
   - Install the Chrome extension → Settings
   - Configure your preferences → Settings
   - Progress bar (0/4 completed)
   - Collapsible with ChevronUp/Down
4. **Quick Start Cards** (3 feature cards):
   - Job Automation → /dashboard/jobs
   - Become a Hero → /dashboard/hero
   - Data Scraper → /dashboard/scraper
   - Each with arrow animation on hover
5. **Recent Activity Feed**:
   - Empty state with Clock icon: "No activity yet"
   - Will display activity items with Badge status + action text + time

**Suspense Boundaries**: Stats and Recent Activity sections wrapped in `<Suspense>` with `CardSkeleton` fallbacks.

### Dashboard Sub-Pages (Placeholders)
Each page has:
- Page-specific **metadata export** (title + description for SEO)
- Centered icon + heading + description
- Ready for Phase 2 implementation

| Page | Title | Accent Color |
|------|-------|-------------|
| /dashboard/jobs | Job Automation | Blue |
| /dashboard/hero | Become a Hero | Purple |
| /dashboard/scraper | Data Scraper | Amber |
| /dashboard/analytics | Analytics | Emerald |
| /dashboard/settings | Settings | White/gray |

---

## 11. Chrome Extension

### Manifest V3 (`extension/manifest.json`)
```json
{
  "manifest_version": 3,
  "name": "LinkedBoost",
  "version": "1.0.0",
  "permissions": ["activeTab", "storage", "tabs", "scripting", "alarms"],
  "host_permissions": ["https://www.linkedin.com/*"],
  "content_scripts": [{ "matches": ["https://www.linkedin.com/*"], "run_at": "document_idle" }]
}
```

### Background Service Worker (`extension/background/service-worker.js`)

**Purpose**: WebSocket bridge between the Next.js web app and the content script running on LinkedIn.

**WebSocket Connection**:
- Connects to `ws://localhost:3001` (configurable)
- Heartbeat: every 30 seconds
- Reconnect: exponential backoff (1s → 30s max)
- Authentication: sends JWT token on connect
- Command queue: buffers up to 100 messages when disconnected

**Message Types Handled**:
| Type | Direction | Action |
|------|-----------|--------|
| AUTH | → Server | Send JWT token for authentication |
| HEARTBEAT | → Server | Keep-alive ping |
| EXECUTE_ACTION | Server → | Forward to content script on active LinkedIn tab |
| SYNC_CONFIG | Server → | Store config in chrome.storage.local |
| AUTH_SUCCESS | Server → | Log success |
| AUTH_FAILURE | Server → | Clear stored token |
| REPORT_STATUS | Content → Server | Forward status reports |

**Chrome API Usage**:
- `chrome.tabs.query` — find active LinkedIn tab
- `chrome.tabs.sendMessage` — forward commands to content script
- `chrome.storage.local` — persist auth token and config
- `chrome.alarms` — periodic reconnect check (every 1 minute)
- `chrome.runtime.onMessage` — listen for messages from popup and content script

### Content Script (`extension/content/content-script.js`)

**Purpose**: Runs on LinkedIn pages. Detects page type, monitors navigation, and executes DOM actions.

**Page Detection**:
| URL Pattern | Page Type |
|-------------|-----------|
| `/feed` | feed |
| `/jobs` | jobs |
| `/in/` | profile |
| `/messaging` | messaging |
| `/mynetwork` | network |
| `/notifications` | notifications |
| `/company` | company |
| `/groups` | groups |
| Other | unknown |

**Action Commands**:
| Command | Action | Notes |
|---------|--------|-------|
| CLICK | Native click dispatch | mousedown → mouseup → click event sequence |
| TYPE | Native input dispatch | Uses HTMLInputElement/HTMLTextAreaElement value setters |
| SCROLL | Smooth scroll to Y | `window.scrollTo({ behavior: "smooth" })` |
| GET_PAGE_INFO | Return page type, URL, title | For navigation awareness |
| EXTRACT_TEXT | Get element text content | Uses selector + `waitForElement` |
| CHECK_ELEMENT | Check if element exists | Returns `{ exists: boolean }` |

**Anti-Detection Measures**:
- All clicks dispatch native `MouseEvent` with real coordinates (not synthetic)
- Input values set via native property descriptors (not `.value = `)
- Events dispatched with `bubbles: true` for natural propagation
- `MutationObserver` for SPA navigation detection (not polling)
- `waitForElement` uses MutationObserver (not `setInterval`) with 10s timeout

**SPA Navigation Detection**:
- MutationObserver watches `document.body` for child changes
- Compares current URL with `lastUrl` on each mutation
- Reports navigation events to background worker

### Popup UI (`extension/popup/`)
- Minimal HTML + vanilla JS (no framework)
- 320px width, dark theme matching the web app
- **Unauthenticated State**: "Sign in to your LinkedBoost account" + "Open Dashboard" button
- **Authenticated State**: 
  - Server connection status (green/red dot)
  - Authentication status (green/yellow dot)
  - Current task display
  - "Open Dashboard" button
  - "Reconnect" button (when disconnected)

### Build System (`extension/build.js`)
- Node.js script (not bundled — simple file copy)
- Copies manifest, background worker, content script, popup files to `dist/`
- Generates SVG placeholder icons (16px, 48px, 128px) — blue square with ⚡
- Run: `node extension/build.js`
- Load as unpacked extension from `extension/dist/`

### Shared Utilities (`extension/utils/helpers.js`)
- `generateActionId()` — timestamp + random string ID
- `randomDelay(min, max)` — Gaussian-distributed sleep (Box-Muller transform)
- `logMessage(level, ...args)` — timestamped console logging

---

## 12. Anti-Detection Engine

### File: `lib/anti-detection/human-simulator.ts`

The anti-detection system makes automated LinkedIn actions appear human-like.

### Core Functions

| Function | Purpose | Details |
|----------|---------|---------|
| `randomDelay(min, max)` | Gaussian-distributed delay | Box-Muller transform for bell curve timing |
| `readingPause(contentLength)` | Simulate reading time | 200-300 WPM, 2s min, 3min max |
| `getKeystrokeDelay()` | Inter-keystroke timing | Mean 120ms, stdDev 40ms (Gaussian) |
| `cooldownDelay(actionType)` | Action cooldown | Type-specific delay ranges |
| `getEffectiveLimit(action, speed)` | Adjusted daily limits | Scales with speed preset |

### Daily Limits (Safe Defaults)
| Action | Limit/Day |
|--------|-----------|
| Job Applications | 15 |
| Posts | 2 |
| Profile Views | 30 |
| Connection Requests | 20 |
| Comments | 15 |
| Messages | 10 |
| Scrapes | 50 |

### Cooldown Periods
| Action | Min Delay | Max Delay |
|--------|-----------|-----------|
| Applications | 5 min | 15 min |
| Posts | 4 hours | 8 hours |
| Profile Views | 30 sec | 2 min |
| Comments | 2 min | 5 min |
| Messages | 5 min | 20 min |
| Connection Requests | 3 min | 10 min |

### Speed Presets
| Preset | Multiplier | Effect |
|--------|-----------|--------|
| Conservative | 0.5x | Halves daily limits |
| Balanced | 1.0x | Default limits |
| Aggressive | 1.5x | 50% more actions |

### Session Limits
- Min session: 30 minutes
- Max session: 2 hours
- Break between sessions: 15-45 minutes

---

## 13. Security Implementation

### Encryption (`lib/utils/encryption.ts`)

**Algorithm**: AES-256-GCM (authenticated encryption)  
**Key Derivation**: `scryptSync` from master key + random salt  
**Implementation**: Native Node.js `crypto` module (no external dependencies)

**Encryption Format**: `salt:iv:authTag:ciphertext` (all base64-encoded, colon-separated)

| Component | Size | Purpose |
|-----------|------|---------|
| Salt | 32 bytes (random) | Unique per encryption for key derivation |
| IV | 16 bytes (random) | Initialization vector |
| Auth Tag | 16 bytes | Authentication tag (GCM integrity verification) |
| Ciphertext | Variable | Encrypted data |

**Usage**: Encrypts user AI API keys before MongoDB storage. Decrypts in-memory only during AI calls.

**Master Key**: `ENCRYPTION_MASTER_KEY` environment variable (required).

### Password Security
- **Hashing**: bcrypt with 12 salt rounds
- **Storage**: `hashedPassword` field has `select: false` — excluded from all queries by default
- **Access**: Only `auth.ts` uses `.select("+hashedPassword")` during login

### Rate Limiting (`lib/utils/rate-limit.ts`)

| Limiter | Points | Duration | Key |
|---------|--------|----------|-----|
| Auth endpoints | 5 attempts | 60 seconds | IP address |
| API endpoints | 100 requests | 60 seconds | User ID |

**Implementation**: `rate-limiter-flexible` with `RateLimiterMemory` (in-process)  
**Response on limit**: HTTP 429 with `Retry-After` header  
**Applied to**: `POST /api/auth/register`

### Input Validation
- All user inputs validated with Zod schemas before processing
- Schemas defined in `lib/validators/index.ts`
- Form-level validation via `react-hook-form` + `@hookform/resolvers/zod`
- Server-level validation in API routes (`safeParse`)

### Other Security Measures
- CSRF protection via NextAuth.js (built-in)
- JWT sessions (HTTP-only, secure cookies)
- No raw MongoDB queries (Mongoose parameterized)
- Environment variables never exposed to client (no `NEXT_PUBLIC_` prefix on sensitive vars)
- `serverExternalPackages` prevents mongoose/bcrypt from client bundles

---

## 14. SEO Implementation

### Root Layout Metadata (`app/layout.tsx`)
```typescript
metadataBase: new URL(process.env.NEXTAUTH_URL || "https://linkedboost.app")
title: { default: "LinkedBoost — LinkedIn Automation That Goes Viral", template: "%s — LinkedBoost" }
description: "The best free LinkedIn automation tool..."
keywords: ["LinkedIn automation", "job application bot", "LinkedIn Easy Apply", "personal branding", "LinkedIn scraper"]
openGraph: { title, description, type: "website", locale: "en_US" }
twitter: { card: "summary_large_image", title, description }
robots: { index: true, follow: true }
```

### Auth Layout Metadata (`app/(auth)/layout.tsx`)
```typescript
title: { default: "LinkedBoost", template: "%s — LinkedBoost" }
description: "Sign in or create your LinkedBoost account..."
```
Uses template pattern so individual auth pages can set their own titles.

### Per-Page Dashboard Metadata
Each dashboard page exports its own metadata:
| Page | Title |
|------|-------|
| /dashboard/jobs | "Job Automation" |
| /dashboard/hero | "Become a Hero" |
| /dashboard/scraper | "Data Scraper" |
| /dashboard/analytics | "Analytics" |
| /dashboard/settings | "Settings" |

All use the `%s — LinkedBoost` template from the root layout.

### robots.txt (`app/robots.ts`)
```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Sitemap: https://linkedboost.app/sitemap.xml
```
- Allows indexing of public pages
- Blocks API routes and dashboard (private)
- Points to sitemap

### sitemap.xml (`app/sitemap.ts`)
Three entries:
| URL | Priority | Change Frequency |
|-----|----------|-----------------|
| / (landing page) | 1.0 | weekly |
| /login | 0.5 | monthly |
| /register | 0.5 | monthly |

### Structured Data (JSON-LD)
Landing page includes `SoftwareApplication` schema:
- Type: BusinessApplication
- Price: Free ($0 USD)
- Platform: Web

### Technical SEO
- `<html lang="en">` — language declaration
- Semantic HTML — proper heading hierarchy (h1, h2, h3)
- `metadataBase` — ensures all OG URLs resolve correctly
- No client-side rendering on landing page (SSG)

---

## 15. Performance Optimizations

### Build & Bundle
- **Turbopack**: Used for development and production builds
- **Bundle Analyzer**: `@next/bundle-analyzer` integrated — run `ANALYZE=true npm run build`
- **Package Import Optimization**: `experimental.optimizePackageImports` for lucide-react, recharts, date-fns, framer-motion (tree-shaking barrel files)
- **Server External Packages**: `mongoose` and `bcryptjs` excluded from client bundles via `serverExternalPackages`

### Rendering Strategy
| Route | Strategy | Notes |
|-------|----------|-------|
| `/` (landing) | Static (SSG) | Prerendered at build time, no JS hydration needed for content |
| `/login` | Static | Client component, but statically optimized |
| `/register` | Static | Client component, but statically optimized |
| `/robots.txt` | Static | Generated at build time |
| `/sitemap.xml` | Static | Generated at build time |
| `/dashboard` | Dynamic (SSR) | Server-side `auth()` call required |
| `/dashboard/*` | Dynamic | Auth check in layout |
| `/api/*` | Dynamic | Server functions |

### Database Performance
- **Connection Pooling**: `maxPoolSize: 10` on Mongoose connection
- **Singleton Pattern**: Single connection reused across requests via `global.mongooseCache`
- **Efficient Queries**: `.lean()` recommended for read-only queries (skips Mongoose hydration)
- **Strategic Indexes**: All collections have indexes on frequently queried fields
- **TTL Index**: ActivityLog auto-deletes after 90 days (prevents unbounded growth)

### Frontend Performance
- **Suspense Boundaries**: Dashboard uses `<Suspense>` around data-fetching sections with skeleton fallbacks
- **Code Splitting**: Automatic via Next.js App Router (per-route chunks)
- **Font Optimization**: Geist fonts loaded via `next/font/google` with CSS variable strategy
- **Image Optimization**: `next.config.ts` configured for remote patterns (Google, GitHub, LinkedIn avatars)
- **Custom Scrollbar**: CSS-based thin scrollbar (no JS scroll library)

### Tailwind v4 Optimizations
- Using Tailwind CSS v4's new `@theme inline` directive for custom tokens
- Updated class names: `bg-linear-to-r` (v4) instead of `bg-gradient-to-r` (v3)
- Arbitrary value classes replaced where possible: `w-18`/`w-70` instead of `w-[72px]`/`w-[280px]`

---

## 16. State Management

### Zustand Stores (`lib/hooks/use-stores.ts`)

#### SidebarStore
| State | Type | Default | Purpose |
|-------|------|---------|---------|
| isCollapsed | boolean | false | Sidebar collapsed state |
| isMobileOpen | boolean | false | Mobile drawer open state |

| Action | Effect |
|--------|--------|
| toggle() | Flip isCollapsed |
| setCollapsed(bool) | Set isCollapsed directly |
| setMobileOpen(bool) | Set isMobileOpen directly |

#### ExtensionStore
| State | Type | Default | Purpose |
|-------|------|---------|---------|
| isConnected | boolean | false | WebSocket connection status |
| currentTask | string | null | Currently executing task description |

| Action | Effect |
|--------|--------|
| setConnected(bool) | Update connection status |
| setCurrentTask(string|null) | Update current task |

### Provider Setup (`components/providers.tsx`)
- `SessionProvider` (NextAuth) — wraps entire app for client-side session access
- `Toaster` (Sonner) — dark theme, top-right position, with close buttons

---

## 17. Validation Layer

### Zod Schemas (`lib/validators/index.ts`)

#### Authentication Schemas
| Schema | Fields | Rules |
|--------|--------|-------|
| `loginSchema` | email, password | Valid email, 8+ chars password |
| `registerSchema` | name, email, password, confirmPassword | Name 2-50 chars, valid email, password 8-128 chars with uppercase+lowercase+number, passwords must match |
| `forgotPasswordSchema` | email | Valid email |

#### Feature Schemas
| Schema | Key Fields | Rules |
|--------|------------|-------|
| `aiApiKeySchema` | provider, apiKey | enum [gemini, openai, anthropic, groq], key 10+ chars |
| `jobSearchSchema` | name, keywords, location, remote, experienceLevel, datePosted, easyApplyOnly, salary, excludeCompanies, excludeKeywords | name 1-100 chars, keywords required, experienceLevel enum array, datePosted enum |
| `heroProfileSchema` | niche, targetAudience, contentPillars, voiceTone, postingSchedule | niche required, 1-5 content pillars, voiceTone enum, schedule with days/times |
| `scraperConfigSchema` | name, type, keywords, filters, maxResults | name 1-100, type enum [posts, profiles, companies], 1+ keywords, maxResults 1-100 |

#### Exported Types
All schemas have corresponding TypeScript types exported via `z.infer<>`:
`LoginInput`, `RegisterInput`, `ForgotPasswordInput`, `AiApiKeyInput`, `JobSearchInput`, `HeroProfileInput`, `ScraperConfigInput`

---

## 18. Build Configuration

### `next.config.ts`
```typescript
{
  serverExternalPackages: ["mongoose", "bcryptjs"],
  images: {
    remotePatterns: [
      "lh3.googleusercontent.com",   // Google OAuth avatars
      "avatars.githubusercontent.com", // GitHub OAuth avatars
      "media.licdn.com"               // LinkedIn images
    ]
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "date-fns", "framer-motion"]
  }
}
```
Wrapped with `withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })`.

### `tsconfig.json`
- Strict mode enabled
- Path alias: `@/*` → `./*`
- JSX: react-jsx
- Module resolution: bundler

### `postcss.config.mjs`
- Single plugin: `@tailwindcss/postcss` (Tailwind v4's PostCSS integration)

### `eslint.config.mjs`
- ESLint 9 flat config
- Extends `eslint-config-next`

### Build Output (19 routes)
```
○  Static:  /, /_not-found, /login, /register, /robots.txt, /sitemap.xml
ƒ  Dynamic: /api/auth/[...nextauth], /api/auth/register, /api/health,
            /api/hero, /api/jobs, /api/scraper, /dashboard, /dashboard/analytics,
            /dashboard/hero, /dashboard/jobs, /dashboard/scraper, /dashboard/settings
ƒ  Proxy:   Middleware
```

### NPM Scripts
| Script | Command |
|--------|---------|
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `eslint` |

---

## 19. Environment Variables

### Required (`/.env.local`)
| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string (Atlas or local) |
| `NEXTAUTH_SECRET` | NextAuth JWT signing secret (32+ char random string) |
| `NEXTAUTH_URL` | Canonical app URL (e.g., `http://localhost:3000`) |
| `ENCRYPTION_MASTER_KEY` | Master key for AES-256-GCM encryption of API keys |

### Optional (OAuth Providers)
| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |

### Build-time
| Variable | Purpose |
|----------|---------|
| `ANALYZE` | Set to `"true"` to enable bundle analyzer |

---

## 20. Module Completion Status

Based on the 19-module plan in `Plan.txt`:

### Phase 1: Foundation — COMPLETE ✅

| Module | Name | Status | Notes |
|--------|------|--------|-------|
| 1 | Project Setup & Architecture | ✅ Complete | Folder structure, dependencies, configs, TypeScript, Tailwind v4 |
| 2 | Database Schema & MongoDB Setup | ✅ Complete | 10 Mongoose models, indexes, connection pooling |
| 3 | Authentication System | ✅ Complete | NextAuth v5, Credentials + OAuth, split auth config for edge |
| 4 | Dashboard Layout & Navigation | ✅ Complete | Sidebar, topbar, responsive layout, Framer Motion animations |
| 5 | Chrome Extension Foundation | ✅ Complete | Manifest V3, service worker, content script, popup, build script |

### Phase 2: Core Features — NOT STARTED

| Module | Name | Status | Dependencies |
|--------|------|--------|-------------|
| 6 | AI Provider Abstraction (BYOK) | ⬜ Not started | Needs Modules 2, 3 |
| 7 | Anti-Detection Engine | 🟡 Partial | `human-simulator.ts` exists with delays/limits; needs session manager, patterns engine |
| 8 | Resume Parser & Builder | ⬜ Not started | Needs Modules 2, 6 |
| 9 | Job Search & Easy Apply | ⬜ Not started | Needs Modules 5, 6, 7, 8 |
| 10 | Become a Hero | ⬜ Not started | Needs Modules 5, 6, 7 |

### Phase 3: Advanced Features — NOT STARTED

| Module | Name | Status | Dependencies |
|--------|------|--------|-------------|
| 11 | Data Scraper & Outreach | ⬜ Not started | Needs Modules 5, 6, 7 |
| 12 | Analytics & Insights | ⬜ Not started | Needs Modules 9, 10, 11 |
| 13 | Settings & User Profile | ⬜ Not started | Needs Modules 2, 3, 6 |
| 14 | Notification System | ⬜ Not started | Needs Module 16 |

### Phase 4: Polish & Scale — NOT STARTED

| Module | Name | Status | Dependencies |
|--------|------|--------|-------------|
| 15 | Landing Page & SEO | 🟡 Partial | Landing page exists; blog, features, about, privacy, terms pages pending |
| 16 | Real-Time Communication | ⬜ Not started | Needs Module 5 |
| 17 | Docker & VPS Deployment | ⬜ Not started | Needs all modules |
| 18 | Testing & QA | ⬜ Not started | Needs all modules |
| 19 | Bonus LinkedIn Features | ⬜ Not started | Needs Modules 5, 6, 7 |

---

## 21. Known Issues & Warnings

### Active Warning
1. **Middleware Deprecation**: Next.js 16 shows `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.` — The middleware still works correctly. Migration to the `proxy` convention is planned but not critical.

### Pending Improvements
1. **API Placeholder Routes**: `/api/jobs`, `/api/hero`, `/api/scraper` return placeholder JSON. These will be implemented in their respective modules (9, 10, 11).
2. **Static Dashboard Data**: Stats cards, recent activity, and getting started checklist show hardcoded/empty data. Will be connected to real database queries in Phase 2.
3. **No Email Verification Flow**: Registration creates the account immediately without email verification. Add email verification in a future update.
4. **No Forgot Password Flow**: The `/forgot-password` link exists on the login page but the route does not exist yet.
5. **Extension Icons**: Using generated SVG placeholders. Replace with proper designed icons before Chrome Web Store submission.
6. **No Rate Limiting on Login**: Rate limiting is only on `/api/auth/register`. The NextAuth `/api/auth/callback/credentials` endpoint (login) is not rate-limited at the application level (relies on Next.js/infra-level protection).
7. **In-Memory Rate Limiter**: Using `RateLimiterMemory` which resets on server restart. For production with multiple instances, switch to `RateLimiterRedis`.
8. **No CORS Configuration**: CORS is not explicitly configured. For the Chrome extension WebSocket connection, CORS headers should be set in the Socket.IO server (Module 16).
9. **WebSocket Server Not Implemented**: The background service worker connects to `ws://localhost:3001`, but the Socket.IO server in Next.js is not yet implemented (Module 16).

---

*This documentation reflects the state of the codebase as of March 2026, with Phase 1 (Modules 1-5) complete and production-ready. The foundation is solid — all security, SEO, and performance optimizations for the current scope are in place.*
