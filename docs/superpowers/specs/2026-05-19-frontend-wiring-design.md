# Frontend-Backend Wiring Spec

**Date:** 2026-05-19
**Status:** Approved

## Overview

Wire the existing backend APIs to frontend pages, starting with conversations (the core view) and creating placeholders for other pages.

## Route Structure

```
app/
├── (auth)/
│   ├── login/page.tsx         # NextAuth sign-in
│   └── layout.tsx
├── (dashboard)/
│   ├── conversations/
│   │   ├── page.tsx           # List all conversations
│   │   └── [id]/page.tsx      # Thread + reply
│   ├── orders/page.tsx        # Placeholder
│   ├── customers/page.tsx    # Placeholder
│   ├── page.tsx               # Dashboard home
│   └── layout.tsx             # Sidebar + header shell
└── page.tsx                   # Redirect to dashboard or login
```

## API Endpoints to Wire

| Page | Method | Endpoint | Auth |
|------|--------|----------|------|
| Conversations list | GET | `/api/conversations` | Required |
| Conversation thread | GET | `/api/messages?conversationId=X` | Required |
| Send message | POST | `/api/messages` | Required |
| Dashboard stats | GET | `/api/metrics` | Required |
| Orders list | GET | `/api/orders` | Required |

## Component Inventory

| Component | Type | Purpose |
|-----------|------|---------|
| `DashboardShell` | layout | Sidebar nav + header |
| `ConversationList` | client | Fetch + display conversations |
| `ConversationThread` | client | Fetch + display messages |
| `MessageBubble` | component | Single message display |
| `OrderTable` | client | Orders list (placeholder) |
| `StatsCards` | client | Dashboard KPIs |

## Data Flow

1. User hits `/conversations` → middleware checks auth → redirects to `/login` if none
2. `ConversationList` fetches `GET /api/conversations` with session cookie
3. User clicks conversation → `ConversationThread` fetches messages
4. User replies → `POST /api/messages` → optimistic update

## Error Handling

- 401 → Redirect to login
- 429 → Show "Too many requests" toast
- 500 → Show error state with retry

## Placeholder Pages

- `/orders` — Shows "Coming soon" with mock order table
- `/customers` — Shows "Coming soon" with mock customer list

## Implementation Order

1. Auth layout + login page
2. Dashboard shell (sidebar, header, layout)
3. Conversations list + detail pages
4. Placeholder pages (orders, customers)
5. Dashboard home with stats