# Agent Guidance — Next.js 16 Breaking Changes

## Overview

This project uses Next.js 16 with React 19. Several breaking changes from earlier versions affect how agents should work with this codebase.

## Critical Breaking Changes

### 1. `next/font` no longer supports `next/font/google`

Use `next/font/google` is still available, but the font loading API changed:
- `display: "swap"` is now automatic
- The `variable` prop creates a CSS custom property that must be applied to `<html>` or `<body>` via `className`, not `style`

### 2. Route Groups use `()` syntax

- `(app)` = authenticated routes (wrapped by app shell)
- `(auth)` = public auth routes
- `(public)` = public marketing pages

### 3. `use client` required for client-side features

Any component using hooks (`useState`, `useSWR`, `useSession`) or browser APIs must have `"use client"` at the top.

### 4. TypeScript strict mode enabled

All implicit `any` types are errors. Always type function parameters and return values.

### 5. `@/*` path alias

The `@/` alias maps to the project root. Use it for all imports from `components/`, `lib/`, `app/`, etc.

Example: `import { cn } from "@/lib/utils"` — NOT `../lib/utils`

### 6. No `await generateMetadata()` in page components

Metadata generation in page components is synchronous. Use `generateMetadata` for dynamic metadata with access to params.

### 7. API Routes are Route Handlers

- Use `export async function GET(req: Request)` pattern
- Response must be explicit: `return Response.json({ ... })`
- Use `NextResponse` from `next/server` for cookies/redirects

### 8. Middleware matches on pathname

The `matcher` in `middleware.ts` uses `/:path*` patterns, not regex. Use `createMiddleware` from `better-auth`.

## Common Patterns

### Client Component
```tsx
"use client"
import { useState } from "react"
```

### Server Component (default)
```tsx
// No "use client" — this is a server component
import { getServerSession } from "next-auth"
```

### API Route Handler
```ts
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  return NextResponse.json({ data: "value" })
}
```

## shadcn/ui Installation

This project uses shadcn/ui via `npx shadcn@latest add`. Components are installed individually to `components/ui/`.

Available components: `button`, `input`, `badge`, `avatar`, `skeleton`, `switch`, `dialog`, `select`, `label`, `tabs`, `dropdown-menu`, `separator`

## Environment Variables

All required env vars are documented in `.env.example`. Copy to `.env.local` for local development. Never commit `.env` — it contains real secrets.