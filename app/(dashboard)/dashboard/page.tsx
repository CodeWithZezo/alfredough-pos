import { prisma } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import { ShoppingCart, Users, Package, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { TableEmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate } from '@/lib/utils'

async function getStats() {
  const [totalOrders, totalCustomers, totalProducts, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.customer.count(),
    prisma.product.count({ where: { status: 'active' } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: 'completed' } }),
  ])
  const recentOrders = await prisma.order.findMany({
    take: 8, orderBy: { createdAt: 'desc' },
    include: { customer: true, admin: { select: { name: true } } },
  })
  return { totalOrders, totalCustomers, totalProducts, recentOrders, revenue }
}

const statusBadge: Record<string, BadgeVariant> = {
  pending: 'pending',
  completed: 'completed',
  cancelled: 'cancelled',
  returned: 'returned',
}

export default async function DashboardPage() {
  const { totalOrders, totalCustomers, totalProducts, recentOrders, revenue } = await getStats()
  const revenueTotal = Number(revenue._sum.total ?? 0)

  const cards = [
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      iconColor: 'text-blue-500',
      iconBg: 'from-blue-50 to-blue-100',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(revenueTotal),
      icon: TrendingUp,
      iconColor: 'text-green-500',
      iconBg: 'from-green-50 to-green-100',
    },
    {
      label: 'Customers',
      value: totalCustomers,
      icon: Users,
      iconColor: 'text-purple-500',
      iconBg: 'from-purple-50 to-purple-100',
    },
    {
      label: 'Active Products',
      value: totalProducts,
      icon: Package,
      iconColor: 'text-orange-500',
      iconBg: 'from-orange-50 to-orange-100',
    },
  ]

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="p-6 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon: Icon, iconColor, iconBg }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-(--shadow-card) hover:shadow-(--shadow-card-hover) hover:-translate-y-0.5 transition-all duration-200 cursor-default"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
                <div className={`w-9 h-9 bg-linear-to-br ${iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon size={17} className={iconColor} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 tracking-tight">{value}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <Link href="/orders/new">
            <span className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors duration-150 shadow-sm">
              <Plus size={15} /> New Order
            </span>
          </Link>
          <Link href="/products">
            <span className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-300 transition-colors duration-150 shadow-sm">
              <Package size={15} /> Add Product
            </span>
          </Link>
          <Link href="/customers">
            <span className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-300 transition-colors duration-150 shadow-sm">
              <Users size={15} /> Add Customer
            </span>
          </Link>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Recent Orders</h3>
            <Link
              href="/orders"
              className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <Table>
            <TableHead>
              <tr>
                <TableHeader>#ID</TableHeader>
                <TableHeader>Customer</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Total</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Date</TableHeader>
              </tr>
            </TableHead>

            {recentOrders.length === 0 ? (
              <TableEmptyState
                colSpan={6}
                icon={ShoppingCart}
                title="No orders yet"
                description="Create your first order to get started."
                action={
                  <Link href="/orders/new">
                    <span className="inline-flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium">
                      <Plus size={14} /> New Order
                    </span>
                  </Link>
                }
              />
            ) : (
              <TableBody>
                {recentOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-gray-500 text-xs">#{order.id}</TableCell>
                    <TableCell className="text-gray-700">
                      {order.customer?.name ?? <span className="text-gray-400 italic">Walk-in</span>}
                    </TableCell>
                    <TableCell className="text-gray-600 capitalize">
                      {order.orderType.replace('_', '-')}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      {formatCurrency(Number(order.total))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadge[order.status] ?? 'neutral'}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs">
                      {formatDate(new Date(order.createdAt))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </div>
      </div>
    </div>
  )
}
