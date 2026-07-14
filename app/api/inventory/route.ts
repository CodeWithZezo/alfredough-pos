import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const stock = await prisma.kitchenStock.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(stock)
}

export async function POST(req: NextRequest) {
  const { name, quantity, unit, minStock } = await req.json()
  const stock = await prisma.kitchenStock.create({
    data: { name, quantity: Number(quantity), unit, minStock: Number(minStock ?? 0) },
  })
  await prisma.kitchenStockHistory.create({ data: { stockId: stock.id, action: 'add', quantity: Number(quantity), note: 'Initial stock' } })
  return NextResponse.json(stock)
}
