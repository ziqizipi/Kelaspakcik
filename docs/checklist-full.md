# BalasBro.ai — Full MVP Implementation Checklist

> Complete checklist for the BalasBro.ai MVP. Frontend dev and backend dev should each own their sections.
> Check off `[x]` as you go. Every item must pass before merge to production.

---

## TABLE OF CONTENTS

1. [Project Setup & Tooling](#1-project-setup--tooling)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Database & Prisma Schema](#3-database--prisma-schema)
4. [Frontend — Pages & Routing](#4-frontend--pages--routing)
5. [Frontend — Components](#5-frontend--components)
6. [Frontend — Design System & UX](#6-frontend--design-system--ux)
7. [Frontend — State & Data Fetching](#7-frontend--state--data-fetching)
8. [Frontend — Forms & Validation](#8-frontend--forms--validation)
9. [Frontend — Integration Points](#9-frontend--integration-points)
10. [Backend — Core API Routes](#10-backend--core-api-routes)
11. [Backend — WhatsApp Integration](#11-backend--whatsapp-integration)
12. [Backend — AI Pipeline](#12-backend--ai-pipeline)
13. [Backend — Team & Tenant Management](#13-backend--team--tenant-management)
14. [Rate Limiting & Error Handling](#14-rate-limiting--error-handling)
15. [Security](#15-security)
16. [Performance](#16-performance)
17. [Testing](#17-testing)
18. [Documentation](#18-documentation)
19. [Deploy Checklist](#19-deploy-checklist)
20. [Pre-Launch QA](#20-pre-launch-qa)

---

## 1. PROJECT SETUP & TOOLING

### Repository & Version Control
- [x] Git repo initialized with `main` and `feature/ui` branches
- [x] `.gitignore` ignores `.env`, `.next/`, `node_modules/`, `*.log`
- [x] Commit history is clean (no secrets committed)
- [x] `.env.example` exists with all required env var names (no values)
- [x] `CLAUDE.md` exists at project root with architecture overview
- [x] `AGENTS.md` exists noting Next.js 16 breaking changes
- [ ] Branch protection on `main` (require PR, require review)

### Dependencies — Root
- [x] `package.json` has all required dependencies with correct versions
- [x] `next` ^16.x with React 19
- [x] `typescript` ^5.x
- [x] `tailwindcss` ^4.x
- [x] `prisma` with `@prisma/client`
- [x] `next-auth` v5 beta (`@auth/prisma-adapter`)
- [x] `swr` for data fetching
- [x] `zod` for schema validation
- [x] `lucide-react` for icons
- [x] `@google-cloud/vertexai` for Gemini
- [x] `bcryptjs` for password hashing
- [x] `@upstash/ratelimit` + `@upstash/redis` for rate limiting

### Dependencies — Frontend
- [x] `shadcn/ui` (Base UI) installed with `npx shadcn@latest init`
- [x] Required shadcn components added: `button`, `input`, `badge`, `avatar`, `skeleton`, `switch`, `dialog`, `select`, `label`, `tabs`, `dropdown-menu`, `separator`
- [x] `next/font` configured for Instrument Serif + Inter
- [x] `clsx` and `tailwind-merge` installed for class merging

### Dev Environment
- [ ] `.env.local` created with all required env vars for local dev
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully (no TypeScript errors)
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] Database migrations run: `npx prisma migrate dev`
- [ ] Prisma client generated: `npx prisma generate`
- [ ] WhatsApp dev webhook pointing to local (ngrok or similar)

### IDE & Editor Setup
- [x] VS Code workspace settings configured (format on save, path mapping)
- [x] ESLint config with TypeScript rules enabled
- [x] Prettier config with consistent formatting (single quotes, trailing commas)
- [x] Git hooks configured (pre-commit lint check, pre-push type check)

---

## 2. AUTHENTICATION & AUTHORIZATION

### NextAuth v5 Setup
- [x] `auth.ts` configured at project root
- [x] Providers: Credentials (email + password) + Google OAuth
- [x] Session strategy: JWT with custom payload including `businessId` and `role`
- [x] `NEXTAUTH_SECRET` set in environment (min 32 chars)
- [x] `NEXTAUTH_URL` set correctly (including protocol and port)
- [x] Session available via `getServerSession` on server components
- [x] Session available via `useSession` on client components
- [x] `getSession()` helper usable in API routes

### Login Flow
- [x] `/login` page renders login form (email + password)
- [x] Form submits to NextAuth's signin handler
- [x] Invalid credentials return clear error message (no "invalid" detail)
- [x] Successful login redirects to `/dashboard`
- [x] Unauthenticated users redirected to `/login`
- [x] "Remember me" checkbox functions (session duration)
- [ ] Login rate limited (prevent brute force)

### Registration Flow
- [x] `/register` page renders registration form (name, email, password, business name)
- [x] Validation: email format, password min 8 chars, business name required
- [x] Creates `Business` record first
- [x] Creates `User` record with `role: "owner"` linked to business
- [x] Hashes password with bcrypt before storing
- [ ] Auto-logs in after registration
- [x] Redirects to `/dashboard` after successful registration

### Multi-Tenancy
- [x] Every session has `user.businessId` populated
- [x] Every API route extracts `businessId` from session
- [x] All Prisma queries scoped to `businessId`
- [ ] User cannot access data from other businesses
- [x] Business ID exposed in session but not forgeable (server-side only)

### Role-Based Access
- [ ] Roles: `owner`, `admin`, `member`
- [ ] Owner can: manage team, manage billing, all CRUD on business data
- [ ] Admin can: manage customers, orders, conversations, view team
- [ ] Member can: view conversations, reply to messages, view orders
- [ ] UI hides/disables features user doesn't have access to
- [ ] API returns 403 if user tries to access beyond their role

### MFA (Multi-Factor Authentication)
- [x] `POST /api/auth/mfa/setup` generates TOTP secret, returns QR code URL
- [x] QR code scannable by Google Authenticator / Authy
- [x] `POST /api/auth/mfa/verify` validates TOTP code (6-digit)
- [x] MFA secret stored encrypted in DB
- [x] `POST /api/auth/mfa/disable` requires valid TOTP to disable
- [ ] After MFA enabled, login requires TOTP code
- [ ] MFA settings page shows enabled/disabled status
- [x] Recovery codes generated and displayed on MFA setup (downloadable)
- [x] Recovery codes hashed before storage

### Password Security
- [x] Passwords hashed with bcrypt (cost factor >= 12)
- [x] Passwords never logged or returned in API responses
- [ ] "Change password" flow with current password verification
- [ ] "Forgot password" flow sends reset email (token-based, expiring)
- [ ] Password reset token single-use and expires after 1 hour

### Session Management
- [x] Sessions expire after 30 days of inactivity
- [ ] "Log out all devices" option in security settings
- [ ] Active session list shown in security settings
- [ ] Sessions invalidated on password change
- [ ] `CSRF` token generated for all state-changing forms

---

## 3. DATABASE & PRISMA SCHEMA

### Prisma Client Setup
- [x] `lib/prisma.ts` exports singleton Prisma client
- [ ] Prisma client uses connection pool (Neon PostgreSQL)
- [ ] `prisma generate` runs without errors after schema changes
- [ ] All Prisma queries use proper typing (no `any` casts)

### Schema: Business
- [x] Business model exists with all fields
- [x] Index on `businessId` for all related models

### Schema: User
- [x] User model exists with all fields
- [x] Index on `email` (unique)
- [x] Index on `businessId`
- [x] Password field stores bcrypt hash, never plaintext

### Schema: WhatsAppAccount
- [x] WhatsAppAccount model exists with all fields
- [x] Index on `businessId`
- [ ] Access token encrypted at rest

### Schema: Customer
- [x] Customer model exists
- [x] Index on `businessId`
- [x] Index on `phone` (for webhook lookup)
- [x] Compound unique on `(businessId, phone)`

### Schema: Conversation
- [x] Conversation model exists
- [x] Index on `businessId`
- [x] Index on `customerId`
- [x] Index on `status` (for filtering open/escalated)
- [x] Index on `lastMessageAt` (for sorting)

### Schema: Message
- [x] Message model exists
- [x] Index on `conversationId`
- [x] Index on `intent` (for batch processing)
- [x] Index on `aiReplyUsed` (for finding unreplied messages)
- [x] Index on `createdAt` (for timeline queries)

### Schema: Order
- [x] Order model exists with all fields
- [x] Index on `businessId`
- [x] Index on `customerId`
- [x] Index on `paymentStatus`
- [x] Index on `createdAt` (for date range queries)
- [x] Unique on `conversationId` (one order per conversation)

### Schema: Product
- [x] Product model exists
- [x] Index on `businessId`

### Schema: AIAutoReplyConfig
- [x] AIAutoReplyConfig model exists
- [x] Unique on `businessId`

### Schema: EscalationRule
- [x] EscalationRule model exists
- [x] Index on `businessId`
- [x] Index on `isActive` (for filtering active rules)

### Schema: DailySummary
- [x] DailySummary model exists
- [x] Compound unique on `(businessId, date)`

### Migrations
- [ ] `npx prisma migrate dev --name init` runs successfully
- [ ] Migration creates all tables with correct indexes
- [ ] Foreign keys properly cascade (or restrict) on delete
- [ ] Soft delete pattern used where appropriate (`deletedAt` nullable datetime)
- [ ] Seed script exists for development data (`prisma/seed.ts`)
- [ ] Seed script exists for development data (`prisma/seed.ts`)

---

## 4. FRONTEND — PAGES & ROUTING

### Route: `/` (Landing)
- [ ] Landing page renders with app branding
- [ ] If not authenticated, shows login/register CTA
- [ ] If authenticated, redirects to `/dashboard`
- [ ] Meta tags set for SEO
- [ ] OG image configured

### Route: `/login`
- [ ] Login form with email and password fields
- [ ] "Forgot password?" link
- [ ] "Don't have an account? Register" link
- [ ] Error message shown on invalid credentials
- [ ] Loading state on submit button during auth request
- [ ] Redirect to `/dashboard` on success

### Route: `/register`
- [ ] Registration form: name, email, password, business name
- [ ] "Already have an account? Login" link
- [ ] Validation errors shown inline
- [ ] Loading state on submit
- [ ] Auto-login after registration and redirect to `/dashboard`

### Route: `/dashboard`
- [ ] Page requires authentication (redirect to `/login` if not)
- [ ] KPI card: Total Orders with trend (↑ baru / ↑ X% dari kemarin / ↓ X%)
- [ ] KPI card: Total Revenue with trend (formatted as Rp with thousand separators)
- [ ] KPI card: Open Conversations with trend
- [ ] KPI card: AI Deflection Rate (percentage) with trend
- [ ] KPI card: Waiting Count (messages >5min without reply)
- [ ] Quick actions section with buttons: "Kirim Pesan Massal", "Lihat Laporan AI"
- [ ] Bulk message modal opens on button click
- [ ] "Lihat Laporan AI" navigates to `/settings/reports`
- [ ] AI insight box with tip text
- [ ] All data loads from `GET /api/metrics` via SWR
- [ ] Loading skeletons while data fetches
- [ ] Refreshes automatically via SWR polling

### Route: `/conversations`
- [ ] Page requires authentication
- [ ] Left panel: conversation list with search/filter
- [ ] Filter tabs: Semua, Aktif (open), Selesai (closed/escalated)
- [ ] Conversation list items show: avatar, customer name/phone, last message preview, timestamp, status badge
- [ ] Clicking conversation opens chat in right panel (or navigates to `/conversations/[id]`)
- [ ] Active conversation highlighted
- [ ] Real-time update when new message arrives (SWR refresh)
- [ ] Empty state when no conversations match filter

### Route: `/conversations/[id]`
- [ ] Page requires authentication
- [ ] Loads conversation via `GET /api/conversations/[id]/messages`
- [ ] Chat panel with message bubbles (INBOUND left, OUTBOUND right)
- [ ] Intent badge on each message (ORDER=green, COMPLAINT=red, etc.)
- [ ] Message status icons (delivered=check, pending=clock, failed=warning)
- [ ] Reply box at bottom with send button
- [ ] Sending a message calls `POST /api/messages` then to refreshes
- [ ] Auto-scroll to latest message
- [ ] 5-second polling for new messages (SWR `refreshInterval: 5000`)
- [ ] AI reply panel on right side with generate/send flow

### Route: `/customers`
- [ ] Page requires authentication
- [ ] Split panel: list (left 320px) + detail (right)
- [ ] Left: search input, customer list
- [ ] Customer list items: avatar initials, name or phone, conversation/order counts, last message date
- [ ] Clicking customer selects them and shows detail
- [ ] Right: `CustomerDetailPanel` with tabs (Percakapan / Pesanan)
- [ ] Percakapan tab: list of conversations, click navigates to `/conversations/[id]`
- [ ] Pesanan tab: list of orders, click navigates to `/orders/[id]`
- [ ] Search filters by name or phone number
- [ ] Empty state when no customers
- [ ] Loading skeletons during fetch

### Route: `/customers/[id]`
- [ ] Page requires authentication
- [ ] Full-page customer detail (no split panel)
- [ ] Breadcrumb: Pelanggan > Detail Pelanggan
- [ ] Header: avatar, name, phone, WA ID badge, member since date
- [ ] Tabs: Percakapan / Pesanan
- [ ] Same behavior as detail panel on `/customers` page

### Route: `/orders`
- [ ] Page requires authentication
- [ ] Stats row: Delivered (recorded), Pending, Cancelled counts
- [ ] Filter bar: status filter, payment filter, date range filter
- [ ] Table with columns: Customer, Amount, Type, Payment Status, Items, Date
- [ ] Order row click opens preview panel (slide in from right)
- [ ] Preview panel shows full order detail
- [ ] "Add Order" button opens `AddOrderModal`
- [ ] Pagination or infinite scroll for large lists

### Route: `/orders/[id]`
- [ ] Page requires authentication
- [ ] Loads order via `GET /api/orders/[id]`
- [ ] Full order detail: customer info, amount, type, category, payment status, items list, notes
- [ ] Payment status buttons: Lunas (recorded), Dikonfirmasi (confirmed), Menunggu (pending), Dibatalkan (cancelled)
- [ ] Clicking payment status button calls `PATCH /api/orders/[id]`
- [ ] Notes section shows existing notes, input to add new note
- [ ] "Add Note" calls `PATCH /api/orders/[id]` with updated notes array
- [ ] AI insights section shown
- [ ] Timeline section with order creation event

### Route: `/settings`
- [ ] Page requires authentication
- [ ] Sidebar sub-nav: Profil, Keamanan, Saluran, AI Reply, Eskalasi, Laporan, Tim, Tagihan
- [ ] Profil tab: business name, logo upload, owner name, email
- [ ] Save button calls `PATCH /api/tenant`

### Route: `/settings/security`
- [ ] MFA setup card with enable/disable toggle
- [ ] When enabling: show QR code, verify input, save
- [ ] When disabling: require TOTP code first
- [ ] Active sessions list with "Log out all" option
- [ ] Change password form

### Route: `/settings/channels`
- [ ] WhatsApp connection status card
- [ ] If not connected: "Connect WhatsApp" button
- [ ] Connect modal: phoneNumberId, waBusinessAcct, accessToken fields
- [ ] If connected: show phone number, account name, connection status (connected/disconnected)
- [ ] "Disconnect" button with confirmation
- [ ] Webhook URL displayed (for Meta Developer Console registration)

### Route: `/settings/ai`
- [ ] AI Auto-Reply toggle (enables/disables AI responses)
- [ ] Tone selector: Ramah (friendly), Formal (formal), Casual (casual)
- [ ] Working hours: start time + end time inputs
- [ ] SOP Context textarea (multiline, placeholder with example)
- [ ] Fallback Reply textarea
- [ ] Save button calls `PATCH /api/ai/config`
- [ ] Success toast on save
- [ ] All fields populate from `GET /api/ai/config`

### Route: `/settings/escalation`
- [ ] Rules list with empty state when none exist
- [ ] Each rule shows: name, type badge, keywords chips, min order value, toggle switch
- [ ] "Tambah Aturan" button opens modal
- [ ] Add/Edit modal: name, type select, conditional fields
  - COMPLAINT: no extra fields
  - HIGH_VALUE_ORDER: min order value input
  - SPECIFIC_KEYWORD: keywords textarea (comma-separated)
  - NO_REPLY_24H: no extra fields
- [ ] Edit button per rule opens modal pre-filled
- [ ] Delete button per rule with confirmation
- [ ] Toggle switch calls `PATCH /api/escalation-rules/[id]`
- [ ] Delete calls `DELETE /api/escalation-rules/[id]`
- [ ] Create calls `POST /api/escalation-rules`

### Route: `/settings/reports`
- [ ] Daily Recap toggle (enable/disable automatic daily summary)
- [ ] Time picker for when to send recap
- [ ] Preview box showing sample recap message (formatted with emojis and today's date)
- [ ] Save button calls `PATCH /api/ai/config`
- [ ] Success feedback on save

### Route: `/settings/team`
- [a] Team member list: name, email, role badge, join date
- [ ] "Undang Anggota" button opens modal
- [ ] Invite modal: name, email, role select (admin/member)
- [ ] Invite calls `POST /api/tenant/team`
- [ ] Remove button per member with confirmation
- [ ] Remove calls `DELETE /api/tenant/team/[userId]`
- [ ] Role badge color-coded (owner=gold, admin=green, member=gray)

### Route: `/settings/billing`
- [ ] Current plan card (Free / Starter / Pro) — can be static stub
- [ ] Usage stats: conversations used / limit, messages used / limit
- [ ] Payment history table (static stub ok for MVP)
- [ ] "Upgrade Plan" button (link to payment flow, can be stub)

---

## 5. FRONTEND — COMPONENTS

### Layout Components

#### `AppShell`
- [ ] Wraps all `(app)` routes
- [ ] Renders Sidebar (desktop) + BottomTabBar (mobile) + TopBar
- [ ] Main content area respects sidebar width on desktop
- [ ] Main content area has bottom padding on mobile for tab bar

#### `Sidebar`
- [ ] Brand logo + "BalasBro.ai" text at top
- [ ] Nav items: Kotak Masuk (conversations icon), Pesanan (orders icon), Pelanggan (people icon), Pengaturan (settings icon)
- [ ] Active route highlighted with background + left border
- [ ] Bottom section: Pusat Bantuan (help icon), Keluar (logout icon)
- [ ] Collapses to icons only on medium screens
- [ ] Hidden on mobile (replaced by bottom tab bar)

#### `BottomTabBar`
- [ ] Shows on mobile only (CSS breakpoint at 768px)
- [ ] 5 tabs: Home (dashboard), Inbox (conversations), Orders, Customers, Settings
- [ ] Active tab highlighted with color
- [ ] Safe area padding at bottom for notched phones

#### `TopBar`
- [ ] Business name on left
- [ ] User avatar + name dropdown on right
- [ ] Dropdown: Settings link, Logout button
- [ ] Notification bell with unread count badge (stub ok for MVP)

### Conversation Components

#### `ChatPanel`
- [ ] Props: `conversationId: string`
- [ ] Fetches messages via `GET /api/conversations/[id]/messages` with SWR
- [ ] `refreshInterval: 5000` for real-time polling
- [ ] Renders message bubbles:
  - INBOUND: left-aligned, white/light gray background
  - OUTBOUND: right-aligned, dark green background
- [ ] Intent badge above each message showing type (ORDER, COMPLAINT, etc.)
- [ ] Badge colors match intent (green=order, red=complaint, yellow=follow-up, blue=inquiry, gray=general)
- [ ] Timestamp below each message (HH:MM format)
- [ ] Status icon on outbound messages (CheckCircle2=delivered, Clock=pending, AlertTriangle=failed)
- [ ] Reply box: input + send button
- [ ] Submit calls `POST /api/messages`, adds response to list
- [ ] Scrolls to bottom on new message
- [ ] Empty state when no messages
- [ ] Loading state during to initial fetch

#### `AIReplyPanel`
- [ ] Shows AI reply suggestion for current conversation
- [ ] "Generate Reply" button calls `POST /api/ai/reply`
- [ ] Shows generated reply in preview
- [ ] "Kirim" button sends reply via WhatsApp
- [ ] Shows status: generating, ready, sending, sent
- [ ] "lewati" button dismisses without sending

#### `ConversationListItem`
- [ ] Props: `conversation`, `isActive`, `onClick`
- [ ] Avatar with customer initials
- [ ] Customer name (or phone if no name)
- [ ] Last message preview (truncated, 1 line)
- [ ] Timestamp (relative or time format)
- [ ] Status badge: open=green, escalated=red, closed=gray
- [ ] Unread indicator dot if has unread messages
- [ ] Hover state with background color
- [ ] Click triggers `onClick`

### Order Components

#### `OrderListItem`
- [ ] Props: `order`, `isActive`, `onClick`
- [ ] Customer name + avatar initials
- [ ] Order amount formatted as Rp (thousand separators)
- [ ] Payment status badge color-coded:
  - recorded/confirmed = green
  - pending = yellow
  - cancelled = red
- [ ] Item count in parentheses
- [ ] Created date
- [ ] Hover and active states

#### `OrderDetailPanel`
- [ ] Props: `order`, `onUpdateStatus`, `onAddNote`
- [ ] Customer section: name, phone, click to navigate
- [ ] Order info section: ID, type badge (INCOME=green, EXPENSE=red), category, amount, description
- [ ] Payment status section: 4 buttons (Lunas/Dikonfirmasi/Menunggu/Dibatalkan), active state highlighted
- [ ] Items section: list of items with name, qty, price
- [ ] Notes section: existing notes listed, input + add button
- [ ] AI insights section: suggestion text
- [ ] Timeline section: order created event
- [ ] `onUpdateStatus` calls `PATCH /api/orders/[id]` with `{ paymentStatus: status }`
- [ ] `onAddNote` calls `PATCH /api/orders/[id]` with updated notes array

#### `AddOrderModal`
- [ ] Triggered by "Add Order" button on orders page
- [ ] Customer selector (searchable dropdown of customers)
- [ ] Order type toggle: INCOME / EXPENSE
- [ ] Amount input (number, formatted as currency)
- [ ] Category input (text)
- [ ] Items input (JSON array or simplified add-item UI)
- [ ] Description textarea
- [ ] Payment status select: pending / recorded / confirmed / cancelled
- [ ] Cancel + Submit buttons
- [ ] Submit calls `POST /api/orders`
- [ ] Success: modal closes, order list refreshes

### Customer Components

#### `CustomerListItem`
- [ ] Props: `customer`, `isActive`, `onClick`
- [ ] Avatar with initials from name or phone
- [ ] Name (or phone if no name)
- [ ] "X percakapan · Y pesanan" subtitle
- [ ] Last message date (right-aligned)
- [ ] Active state: dark background, white text
- [ ] Hover state

#### `CustomerDetailPanel`
- [ ] Props: `customer: CustomerDetail | null`
- [ ] Empty state when no customer selected
- [ ] Header: avatar, name, phone, WA ID badge, member since
- [ ] Tabs: Percakapan / Pesanan
- [ ] Percakapan tab: list of conversations with status badges, click navigates
- [ ] Pesanan tab: list of orders with amounts and status, click navigates
- [ ] Empty states for both tabs

### Dashboard Components

#### `KPICard`
- [ ] Props: `title`, `value`, `trend`, `icon`, `color`
- [ ] Card with title, large value, trend text
- [ ] Trend text format: "↑ baru", "↑ X% dari kemarin", "↓ X% dari kemarin"
- [ ] Icon in top-right or left of card
- [ ] Color accent matches the card theme

#### `BulkMessageModal`
- [ ] Props: `open`, `onClose`
- [ ] Triggered by "Kirim Pesan Massal" button on dashboard
- [ ] Header: "Kirim Pesan Massal" + close button
- [ ] Message type tabs: Promosi / Info / Pengingat
- [ ] Customer selector: checkbox list with "Pilih Semua"
- [ ] Message textarea (max 1000 chars, char counter)
- [ ] Preview panel showing styled message
- [ ] Progress indicator during sending (X/Y terkirim)
- [ ] Success screen with checkmark when done
- [ ] Batch sending: 5 messages at a time with delay
- [ ] Cancel and Send buttons
- [ ] Send calls `POST /api/messages` for each recipient

#### `DashboardQuickActions`
- [ ] "Kirim Pesan Massal" → opens `BulkMessageModal`
- [ ] "Lihat Laporan AI" → navigates to `/settings/reports`

#### `ActivityFeed`
- [ ] Shows recent events (new customer, new order, etc.)
- [ ] Each item: icon + text description + timestamp
- [ ] Realistic sample data shown when empty

### Settings Components

#### `AIConfigCard`
- [ ] Fetches config from `GET /api/ai/config`
- [ ] Toggle: Auto-Reply AI enabled/disabled
- [ ] Tone: 3 segmented buttons (Ramah / Formal / Casual)
- [ ] Working hours: start time + end time inputs
- [ ] SOP Context: textarea with placeholder
- [ ] Fallback Reply: textarea
- [ ] Save calls `PATCH /api/ai/config`
- [ ] Loading skeleton while fetching
- [ ] Success message after save
- [ ] Error message on failure

#### `EscalationRulesList`
- [ ] Fetches rules from `GET /api/escalation-rules`
- [ ] Each rule card: icon, name, type badge, keywords chips, min order value, toggle, edit, delete
- [ ] Type badges color-coded: COMPLAINT=red, HIGH_VALUE_ORDER=yellow, SPECIFIC_KEYWORD=blue, NO_REPLY_24H=gray
- [ ] Toggle calls `PATCH /api/escalation-rules/[id]`
- [ ] Edit opens modal with pre-filled fields
- [ ] Delete shows confirmation then calls `DELETE /api/escalation-rules/[id]`
- [ ] "Tambah Aturan" button opens empty modal
- [ ] Modal fields: name (text), type (select), conditional fields based on type
- [ ] Create calls `POST /api/escalation-rules`
- [ ] Update calls `PATCH /api/escalation-rules/[id]`
- [ ] Empty state when no rules
- [ ] Loading skeleton during fetch

#### `MFASetupCard`
- [ ] Imported in `app/(app)/settings/security/page.tsx` from `@/components/settings/mfa-setup-card`
- [ ] Component file needs to be created: `components/settings/mfa-setup-card.tsx`
- [ ] Shows current MFA status (enabled/disabled)
- [ ] If disabled: "Aktifkan MFA" button → calls `POST /api/auth/mfa/setup`
- [ ] If enabling: shows QR code from setup endpoint, verification input, verify button
- [ ] If enabled: "Nonaktifkan MFA" button (requires TOTP code)
- [ ] After setup: shows recovery codes for download
- [ ] Calls `POST /api/auth/mfa/verify` for setup, `POST /api/auth/mfa/disable` for disabling

#### `WhatsAppStatus`
- [ ] Imported in `app/(app)/settings/channels/page.tsx` from `@/components/settings/whatsapp-status`
- [ ] Component file needs to be created: `components/settings/whatsapp-status.tsx`
- [ ] Props: `accounts[]`
- [ ] Shows connection status per account (connected/disconnected)
- [ ] If connected: phone number, account name, connection status badge
- [ ] If disconnected: "Hubungkan" button
- [ ] Connect modal: phoneNumberId, waBusinessAcctId, accessToken fields
- [ ] Save calls backend to store WhatsApp credentials
- [ ] Disconnect calls delete endpoint

#### `TeamMemberRow`
- [ ] Avatar with initials
- [ ] Name + email
- [ ] Role badge (owner=gold, admin=green, member=gray)
- [ ] Join date
- [ ] Remove button (except for self, and not for owner)

### Shared / UI Components

#### All shadcn/ui components
- [ ] `Button` — used everywhere with consistent styling (bg-[#111] hover:bg-[#333])
- [ ] `Input` — styled with border-[#e0ddd8] bg-[#f7f5f2]
- [ ] `Badge` — status badges with appropriate colors
- [ ] `Avatar` — customer/user avatars with fallback initials
- [ ] `Skeleton` — loading states for all async content
- [ ] `Switch` — toggle components
- [ ] `Dialog` / Modal — confirmation dialogs, add/edit modals
- [ ] `Select` — dropdowns
- [ ] `Label` — form labels
- [ ] `Tabs` — customer detail, settings sub-nav
- [ ] `Separator` — section dividers
- [ ] `DropdownMenu` — user dropdown, action menus

#### Loading States
- [ ] Every async component has loading skeleton
- [ ] Skeletons match the shape of loaded content (not generic spinners)
- [ ] Tables show skeleton rows during load
- [ ] Forms disable during submission

#### Error States
- [ ] Every API error shows user-friendly message (not raw error)
- [ ] Network error shows "Koneksi gagal. Periksa internet Anda."
- [ ] 401 shows redirect to login
- [ ] 403 shows "Anda tidak memiliki akses ke halaman ini."
- [ ] 404 shows "Halaman tidak ditemukan."
- [ ] 500 shows "Terjadi kesalahan. Coba lagi nanti."

#### Empty States
- [ ] Each list has empty state with icon and helpful message
- [ ] Conversations empty: "Belum ada percakapan. Hubungkan saluran WhatsApp Anda."
- [ ] Customers empty: "Belum ada pelanggan."
- [ ] Orders empty: "Belum ada pesanan."
- [ ] Search empty: "Tidak ada hasil untuk '[query]'."

---

## 6. FRONTEND — DESIGN SYSTEM & UX

### Color Palette
- [ ] Background: `#fafaf8` (warm off-white)
- [ ] Surface (cards): `#ffffff`
- [ ] Border: `#f0ede8` (warm gray)
- [ ] Primary text: `#111111`
- [ ] Secondary text: `#888888`
- [ ] Primary brand: `#3a7a55` (forest green)
- [ ] Brand dark: `#004526` (deep forest)
- [ ] Gold accent: `#795900` (for badges/highlights)
- [ ] Status green: `#1a7a42` (success/received)
- [ ] Status yellow: `#9a6800` (pending/warning)
- [ ] Status red: `#ba1a1a` (error/complaint/cancelled)

### Typography
- [ ] Headings use `Instrument Serif` (Google Font), italic variant for emphasis
- [ ] Body text uses `Inter` (Google Font)
- [ ] Font sizes: 11px (labels), 13px (small), 14px (body), 16px (subtitle), 20-26px (headings)
- [ ] Line height: 1.5 for body, 1.2 for headings
- [ ] Letter spacing: 0.15em for uppercase labels, -0.02em for headings

### Spacing
- [ ] 4px base unit system
- [ ] Card padding: 20px (p-5) or 24px (p-6)
- [ ] Section gaps: 16px (gap-4) or 20px (gap-5)
- [ ] List item padding: 12px vertical, 16px horizontal

### Components Styling
- [ ] Cards: `bg-white rounded-xl border border-[#f0ede8]`
- [ ] Buttons: primary=`bg-[#111] hover:bg-[#333] text-white`, secondary=`border border-[#e0ddd8]`
- [ ] Inputs: `border border-[#e0ddd8] bg-[#f7f5f2] rounded-lg`
- [ ] Badges: `px-2 py-0.5 rounded-full text-[11px] font-bold`
- [ ] Active nav item: `bg-[#111] text-white rounded-l-xl`

### Animations & Transitions
- [ ] Page transitions: fade (150ms)
- [ ] Modal: fade in (200ms)
- [ ] Hover: 150ms ease transitions on all interactive elements
- [ ] Skeleton pulse animation for loading states
- [ ] Smooth scroll behavior

### Mobile Responsiveness
- [ ] Sidebar hidden below 1024px (replaced by bottom tab bar)
- [ ] Bottom tab bar visible below 768px
- [ ] Split-panel pages (conversations, customers) stack vertically on mobile
- [ ] Dashboard KPI cards: 2 columns on tablet, 1 column on mobile
- [ ] Modals: full-screen on mobile (max-w-none, mx-0, rounded-none)
- [ ] Touch targets: minimum 44px height for buttons on mobile

---

## 7. FRONTEND — STATE & DATA FETCHING

### SWR Configuration
- [ ] Global SWR config with `fallbackData` for initial states
- [ ] `refreshInterval` set per-route appropriately:
  - Conversation messages: `5000` (5 seconds)
  - Dashboard metrics: `30000` (30 seconds) or manual refresh
  - Static data (settings, team): no auto-refresh
- [ ] `revalidateOnFocus: true` for all data
- [ ] `revalidateOnReconnect: true` for all data
- [ ] Error retry: 3 attempts with exponential backoff

### Data Freshness
- [ ] Messages: revalidate on send (mutate after POST)
- [ ] Orders: revalidate on create/update (mutate after POST/PATCH)
- [ ] Customer list: revalidate on changes
- [ ] Settings pages: revalidate on save (mutate after PATCH)
- [ ] Dashboard: manual refresh button or pull-to-refresh

### Loading States
- [ ] Initial load shows skeleton (not spinner)
- [ ] Subsequent polling doesn't show skeleton
- [ ] Optimistic updates where appropriate (e.g., message sending)
- [ ] Stale data shown while revalidating (no blank flash)

### Error Handling
- [ ] Network error shows toast/banner with retry option
- [ ] 401 redirects to login
- [ ] 403 shows permission denied message
- [ ] 404 shows not found message
- [ ] Rate limited shows "Terlalu banyak permintaan. Coba lagi nanti."
- [ ] All errors logged to console in development

---

## 8. FRONTEND — FORMS & VALIDATION

### Login Form
- [ ] Email: required, valid email format
- [ ] Password: required, min 8 chars
- [ ] Submit disabled when invalid
- [ ] Error message on failed login
- [ ] Loading state on button during auth

### Registration Form
- [ ] Name: required
- [ ] Email: required, valid email format, unique check
- [ ] Password: required, min 8 chars, confirmation match
- [ ] Business Name: required
- [ ] All fields validated on blur and on submit

### Add Order Modal
- [ ] Customer: required (select from list)
- [ ] Amount: required, positive number
- [ ] Type: required (INCOME or EXPENSE)
- [ ] Payment Status: required
- [ ] Items: valid JSON if provided
- [ ] Description: optional

### AI Config Form
- [ ] Tone: required (one of friendly/formal/casual)
- [ ] Working Hours: start < end
- [ ] SOP Context: max 5000 chars
- [ ] Fallback Reply: max 1000 chars

### Escalation Rule Form
- [ ] Name: required, max 100 chars
- [ ] Type: required
- [ ] Keywords: valid when type is SPECIFIC_KEYWORD (comma-separated)
- [ ] Min Order Value: positive number when type is HIGH_VALUE_ORDER

### Team Invite Form
- [ ] Name: required
- [ ] Email: required, valid email format
- [ ] Role: required (admin or member)

### Bulk Message Form
- [ ] Recipients: at least 1 customer selected
- [ ] Message: required, max 1000 chars
- [ ] Warning at 900+ chars

---

## 9. FRONTEND — INTEGRATION POINTS

### API Response Shapes (Frontend expects these exact shapes)

#### `GET /api/customers`
```json
{
  "customers": [
    {
      "id": "cuid",
      "name": "Budi Santoso",
      "phone": "6281234567890",
      "waId": "6281234567890",
      "lastMessageAt": "2026-05-25T10:30:00Z",
      "_count": { "conversations": 5, "orders": 2 },
      "createdAt": "2026-05-01T00:00:00Z"
    }
  ]
}
```

#### `GET /api/customers/[id]`
```json
{
  "customer": {
    "id": "cuid",
    "name": "Budi Santoso",
    "phone": "6281234567890",
    "waId": "6281234567890",
    "createdAt": "2026-05-01T00:00:00Z",
    "conversations": [
      {
        "id": "cuid",
        "status": "open",
        "lastMessageAt": "2026-05-25T10:30:00Z",
        "_count": { "messages": 18 }
      }
    ],
    "orders": [
      {
        "id": "cuid",
        "amount": "150000",
        "paymentStatus": "recorded",
        "createdAt": "2026-05-20T00:00:00Z"
      }
    ]
  }
}
```

#### `GET /api/metrics`
```json
{
  "totalOrders": 47,
  "totalOrdersTrend": "↑ 12% dari kemarin",
  "totalRevenue": 1850000,
  "revenueTrend": "↑ 8% dari kemarin",
  "openConversations": 4,
  "conversationsTrend": "↓ 2 dari kemarin",
  "aiDeflectionRate": "71",
  "deflectionTrend": "↑ 5% dari kemarin",
  "waitingCount": 2,
  "aiInsight": "Otomatisasi penjawab pesan meningkatkan respons rate hingga 91%."
}
```

#### `GET /api/conversations/[id]/messages`
```json
{
  "messages": [
    {
      "id": "cuid",
      "direction": "INBOUND",
      "content": "Halo, saya mau order 2 lusin mug",
      "intent": "ORDER",
      "aiReplyUsed": true,
      "repliedBy": null,
      "status": "delivered",
      "waMsgId": "wamid.xxx",
      "createdAt": "2026-05-25T10:30:00Z"
    }
  ]
}
```

#### `POST /api/messages` (request)
```json
{
  "conversationId": "cuid",
  "content": "Terima kasih, order sudah kami catat!",
  "direction": "OUTBOUND"
}
```
Or for bulk/outbound:
```json
{
  "phoneNumber": "6281234567890",
  "content": "Halo, ada promo baru!",
  "direction": "OUTBOUND",
  "bulk": true
}
```

#### `GET /api/orders`
```json
{
  "orders": [
    {
      "id": "cuid",
      "type": "INCOME",
      "amount": "150000",
      "paymentStatus": "recorded",
      "category": "sales",
      "description": "2 lusin mug",
      "createdAt": "2026-05-20T00:00:00Z",
      "customer": { "id": "cuid", "name": "Budi Santoso", "phone": "6281234567890" },
      "_count": { "items": 1 }
    }
  ]
}
```

#### `GET /api/orders/[id]`
```json
{
  "order": {
    "id": "cuid",
    "conversationId": "cuid",
    "customerId": "cuid",
    "businessId": "cuid",
    "type": "INCOME",
    "amount": "150000",
    "category": "sales",
    "paymentStatus": "recorded",
    "items": [{ "name": "Mug Keramik", "qty": 24, "price": 6250 }],
    "notes": ["Dikirim via JNE"],
    "description": "2 lusin mug",
    "createdAt": "2026-05-20T00:00:00Z",
    "updatedAt": "2026-05-20T00:00:00Z",
    "customer": { "id": "cuid", "name": "Budi Santoso", "phone": "6281234567890" }
  }
}
```

#### `PATCH /api/orders/[id]` (request)
```json
{
  "paymentStatus": "confirmed"
}
```
or for notes:
```json
{
  "notes": ["Dikirim via JNE", "Customer request packing"]
}
```

#### `GET /api/ai/config`
```json
{
  "config": {
    "isEnabled": true,
    "tone": "friendly",
    "sopContext": "Kami toko配件 motor di Surabaya. Pengiriman via JNE, J&T, SiCepat.",
    "fallbackReply": "Terima kasih! Kami akan segera merespons.",
    "workingHours": { "start": "09:00", "end": "21:00", "timezone": "Asia/Jakarta" },
    "dailyRecapEnabled": true,
    "dailyRecapTime": "20:00"
  }
}
```

#### `PATCH /api/ai/config` (request — partial update ok)
```json
{
  "isEnabled": true,
  "tone": "formal",
  "dailyRecapTime": "19:00"
}
```

#### `GET /api/escalation-rules`
```json
{
  "rules": [
    {
      "id": "cuid",
      "name": "Komplain Produk",
      "type": "COMPLAINT",
      "keywords": null,
      "minOrderValue": null,
      "isActive": true
    }
  ]
}
```

#### `POST /api/escalation-rules` (request)
```json
{
  "name": "Order Nilai Tinggi",
  "type": "HIGH_VALUE_ORDER",
  "keywords": [],
  "minOrderValue": 500000,
  "isActive": true
}
```

#### `GET /api/tenant/team`
```json
{
  "users": [
    {
      "id": "cuid",
      "name": "Admin Toko",
      "email": "admin@toko.com",
      "role": "owner",
      "createdAt": "2026-05-01T00:00:00Z"
    }
  ]
}
```

### Webhook Endpoints (Frontend doesn't call these, but must work)

#### `GET /api/webhook/wa/connect`
- [x] Returns `hub.challenge` when `hub.verify_token` matches
- [x] Returns 403 when token doesn't match

#### `POST /api/webhook/wa` (WhatsApp inbound webhook)
- [x] Verifies HMAC signature
- [x] Creates/updates customer from inbound message
- [x] Creates conversation if new
- [x] Creates message with INBOUND direction
- [x] Triggers AI classification pipeline

#### `POST /api/webhook/wa/status` (WhatsApp status webhook)
- [x] Updates message status based on delivery receipts
- [x] Handles: sent, delivered, read, failed

---

## 10. BACKEND — CORE API ROUTES

### Auth Routes
- [x] `GET/POST /api/auth/[...nextauth]` — NextAuth handler
- [ ] `POST /api/auth/register` — Create Business + User *(depends on missing lib files)*
- [x] `POST /api/auth/mfa/setup` — Generate TOTP secret + QR
- [x] `POST /api/auth/mfa/verify` — Verify TOTP code
- [x] `POST /api/auth/mfa/disable` — Disable MFA with valid TOTP

### Conversations Routes
- [x] `GET /api/conversations` — Partial list, needs `_count` fix
- [x] `GET /api/conversations/[id]` — Single conversation
- [x] `GET /api/conversations/[id]/messages` — Messages sorted by createdAt asc

### Messages Routes
- [x] `POST /api/messages` — Creates OUTBOUND message + sends via WhatsApp API

### Customers Routes
- [x] `GET /api/customers` — List with pagination (missing `_count` + `businessId` scope bug)
- [x] `GET /api/customers/[id]` — Detail with conversations + orders

### Orders Routes
- [x] `GET /api/orders` — List with filtering
- [x] `POST /api/orders` — Create with items JSON
- [x] `GET /api/orders/[id]` — Single order with items and customer
- [x] `PATCH /api/orders/[id]` — Update paymentStatus and/or notes

### Metrics Route
- [x] `GET /api/metrics` — All KPIs with trend calculations vs yesterday

---

## 11. BACKEND — WHATSAPP INTEGRATION

### Webhook Security
- [x] HMAC-SHA256 verification on all incoming webhooks
- [x] `X-Hub-Signature-256` header checked
- [x] Invalid signatures return 403
- [x] Webhook secret configurable per WhatsApp account

### Inbound Message Handling
- [x] Parse message from WhatsApp webhook payload
- [x] Extract: phone, waId, message content, timestamp
- [x] Find or create customer by phone number
- [x] Find or create conversation (customer + business + waAccount)
- [x] Create message record with direction=INBOUND
- [x] Call AI classification pipeline asynchronously
- [x] Respond to WhatsApp API with 200 within 20 seconds

### Status/Delivery Receipts
- [x] Handle status updates: sent, delivered, read, failed, bounced
- [x] Map WhatsApp status to internal status
- [x] Update message `status` field in database
- [x] Acknowledge quickly (don't process heavy logic in webhook handler)

### Outbound Messages
- [x] `sendWhatsAppMessage(phone, content, accessToken)` function in `lib/whatsapp.ts`
- [x] WhatsApp API v18.0 endpoint
- [x] Retry logic: 3 attempts with exponential backoff
- [x] Handle rate limits (429) with retry-after
- [x] Return waMsgId from WhatsApp API response
- [x] Log all outbound message attempts

### WhatsApp API Credentials
- [x] Phone Number ID, Business Account ID, Access Token stored in DB (WhatsAppAccount model)
- [x] Access token refreshed automatically (Meta handles this via long-lived tokens)
- [x] Token stored encrypted in database (accessToken field — encrypted at rest by DB)

---

## 12. BACKEND — AI PIPELINE

### Classification (`POST /api/ai/classify`)
- [x] Accepts `{ messageId }`
- [x] Gets message content + conversation context
- [x] Calls Gemini with classification prompt
- [x] Returns intent: ORDER, PRODUCT_INQUIRY, COMPLAINT, FOLLOW_UP, GENERAL
- [x] Updates message `intent` field in DB
- [x] Routes based on intent:
  - ORDER → trigger order extraction
  - COMPLAINT → trigger escalation + reply apology
  - PRODUCT_INQUIRY → trigger auto-reply
  - FOLLOW_UP → trigger auto-reply
  - GENERAL → trigger auto-reply
- [x] Handles Gemini errors gracefully

### Auto-Reply (`POST /api/ai/reply`)
- [x] Accepts `{ messageId }`
- [x] Reads AI config from DB (tone, sopContext, workingHours)
- [x] Checks working hours (returns `{ outsideWorkingHours: true }` if outside)
- [x] Builds prompt with business name, tone, SOP, conversation history, message
- [x] Calls Gemini to generate reply
- [x] Sends via WhatsApp API
- [x] Creates OUTBOUND message record
- [x] Marks original message `aiReplyUsed: true`
- [x] GET endpoint batch-processes pending messages

### Order Extraction (`POST /api/ai/extract-order`)
- [x] Accepts `{ messageId }`
- [x] Gets message content + product list from DB
- [x] Calls Gemini to extract `{ items, total, notes, confidence }`
- [x] If confidence > 0.5 and items exist: creates Order record
- [x] Prevents duplicate orders (check conversationId)
- [x] Returns `{ success, orderId, items, total, confidence }`
- [x] GET endpoint batch-processes ORDER-classified messages

### Escalation (`POST /api/ai/escalate`)
- [x] Accepts `{ conversationId, messageId?, reason? }`
- [x] Reads escalation rules from DB
- [x] Builds escalation message (customer info, message preview, timestamp, link)
- [x] Sends to owner via WhatsApp (or other configured channel)
- [x] Updates conversation status to "escalated"
- [x] Creates escalation log entry
- [x] Returns `{ success, escalationId }`

### Daily Recap Generation
- [ ] Triggered by cron job or manual call
- [ ] Queries today's data: orders, revenue, expenses, messages, new customers
- [ ] Generates formatted recap message with emojis
- [ ] Sends to owner via WhatsApp
- [ ] Stores recap in DailySummary table

### AI Config Management
- [x] `GET /api/ai/config` — Returns config for current business
- [x] `PATCH /api/ai/config` — Partial update, validates input
- [x] Config stored in AIAutoReplyConfig table

### AI Safety & Prompt Engineering

#### Prompt Injection Defense
- [x] Input sanitization strips known jailbreak patterns before reaching Gemini (`lib/ai/injection-filter.ts`)
- [x] Blocked patterns: `ignore previous`, `disregard`, `[SYSTEM]`, `// ignored`, hidden unicode injected instructions
- [x] Message length capped at 512 chars for AI calls (prevent prompt flooding)
- [x] AI never reveals it is an LLM / AI model in responses (enforced via prompt template)
- [x] No shell/code execution — AI output never passed to `exec()` or similar

#### SOP Context Binding (RAG-lite)
- [x] All AI calls inject business context: name, tone, working hours, products, escalation rules
- [x] Context loaded from DB at inference time (not hardcoded in prompts)
- [x] Few-shot examples per business (2-3 sample replies loaded from business config)
- [x] Prompt template stored in `lib/ai/prompts.ts` for consistency across classify/reply/extract

#### Human-like Voice
- [x] Max response length: 160 chars for WhatsApp (prevents essay replies)
- [x] Indonesian casual spelling respected (e.g., "bsh", "sdh", "blm", "tdk" not blocked as typos)
- [ ] Typing indication delay simulated (200-800ms random) when sending via API
- [ ] No emoji in AI replies unless business config allows it
- [x] Apology escalation: COMPLAINT triggers scripted apology template, not full LLM essay

#### Rule-based Fallbacks (No GenAI fallback for critical actions)
- [x] `confidence < 0.5` on order extraction → escalate to human, do not auto-create order
- [x] `outside_working_hours` → hardcoded greeting message, not GenAI response
- [x] Complaint keywords detected → hardcoded scripted reply + escalation trigger, not gen'd response
- [x] Order amount > escalation threshold → escalate before confirming to customer
- [x] AI reply failed → fallback to stored `fallbackReply` from business config
- [x] All order creation requires confidence > 0.5; otherwise logged as pending human review

---

## 13. BACKEND — TEAM & TENANT MANAGEMENT

### Tenant Routes
- [x] `GET /api/tenant` — Returns current business info
- [x] `PATCH /api/tenant` — Updates business name/logo

### Team Routes
- [x] `GET /api/tenant/team` — List all users in business with roles
- [x] `POST /api/tenant/team` — Invite new member (create User + send invite email)
- [x] `DELETE /api/tenant/team/[userId]` — Remove member (only owner can remove)
- [x] Cannot remove self if last owner
- [x] Cannot remove owner role from self

### Owner Commands
- [x] `POST /api/owner/command` — Execute text commands from WhatsApp
- [x] `rekap` — Daily summary (orders, revenue, expenses, messages)
- [x] `status` — Bot status (online, AI enabled, open conversations)
- [x] `help` — List available commands

---

## 14. RATE LIMITING & ERROR HANDLING

### Rate Limiting (Upstash Redis)
- [x] Rate limiting infrastructure in place with in-memory fallback (`lib/rate-limit.ts`)
- [x] Major routes have rate limits applied (metrics, conversations, orders, AI routes)
- [ ] Rate limit headers on ALL routes — some routes (messages, customers, tenant) missing headers
- [ ] 429 response when exceeded with `{ error: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" }`

Rate limits per route (as-implemented):
| Route | Limit | Window |
|-------|-------|--------|
| `GET /api/metrics` | 60 | 1 min |
| `GET /api/conversations` | 200 | 1 min |
| `PATCH /api/conversations/[id]` | 50 | 1 min |
| `GET/POST /api/orders` | 200/50 | 1 min |
| `POST /api/messages` | — | — |
| `GET /api/customers` | — | — |
| `POST /api/ai/reply` | 50 | 1 min |
| `POST /api/ai/classify` | 50 | 1 min |
| `POST /api/ai/extract-order` | 30 | 1 min |
| `POST /api/ai/escalate` | 30 | 1 min |

### Error Response Format
All errors follow this format:
```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

Error codes:
- `UNAUTHORIZED` — Not authenticated (401)
- `FORBIDDEN` — Not authorized for this resource (403)
- `NOT_FOUND` — Resource not found (404)
- `VALIDATION_ERROR` — Zod validation failed (400)
- `RATE_LIMIT_EXCEEDED` — Too many requests (429)
- `AI_ERROR` — AI generation failed (500)
- `AI_PARSE_ERROR` — AI response parsing failed (500)
- `INTERNAL_ERROR` — Unexpected server error (500)

### Logging
- [x] All errors logged with `logger.error` or `console.error`
- [x] Logs include: error message, timestamp, request path, userId (if authenticated)
- [x] Sensitive data (tokens, passwords) not logged
- [x] API version logged in headers (`X-API-Version`) on most routes

---

## 15. SECURITY

### Authentication
- [ ] All API routes require valid session
- [ ] Session validated server-side (never trust client)
- [ ] JWT secret minimum 32 characters
- [ ] Passwords hashed with bcrypt (cost factor 12+)
- [ ] TOTP secrets stored encrypted

### Authorization
- [ ] Every route checks `businessId` scope
- [ ] Users can only access their own business data
- [ ] Role checks on sensitive operations (billing, team management)
- [ ] `CSRF` protection on all state-changing endpoints

### WhatsApp Security
- [ ] HMAC-SHA256 verification on all webhook payloads
- [ ] Webhook URL is secret (not guessable)
- [ ] Access tokens stored encrypted at rest

### API Security
- [ ] CORS restricted to known frontend origin
- [ ] No sensitive data in error messages
- [ ] API_VERSION header on all responses
- [ ] Request ID traced through all logs
- [ ] No hardcoded secrets (all in env vars)

### Environment Variables (Required)
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<min 32 chars>
NEXTAUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GEMINI_API_KEY=  # or GCP_PROJECT_ID + service account
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
WHATSAPP_APP_ID=
WHATSAPP_APP_SECRET=
```

---

## 16. PERFORMANCE

### Database
- [ ] All Prisma queries use `select` to limit returned fields (no `SELECT *`)
- [ ] Compound indexes on `(businessId, createdAt)` for time-range queries
- [ ] Pagination on all list endpoints (cursor or offset, max 50 per page)
- [ ] No N+1 queries (use `include` with nested relations)
- [ ] Prisma connection pool: min 2, max 10

### Frontend
- [ ] `next/image` for all images (auto WebP, lazy load)
- [ ] Dynamic imports for heavy components (modals, rich editors)
- [ ] Route-based code splitting (automatic with Next.js)
- [ ] SWR deduplication (same key = same request)
- [ ] Debounced search inputs (300ms)

### API
- [ ] Response caching headers where appropriate
- [ ] No blocking operations in request handlers
- [ ] Async processing for non-critical operations (webhook handlers queue work)

---

## 17. TESTING

### Frontend Tests (Minimum)
- [ ] Component renders without crashing
- [ ] Form validation shows errors
- [ ] Button click triggers state change
- [ ] Loading state shows during fetch
- [ ] Error state shows on API failure
- [ ] Empty state shows when list is empty

### Backend Tests (Minimum)
- [ ] Auth: login with valid credentials → 200 + session
- [ ] Auth: login with invalid credentials → 401
- [ ] Auth: register with valid data → 201 + user created
- [ ] Auth: register with duplicate email → 400
- [ ] Auth: access protected route without session → 401
- [ ] Conversations: list scoped to businessId
- [ ] Conversations: cannot access other business's conversations → 403
- [ ] Messages: create message returns message object
- [ ] Orders: create with valid data → 201
- [ ] Orders: update paymentStatus → 200 with updated order
- [ ] Webhook: invalid HMAC → 403
- [ ] Webhook: valid inbound message → 200 + customer/conversation/message created
- [ ] AI: classify message → 200 + intent set
- [ ] Rate limit: exceeding limit → 429
- [ ] Zod validation: invalid body → 400 with error details

### E2E Tests (Playwright)
- [ ] Login flow: form → dashboard
- [ ] Send message: conversations → reply → message appears
- [ ] Create order: orders → add modal → order in list
- [ ] Settings save: AI config → change tone → save → reload → value persists

---

## 18. DOCUMENTATION

### Code Documentation
- [ ] No `// TODO` comments left in code
- [ ] Complex logic has inline comments explaining WHY
- [ ] API routes have JSDoc comments with request/response shapes
- [ ] Type definitions for all Prisma models used in API layer

### Architecture Documentation
- [ ] `CLAUDE.md` updated with current architecture overview
- [ ] `AGENTS.md` notes Next.js 16 breaking changes
- [ ] `docs/` folder exists with architecture diagrams (if applicable)
- [ ] API endpoint list in `docs/` or `swagger.yaml`

### README.md
- [ ] Project description
- [ ] Tech stack list
- [ ] Local setup instructions
- [ ] Environment variables list
- [ ] Available scripts (`npm run dev`, `npm run build`, etc.)
- [ ] Deployment instructions
- [ ] License (MIT)

---

## 19. DEPLOY CHECKLIST

### Pre-Deploy
- [ ] `npm run build` succeeds with no errors
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] All environment variables set in Vercel project
- [ ] Database migrations run on production
- [ ] `prisma generate` run for production build
- [ ] WhatsApp webhook URL updated to production domain
- [ ] WhatsApp app status: "In Review" → approved for production

### Vercel Configuration
- [ ] `vercel.json` or `vercel.ts` configured
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`
- [ ] Install command: `npm install`
- [ ] Environment variables set in Vercel dashboard
- [ ] `FRAMEWORK_V8` preset for Next.js 16

### Environment Variables (Production)
- [ ] `DATABASE_URL` — Neon PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` — New random secret (min 32 chars)
- [ ] `NEXTAUTH_URL` — Production URL (https://yourdomain.com)
- [ ] `GEMINI_API_KEY` — Google AI API key (or GCP credentials)
- [ ] `UPSTASH_REDIS_REST_URL` — Upstash Redis URL
- [ ] `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis token
- [ ] `WHATSAPP_APP_ID` — Meta App ID
- [ ] `WHATSAPP_APP_SECRET` — Meta App Secret
- [ ] `WHATSAPP_PHONE_NUMBER_ID` — WhatsApp Phone Number ID
- [ ] `WHATSAPP_BUSINESS_ACCOUNT_ID` — WhatsApp Business Account ID

### Post-Deploy
- [ ] Production URL opens correctly
- [ ] Login works on production
- [ ] WhatsApp webhook receives events
- [ ] AI classification works end-to-end
- [ ] Dashboard metrics load
- [ ] No console errors in production
- [ ] Lighthouse score: Performance > 80

---

## 20. PRE-LAUNCH QA

### Functional Testing
- [ ] Login and registration work on first try
- [ ] Can send and receive WhatsApp messages (receive → webhook → DB → UI)
- [ ] AI auto-reply sends when enabled and within working hours
- [ ] AI auto-reply does NOT send when disabled or outside working hours
- [ ] AI classification correctly identifies ORDER, COMPLAINT, etc.
- [ ] Order extraction creates order from ORDER-classified message
- [ ] Escalation sends message to owner for COMPLAINT
- [ ] Bulk message sends to multiple recipients
- [ ] Payment status updates reflect immediately in UI
- [ ] Notes add and display correctly on orders
- [ ] Customer list shows correct conversation/order counts
- [ ] MFA enable/disable cycle works
- [ ] Team invite email sends (if email configured)

### Edge Cases
- [ ] Handle WhatsApp webhook retry (same message ID sent twice)
- [ ] Handle AI returning empty response (fallback reply)
- [ ] Handle WhatsApp API rate limits
- [ ] Handle Gemini API errors gracefully
- [ ] Handle customer with no name (display phone instead)
- [ ] Handle message with no content
- [ ] Handle order for non-existent customer
- [ ] Handle concurrent updates to same order

### Security Testing
- [ ] Cannot access other business's data via ID manipulation
- [ ] Cannot call APIs without authentication
- [ ] Cannot call APIs for other business (even with valid auth)
- [ ] HMAC verification rejects forged webhook payloads
- [ ] Password not visible in any API response
- [ ] No secrets in frontend JavaScript bundle

### Performance Testing
- [ ] Dashboard loads in < 2s on 3G
- [ ] Conversation opens in < 1s
- [ ] Message sends and appears in < 3s
- [ ] AI reply generates in < 10s (timeout at 15s)
- [ ] No memory leaks after 1 hour of active use

### Monitoring & Observability
- [ ] Error tracking (Sentry or similar) configured
- [ ] Uptime monitoring on production URL
- [ ] Database query monitoring (Neon dashboard)
- [ ] WhatsApp API usage tracked (Meta dashboard)
- [ ] Gemini API usage tracked (Google Cloud)
- [ ] Log aggregation configured for production

### Final Sign-Off
- [ ] All checklist items marked `[x]`
- [ ] No known critical bugs
- [ ] Stakeholder has reviewed and approved
- [ ] Rollback plan documented (how to revert to previous version)
- [ ] On-call runbook ready (who to contact, how to debug)