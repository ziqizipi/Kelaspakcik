# WAIB Frontend Pages — Design Specification

## Context

WAIB is a multi-tenant SaaS platform providing AI-powered WhatsApp business management for Indonesian MSMEs. The backend API is already implemented (NextAuth + MFA, AI classification/reply/escalation, WhatsApp webhook, order extraction, cron jobs). The frontend needs to be built from scratch.

## Design Decisions

| Decision | Choice |
|----------|--------|
| Multi-tenancy model | Tenant-scoped (tenant ID from session, no manual filter) |
| Conversations | Tenant-scoped automatically |
| AI Reply UX | Separate "AI Reply" side panel (not inline bubbles) |
| Orders list | Rich list with product thumbnails + quick actions + side preview |
| Order detail | AI sentiment/priority tags + recommended next actions |
| Onboarding | Guided wizard: Business Name → WhatsApp Connect → Invite Team → Done |
| MFA | TOTP (authenticator app) + Recovery Codes |
| Dashboard | Activity feed (live WhatsApp messages, order updates, team activity) |
| App shell | Collapsible left sidebar + bottom tab bar on mobile |

---

## Pages to Build

### Public Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page (marketing, current placeholder) |
| `/login` | NextAuth sign-in page |
| `/register` | Guided onboarding wizard (4 steps) |

### App Shell (authenticated)

| Route | Description |
|-------|-------------|
| `/dashboard` | Activity feed: live messages, orders, team events |
| `/conversations` | Paginated conversation list, tenant-scoped |
| `/conversations/[id]` | Chat view + AI Reply side panel |
| `/orders` | Rich order list with thumbnails and quick actions |
| `/orders/[id]` | Order detail with AI tags and recommended actions |
| `/settings` | Business profile, billing, team management |
| `/settings/security` | MFA setup (TOTP + recovery codes) |
| `/settings/channels` | WhatsApp phone number connection status |

---

## App Shell Layout

- **Left sidebar**: icon + label, collapsible to icon-only on smaller screens
- **Mobile**: bottom tab bar replacing sidebar (Dashboard, Conversations, Orders, Settings)
- **Top bar**: tenant/business name on left, user avatar + logout on right
- **Sidebar sections**:
  - Dashboard
  - Conversations
  - Orders
  - Settings (with sub-items: General, Security, Channels, Team, Billing)

---

## Backend Wiring Per Page

### `/login`
- Provider: NextAuth (credentials or WhatsApp OTP)
- Wire to: `/api/auth/[...nextauth]`

### `/register`
- Step 1 — Business info: name, email, password → `POST /api/auth/[...nextauth]` (signup)
- Step 2 — WhatsApp connect: phone number → verify via OTP → store in tenant settings
- Step 3 — Invite team: email invites → `POST /api/team` (new endpoint)
- Step 4 — Done → redirect to `/dashboard`

### `/dashboard`
- Wire to: `GET /api/metrics` → KPI cards
- Wire to: `GET /api/conversations?limit=10&sort=createdAt:desc` → activity feed
- Wire to: `GET /api/orders?limit=10&sort=createdAt:desc` → recent orders

### `/conversations`
- Wire to: `GET /api/conversations?tenantId=<session>&page=&limit=`
- Wire to: `GET /api/conversations/[id]/messages` (on detail open)
- Real-time: polling every 10s or WebSocket

### `/conversations/[id]`
- Wire to: `GET /api/conversations/[id]`
- Wire to: `GET /api/messages?conversationId=[id]`
- AI Reply panel: `POST /api/ai/reply` → show suggestion in side panel
- Agent can edit + send: `POST /api/messages` with `sender: "agent"`
- Escalate: `POST /api/conversations/[id]/escalate`

### `/orders`
- Wire to: `GET /api/orders?tenantId=<session>&page=&limit=`
- Quick actions: `PATCH /api/orders/[id]` (refund, mark_shipped)
- Preview panel: `GET /api/orders/[id]` on row click

### `/orders/[id]`
- Wire to: `GET /api/orders/[id]`
- AI tags: from `POST /api/ai/classify` (already attached to order object)
- Recommended actions: from `POST /api/ai/escalate` (returned as suggestions)

### `/settings`
- Wire to: `GET /api/tenant` and `PATCH /api/tenant` (new or existing endpoints)
- Sections: General, Security, Channels, Team, Billing

### `/settings/security`
- Wire to: `POST /api/auth/mfa/setup` → QR code for TOTP
- Wire to: `POST /api/auth/mfa/verify` → activate MFA
- Wire to: `POST /api/auth/mfa/disable` → deactivate MFA
- Display: recovery codes on setup completion

### `/settings/channels`
- Wire to: `GET /api/webhook/wa/status` (new endpoint)
- Wire to: `POST /api/webhook/wa/connect` → initiate WhatsApp OTP verification
- Display: connected phone number, connection status, test message button

---

## Pending API Endpoints Needed

These endpoints don't exist yet and need to be created alongside the frontend:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tenant` | GET/PATCH | Get/update tenant business info |
| `/api/tenant/team` | GET/POST/DELETE | List/invite/remove team members |
| `/api/orders/[id]` | GET/PATCH | Get order detail, update status |
| `/api/webhook/wa/status` | GET | Check WhatsApp connection status |
| `/api/webhook/wa/connect` | POST | Initiate WhatsApp phone verification |
| `/api/auth/signup` | POST | Handle new business registration |
| `/api/conversations/[id]/messages` | GET | Get messages for a conversation |
| `/api/messages` | POST | Send a message (agent or AI approved) |

---

## Component Inventory

### Shell Components
- `AppShell` — layout wrapper with sidebar + top bar
- `Sidebar` — collapsible nav with icons + labels
- `BottomTabBar` — mobile-only tab navigation
- `TopBar` — tenant name + user menu

### Shared Components
- `ConversationListItem` — avatar, name, last message preview, timestamp, unread badge
- `OrderListItem` — thumbnail, customer name, order ID, total, status badge, date
- `OrderPreviewPanel` — slide-in panel showing order summary on list row click
- `AIReplyPanel` — side panel showing AI-generated reply with edit + send buttons
- `ActivityFeedItem` — icon + description + timestamp for live activity
- `MFASetupCard` — QR code, TOTP input, recovery codes display
- `WhatsAppStatusBadge` — connected / pending / disconnected indicator

### UI Components (existing, use from `components/ui/`)
- `button`, `input`, `card`, `badge`, `dialog`, `dropdown-menu`, `label`, `separator`, `skeleton`, `table`, `sonner`

---

## Scope for First Implementation

The first implementation pass should build:

1. **App Shell** — Sidebar + TopBar + BottomTabBar + route protection
2. **Login + Register** — Auth pages + onboarding wizard
3. **Dashboard** — Activity feed
4. **Conversations** — List + Detail with AI Reply panel
5. **Orders** — Rich list + Order detail with AI tags/actions
6. **Settings** — General + Security (MFA) + WhatsApp Channels

Billing settings can be deferred (stub page).