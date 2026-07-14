import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status')
  const orders = await prisma.order.findMany({
    where: status ? { status: status as any } : {},
    include: { customer: true, admin: { select: { name: true } }, items: { include: { variant: { include: { product: true } } } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const { customerId, orderType, items, serviceCharge, discountType, discountValue, deliveryFee, notes } = await req.json()

  const subtotal = items.reduce((s: number, i: any) => s + Number(i.unitPrice) * Number(i.quantity), 0)
  const discountAmount = discountType === 'percentage' ? subtotal * Number(discountValue) / 100 : Number(discountValue)
  const total = subtotal + Number(serviceCharge) + Number(deliveryFee) - discountAmount

  const order = await prisma.order.create({
    data: {
      customerId: customerId ? Number(customerId) : null,
      adminId: 1, // Default admin
      orderType,
      subtotal,
      serviceCharge: Number(serviceCharge),
      discountType: discountType || null,
      discountValue: Number(discountValue),
      discountAmount,
      deliveryFee: Number(deliveryFee),
      total,
      notes,
      items: {
        create: items.map((i: any) => ({
          variantId: Number(i.variantId),
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          subtotal: Number(i.unitPrice) * Number(i.quantity),
          notes: i.notes,
        })),
      },
    },
    include: { customer: true, items: true },
  })
  return NextResponse.json(order)
}
