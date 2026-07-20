import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";

const generateInvoiceNo = (prefix = "INV"): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${randomStr}`;
};

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // 1. Create Demo User
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await prisma.user.upsert({
      where: { email: "demo@zopshop.com" },
      update: {},
      create: {
        email: "demo@zopshop.com",
        name: "Demo User",
        emailVerified: true,
        role: "OWNER",
        accounts: {
          create: {
            providerId: "credential",
            accountId: "demo@zopshop.com",
            password: hashedPassword,
          },
        },
      },
    });
    console.log("✅ Created Demo User");

    // 2. Create Demo Store
    const store = await prisma.store.upsert({
      where: { id: "demo-store-id" }, // Using a fixed ID for demo to ensure upsert works smoothly
      update: {
        name: "Demo Store",
        businessType: "General",
      },
      create: {
        id: "demo-store-id",
        name: "Demo Store",
        businessType: "General",
      },
    });

    // Assign store to user
    await prisma.user.update({
      where: { id: user.id },
      data: { storeId: store.id },
    });
    console.log("✅ Created Demo Store");

    // 3. Create Default Config
    await prisma.config.upsert({
      where: { storeId: store.id },
      update: {
        enableCredit: true,
        enableStock: true,
        enableExpense: true,
        currency: "BDT",
        dateFormat: "DD-MM-YYYY",
        businessType: "General",
      },
      create: {
        storeId: store.id,
        enableCredit: true,
        enableStock: true,
        enableExpense: true,
        currency: "BDT",
        dateFormat: "DD-MM-YYYY",
        businessType: "General",
      },
    });
    console.log("✅ Created Default Config");

    // 4. Create Categories
    const categoryNames = [
      "Construction",
      "Electronics",
      "Food & Beverage",
      "Clothing",
      "General",
    ];
    const categories: any = {};

    for (const name of categoryNames) {
      const cat = await prisma.category.upsert({
        where: { name_storeId: { name, storeId: store.id } },
        update: {},
        create: { name, storeId: store.id },
      });
      categories[name] = cat;
    }
    console.log("✅ Created Categories");

    // 5. Create Products
    const productsData = [
      {
        name: "Cement",
        cat: "Construction",
        unit: "Bag",
        price: 550,
        purchasePrice: 480,
        attributes: { brand: "Fresh", weight: "50kg" },
      },
      {
        name: "Steel Rod",
        cat: "Construction",
        unit: "Ton",
        price: 85000,
        purchasePrice: 80000,
        attributes: { size: "12mm", grade: "60" },
      },
      {
        name: "Laptop",
        cat: "Electronics",
        unit: "Piece",
        price: 45000,
        purchasePrice: 38000,
        attributes: { brand: "Dell", model: "Inspiron", ram: "8GB" },
      },
      {
        name: "Rice",
        cat: "Food & Beverage",
        unit: "Sack",
        price: 350,
        purchasePrice: 300,
        attributes: { brand: "Miniket", weight: "5kg" },
      },
      {
        name: "T-Shirt",
        cat: "Clothing",
        unit: "Piece",
        price: 400,
        purchasePrice: 250,
        attributes: { size: "L", color: "Blue", material: "Cotton" },
      },
    ];

    const products: any = {};
    for (const p of productsData) {
      // Generate a deterministic SKU based on name for upserting
      const sku = `SKU-${p.name.replace(/\s+/g, "-").toUpperCase()}`;
      const prod = await prisma.product.upsert({
        where: { sku },
        update: { stock: 100 },
        create: {
          name: p.name,
          storeId: store.id,
          categoryId: categories[p.cat].id,
          unit: p.unit,
          price: p.price,
          purchasePrice: p.purchasePrice,
          stock: 100,
          sku,
          attributes: p.attributes,
        },
      });
      products[p.name] = prod;
    }
    console.log("✅ Created Products");

    // 6. Create Parties
    const partiesData = [
      {
        name: "Rahmat Ali",
        type: "CUSTOMER",
        openingBalance: 5000,
        mobile: "01711111111",
      },
      {
        name: "Karim Store",
        type: "SUPPLIER",
        openingBalance: -3000,
        mobile: "01822222222",
      },
      {
        name: "ABC Construction",
        type: "BOTH",
        openingBalance: 10000,
        mobile: "01933333333",
      },
    ];

    const parties: any = {};
    for (const p of partiesData) {
      const party = await prisma.party.upsert({
        // Assuming mobile is not unique, we just fetch by name (not technically unique but works for seed)
        // Wait, party doesn't have a unique constraint on name. Let's findFirst, then create.
        where: { id: `party-${p.name.replace(/\s+/g, "-").toLowerCase()}` },
        update: {},
        create: {
          id: `party-${p.name.replace(/\s+/g, "-").toLowerCase()}`,
          name: p.name,
          storeId: store.id,
          type: p.type as any,
          openingBalance: p.openingBalance,
          mobile: p.mobile,
        },
      });
      parties[p.name] = party;
    }
    console.log("✅ Created Parties");

    // 7. Create Sample Transactions
    // Let's clear transactions for demo store so we don't pile them up on every seed run
    await prisma.transaction.deleteMany({ where: { storeId: store.id } });

    // Credit Sale to Rahmat Ali
    await prisma.transaction.create({
      data: {
        storeId: store.id,
        partyId: parties["Rahmat Ali"].id,
        invoiceNo: generateInvoiceNo("SAL"),
        type: "SALE",
        mode: "CREDIT",
        amount: 1100, // 2 cement bags
        discount: 0,
        tax: 0,
        netAmount: 1100,
        paidAmount: 0,
        dueAmount: 1100,
        transactionDate: new Date(),
        items: {
          create: [
            {
              productId: products["Cement"].id,
              quantity: 2,
              unitPrice: 550,
              totalPrice: 1100,
              netPrice: 1100,
            },
          ],
        },
      },
    });

    // Cash Sale
    await prisma.transaction.create({
      data: {
        storeId: store.id,
        invoiceNo: generateInvoiceNo("SAL"),
        type: "SALE",
        mode: "CASH",
        amount: 800, // 2 T-shirts
        discount: 0,
        tax: 0,
        netAmount: 800,
        paidAmount: 800,
        dueAmount: 0,
        transactionDate: new Date(),
        items: {
          create: [
            {
              productId: products["T-Shirt"].id,
              quantity: 2,
              unitPrice: 400,
              totalPrice: 800,
              netPrice: 800,
            },
          ],
        },
      },
    });

    // Purchase from Karim Store
    await prisma.transaction.create({
      data: {
        storeId: store.id,
        partyId: parties["Karim Store"].id,
        invoiceNo: generateInvoiceNo("PUR"),
        type: "PURCHASE",
        mode: "CREDIT",
        amount: 300, // 1 Rice Sack
        discount: 0,
        tax: 0,
        netAmount: 300,
        paidAmount: 0,
        dueAmount: 300,
        transactionDate: new Date(),
        items: {
          create: [
            {
              productId: products["Rice"].id,
              quantity: 1,
              unitPrice: 300,
              totalPrice: 300,
              netPrice: 300,
            },
          ],
        },
      },
    });

    // Expense (Electricity Bill)
    await prisma.transaction.create({
      data: {
        storeId: store.id,
        invoiceNo: generateInvoiceNo("EXP"),
        type: "EXPENSE",
        mode: "CASH",
        amount: 1500,
        discount: 0,
        tax: 0,
        netAmount: 1500,
        paidAmount: 1500,
        dueAmount: 0,
        transactionDate: new Date(),
        note: "Electricity Bill",
      },
    });

    // Payment received from ABC Construction
    await prisma.transaction.create({
      data: {
        storeId: store.id,
        partyId: parties["ABC Construction"].id,
        invoiceNo: generateInvoiceNo("REC"),
        type: "PAYMENT_RECEIVED",
        mode: "CASH",
        amount: 5000,
        netAmount: 5000,
        paidAmount: 5000,
        dueAmount: 0,
        transactionDate: new Date(),
      },
    });

    // Payment sent to Karim Store
    await prisma.transaction.create({
      data: {
        storeId: store.id,
        partyId: parties["Karim Store"].id,
        invoiceNo: generateInvoiceNo("SNT"),
        type: "PAYMENT_SENT",
        mode: "CASH",
        amount: 1000,
        netAmount: 1000,
        paidAmount: 1000,
        dueAmount: 0,
        transactionDate: new Date(),
      },
    });

    console.log("✅ Created Sample Transactions");

    console.log("🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
