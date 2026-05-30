/**
 * RBAC — Role-Based Access Control for BalasBro.ai
 * Roles: owner | admin | staff
 */

export type Role = "owner" | "admin" | "staff"

export const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 3,
  admin: 2,
  staff: 1,
}

export function hasRole(userRole: string, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole as Role] >= ROLE_HIERARCHY[requiredRole]
}

// Permissions per resource + action
export type Permission =
  // Customers
  | "customers:read"
  | "customers:write"
  | "customers:delete"
  // Conversations
  | "conversations:read"
  | "conversations:write"
  | "conversations:delete"
  // Orders
  | "orders:read"
  | "orders:write"
  | "orders:delete"
  // Team
  | "team:read"
  | "team:write"
  | "team:delete"
  | "team:manage-roles"
  // Billing
  | "billing:read"
  | "billing:write"
  // Channels (WhatsApp)
  | "channels:read"
  | "channels:write"
  | "channels:delete"
  // AI Config
  | "ai:read"
  | "ai:write"
  // Escalation
  | "escalation:read"
  | "escalation:write"
  | "escalation:delete"
  // Reports
  | "reports:read"
  // Settings
  | "settings:read"
  | "settings:write"

type RolePermissions = Record<Permission, boolean>

const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  owner: {
    "customers:read": true,
    "customers:write": true,
    "customers:delete": true,
    "conversations:read": true,
    "conversations:write": true,
    "conversations:delete": true,
    "orders:read": true,
    "orders:write": true,
    "orders:delete": true,
    "team:read": true,
    "team:write": true,
    "team:delete": true,
    "team:manage-roles": true,
    "billing:read": true,
    "billing:write": true,
    "channels:read": true,
    "channels:write": true,
    "channels:delete": true,
    "ai:read": true,
    "ai:write": true,
    "escalation:read": true,
    "escalation:write": true,
    "escalation:delete": true,
    "reports:read": true,
    "settings:read": true,
    "settings:write": true,
  },
  admin: {
    "customers:read": true,
    "customers:write": true,
    "customers:delete": true,
    "conversations:read": true,
    "conversations:write": true,
    "conversations:delete": false,
    "orders:read": true,
    "orders:write": true,
    "orders:delete": true,
    "team:read": true,
    "team:write": true,
    "team:delete": false,
    "team:manage-roles": false,
    "billing:read": true,
    "billing:write": false,
    "channels:read": true,
    "channels:write": true,
    "channels:delete": false,
    "ai:read": true,
    "ai:write": true,
    "escalation:read": true,
    "escalation:write": true,
    "escalation:delete": true,
    "reports:read": true,
    "settings:read": true,
    "settings:write": false,
  },
  staff: {
    "customers:read": true,
    "customers:write": false,
    "customers:delete": false,
    "conversations:read": true,
    "conversations:write": true,
    "conversations:delete": false,
    "orders:read": true,
    "orders:write": false,
    "orders:delete": false,
    "team:read": false,
    "team:write": false,
    "team:delete": false,
    "team:manage-roles": false,
    "billing:read": false,
    "billing:write": false,
    "channels:read": false,
    "channels:write": false,
    "channels:delete": false,
    "ai:read": false,
    "ai:write": false,
    "escalation:read": false,
    "escalation:write": false,
    "escalation:delete": false,
    "reports:read": false,
    "settings:read": false,
    "settings:write": false,
  },
}

export function can(userRole: string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[userRole as Role]
  return perms?.[permission] ?? false
}

// Route guards — which roles can access which paths
export const ROUTE_GUARDS: Array<{ pattern: RegExp; minRole: Role; permission?: Permission }> = [
  // Settings — owner only for billing
  { pattern: /^\/settings\/billing/, minRole: "admin" },
  // Team management — owner/admin only
  { pattern: /^\/settings\/team/, minRole: "admin" },
  // AI config — admin+ only
  { pattern: /^\/settings\/ai/, minRole: "admin" },
  // Channels — admin+ only
  { pattern: /^\/settings\/channels/, minRole: "admin" },
  // Escalation — admin+ only
  { pattern: /^\/settings\/escalation/, minRole: "admin" },
  // Reports — admin+ only
  { pattern: /^\/settings\/reports/, minRole: "admin" },
]

export function canAccessRoute(userRole: string, pathname: string): boolean {
  for (const guard of ROUTE_GUARDS) {
    if (guard.pattern.test(pathname)) {
      if (!hasRole(userRole, guard.minRole)) return false
    }
  }
  return true
}

// UI hiding — returns whether a nav item should be hidden for a role
export const NAV_HIDE_FOR_ROLES: Array<{ href: string; hiddenRoles: Role[] }> = [
  { href: "/settings/billing", hiddenRoles: ["staff"] },
  { href: "/settings/team", hiddenRoles: ["staff"] },
  { href: "/settings/ai", hiddenRoles: ["staff"] },
  { href: "/settings/channels", hiddenRoles: ["staff"] },
  { href: "/settings/escalation", hiddenRoles: ["staff"] },
  { href: "/settings/reports", hiddenRoles: ["staff"] },
]

export function isNavHidden(href: string, userRole: string): boolean {
  const rule = NAV_HIDE_FOR_ROLES.find((r) => r.href === href)
  if (!rule) return false
  return rule.hiddenRoles.includes(userRole as Role)
}