import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/auth"
import { prisma } from "@/lib/prisma"

function escapeCSV(value: string): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const search = searchParams.get("search")

    const businessId = (session as any)?.user?.businessId || ""

    const where: Record<string, unknown> = { businessId }
    if (status && status !== "Semua") {
      where.paymentStatus = status
    }
    if (dateFrom) {
      where.createdAt = { ...where.createdAt as object, gte: new Date(dateFrom) }
    }
    if (dateTo) {
      where.createdAt = { ...where.createdAt as object, lte: new Date(dateTo + "T23:59:59.999Z") }
    }

    const orders = await prisma.order.findMany({
      where,
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 1000,
    })

    // Client-side search filter
    let filtered = orders
    if (search) {
      const q = search.toLowerCase()
      filtered = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer?.name?.toLowerCase().includes(q) ||
          o.customer?.phone?.includes(q)
      )
    }

    const headers = ["ID", "Tanggal", "Pelanggan", "Items", "Total", "Status", "Pembayaran"]
    const rows = filtered.map((o) => {
      const items = Array.isArray(o.items)
        ? o.items.map((i: any) => `${i.name || "Item"} x${i.qty || 1}`).join("; ")
        : ""
      return [
        o.id.slice(-6),
        new Date(o.createdAt).toLocaleDateString("id-ID"),
        o.customer?.name || "",
        escapeCSV(items),
        Number(o.amount).toLocaleString("id-ID"),
        o.paymentStatus,
        o.paymentStatus === "recorded" || o.paymentStatus === "confirmed" ? "Lunas" : "Belum Bayar",
      ].map(escapeCSV)
    })

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Orders export error:", err.message)
    return NextResponse.json({ error: "Failed to export orders" }, { status: 500 })
  }
}