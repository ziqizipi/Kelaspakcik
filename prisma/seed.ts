import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create demo business
  const business = await prisma.business.upsert({
    where: { id: "demo-business-001" },
    update: {},
    create: {
      id: "demo-business-001",
      name: "Toko Elektronik Jaya",
      industry: "Electronics Retail",
      address: "Jl. Merdeka No. 123, Jakarta",
      phone: "+6281234567890",
    },
  })
  console.log(`✅ Business: ${business.name}`)

  // Create owner user
  const hashedPassword = await bcrypt.hash("password123", 12)
  const owner = await prisma.user.upsert({
    where: { email: "owner@demo.com" },
    update: {},
    create: {
      email: "owner@demo.com",
      password: hashedPassword,
      name: "Budi Santoso",
      role: "owner",
      businessId: business.id,
    },
  })
  console.log(`✅ Owner: ${owner.email}`)

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      password: hashedPassword,
      name: "Siti Rahayu",
      role: "admin",
      businessId: business.id,
    },
  })
  console.log(`✅ Admin: ${admin.email}`)

  // Create staff user
  const staff = await prisma.user.upsert({
    where: { email: "staff@demo.com" },
    update: {},
    create: {
      email: "staff@demo.com",
      password: hashedPassword,
      name: "Ahmad Rizki",
      role: "staff",
      businessId: business.id,
    },
  })
  console.log(`✅ Staff: ${staff.email}`)

  // Create or update Twilio WhatsApp account with real credentials from env
  const realAccountSid = process.env.TWILIO_ACCOUNT_SID || ""
  const realAuthToken = process.env.TWILIO_AUTH_TOKEN || ""

  if (realAccountSid) {
    // Delete any existing accounts for this business (handles SID change from demo → real)
    await prisma.twilioAccount.deleteMany({ where: { businessId: business.id } })
    const twilioAccount = await prisma.twilioAccount.create({
      data: {
        accountSid: realAccountSid,
        authToken: realAuthToken,
        whatsappNumber: "+6281234567890",
        businessName: "Toko Elektronik Jaya",
        webhookVerifyToken: "demo-verify-token",
        isActive: true,
        businessId: business.id,
      },
    })
    console.log(`✅ Twilio Account: ${twilioAccount.whatsappNumber} (${realAccountSid.slice(0, 16)}...)`)
  } else {
    const twilioAccount = await prisma.twilioAccount.upsert({
      where: { accountSid: "ACdemo00000000000000000000000000" },
      update: {},
      create: {
        accountSid: "ACdemo00000000000000000000000000",
        authToken: "placeholder-auth-token",
        whatsappNumber: "+6281234567890",
        businessName: "Toko Elektronik Jaya",
        webhookVerifyToken: "demo-verify-token",
        isActive: true,
        businessId: business.id,
      },
    })
    console.log(`✅ Twilio Account: ${twilioAccount.whatsappNumber} (demo placeholder)`)
  }

  // Create demo customers
  const customers = [
    { phone: "6289887766551", name: "Dewi Lestari" },
    { phone: "6289887766552", name: "Hartono Wijaya" },
    { phone: "6289887766553", name: "Maya Putri" },
    { phone: "6289887766554", name: "Rudi Hermawan" },
    { phone: "6289887766555", name: "Lisa Permata" },
  ]

  for (const c of customers) {
    const customer = await prisma.customer.upsert({
      where: { businessId_phone: { businessId: business.id, phone: c.phone } },
      update: {},
      create: {
        phone: c.phone,
        name: c.name,
        waId: c.phone,
        businessId: business.id,
      },
    })
    console.log(`✅ Customer: ${customer.name} (${customer.phone})`)
  }

  // Create demo products
  const products = [
    { name: "Xiaomi Redmi Note 12", sku: "XIA-001", price: 2899000, qty: 15 },
    { name: "Samsung Galaxy A54", sku: "SAM-001", price: 4299000, qty: 8 },
    { name: "Realme C55", sku: "RLM-001", price: 2199000, qty: 20 },
    { name: "Vivo Y36", sku: "VVO-001", price: 2499000, qty: 12 },
    { name: "OPPO A78", sku: "OPP-001", price: 2699000, qty: 10 },
    { name: "iPhone 14", sku: "APL-001", price: 15999000, qty: 3 },
    { name: "Powerbank 10000mAh", sku: "ACC-001", price: 89000, qty: 50 },
    { name: "Kabel Data Type-C", sku: "ACC-002", price: 45000, qty: 100 },
    { name: "Tempered Glass", sku: "ACC-003", price: 35000, qty: 75 },
    { name: "Case HP Universal", sku: "ACC-004", price: 55000, qty: 60 },
  ]

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { id: `seed-product-${p.sku}` },
      update: {},
      create: {
        id: `seed-product-${p.sku}`,
        name: p.name,
        sku: p.sku,
        description: `${p.name} - Barang original dengan garansi resmi`,
        price: p.price,
        qty: p.qty,
        reorderPoint: 5,
        businessId: business.id,
      },
    })
    console.log(`✅ Product: ${product.name}`)
  }

  // Create AI auto-reply config
  await prisma.aIAutoReplyConfig.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      businessId: business.id,
      isEnabled: true,
      tone: "friendly",
      sopContext:
        "Toko Elektronik Jaya adalah toko elektronik terpercaya di Jakarta. " +
        "Kami menjual smartphone, aksesoris, dan gadget dengan harga kompetitif. " +
        "Pengiriman tersedia untuk seluruh Indonesia via JNE, J&T, dan SiCepat. " +
        "Garansi resmi untuk setiap produk elektronik.",
      fallbackReply:
        "Terima kasih atas pesanannya! Untuk informasi lebih lanjut, " +
        "silakan hubungi kami di +6281234567890. Kami siap membantu! 😊",
      workingHours: {
        start: "08:00",
        end: "21:00",
        timezone: "Asia/Jakarta",
      },
    },
  })
  console.log(`✅ AI Auto-Reply Config`)

  // Create escalation rules
  await prisma.escalationRule.upsert({
    where: { id: "seed-escalation-1" },
    update: {},
    create: {
      id: "seed-escalation-1",
      name: "Komplain Pelanggan",
      type: "COMPLAINT",
      keywords: ["komplain", "rusak", "garansi", "tidak puas", "kecewa"],
      notifyVia: "whatsapp",
      isActive: true,
      businessId: business.id,
    },
  })

  await prisma.escalationRule.upsert({
    where: { id: "seed-escalation-2" },
    update: {},
    create: {
      id: "seed-escalation-2",
      name: "Pesanan Tinggi",
      type: "HIGH_VALUE_ORDER",
      minOrderValue: 5000000,
      notifyVia: "whatsapp",
      isActive: true,
      businessId: business.id,
    },
  })
  console.log(`✅ Escalation Rules`)

  console.log("\n🎉 Seed completed!")
  console.log("\n📋 Demo credentials:")
  console.log("   Owner:  owner@demo.com / password123")
  console.log("   Admin:  admin@demo.com / password123")
  console.log("   Staff:  staff@demo.com / password123")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
