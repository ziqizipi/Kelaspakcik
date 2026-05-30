# BalasBro.ai — Architecture Overview

## Overview

BalasBro.ai is a WhatsApp-first AI-powered customer service and order management platform for Indonesian MSMEs. Built with Next.js 16 App Router, React 19, and TypeScript.

## Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router) with React 19
- **Styling:** Tailwind CSS 4 with shadcn/ui components
- **Data Fetching:** SWR with 5-second polling for real-time updates
- **Fonts:** Instrument Serif (headings) + Inter (body)

### Backend
- **Framework:** Next.js API Routes (serverless)
- **Database:** Neon PostgreSQL (via Prisma ORM)
- **Auth:** NextAuth v5 (Better Auth / Neon Auth) with JWT sessions
- **AI:** Google Vertex AI (Gemini) for classification, auto-reply, order extraction
- **WhatsApp:** WhatsApp Business API via webhook (HMAC-verified)
- **Cache/Queue:** Upstash Redis + QStash

## Key Files

### Root Config
- `package.json` — dependencies and scripts
- `tailwind.config.ts` — design system tokens (Forest Intelligence)
- `tsconfig.json` — TypeScript configuration with `@/*` path alias
- `auth.ts` — NextAuth v5 configuration
- `middleware.ts` — auth protection for `(app)` routes

### App Structure
```
app/
├── (app)/              # Authenticated routes (dashboard, conversations, orders, customers, settings)
├── (auth)/             # Public auth routes (login, register)
├── (public)/           # Public marketing pages
└── api/                # API routes
    ├── auth/           # NextAuth handlers + MFA
    ├── ai/             # classify, reply, extract-order, escalate
    ├── conversations/  # CRUD + messages
    ├── customers/      # Customer list/detail
    ├── orders/         # Order CRUD
    ├── metrics/        # Dashboard KPIs
    ├── tenant/         # Business + team management
    └── webhook/wa/     # WhatsApp webhooks
```

### Prisma Schema
Main models: `Business`, `User`, `WhatsAppAccount`, `Customer`, `Conversation`, `Message`, `Order`, `Product`, `AIAutoReplyConfig`, `EscalationRule`, `DailySummary`

All tenant-scoped: every API route extracts `businessId` from session.

### Design System — Forest Intelligence
- Background: `#fafaf8`
- Primary brand: `#3a7a55` (forest green)
- Gold accent: `#795900`
- Active nav: `#111111`
- Border: `#f0ede8`

## AI Pipeline

1. Inbound WhatsApp message → webhook → create Message
2. Classify intent (ORDER / COMPLAINT / PRODUCT_INQUIRY / FOLLOW_UP / GENERAL)
3. Route:
   - ORDER → extract order → create Order
   - COMPLAINT → escalate to owner
   - Others → auto-reply if enabled + within working hours

## Intent Types
- `ORDER` — customer wants to place an order
- `PRODUCT_INQUIRY` — question about products/prices
- `COMPLAINT` — customer has a problem
- `FOLLOW_UP` — customer following up on existing order
- `GENERAL` — casual conversation

## Multi-Tenancy
All data scoped by `businessId` from JWT session. Users cannot access other businesses' data.