import 'dotenv/config'
import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

// ─── Static data ─────────────────────────────────────────────────────────────

const CATEGORIES = ['Burgers', 'Pizzas', 'Drinks', 'Desserts', 'Sides', 'Wraps', 'Salads']

const PRODUCTS: Record<string, { name: string; basePrice: number; variants: { name: string; price: number }[] }[]> = {
  Burgers: [
    { name: 'Chicken Burger', basePrice: 350, variants: [{ name: 'Single', price: 350 }, { name: 'Double', price: 550 }, { name: 'Triple', price: 750 }] },
    { name: 'Beef Burger',    basePrice: 400, variants: [{ name: 'Single', price: 400 }, { name: 'Double', price: 650 }, { name: 'Triple', price: 900 }] },
    { name: 'Zinger Burger',  basePrice: 320, variants: [{ name: 'Regular', price: 320 }, { name: 'Large', price: 480 }] },
    { name: 'BBQ Burger',     basePrice: 450, variants: [{ name: 'Regular', price: 450 }, { name: 'Double', price: 700 }] },
    { name: 'Veggie Burger',  basePrice: 280, variants: [{ name: 'Regular', price: 280 }] },
  ],
  Pizzas: [
    { name: 'Margherita',    basePrice: 700,  variants: [{ name: 'Small (7")', price: 700 }, { name: 'Medium (10")', price: 950 }, { name: 'Large (14")', price: 1200 }] },
    { name: 'BBQ Chicken',   basePrice: 850,  variants: [{ name: 'Small (7")', price: 850 }, { name: 'Medium (10")', price: 1150 }, { name: 'Large (14")', price: 1450 }] },
    { name: 'Pepperoni',     basePrice: 900,  variants: [{ name: 'Small (7")', price: 900 }, { name: 'Medium (10")', price: 1200 }, { name: 'Large (14")', price: 1500 }] },
    { name: 'Veggie Supreme',basePrice: 750,  variants: [{ name: 'Small (7")', price: 750 }, { name: 'Medium (10")', price: 1000 }, { name: 'Large (14")', price: 1300 }] },
    { name: 'Hawaiian',      basePrice: 800,  variants: [{ name: 'Small (7")', price: 800 }, { name: 'Medium (10")', price: 1050 }, { name: 'Large (14")', price: 1350 }] },
  ],
  Drinks: [
    { name: 'Cold Drink',    basePrice: 80,  variants: [{ name: 'Regular (330ml)', price: 80 }, { name: 'Large (500ml)', price: 120 }] },
    { name: 'Fresh Juice',   basePrice: 150, variants: [{ name: 'Small', price: 150 }, { name: 'Large', price: 220 }] },
    { name: 'Milkshake',     basePrice: 250, variants: [{ name: 'Regular', price: 250 }, { name: 'Large', price: 350 }] },
    { name: 'Mineral Water', basePrice: 50,  variants: [{ name: 'Small (500ml)', price: 50 }, { name: 'Large (1.5L)', price: 100 }] },
    { name: 'Tea',           basePrice: 60,  variants: [{ name: 'Regular', price: 60 }, { name: 'Karak', price: 100 }] },
    { name: 'Coffee',        basePrice: 120, variants: [{ name: 'Regular', price: 120 }, { name: 'Large', price: 180 }] },
  ],
  Desserts: [
    { name: 'Chocolate Brownie', basePrice: 200, variants: [{ name: 'Single', price: 200 }, { name: 'Box of 4', price: 700 }] },
    { name: 'Ice Cream',         basePrice: 150, variants: [{ name: 'Single Scoop', price: 150 }, { name: 'Double Scoop', price: 250 }, { name: 'Triple Scoop', price: 350 }] },
    { name: 'Cheesecake',        basePrice: 350, variants: [{ name: 'Slice', price: 350 }, { name: 'Whole Cake', price: 1800 }] },
    { name: 'Waffle',            basePrice: 250, variants: [{ name: 'Plain', price: 250 }, { name: 'With Ice Cream', price: 380 }, { name: 'With Nutella', price: 420 }] },
  ],
  Sides: [
    { name: 'French Fries',  basePrice: 120, variants: [{ name: 'Small', price: 120 }, { name: 'Medium', price: 180 }, { name: 'Large', price: 250 }] },
    { name: 'Onion Rings',   basePrice: 180, variants: [{ name: 'Regular', price: 180 }, { name: 'Large', price: 280 }] },
    { name: 'Coleslaw',      basePrice: 100, variants: [{ name: 'Regular', price: 100 }, { name: 'Large', price: 160 }] },
    { name: 'Garlic Bread',  basePrice: 150, variants: [{ name: 'Regular', price: 150 }] },
    { name: 'Chicken Wings', basePrice: 280, variants: [{ name: '4 Pieces', price: 280 }, { name: '8 Pieces', price: 500 }, { name: '12 Pieces', price: 720 }] },
  ],
  Wraps: [
    { name: 'Chicken Wrap', basePrice: 350, variants: [{ name: 'Regular', price: 350 }, { name: 'Large', price: 480 }] },
    { name: 'Beef Wrap',    basePrice: 400, variants: [{ name: 'Regular', price: 400 }, { name: 'Large', price: 550 }] },
    { name: 'Veggie Wrap',  basePrice: 280, variants: [{ name: 'Regular', price: 280 }] },
    { name: 'BBQ Wrap',     basePrice: 380, variants: [{ name: 'Regular', price: 380 }, { name: 'Large', price: 520 }] },
  ],
  Salads: [
    { name: 'Caesar Salad',  basePrice: 250, variants: [{ name: 'Small', price: 250 }, { name: 'Large', price: 380 }] },
    { name: 'Garden Salad',  basePrice: 200, variants: [{ name: 'Small', price: 200 }, { name: 'Large', price: 320 }] },
    { name: 'Chicken Salad', basePrice: 300, variants: [{ name: 'Small', price: 300 }, { name: 'Large', price: 450 }] },
  ],
}

