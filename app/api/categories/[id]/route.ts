import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { name, status } = await req.json()
  const category = await prisma.category.update({
    where: { id: Number((await params).id) },
    data: { name, status },
  })
  return NextResponse.json(category)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await prisma.category.delete({ where: { id: Number((await params).id) } })
  return NextResponse.json({ success: true })
}
