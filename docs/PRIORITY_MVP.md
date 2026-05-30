# BalasBro.ai — MVP Finishing Priority

> Generated: 2026-05-28
> Based on: `docs/checklist-full.md` + `PAGES.md` audit
> Current progress: ~35-40% to MVP

---

## PRIORITY 1 — Blockers (~84 items)
*App won't work without these. No point testing or deploying until these are done.*

### 1A: Auth Pages (stub → real)
| Page | Items | Description |
|------|-------|-------------|
| `/login` | 7 | Form, validation, error handling, loading state, redirect |
| `/register` | 5 | Form, validation, auto-login on success, redirect |
| `/verify-mfa` | 4 | TOTP 6-digit input, auto-submit, verify flow |
| `/forgot-password` | 2 | Email form → sends reset link |
| `/reset-password` | 2 | New password form with token in URL |

### 1B: Core App Pages (stub → real)
| Page | Items | Description |
|------|-------|-------------|
| `/dashboard` | 13 | KPI cards (5), metrics API wiring via SWR, quick actions |
| `/conversations` | 8 | List with search/filter, chat panel, empty state |
| `/conversations/[id]` | 10 | Full chat, message bubbles (INBOUND/OUTBOUND), intent badges, reply box, 5s polling |
| `/customers` | 11 | Split list/detail, search, tabs (Percakapan/Pesanan) |
| `/customers/[id]` | 6 | Full page, breadcrumb, header, same tabs |
| `/orders` | 8 | Stats row, filter bar, table, preview panel, add order button |
| `/orders/[id]` | 9 | Full detail, payment status buttons (4), notes, AI insights, timeline |

### 1C: Feature Components (stub → real)
| Component | Items | File |
|-----------|-------|------|
| `KPICard` | 5 | `components/dashboard/kpi-card.tsx` |
| `BulkMessageModal` | 12 | `components/dashboard/bulk-message-modal.tsx` |
| `DashboardQuickActions` | 2 | `components/dashboard/quick-actions.tsx` |
| `ActivityFeed` | 3 | `components/shared/activity-feed.tsx` |
| `ChatPanel` | 18 | `components/conversation/chat-panel.tsx` |
| `AIReplyPanel` | 6 | `components/conversation/ai-reply-panel.tsx` |
| `ConversationListItem` | 9 | `components/conversation/list-item.tsx` |
| `OrderListItem` | 7 | `components/order/list-item.tsx` |
| `OrderDetailPanel` | 10 | `components/order/detail-panel.tsx` |
| `AddOrderModal` | 11 | `components/order/add-order-modal.tsx` |
| `CustomerListItem` | 7 | `components/customer/list-item.tsx` |
| `CustomerDetailPanel` | 7 | `components/customer/detail-panel.tsx` |
| `MFASetupCard` | 8 | `components/settings/mfa-setup-card.tsx` |
| `WhatsAppStatus` | 9 | `components/settings/whatsapp-status.tsx` |
| `AIConfigCard` | 10 | `components/settings/ai-config-card.tsx` |
| `EscalationRulesList` | 11 | `components/settings/escalation-rules-list.tsx` |
| `TeamMemberRow` | 6 | `components/settings/team-member-row.tsx` |

### 1D: Backend Gaps (block full functionality)
| Item | Status | Notes |
|------|--------|-------|
| `POST /api/auth/register` depends on missing lib files | ❌ Missing | 1 item |
| Login rate limiting | ❌ Missing | 1 item |
| Auto-login after registration | ❌ Missing | 1 item |
| After MFA enabled, login requires TOTP code | ❌ Missing | 1 item |
| `/api/cron/ai-insight` | ❌ Missing | 1 item |
| `/api/cron/follow-up` | ❌ Missing | 1 item |
| Rate limit headers on messages/customers/tenant routes | ❌ Missing | 1 item |
| `npx prisma migrate dev` not run | ❌ Missing | 1 item |
| Daily recap generation | ❌ Missing | 5 items |

---

## PRIORITY 2 — Security + RBAC (~28 items)
*Do these in parallel with P1 or right after completing P1.*

| Area | Items | Description |
|------|-------|-------------|
| Role definitions | 12 | `owner`, `admin`, `member` — UI hides features, API returns 403 |
| Authorization scope | 2 | Every route checks `businessId`, users can't access other businesses |
| Session validation | 2 | Server-side only, CSRF on state-changing endpoints |
| Session management | 3 | "Log out all devices", active sessions list, invalidation on password change |
| Password flows | 4 | Change password, forgot password with email, reset token single-use + 1hr expiry |
| MFA login flow | 1 | After MFA enabled, login requires TOTP |

