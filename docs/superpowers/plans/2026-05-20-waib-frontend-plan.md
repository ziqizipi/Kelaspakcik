# WAIB Frontend + Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build all frontend pages and missing backend endpoints for the WAIB multi-tenant WhatsApp SaaS platform.

**Architecture:**
- **Frontend**: Next.js App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui components
- **State**: React Context + SWR for data fetching, no Redux
- **Auth**: NextAuth.js v5 with credentials provider + MFA
- **Backend**: Next.js Route Handlers (existing) + missing ones to be created
- **Multi-tenancy**: Tenant-scoped via `session.user.businessId`

**Tech Stack:** Next.js 15 (App Router), NextAuth v5, Prisma, SWR, Tailwind, shadcn/ui

---

## File Map

### New API Routes to Create
| File | Method | Purpose |
|------|--------|---------|
| `app/api/tenant/route.ts` | GET, PATCH | Get/update business info |
| `app/api/tenant/team/route.ts` | GET, POST | List/invite team members |
| `app/api/tenant/team/[userId]/route.ts` | DELETE | Remove team member |
| `app/api/orders/[id]/route.ts` | GET, PATCH | Order detail + status update |
| `app/api/conversations/[id]/messages/route.ts` | GET | Messages for a conversation |
| `app/api/messages/route.ts` | POST | Send a message |
| `app/api/auth/signup/route.ts` | POST | New business registration |
| `app/api/webhook/wa/status/route.ts` | GET | WhatsApp connection status |
| `app/api/webhook/wa/connect/route.ts` | POST | Initiate WhatsApp phone verification |

### New frontend pages
| File | Route |
|------|-------|
| `app/(auth)/login/page.tsx` | `/login` |
| `app/(auth)/register/page.tsx` | `/register` |
| `app/(auth)/layout.tsx` | Auth group layout |
| `app/(app)/layout.tsx` | App shell layout |
| `app/(app)/dashboard/page.tsx` | `/dashboard` |
| `app/(app)/conversations/page.tsx` | `/conversations` |
| `app/(app)/conversations/[id]/page.tsx` | `/conversations/[id]` |
| `app/(app)/orders/page.tsx` | `/orders` |
| `app/(app)/orders/[id]/page.tsx` | `/orders/[id]` |
| `app/(app)/settings/page.tsx` | `/settings` |
| `app/(app)/settings/security/page.tsx` | `/settings/security` |
| `app/(app)/settings/channels/page.tsx` | `/settings/channels` |
| `app/(app)/settings/team/page.tsx` | `/settings/team` |
| `app/(app)/settings/billing/page.tsx` | `/settings/billing` |

### New shared components
| File | Purpose |
|------|---------|
| `components/layout/sidebar.tsx` | Collapsible sidebar nav |
| `components/layout/bottom-tab-bar.tsx` | Mobile bottom tabs |
| `components/layout/top-bar.tsx` | Tenant name + user menu |
| `components/layout/app-shell.tsx` | Shell wrapper |
| `components/conversation/list-item.tsx` | Conv. list row |
| `components/conversation/chat-panel.tsx` | Chat messages view |
| `components/conversation/ai-reply-panel.tsx` | AI reply side panel |
| `components/order/list-item.tsx` | Order list row with thumbnail |
| `components/order/preview-panel.tsx` | Slide-in order preview |
| `components/order/detail-panel.tsx` | Order detail with AI tags |
| `components/settings/mfa-setup-card.tsx` | TOTP QR + recovery codes |
| `components/settings/whatsapp-status.tsx` | WA connection status |
| `components/shared/activity-feed.tsx` | Live activity feed |

---

## Task Breakdown

### Task 1: Missing API Endpoints (Backend)

**Files:**
- Create: `app/api/tenant/route.ts`
- Create: `app/api/tenant/team/route.ts`
- Create: `app/api/tenant/team/[userId]/route.ts`
- Create: `app/api/orders/[id]/route.ts`
- Create: `app/api/conversations/[id]/messages/route.ts`
- Create: `app/api/messages/route.ts`
- Create: `app/api/auth/signup/route.ts`
- Create: `app/api/webhook/wa/status/route.ts`
- Create: `app/api/webhook/wa/connect/route.ts`

- [ ] **Step 1: Create `/api/tenant` route (GET/PATCH)**

