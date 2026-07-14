import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const [totalOrders, totalCustomers, totalProducts, revenue, ordersByStatus, lowStockCount] = await Promise.all([
    prisma.order.count(),
    prisma.customer.count(),
    prisma.product.count({ where: { status: 'active' } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: 'completed' } }),
    prisma.order.groupBy({ by: ['status'], _count: true }),
    prisma.kitchenStock.count({ where: { quantity: { lte: 5 } } }),
  ])

  return NextResponse.json({
    totalOrders,
    totalCustomers,
    totalProducts,
    totalRevenue: Number(revenue._sum.total ?? 0),
    ordersByStatus,
    lowStockCount,
  })
}
