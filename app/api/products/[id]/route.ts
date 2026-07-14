import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { name, description, categoryId, basePrice, status } = await req.json()
  const product = await prisma.product.update({
    where: { id: Number((await params).id) },
    data: { name, description, categoryId: Number(categoryId), basePrice: Number(basePrice), status },
    include: { category: true, variants: true },
  })
  return NextResponse.json(product)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await prisma.productVariant.deleteMany({ where: { productId: Number((await params).id) } })
  await prisma.product.delete({ where: { id: Number((await params).id) } })
  return NextResponse.json({ success: true })
}