```typescript
// app/api/tenant/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const businessId = (session.user as { businessId?: string }).businessId || ""
  const business = await prisma.business.findUnique({ where: { id: businessId } })
  return NextResponse.json({ business })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const businessId = (session.user as { businessId?: string }).businessId || ""
  const body = await req.json()
  const { name, industry, address, phone } = body
  const business = await prisma.business.update({
    where: { id: businessId },
    data: { name, industry, address, phone }
  })
  return NextResponse.json({ business })
}
```

- [ ] **Step 2: Create `/api/tenant/team` route (GET/POST)**

```typescript
// app/api/tenant/team/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const inviteSchema = z.object({ email: z.string().email(), name: z.string(), role: z.string().default("staff") })

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const businessId = (session.user as { businessId?: string }).businessId || ""
  const users = await prisma.user.findMany({ where: { businessId }, select: { id: true, email: true, name: true, role: true, createdAt: true } })
  return NextResponse.json({ users })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const businessId = (session.user as { businessId?: string }).businessId || ""
  const body = await req.json()
  const { email, name, role } = inviteSchema.parse(body)
  const bcrypt = require("bcryptjs")
  const tempPassword = Math.random().toString(36).slice(-8)
  const hashedPassword = await bcrypt.hash(tempPassword, 10)
  const user = await prisma.user.create({ data: { email, name, role, businessId, password: hashedPassword } })
  return NextResponse.json({ user, tempPassword }, { status: 201 })
}
```

- [ ] **Step 3: Create `/api/tenant/team/[userId]` route (DELETE)**

```typescript
// app/api/tenant/team/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const businessId = (session.user as { businessId?: string }).businessId || ""
  const targetUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!targetUser || targetUser.businessId !== businessId) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (targetUser.role === "owner") return NextResponse.json({ error: "Cannot remove owner" }, { status: 403 })
  await prisma.user.delete({ where: { id: userId } })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 4: Create `/api/orders/[id]` route (GET/PATCH)**

```typescript
// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const businessId = (session.user as { businessId?: string }).businessId || ""
  const order = await prisma.order.findFirst({ where: { id, businessId }, include: { customer: true, conversation: { include: { messages: true } } } })
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ order })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const businessId = (session.user as { businessId?: string }).businessId || ""
  const body = await req.json()
  const { paymentStatus, description } = body
  const order = await prisma.order.update({ where: { id, businessId }, data: { paymentStatus, description } })
  return NextResponse.json({ order })
}
```

- [ ] **Step 5: Create `/api/conversations/[id]/messages` route (GET)**

```typescript
// app/api/conversations/[id]/messages/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const businessId = (session.user as { businessId?: string }).businessId || ""
  const conversation = await prisma.conversation.findFirst({ where: { id, businessId } })
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const messages = await prisma.message.findMany({ where: { conversationId: id }, orderBy: { createdAt: "asc" } })
  return NextResponse.json({ messages })
}
```

- [ ] **Step 6: Create `/api/messages` route (POST)**

```typescript
// app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const { conversationId, content, direction = "OUTBOUND" } = body
  const userId = (session.user as { id?: string }).id || ""
  const conversation = await prisma.conversation.findFirst({ where: { id: conversationId } })
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const message = await prisma.message.create({
    data: { conversationId, content, direction, repliedBy: direction === "OUTBOUND" ? userId : null }
  })
  await prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } })
  return NextResponse.json({ message }, { status: 201 })
}
```

- [ ] **Step 7: Create `/api/auth/signup` route (POST)**

```typescript
// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const signupSchema = z.object({ businessName: z.string(), email: z.string().email(), password: z.string().min(8) })

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { businessName, email, password } = signupSchema.parse(body)
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 })
  const hashedPassword = await bcrypt.hash(password, 10)
  const business = await prisma.business.create({ data: { name: businessName } })
  const user = await prisma.user.create({ data: { email, password: hashedPassword, name: businessName, role: "owner", businessId: business.id } })
  return NextResponse.json({ userId: user.id, businessId: business.id }, { status: 201 })
}
```

- [ ] **Step 8: Create `/api/webhook/wa/status` route (GET)**

```typescript
// app/api/webhook/wa/status/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const businessId = (session.user as { businessId?: string }).businessId || ""
  const accounts = await prisma.whatsAppAccount.findMany({ where: { businessId }, select: { id: true, phoneNumberId: true, businessName: true, isActive: true, createdAt: true } })
  return NextResponse.json({ accounts })
}
```

- [ ] **Step 9: Create `/api/webhook/wa/connect` route (POST)**

```typescript
// app/api/webhook/wa/connect/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const businessId = (session.user as { businessId?: string }).businessId || ""
  const body = await req.json()
  const { phoneNumberId, waBusinessAcct, accessToken } = body
  const account = await prisma.whatsAppAccount.create({ data: { phoneNumberId, waBusinessAcct, accessToken, businessId, businessName: "", webhookVerifyToken: crypto.randomUUID() } })
  return NextResponse.json({ account }, { status: 201 })
}
```

- [ ] **Step 10: Commit**

```bash
git add app/api/tenant app/api/orders app/api/conversations app/api/messages app/api/auth/signup app/api/webhook/wa
git commit -m "feat: add missing API endpoints for frontend wiring"
```

---

### Task 2: App Shell Layout

**Files:**
- Create: `components/layout/app-shell.tsx`
- Create: `components/layout/sidebar.tsx`
- Create: `components/layout/bottom-tab-bar.tsx`
- Create: `components/layout/top-bar.tsx`
- Create: `app/(app)/layout.tsx`

- [ ] **Step 1: Create sidebar component**

```tsx
// components/layout/sidebar.tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, MessageSquare, ShoppingCart, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  return (
    <aside className={cn("flex flex-col border-r bg-card transition-all duration-300", collapsed ? "w-16" : "w-56")}>
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && <span className="font-semibold text-sm">WAIB</span>}
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", pathname === href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>
      <button onClick={() => setCollapsed(!collapsed)} className="flex h-10 items-center justify-center border-t text-muted-foreground hover:text-foreground">
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  )
}
```

- [ ] **Step 2: Create bottom tab bar for mobile**

```tsx
// components/layout/bottom-tab-bar.tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MessageSquare, ShoppingCart, Settings } from "lucide-react"

