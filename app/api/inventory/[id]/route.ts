import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const history = await prisma.kitchenStockHistory.findMany({
    where: { stockId: Number((await params).id) },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return NextResponse.json(history)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { action, quantity, note, name, unit, minStock } = await req.json()
  const stock = await prisma.kitchenStock.findUnique({ where: { id: Number((await params).id) } })
  if (!stock) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let newQty = Number(stock.quantity)
  if (action === 'add') newQty += Number(quantity)
  else if (action === 'use') newQty = Math.max(0, newQty - Number(quantity))
  else if (action === 'update') newQty = Number(quantity)

  const updated = await prisma.kitchenStock.update({
    where: { id: Number((await params).id) },
    data: { quantity: newQty, name: name ?? stock.name, unit: unit ?? stock.unit, minStock: minStock !== undefined ? Number(minStock) : stock.minStock },
  })

  if (action) {
    await prisma.kitchenStockHistory.create({
      data: { stockId: Number((await params).id), action, quantity: Number(quantity), note },
    })
  }
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await prisma.kitchenStockHistory.deleteMany({ where: { stockId: Number((await params).id) } })
  await prisma.kitchenStock.delete({ where: { id: Number((await params).id) } })
  return NextResponse.json({ success: true })
}
