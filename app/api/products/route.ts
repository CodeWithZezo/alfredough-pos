import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const { name, description, categoryId, basePrice, variants } = await req.json()
  const product = await prisma.product.create({
    data: {
      name, description, categoryId: Number(categoryId),
      basePrice: Number(basePrice),
      variants: { create: variants.map((v: any) => ({ name: v.name, price: Number(v.price) })) },
    },
    include: { variants: true, category: true },
  })
  return NextResponse.json(product)
}
