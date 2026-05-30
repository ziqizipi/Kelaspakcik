---
name: api-debug
description: Debugging API routes and backend issues
---

# API Debugging

Debugging API routes in BalasBro.

## When to Use
- API returns unexpected error
- 500 errors in API routes
- Auth issues with API endpoints
- Data not saving/retrieving correctly

## Procedure

### 1. Check Route Structure
```
app/api/[resource]/route.ts    # Handler file
app/api/[resource]/[id]/route.ts  # ID-based routes
```

### 2. Common Issues Checklist
- [ ] Auth middleware applied correctly
- [ ] Request body matches Zod schema validation
- [ ] Environment variables set (.env)
- [ ] Prisma client imported correctly
- [ ] CORS headers set if needed

### 3. Debug Steps
1. Check `middleware.ts` — auth protection
2. Check `auth.ts` — NextAuth config
3. Check `lib/prisma.ts` — database client
4. Look at `docs/` for runbooks if specific error

### 4. Testing APIs
```bash
# With Vercel CLI
vercel env pull
vercel dev

# Or test locally with curl
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

## Common Patterns

### NextAuth Protected Routes
```typescript
import { auth } from '@/auth'
const session = await auth()
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

### Zod Validation
```typescript
import { z } from 'zod'
const schema = z.object({ name: z.string() })
const data = schema.parse(req.body)
```

### Prisma Error Handling
```typescript
try {
  const result = await prisma.user.create({ data })
} catch (error) {
  if (error.code === 'P2002') { /* unique constraint */ }
  throw error
}
```