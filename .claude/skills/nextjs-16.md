---
name: nextjs-16
description: Next.js 16 App Router specifics for this project
---

# Next.js 16 App Router

Next.js 16 has breaking changes from training data. **Read the docs first.**

## When to Use
- Working with app directory
- Creating/modifying pages, layouts, API routes
- Using React 19 features
- Server Components vs Client Components decisions

## Critical Rule

> **This is NOT the Next.js you know**
> APIs, conventions, and file structure may ALL differ from your training data.
> Read `node_modules/next/dist/docs/` BEFORE writing any code.

## How to Check

```bash
# Read the relevant guide
cat node_modules/next/dist/docs/app-router-guide.md

# Or look at existing code patterns in the project
grep -r "use server" app/
grep -r "use client" app/
```

## Key Differences to Watch For

1. **Server Components** — default in app/
2. **Client Components** — add `'use client'` directive
3. **API Routes** — use `app/api/` not `pages/api/`
4. **Route Handlers** — `route.ts` not `route.js`
5. **Layouts** — `layout.tsx` at each segment
6. **Loading/Error** — `loading.tsx`, `error.tsx` in each segment

## Project Conventions

- NextAuth v5 with `@auth/prisma-adapter`
- Prisma for database
- Shadcn/ui for components
- Zod for validation
- `'use client'` for interactivity, hooks, event handlers

## Checklist
- [ ] Read the actual Next.js 16 docs for any new API
- [ ] Check existing patterns in project before writing similar code
- [ ] Use correct file extensions (.ts/.tsx)
- [ ] Respect Server/Client component boundaries