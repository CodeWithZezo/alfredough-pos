import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { name, phone, address } = await req.json()
  const customer = await prisma.customer.update({ where: { id: Number((await params).id) }, data: { name, phone, address } })
  return NextResponse.json(customer)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await prisma.customer.delete({ where: { id: Number((await params).id) } })
  return NextResponse.json({ success: true })
}