const KITCHEN_STOCK = [
  { name: 'All-Purpose Flour',  quantity: 50,  unit: 'kg',       minStock: 10 },
  { name: 'Tomato Sauce',       quantity: 20,  unit: 'liters',   minStock: 5  },
  { name: 'Mozzarella Cheese',  quantity: 15,  unit: 'kg',       minStock: 3  },
  { name: 'Cheddar Cheese',     quantity: 10,  unit: 'kg',       minStock: 2  },
  { name: 'Chicken Breast',     quantity: 30,  unit: 'kg',       minStock: 5  },
  { name: 'Beef Mince',         quantity: 20,  unit: 'kg',       minStock: 5  },
  { name: 'Burger Buns',        quantity: 100, unit: 'pcs',      minStock: 20 },
  { name: 'Pizza Dough',        quantity: 30,  unit: 'portions', minStock: 10 },
  { name: 'Cooking Oil',        quantity: 10,  unit: 'liters',   minStock: 3  },
  { name: 'Lettuce',            quantity: 10,  unit: 'kg',       minStock: 2  },
  { name: 'Tomatoes',           quantity: 15,  unit: 'kg',       minStock: 3  },
  { name: 'Onions',             quantity: 20,  unit: 'kg',       minStock: 5  },
  { name: 'Potatoes',           quantity: 50,  unit: 'kg',       minStock: 10 },
  { name: 'Cold Drink Cans',    quantity: 200, unit: 'pcs',      minStock: 50 },
  { name: 'Milk',               quantity: 20,  unit: 'liters',   minStock: 5  },
  { name: 'Sugar',              quantity: 10,  unit: 'kg',       minStock: 2  },
  { name: 'Salt',               quantity: 5,   unit: 'kg',       minStock: 1  },
  { name: 'Ketchup',            quantity: 10,  unit: 'liters',   minStock: 2  },
  { name: 'Mayonnaise',         quantity: 8,   unit: 'kg',       minStock: 2  },
  { name: 'Wrap Tortillas',     quantity: 80,  unit: 'pcs',      minStock: 20 },
]

