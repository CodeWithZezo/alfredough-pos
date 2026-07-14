import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') ?? ''
  const customers = await prisma.customer.findMany({
    where: search ? { OR: [{ name: { contains: search } }, { phone: { contains: search } }] } : {},
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(customers)
}

export async function POST(req: NextRequest) {
  const { name, phone, address } = await req.json()
  const customer = await prisma.customer.create({ data: { name, phone, address } })
  return NextResponse.json(customer)
}