---

## PRIORITY 3 — SWR + Forms + Data Fetching (~48 items)
*Wire up all data fetching and form validation.*

| Area | Items | Description |
|------|-------|-------------|
| SWR config | 6 | Global config, refreshInterval per route (5s messages, 30s dashboard), revalidateOnFocus/Reconnect, error retry |
| SWR mutations | 4 | Mutate on send/create/update for messages, orders, customers, settings |
| Dashboard refresh | 1 | Manual refresh button |
| Loading states | 3 | Skeletons (not spinners), no skeleton on polling, optimistic updates |
| Error handling | 6 | 401/403/404/429/500 user-friendly messages |
| Login form | 6 | email required, password min 8, submit disabled when invalid, error, loading |
| Registration form | 6 | name, email, password, business name, all validated on blur + submit |
| Add order modal | 7 | customer select, amount, type, payment status, items JSON, description |
| AI config form | 4 | tone required, working hours start < end, SOP max 5000, fallback max 1000 |
| Escalation rule form | 4 | name max 100, type required, keywords conditional, min value conditional |
| Team invite form | 3 | name required, email format, role select |
| Bulk message form | 3 | at least 1 recipient, message max 1000, warning at 900+ |

---

## PRIORITY 4 — Dev Setup + Testing (~35 items)
*Only start after P1 is mostly done.*

### Dev Environment
| Item | Description |
|------|-------------|
| `.env.local` | All required env vars for local dev |
| `npm run build` | Must succeed with no errors |
| `npx tsc --noEmit` | Must pass with no errors |
| Prisma migrate | `npx prisma migrate dev` must run |
| Prisma generate | `npx prisma generate` must run |
| WhatsApp dev webhook | ngrok tunnel for local webhook testing |

### Testing
| Type | Items | Description |
|------|-------|-------------|
| Frontend component tests | 6 | Render, validation, click, loading, error, empty states |
| Backend API tests | 14 | Auth flows, scoping, CRUD, webhook HMAC, AI classify, rate limit, Zod validation |
| E2E (Playwright) | 4 | Login flow, send message, create order, save settings |

---

## PRIORITY 5 — Deploy + Pre-Launch QA (~19 items)
*Only start after everything above is verified.*

### Deploy Checklist
| Item | Description |
|------|-------------|
| `vercel.json` configured | Build command, output dir, install command |
| All env vars set | DATABASE_URL, NEXTAUTH_SECRET, GEMINI_API_KEY, UPSTASH_*, WHATSAPP_* |
| Prisma generate for production | Build-time |
| WhatsApp webhook URL updated | Production domain |
| WhatsApp app approved | Meta status: "In Review" → approved |

### Pre-Launch QA
| Area | Items | Tests |
|------|-------|-------|
| Auth | 2 | Login + registration work on first try |
| WhatsApp E2E | 8 | Send, receive, auto-reply, AI classify, order extraction, escalation, bulk send |
| UI updates | 4 | Payment status, notes, customer counts, AI deflection rate |
| Edge cases | 7 | Webhook retry dedup, empty AI response, WA API limits, Gemini errors, no-name phone, ID manipulation, forged HMAC |

---

## Progress Summary

| Priority | Items | Running Total | % of Total |
|----------|-------|---------------|------------|
| P1 — Blockers | ~84 | ~84 | 41% → 62% |
| P2 — Security | ~28 | ~112 | 62% → 76% |
| P3 — Data + Forms | ~48 | ~160 | 76% → 100% |
| P4 — Dev + Testing | ~35 | ~195 | — |
| P5 — Deploy + QA | ~19 | ~214 | — |

**Total checklist items: 584 done / 214 remaining**

---

## Execution Order (P1 First)

1. `/login` page — auth entry point, everything depends on this
2. `/register` page — new user signup
3. `/verify-mfa` page — MFA flow after login
4. `/dashboard` — entry point after login
5. `/conversations` + `ChatPanel` — core daily use
6. `/orders` + `AddOrderModal` — business operations
7. `/customers` + `CustomerDetailPanel` — customer management
8. Settings pages (`/settings/security`, `/settings/ai`, `/settings/channels`, `/settings/team`, `/settings/escalation`)
9. Remaining components in parallel
10. Backend gap fixes
11. P2 → P3 → P4 → P5