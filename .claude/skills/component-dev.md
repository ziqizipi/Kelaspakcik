---
name: component-dev
description: Building UI components with shadcn/ui + Forest Design System
---

# Component Development

Building UI components for BalasBro using shadcn/ui + Forest Design System.

## When to Use
- Creating new UI components
- Modifying existing components
- Adding dashboard features

## Procedure

### 1. Check Design System
Read `DESIGN.md` for:
- Color palette (Forest Green #004526, Gold accents)
- Typography (Inter font family)
- Spacing (8px base unit)
- Border radius (8px small, 12px medium, 16px large)
- Shadows (tinted with primary color)

### 2. Use shadcn/ui Components
```bash
npx shadcn@latest add [component-name]
```

Never create components from scratch if shadcn has one.

### 3. Component Structure
```
components/
├── ui/           # shadcn components (don't edit)
├── custom/       # Custom components
└── [feature]/    # Feature-specific components
```

### 4. Follow Naming
- Files: `kebab-case.tsx` (e.g., `conversation-list.tsx`)
- Components: `PascalCase` (e.g., `ConversationList`)
- Utilities: `camelCase` (e.g., `formatTimestamp`)

## Checklist
- [ ] Follows Forest Design System colors/typography
- [ ] Uses shadcn/ui when available
- [ ] Responsive (mobile-first)
- [ ] Dark mode compatible (use `next-themes`)
- [ ] No hardcoded colors — use design tokens