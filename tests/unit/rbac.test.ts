import { describe, it, expect } from "vitest"
import { can, hasRole, isNavHidden, ROLE_HIERARCHY } from "@/lib/rbac"

describe("RBAC Utility Functions", () => {
  describe("hasRole", () => {
    it("owner role should be >= all roles", () => {
      expect(hasRole("owner", "owner")).toBe(true)
      expect(hasRole("owner", "admin")).toBe(true)
      expect(hasRole("owner", "staff")).toBe(true)
    })

    it("admin role should be >= admin and staff", () => {
      expect(hasRole("admin", "owner")).toBe(false)
      expect(hasRole("admin", "admin")).toBe(true)
      expect(hasRole("admin", "staff")).toBe(true)
    })

    it("staff role should only be >= staff", () => {
      expect(hasRole("staff", "owner")).toBe(false)
      expect(hasRole("staff", "admin")).toBe(false)
      expect(hasRole("staff", "staff")).toBe(true)
    })

    it("unknown role should fail all checks", () => {
      expect(hasRole("unknown", "staff")).toBe(false)
      expect(hasRole("unknown", "admin")).toBe(false)
    })
  })

  describe("can", () => {
    it("owner can do everything", () => {
      expect(can("owner", "customers:read")).toBe(true)
      expect(can("owner", "customers:write")).toBe(true)
      expect(can("owner", "customers:delete")).toBe(true)
      expect(can("owner", "team:manage-roles")).toBe(true)
      expect(can("owner", "billing:write")).toBe(true)
      expect(can("owner", "ai:write")).toBe(true)
      expect(can("owner", "escalation:delete")).toBe(true)
    })

    it("admin can do most things except team management and billing", () => {
      expect(can("admin", "customers:read")).toBe(true)
      expect(can("admin", "customers:write")).toBe(true)
      expect(can("admin", "customers:delete")).toBe(true)
      expect(can("admin", "team:read")).toBe(true)
      expect(can("admin", "team:write")).toBe(true)
      expect(can("admin", "team:delete")).toBe(false)
      expect(can("admin", "team:manage-roles")).toBe(false)
      expect(can("admin", "billing:read")).toBe(true)
      expect(can("admin", "billing:write")).toBe(false)
      expect(can("admin", "ai:write")).toBe(true)
      expect(can("admin", "escalation:write")).toBe(true)
    })

    it("staff can only read/write conversations and read orders/customers", () => {
      expect(can("staff", "customers:read")).toBe(true)
      expect(can("staff", "customers:write")).toBe(false)
      expect(can("staff", "customers:delete")).toBe(false)
      expect(can("staff", "conversations:read")).toBe(true)
      expect(can("staff", "conversations:write")).toBe(true)
      expect(can("staff", "orders:read")).toBe(true)
      expect(can("staff", "orders:write")).toBe(false)
      expect(can("staff", "team:read")).toBe(false)
      expect(can("staff", "ai:write")).toBe(false)
      expect(can("staff", "billing:read")).toBe(false)
      expect(can("staff", "settings:read")).toBe(false)
    })

    it("unknown role should have no permissions", () => {
      expect(can("unknown", "customers:read")).toBe(false)
      expect(can("unknown", "conversations:read")).toBe(false)
    })
  })

  describe("isNavHidden", () => {
    it("should hide billing for staff", () => {
      expect(isNavHidden("/settings/billing", "staff")).toBe(true)
      expect(isNavHidden("/settings/billing", "admin")).toBe(false)
      expect(isNavHidden("/settings/billing", "owner")).toBe(false)
    })

    it("should hide team for staff", () => {
      expect(isNavHidden("/settings/team", "staff")).toBe(true)
      expect(isNavHidden("/settings/team", "admin")).toBe(false)
    })

    it("should hide AI settings for staff", () => {
      expect(isNavHidden("/settings/ai", "staff")).toBe(true)
      expect(isNavHidden("/settings/ai", "admin")).toBe(false)
    })

    it("should not hide regular settings pages for any role", () => {
      expect(isNavHidden("/settings", "staff")).toBe(false)
      expect(isNavHidden("/settings", "owner")).toBe(false)
    })
  })

  describe("ROLE_HIERARCHY", () => {
    it("should have correct numeric values", () => {
      expect(ROLE_HIERARCHY.owner).toBe(3)
      expect(ROLE_HIERARCHY.admin).toBe(2)
      expect(ROLE_HIERARCHY.staff).toBe(1)
    })
  })
})