const CUSTOMERS_DATA = [
  { name: 'Ahmed Khan',   phone: '03001234567', address: 'House 12, Street 4, Gulshan-e-Iqbal' },
  { name: 'Sara Malik',   phone: '03219876543', address: 'Flat 3B, Clifton Block 5' },
  { name: 'Usman Ali',    phone: '03335556789', address: 'Plot 45, DHA Phase 6' },
  { name: 'Fatima Noor',  phone: '03124441234', address: 'House 8, Johar Town' },
  { name: 'Bilal Hassan', phone: '03457778901', address: '2nd Floor, Nazimabad' },
  { name: 'Zainab Raza',  phone: '03112223456', address: 'House 22, North Nazimabad' },
  { name: 'Hamza Sheikh', phone: '03228889012', address: 'Bungalow 7, PECHS Block 2' },
  { name: 'Ayesha Butt',  phone: '03446667890', address: 'House 15, Bahria Town' },
  { name: 'Omar Farooq',  phone: '03551112345', address: 'Flat 5A, Gulberg III' },
  { name: 'Nadia Iqbal',  phone: '03665554321', address: 'House 30, Model Town' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pastDate(daysBack: number, hour: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - daysBack)
  d.setHours(hour, Math.floor(Math.random() * 59), 0, 0)
  return d
}

type OrderItem = { variantId: number; qty: number; price: number }

async function placeOrder(
  adminId: number,
  customerId: number | null,
  orderType: 'dine_in' | 'takeaway' | 'delivery',
  status: 'pending' | 'completed' | 'cancelled' | 'returned',
  items: OrderItem[],
  opts: {
    serviceChargePct?: number
    discountType?: 'percentage' | 'amount'
    discountValue?: number
    deliveryFee?: number
    notes?: string
    createdAt: Date
  },
) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const serviceCharge = opts.serviceChargePct ? Math.round(subtotal * opts.serviceChargePct / 100) : 0
  const discountAmount = opts.discountType === 'percentage'
    ? Math.round(subtotal * (opts.discountValue ?? 0) / 100)
    : (opts.discountValue ?? 0)
  const deliveryFee = opts.deliveryFee ?? 0
  const total = subtotal + serviceCharge + deliveryFee - discountAmount

  return prisma.order.create({
    data: {
      customerId,
      adminId,
      orderType,
      status,
      subtotal,
      serviceCharge,
      discountType: opts.discountType ?? null,
      discountValue: opts.discountValue ?? 0,
      discountAmount,
      deliveryFee,
      total,
      notes: opts.notes ?? null,
      createdAt: opts.createdAt,
      items: {
        create: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.qty,
          unitPrice: i.price,
          subtotal: i.price * i.qty,
        })),
      },
    },
  })
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Always ensure admin exists, even if rest of seed is skipped
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hashedPassword, name: 'Super Admin' },
  })

  const existing = await prisma.product.count()
  if (existing > 0) {
    console.log(`✓ Database already seeded (${existing} products found), skipping.`)
    return
  }

  console.log('Seeding database...\n')

  // ── Admin ──────────────────────────────────────────────────────────────────
  const admin = await prisma.admin.findUniqueOrThrow({ where: { username: 'admin' } })
  console.log('  ✓ Admin ready')

  // ── Categories ─────────────────────────────────────────────────────────────
  for (const name of CATEGORIES) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } })
  }
  console.log(`  ✓ ${CATEGORIES.length} categories created`)

  // ── Products + Variants ────────────────────────────────────────────────────
  // Variant map: "Product Name|Variant Name" => { id, price }
  const vm = new Map<string, { id: number; price: number }>()
  let totalProducts = 0

  for (const [catName, products] of Object.entries(PRODUCTS)) {
    const category = await prisma.category.findFirst({ where: { name: catName } })
    if (!category) continue
    for (const p of products) {
      const product = await prisma.product.create({
        data: { name: p.name, categoryId: category.id, basePrice: p.basePrice },
      })
      for (const v of p.variants) {
        const variant = await prisma.productVariant.create({
          data: { productId: product.id, name: v.name, price: v.price },
        })
        vm.set(`${p.name}|${v.name}`, { id: variant.id, price: v.price })
      }
      totalProducts++
    }
  }
  console.log(`  ✓ ${totalProducts} products created`)

  // ── Kitchen Stock ──────────────────────────────────────────────────────────
  for (const item of KITCHEN_STOCK) {
    const stock = await prisma.kitchenStock.create({ data: item })
    await prisma.kitchenStockHistory.create({
      data: { stockId: stock.id, action: 'add', quantity: item.quantity, note: 'Initial stock' },
    })
  }
  console.log(`  ✓ ${KITCHEN_STOCK.length} kitchen stock items created`)

  // ── Customers ──────────────────────────────────────────────────────────────
  const customers: { id: number }[] = []
  for (const c of CUSTOMERS_DATA) {
    const customer = await prisma.customer.upsert({
      where: { phone: c.phone },
      update: {},
      create: c,
    })
    customers.push(customer)
  }
  console.log(`  ✓ ${customers.length} customers created`)

  // Shorthand: v(product, variant) → { variantId, qty, price }
  const v = (product: string, variant: string, qty = 1): OrderItem => {
    const entry = vm.get(`${product}|${variant}`)
    if (!entry) throw new Error(`Variant not found: ${product}|${variant}`)
    return { variantId: entry.id, qty, price: entry.price }
  }

  const C = (i: number) => customers[i].id  // customer ID by index

  // ── Orders ─────────────────────────────────────────────────────────────────
  // ---- Week 4 ago -----------------------------------------------------------

  const o1 = await placeOrder(admin.id, null, 'dine_in', 'completed',
    [v('Chicken Burger','Single',2), v('French Fries','Medium',2), v('Cold Drink','Regular (330ml)',2)],
    { createdAt: pastDate(29, 19) })

  const o2 = await placeOrder(admin.id, C(0), 'delivery', 'completed',
    [v('Margherita','Medium (10")'), v('BBQ Chicken','Small (7")'), v('Cold Drink','Regular (330ml)',2)],
    { deliveryFee: 150, createdAt: pastDate(28, 20) })

  const o3 = await placeOrder(admin.id, C(1), 'takeaway', 'completed',
    [v('Zinger Burger','Regular'), v('French Fries','Small'), v('Tea','Regular')],
    { createdAt: pastDate(26, 13) })

  const o4 = await placeOrder(admin.id, C(6), 'dine_in', 'completed',
    [v('Pepperoni','Large (14")'), v('Waffle','Plain',2), v('Coffee','Regular',2)],
    { serviceChargePct: 10, createdAt: pastDate(25, 20) })

  const o5 = await placeOrder(admin.id, null, 'dine_in', 'completed',
    [v('Chicken Wings','8 Pieces'), v('French Fries','Large'), v('Cold Drink','Regular (330ml)',3)],
    { createdAt: pastDate(23, 18) })

  const o6 = await placeOrder(admin.id, C(2), 'delivery', 'completed',
    [v('Hawaiian','Large (14")'), v('Veggie Wrap','Regular',2), v('Cold Drink','Large (500ml)',2)],
    { deliveryFee: 200, createdAt: pastDate(22, 19) })

  const o7 = await placeOrder(admin.id, C(3), 'takeaway', 'completed',
    [v('BBQ Wrap','Regular',2), v('Cold Drink','Regular (330ml)',2), v('Ice Cream','Double Scoop')],
    { createdAt: pastDate(20, 15) })

  // ---- Week 3 ago -----------------------------------------------------------

  const o8 = await placeOrder(admin.id, C(4), 'dine_in', 'completed',
    [v('Beef Burger','Double',2), v('Onion Rings','Regular',2), v('Cold Drink','Large (500ml)',2)],
    { discountType: 'percentage', discountValue: 10, createdAt: pastDate(19, 20) })

  const o9 = await placeOrder(admin.id, C(5), 'delivery', 'completed',
    [v('BBQ Chicken','Large (14")'), v('Pepperoni','Medium (10")'), v('Cold Drink','Regular (330ml)',3)],
    { deliveryFee: 150, createdAt: pastDate(18, 19) })

  const o10 = await placeOrder(admin.id, null, 'dine_in', 'completed',
    [v('Hawaiian','Medium (10")'), v('Caesar Salad','Small',2), v('Cold Drink','Large (500ml)',2)],
    { serviceChargePct: 10, createdAt: pastDate(17, 21) })

  const o11 = await placeOrder(admin.id, C(7), 'takeaway', 'completed',
    [v('Chicken Wrap','Regular',2), v('Cold Drink','Regular (330ml)',2)],
    { createdAt: pastDate(15, 12) })

  const o12 = await placeOrder(admin.id, C(8), 'dine_in', 'completed',
    [v('Cheesecake','Slice',3), v('Chocolate Brownie','Single',2), v('Milkshake','Regular',3)],
    { createdAt: pastDate(14, 21) })

  // Cancelled order — also create OrderCancellation record
  const o13 = await placeOrder(admin.id, null, 'dine_in', 'cancelled',
    [v('BBQ Chicken','Medium (10")'), v('Hawaiian','Medium (10")'), v('Cold Drink','Regular (330ml)',4)],
    { createdAt: pastDate(16, 19) })
  await prisma.orderCancellation.create({
    data: { orderId: o13.id, adminId: admin.id, reason: 'Customer left before order was prepared', cancelledAt: o13.createdAt },
  })

  const o14 = await placeOrder(admin.id, C(9), 'takeaway', 'completed',
    [v('Zinger Burger','Regular',2), v('BBQ Wrap','Regular'), v('French Fries','Medium'), v('Tea','Regular',2)],
    { discountType: 'amount', discountValue: 100, createdAt: pastDate(13, 17) })

  // Returned order — also create OrderReturn record
  const o15 = await placeOrder(admin.id, C(0), 'dine_in', 'returned',
    [v('Beef Burger','Single',2), v('French Fries','Large',2), v('Cold Drink','Regular (330ml)',2)],
    { createdAt: pastDate(12, 20) })
  await prisma.orderReturn.create({
    data: { orderId: o15.id, adminId: admin.id, reason: 'Burgers were undercooked', refundAmount: o15.total, returnedAt: o15.createdAt },
  })

  // ---- Week 2 ago -----------------------------------------------------------

  const o16 = await placeOrder(admin.id, C(1), 'delivery', 'completed',
    [v('Pepperoni','Large (14")'), v('Veggie Supreme','Large (14")'), v('Cold Drink','Regular (330ml)',4)],
    { deliveryFee: 200, discountType: 'percentage', discountValue: 5, createdAt: pastDate(11, 19) })

  const o17 = await placeOrder(admin.id, null, 'dine_in', 'completed',
    [v('Chicken Burger','Triple'), v('Beef Burger','Double'), v('French Fries','Large',2), v('Cold Drink','Large (500ml)',2)],
    { serviceChargePct: 10, createdAt: pastDate(10, 21) })

  const o18 = await placeOrder(admin.id, C(2), 'takeaway', 'completed',
    [v('Chicken Wings','12 Pieces'), v('French Fries','Large'), v('Coleslaw','Regular'), v('Cold Drink','Large (500ml)',2)],
    { createdAt: pastDate(9, 16) })

  const o19 = await placeOrder(admin.id, C(4), 'dine_in', 'completed',
    [v('Waffle','With Nutella',4), v('Ice Cream','Double Scoop',4), v('Milkshake','Large',4)],
    { serviceChargePct: 10, createdAt: pastDate(8, 21), notes: 'Birthday celebration' })

  const o20 = await placeOrder(admin.id, C(3), 'delivery', 'completed',
    [v('BBQ Chicken','Large (14")'), v('Hawaiian','Medium (10")'), v('Caesar Salad','Large'), v('Cold Drink','Regular (330ml)',4)],
    { deliveryFee: 150, createdAt: pastDate(7, 19) })

  const o21 = await placeOrder(admin.id, C(6), 'dine_in', 'completed',
    [v('Margherita','Large (14")',2), v('Garlic Bread','Regular',2), v('Cold Drink','Regular (330ml)',4)],
    { discountType: 'percentage', discountValue: 10, createdAt: pastDate(6, 20), notes: 'Regular customer' })

  // Second cancelled order
  const o22 = await placeOrder(admin.id, C(5), 'delivery', 'cancelled',
    [v('Beef Burger','Double',3), v('French Fries','Large',3), v('Cold Drink','Regular (330ml)',3)],
    { deliveryFee: 150, createdAt: pastDate(5, 18) })
  await prisma.orderCancellation.create({
    data: { orderId: o22.id, adminId: admin.id, reason: 'Customer unreachable for delivery', cancelledAt: o22.createdAt },
  })

  // ---- Last 4 days ----------------------------------------------------------

  const o23 = await placeOrder(admin.id, null, 'dine_in', 'completed',
    [v('Chicken Wrap','Regular',3), v('Cold Drink','Regular (330ml)',3), v('French Fries','Medium',2)],
    { createdAt: pastDate(4, 19) })

  const o24 = await placeOrder(admin.id, C(7), 'takeaway', 'completed',
    [v('Zinger Burger','Regular',3), v('French Fries','Small',3), v('Cold Drink','Regular (330ml)',3)],
    { createdAt: pastDate(3, 14) })

  const o25 = await placeOrder(admin.id, C(8), 'delivery', 'completed',
    [v('Hawaiian','Large (14")',2), v('BBQ Chicken','Medium (10")'), v('Cold Drink','Large (500ml)',4)],
    { deliveryFee: 200, discountType: 'percentage', discountValue: 5, createdAt: pastDate(2, 20) })

  const o26 = await placeOrder(admin.id, C(9), 'dine_in', 'completed',
    [v('Chicken Burger','Single',4), v('French Fries','Medium',4), v('Chocolate Brownie','Single',2), v('Cold Drink','Regular (330ml)',4)],
    { serviceChargePct: 10, createdAt: pastDate(1, 19) })

  const o27 = await placeOrder(admin.id, null, 'dine_in', 'completed',
    [v('Pepperoni','Medium (10")'), v('Garden Salad','Small'), v('Tea','Regular',2)],
    { createdAt: pastDate(1, 13) })

  // ---- Today (pending) ------------------------------------------------------

  const o28 = await placeOrder(admin.id, C(0), 'takeaway', 'pending',
    [v('Beef Burger','Double',2), v('French Fries','Large',2), v('Cold Drink','Large (500ml)',2)],
    { notes: 'Extra sauce on the side', createdAt: pastDate(0, 11) })

  const o29 = await placeOrder(admin.id, null, 'dine_in', 'pending',
    [v('Chicken Wings','8 Pieces',2), v('Onion Rings','Large'), v('Cold Drink','Regular (330ml)',4)],
    { serviceChargePct: 10, notes: 'Table 5', createdAt: pastDate(0, 12) })

  const o30 = await placeOrder(admin.id, C(1), 'delivery', 'pending',
    [v('Margherita','Large (14")'), v('BBQ Chicken','Medium (10")'), v('Cold Drink','Regular (330ml)',2)],
    { deliveryFee: 150, notes: 'Ring doorbell twice', createdAt: pastDate(0, 13) })

  // suppress unused-variable warnings for o1–o27 that aren't referenced below
  void [o1,o2,o3,o4,o5,o6,o7,o8,o9,o10,o11,o12,o14,o16,o17,o18,o19,o20,o21,o23,o24,o25,o26,o27,o28,o29,o30]

  const orderCount = 30
  const completedCount = 25
  const pendingCount  = 3
  const cancelledCount = 2
  const returnedCount  = 1

  console.log(`  ✓ ${orderCount} orders created (${completedCount} completed, ${pendingCount} pending, ${cancelledCount} cancelled, ${returnedCount} returned)`)

  console.log('\n✅ Seeding complete!')
  console.log('   Login:    admin / admin123')
  console.log('   Database: SQLite (prisma/dev.db)')
}

main().catch(console.error).finally(() => prisma.$disconnect())