const tabs = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/conversations", label: "Chat", icon: MessageSquare },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function BottomTabBar() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex border-t bg-card md:hidden">
      {tabs.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className={`flex flex-1 flex-col items-center py-2 text-xs ${pathname === href ? "text-primary" : "text-muted-foreground"}`}>
          <Icon className="h-5 w-5 mb-1" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
```

- [ ] **Step 3: Create top bar**

```tsx
// components/layout/top-bar.tsx
"use client"
import { signOut } from "next-auth/react"
import { User, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function TopBar({ tenantName }: { tenantName?: string }) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      <span className="text-sm font-medium">{tenantName || "Business"}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
```

- [ ] **Step 4: Create app shell wrapper component**

```tsx
// components/layout/app-shell.tsx
import { Sidebar } from "./sidebar"
import { TopBar } from "./top-bar"
import { BottomTabBar } from "./bottom-tab-bar"

export function AppShell({ children, tenantName }: { children: React.ReactNode; tenantName?: string }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar tenantName={tenantName} />
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <BottomTabBar />
    </div>
  )
}
```

- [ ] **Step 5: Create app shell layout**

```tsx
// app/(app)/layout.tsx
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AppShell } from "@/components/layout/app-shell"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")
  const tenantName = (session.user as { businessName?: string }).businessName || ""
  return (
    <AppShell tenantName={tenantName}>
      {children}
    </AppShell>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add components/layout app/\(app\)/layout.tsx
git commit -m "feat: add app shell layout with sidebar and top bar"
```

---

### Task 3: Auth Pages (Login + Register)

**Files:**
- Create: `app/(auth)/layout.tsx`
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/register/page.tsx`

- [ ] **Step 1: Create auth layout**

```tsx
// app/(auth)/layout.tsx
import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session) redirect("/dashboard")
  return <div className="flex min-h-screen items-center justify-center bg-background">{children}</div>
}
```

- [ ] **Step 2: Create login page**

```tsx
// app/(auth)/login/page.tsx
"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const result = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (result?.error) {
      setError("Invalid email or password")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Access your WAIB dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Create register page (onboarding wizard)**

```tsx
// app/(auth)/register/page.tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

type Step = 1 | 2 | 3 | 4

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState({ businessName: "", email: "", password: "", phoneNumberId: "", waBusinessAcct: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/auth/signup", { method: "POST", body: JSON.stringify({ businessName: form.businessName, email: form.email, password: form.password }) })
    setLoading(false)
    if (!res.ok) { setError("Registration failed"); return }
    setStep(2)
  }

  async function handleWhatsAppConnect(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/webhook/wa/connect", { method: "POST", body: JSON.stringify({ phoneNumberId: form.phoneNumberId, waBusinessAcct: form.waBusinessAcct, accessToken: "pending" }) })
    setLoading(false)
    if (res.ok) setStep(3)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {step === 1 && "Create Your Business Account"}
          {step === 2 && "Connect WhatsApp"}
          {step === 3 && "Invite Your Team"}
          {step === 4 && "You're All Set!"}
        </CardTitle>
        <CardDescription>
          {step === 1 && "Step 1 of 4"}
          {step === 2 && "Step 2 of 4"}
          {step === 3 && "Step 3 of 4"}
          {step === 4 && "Step 4 of 4"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label>Business Name</Label>
              <Input value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Next"}</Button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleWhatsAppConnect} className="space-y-4">
            <div>
              <Label>WhatsApp Phone Number ID</Label>
              <Input value={form.phoneNumberId} onChange={e => setForm({ ...form, phoneNumberId: e.target.value })} required />
            </div>
            <div>
              <Label>WhatsApp Business Account ID</Label>
              <Input value={form.waBusinessAcct} onChange={e => setForm({ ...form, waBusinessAcct: e.target.value })} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Connecting..." : "Next"}</Button>
          </form>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Team invites can be sent from the Settings page after registration.</p>
            <Button onClick={() => setStep(4)} className="w-full">Skip for Now</Button>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground">Your WAIB workspace is ready. Welcome aboard!</p>
            <Button onClick={() => router.push("/login")} className="w-full">Go to Sign In</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/\(auth\)/layout.tsx app/\(auth\)/login app/\(auth\)/register
git commit -m "feat: add login and register (onboarding wizard) pages"
```

---

### Task 4: Dashboard Page

**Files:**
- Create: `components/shared/activity-feed.tsx`
- Create: `app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Create activity feed component**

```tsx
// components/shared/activity-feed.tsx
"use client"
import { MessageSquare, ShoppingCart, UserPlus } from "lucide-react"

type ActivityItem = {
  id: string
  type: "message" | "order" | "customer"
  description: string
  timestamp: string
}

const iconMap = { message: MessageSquare, order: ShoppingCart, customer: UserPlus }

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="space-y-3">
      {items.map(item => {
        const Icon = iconMap[item.type]
        return (
          <div key={item.id} className="flex items-start gap-3 text-sm">
            <div className="mt-0.5 rounded-full bg-muted p-1.5"><Icon className="h-3 w-3" /></div>
            <div className="flex-1">
              <p className="text-foreground">{item.description}</p>
              <p className="text-xs text-muted-foreground">{item.timestamp}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Create dashboard page**

```tsx
// app/(app)/dashboard/page.tsx
"use client"
import useSWR from "swr"
import { ActivityFeed } from "@/components/shared/activity-feed"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function DashboardPage() {
  const { data: metrics } = useSWR("/api/metrics", fetcher)
  const { data: conversations } = useSWR("/api/conversations?limit=10", fetcher)
  const { data: orders } = useSWR("/api/orders?limit=10", fetcher)

  const activityItems = [
    ...(conversations?.conversations || []).slice(0, 5).map((c: any) => ({ id: c.id, type: "message" as const, description: `New conversation with ${c.customer?.name || c.customer?.phone}`, timestamp: new Date(c.lastMessageAt).toLocaleString() })),
    ...(orders?.orders || []).slice(0, 5).map((o: any) => ({ id: o.id, type: "order" as const, description: `Order #${o.id.slice(-6)} — ${o.type} Rp${Number(o.amount).toLocaleString()}`, timestamp: new Date(o.createdAt).toLocaleString() })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{metrics?.totalOrders ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Revenue</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">Rp{(metrics?.totalRevenue ?? 0).toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open Conversations</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{metrics?.openConversations ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">AI Deflection</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{metrics?.aiDeflectionRate ?? "—"}%</p></CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Activity Feed</CardTitle></CardHeader>
        <CardContent>
          {activityItems.length === 0 ? <p className="text-sm text-muted-foreground">No recent activity</p> : <ActivityFeed items={activityItems} />}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/dashboard components/shared/activity-feed.tsx
git commit -m "feat: add dashboard with KPI cards and activity feed"
```

---

### Task 5: Conversations List + Detail

**Files:**
- Create: `components/conversation/list-item.tsx`
- Create: `components/conversation/chat-panel.tsx`
- Create: `components/conversation/ai-reply-panel.tsx`
- Create: `app/(app)/conversations/page.tsx`
- Create: `app/(app)/conversations/[id]/page.tsx`

- [ ] **Step 1: Create conversation list item component**

```tsx
// components/conversation/list-item.tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function ConversationListItem({ conversation, isActive }: { conversation: any; isActive?: boolean }) {
  const customer = conversation.customer
  return (
    <div className={`flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer ${isActive ? "bg-primary/10" : "hover:bg-muted"}`}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">{(customer?.name || customer?.phone || "?").slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-medium">{customer?.name || customer?.phone || "Unknown"}</p>
          <span className="text-xs text-muted-foreground">{conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleDateString() : ""}</span>
        </div>
        <p className="truncate text-xs text-muted-foreground">{conversation._count?.messages || 0} messages · {conversation.status}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create AI reply panel component**

```tsx
// components/conversation/ai-reply-panel.tsx
"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/input"
import { Send, Sparkles } from "lucide-react"

export function AIReplyPanel({ conversationId, onSend }: { conversationId: string; onSend: (content: string) => void }) {
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(false)

  async function requestAIReply() {
    setLoading(true)
    const res = await fetch("/api/ai/reply", { method: "POST", body: JSON.stringify({ conversationId, message: "Suggest a reply" }) })
    const data = await res.json()
    setReply(data.reply || "")
    setLoading(false)
  }

  function handleSend() {
    if (!reply.trim()) return
    onSend(reply)
    setReply("")
  }

  return (
    <div className="flex flex-col border-l h-full">
      <div className="border-b px-4 py-2 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">AI Reply</span>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <Button onClick={requestAIReply} variant="outline" className="w-full" disabled={loading}>
          {loading ? "Generating..." : "Generate Reply"}
        </Button>
        <Textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="AI-generated reply will appear here..." className="min-h-[120px]" />
        <Button onClick={handleSend} className="w-full" disabled={!reply.trim()}>
          <Send className="mr-2 h-4 w-4" />
          Send Reply
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create chat panel component**

```tsx
// components/conversation/chat-panel.tsx
"use client"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function ChatPanel({ conversationId }: { conversationId: string }) {
  const { data } = useSWR(conversationId ? `/api/conversations/${conversationId}/messages` : null, fetcher)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => { if (data?.messages) setMessages(data.messages) }, [data])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim()) return
    const res = await fetch("/api/messages", { method: "POST", body: JSON.stringify({ conversationId, content: newMessage, direction: "OUTBOUND" }) })
    const data = await res.json()
    if (data.message) setMessages(prev => [...prev, data.message])
    setNewMessage("")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto space-y-3 p-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${msg.direction === "OUTBOUND" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 border-t p-4">
        <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1" />
        <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Create conversations list page**

```tsx
// app/(app)/conversations/page.tsx
"use client"
import useSWR from "swr"
import { ConversationListItem } from "@/components/conversation/list-item"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ConversationsPage() {
  const { data, isLoading } = useSWR("/api/conversations", fetcher)
  return (
    <div className="flex h-full">
      <div className="w-80 border-r overflow-auto">
        <div className="p-4"><h1 className="text-lg font-semibold">Conversations</h1></div>
        <div className="space-y-1 px-2">
          {isLoading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />) : (data?.conversations || []).map(c => <ConversationListItem key={c.id} conversation={c} />)}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Select a conversation to view messages</div>
    </div>
  )
}
```

- [ ] **Step 5: Create conversation detail page**

```tsx
// app/(app)/conversations/[id]/page.tsx
"use client"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { ChatPanel } from "@/components/conversation/chat-panel"
import { AIReplyPanel } from "@/components/conversation/ai-reply-panel"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ConversationDetailPage() {
  const { id } = useParams()
  const { data: conversation } = useSWR(id ? `/api/conversations/${id}` : null, fetcher)

  async function handleSend(content: string) {
    await fetch("/api/messages", { method: "POST", body: JSON.stringify({ conversationId: id, content, direction: "OUTBOUND" }) })
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 border-r">
        <div className="border-b px-4 py-2 flex items-center gap-2">
          <span className="font-medium">{conversation?.customer?.name || conversation?.customer?.phone || "..."}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${conversation?.status === "open" ? "bg-green-100 text-green-700" : "bg-muted"}`}>{conversation?.status}</span>
        </div>
        {conversation ? <ChatPanel conversationId={id as string} /> : <Skeleton className="m-4 h-96" />}
      </div>
      <div className="w-80">
        <AIReplyPanel conversationId={id as string} onSend={handleSend} />
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add components/conversation app/\(app\)/conversations
git commit -m "feat: add conversations list and detail pages with AI reply panel"
```

---

### Task 6: Orders List + Detail

**Files:**
- Create: `components/order/list-item.tsx`
- Create: `components/order/preview-panel.tsx`
- Create: `components/order/detail-panel.tsx`
- Create: `app/(app)/orders/page.tsx`
- Create: `app/(app)/orders/[id]/page.tsx`

- [ ] **Step 1: Create order list item component**

```tsx
// components/order/list-item.tsx
import { Badge } from "@/components/ui/badge"
import { ShoppingBag } from "lucide-react"

const statusColors: Record<string, string> = { recorded: "bg-blue-100 text-blue-700", confirmed: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700" }

export function OrderListItem({ order, isActive, onClick }: { order: any; isActive?: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer ${isActive ? "bg-primary/10" : "hover:bg-muted"}`}>
      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
        <ShoppingBag className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">#{order.id.slice(-6)}</p>
          <Badge className={`text-xs ${statusColors[order.paymentStatus] || "bg-muted"}`}>{order.paymentStatus}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{order.customer?.name || order.customer?.phone || "—"} · Rp{Number(order.amount).toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create order preview panel**

```tsx
// components/order/preview-panel.tsx
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function OrderPreviewPanel({ order, onViewDetail }: { order: any; onViewDetail: () => void }) {
  if (!order) return null
  return (
    <Card className="h-full border-l-0 rounded-l-none">
      <CardHeader className="pb-3"><CardTitle className="text-sm">Order #{order.id.slice(-6)}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm"><span className="text-muted-foreground">Customer:</span> {order.customer?.name || "—"}</div>
        <div className="text-sm"><span className="text-muted-foreground">Amount:</span> Rp{Number(order.amount).toLocaleString()}</div>
        <div className="text-sm"><span className="text-muted-foreground">Type:</span> {order.type}</div>
        <div className="text-sm"><span className="text-muted-foreground">Status:</span> <Badge>{order.paymentStatus}</Badge></div>
        <Button onClick={onViewDetail} variant="outline" className="w-full">View Details</Button>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Create order detail panel with AI tags**

```tsx
// components/order/detail-panel.tsx
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function OrderDetailPanel({ order }: { order: any }) {
  if (!order) return <div className="p-4 text-sm text-muted-foreground">Select an order to view details</div>
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Order #{order.id.slice(-6)}</h2>
        <Badge>{order.paymentStatus}</Badge>
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Customer</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm font-medium">{order.customer?.name || "—"}</p>
          <p className="text-sm text-muted-foreground">{order.customer?.phone || "—"}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Order Info</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Amount</span><span className="font-medium">Rp{Number(order.amount).toLocaleString()}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Type</span><span>{order.type}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Category</span><span>{order.category}</span></div>
          {order.description && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Description</span><span>{order.description}</span></div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">AI Insights</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            {order.aiTags?.map((tag: string) => <Badge key={tag} variant="outline">{tag}</Badge>) || <p className="text-xs text-muted-foreground">No AI tags available</p>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Recommended Actions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {order.recommendedActions?.length ? order.recommendedActions.map((action: string, i: number) => <Button key={i} variant="outline" size="sm" className="w-full justify-start">{action}</Button>) : <p className="text-xs text-muted-foreground">No recommendations</p>}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Create orders list page**

```tsx
// app/(app)/orders/page.tsx
"use client"
import { useState } from "react"
import useSWR from "swr"
import { OrderListItem } from "@/components/order/list-item"
import { OrderPreviewPanel } from "@/components/order/preview-panel"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function OrdersPage() {
  const { data, isLoading } = useSWR("/api/orders", fetcher)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedOrder = data?.orders?.find((o: any) => o.id === selectedId)

  return (
    <div className="flex h-full">
      <div className="w-80 border-r overflow-auto">
        <div className="p-4"><h1 className="text-lg font-semibold">Orders</h1></div>
        <div className="space-y-1 px-2">
          {isLoading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />) : (data?.orders || []).map(o => <OrderListItem key={o.id} order={o} isActive={o.id === selectedId} onClick={() => setSelectedId(o.id)} />)}
        </div>
      </div>
      <div className="flex-1">
        <OrderPreviewPanel order={selectedOrder} onViewDetail={() => window.location.href = `/orders/${selectedId}`} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create order detail page**

```tsx
// app/(app)/orders/[id]/page.tsx
"use client"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { OrderDetailPanel } from "@/components/order/detail-panel"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function OrderDetailPage() {
  const { id } = useParams()
  const { data, isLoading } = useSWR(id ? `/api/orders/${id}` : null, fetcher)
  return (
    <div className="max-w-2xl mx-auto p-6">{isLoading ? <Skeleton className="h-96" /> : data?.order ? <OrderDetailPanel order={data.order} /> : <p className="text-muted-foreground">Order not found</p>}</div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add components/order app/\(app\)/orders
git commit -m "feat: add orders list and detail pages with AI tags and recommendations"
```

---

### Task 7: Settings Pages

**Files:**
- Create: `components/settings/mfa-setup-card.tsx`
- Create: `components/settings/whatsapp-status.tsx`
- Create: `app/(app)/settings/page.tsx`
- Create: `app/(app)/settings/security/page.tsx`
- Create: `app/(app)/settings/channels/page.tsx`
- Create: `app/(app)/settings/team/page.tsx`
- Create: `app/(app)/settings/billing/page.tsx`

- [ ] **Step 1: Create MFA setup card component**

```tsx
// components/settings/mfa-setup-card.tsx
"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function MFASetupCard({ userId }: { userId: string }) {
  const [step, setStep] = useState<"idle" | "setup" | "verify" | "done">("idle")
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [code, setCode] = useState("")
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [error, setError] = useState("")

  async function startSetup() {
    const res = await fetch("/api/auth/mfa/setup", { method: "POST" })
    const data = await res.json()
    setQrCode(data.qrCode || "")
    setSecret(data.secret || "")
    setStep("setup")
  }

  async function verifyAndActivate() {
    setError("")
    const res = await fetch("/api/auth/mfa/verify", { method: "POST", body: JSON.stringify({ code, secret }) })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Invalid code"); return }
    setRecoveryCodes(data.recoveryCodes || [])
    setStep("done")
  }

  if (step === "done") {
    return (
      <Card>
        <CardHeader><CardTitle>MFA Enabled</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Alert><AlertDescription>Your authenticator app is now active. Save your recovery codes below in a safe place.</AlertDescription></Alert>
          <div className="bg-muted rounded-lg p-3 space-y-1">
            {recoveryCodes.map((code, i) => <p key={i} className="text-sm font-mono">{code}</p>)}
          </div>
          <Button onClick={() => setStep("idle")} variant="outline" className="w-full">Done</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle>Two-Factor Authentication</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {step === "idle" && <><p className="text-sm text-muted-foreground">Protect your account with an authenticator app and recovery codes.</p><Button onClick={startSetup} className="w-full">Enable MFA</Button></>}
        {step === "setup" && (
          <>
            <p className="text-sm text-muted-foreground">Scan this QR code with your authenticator app:</p>
            {qrCode && <img src={qrCode} alt="MFA QR Code" className="mx-auto w-48 h-48 bg-white p-2 rounded-lg" />}
            <p className="text-xs text-center text-muted-foreground">Or enter manually: <span className="font-mono">{secret}</span></p>
            <Input value={code} onChange={e => setCode(e.target.value)} placeholder="6-digit code" maxLength={6} className="text-center font-mono" />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={verifyAndActivate} className="w-full">Verify & Activate</Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Create WhatsApp status component**

```tsx
// components/settings/whatsapp-status.tsx
"use client"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Phone } from "lucide-react"

export function WhatsAppStatus({ accounts }: { accounts: any[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>WhatsApp Channels</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No WhatsApp channels connected.</p>
        ) : accounts.map(acc => (
          <div key={acc.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center"><Phone className="h-4 w-4 text-green-700" /></div>
              <div>
                <p className="text-sm font-medium">{acc.businessName || acc.phoneNumberId}</p>
                <p className="text-xs text-muted-foreground font-mono">{acc.phoneNumberId}</p>
              </div>
            </div>
            <Badge className={acc.isActive ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>{acc.isActive ? "Connected" : "Inactive"}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Create main settings page**

```tsx
// app/(app)/settings/page.tsx
"use client"
import useSWR from "swr"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function SettingsPage() {
  const { data, isLoading } = useSWR("/api/tenant", fetcher)
  const business = data?.business

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const res = await fetch("/api/tenant", { method: "PATCH", body: JSON.stringify({ name: (form.elements.namedItem("name") as HTMLInputElement).value, phone: (form.elements.namedItem("phone") as HTMLInputElement).value }) })
    if (res.ok) alert("Business info updated")
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card>
        <CardHeader><CardTitle>Business Info</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-32" /> : (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div><label className="text-sm font-medium">Business Name</label><Input name="name" defaultValue={business?.name || ""} className="mt-1" /></div>
              <div><label className="text-sm font-medium">Phone</label><Input name="phone" defaultValue={business?.phone || ""} className="mt-1" /></div>
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Create security settings page**

```tsx
// app/(app)/settings/security/page.tsx
import { MFASetupCard } from "@/components/settings/mfa-setup-card"
import { auth } from "@/auth"

export default async function SecurityPage() {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id || ""
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Security</h1>
      <MFASetupCard userId={userId} />
    </div>
  )
}
```

- [ ] **Step 5: Create channels settings page**

```tsx
// app/(app)/settings/channels/page.tsx
"use client"
import useSWR from "swr"
import { WhatsAppStatus } from "@/components/settings/whatsapp-status"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ChannelsPage() {
  const { data, isLoading } = useSWR("/api/webhook/wa/status", fetcher)
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Channels</h1>
      {isLoading ? <Skeleton className="h-40" /> : <WhatsAppStatus accounts={data?.accounts || []} />}
    </div>
  )
}
```

- [ ] **Step 6: Create team settings page**

```tsx
// app/(app)/settings/team/page.tsx
"use client"
import useSWR from "swr"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function TeamPage() {
  const { data, isLoading, mutate } = useSWR("/api/tenant/team", fetcher)
  async function removeUser(userId: string) {
    await fetch(`/api/tenant/team/${userId}`, { method: "DELETE" })
    mutate()
  }
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Team Members</h1>
      <Card>
        <CardHeader><CardTitle>Members</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <Skeleton className="h-20" /> : (data?.users || []).map((user: any) => (
            <div key={user.id} className="flex items-center justify-between py-2">
              <div><p className="text-sm font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email} · {user.role}</p></div>
              {user.role !== "owner" && <Button variant="ghost" size="sm" onClick={() => removeUser(user.id)} className="text-destructive">Remove</Button>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 7: Create billing stub page**

```tsx
// app/(app)/settings/billing/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function BillingPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Billing</h1>
      <Card><CardHeader><CardTitle>Coming Soon</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Billing and subscription management will be available here.</p></CardContent></Card>
    </div>
  )
}
```

- [ ] **Step 8: Commit**

```bash
git add components/settings app/\(app\)/settings
git commit -m "feat: add settings pages (general, security, channels, team, billing)"
```

---

## Spec Coverage Check

- [x] App shell with collapsible sidebar — Task 2
- [x] Login page — Task 3
- [x] Register (wizard 4-step) — Task 3
- [x] Dashboard with activity feed — Task 4
- [x] Conversations list (tenant-scoped) — Task 5
- [x] Conversation detail with AI reply panel — Task 5
- [x] Orders list with thumbnails + preview panel — Task 6
- [x] Order detail with AI tags + recommended actions — Task 6
- [x] Settings general — Task 7
- [x] Settings security (TOTP + recovery codes) — Task 7
- [x] Settings WhatsApp channels — Task 7
- [x] Settings team — Task 7
- [x] Settings billing (stub) — Task 7
- [x] All missing API endpoints — Task 1

No gaps found.