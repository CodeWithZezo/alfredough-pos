import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const order = await prisma.order.findUnique({
    where: { id: Number((await params).id) },
    include: {
      customer: true,
      admin: { select: { name: true } },
      items: { include: { variant: { include: { product: true } } } },
      orderEdits: { include: { admin: { select: { name: true } } } },
      orderCancellations: true,
      orderReturns: true,
    },
  })
  return NextResponse.json(order)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { status, reason, refundAmount, changeNote, adminId } = await req.json()
  const order = await prisma.order.findUnique({ where: { id: Number((await params).id) } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let requestedRefund = 0
  if (status === 'returned' && reason) {
    requestedRefund = Number(refundAmount ?? 0)
    if (requestedRefund < 0 || requestedRefund > Number(order.total)) {
      return NextResponse.json(
        { error: `Refund amount cannot exceed order total (${order.total})` },
        { status: 400 }
      )
    }
  }

  await prisma.order.update({ where: { id: Number((await params).id) }, data: { status } })

  if (status === 'cancelled' && reason) {
    await prisma.orderCancellation.upsert({
      where: { orderId: Number((await params).id) },
      update: { reason },
      create: { orderId: Number((await params).id), adminId: Number(adminId ?? 1), reason },
    })
  }
  if (status === 'returned' && reason) {
    await prisma.orderReturn.create({
      data: { orderId: Number((await params).id), adminId: Number(adminId ?? 1), reason, refundAmount: requestedRefund },
    })
  }
  if (changeNote) {
    await prisma.orderEdit.create({
      data: { orderId: Number((await params).id), adminId: Number(adminId ?? 1), changeNote, oldTotal: order.total, newTotal: order.total },
    })
  }
  return NextResponse.json({ success: true })
}
