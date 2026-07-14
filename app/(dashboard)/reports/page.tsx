import { prisma } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { XCircle, RotateCcw } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

async function getReportData() {
  const [ordersByStatus, revenue, recentReturns, recentCancellations] = await Promise.all([
    prisma.order.groupBy({ by: ['status'], _count: true }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: 'completed' } }),
    prisma.orderReturn.findMany({ take: 5, orderBy: { returnedAt: 'desc' }, include: { order: true } }),
    prisma.orderCancellation.findMany({ take: 5, orderBy: { cancelledAt: 'desc' }, include: { order: true } }),
  ])
  return { ordersByStatus, revenue, recentReturns, recentCancellations }
}

const statusBadge: Record<string, BadgeVariant> = {
  pending: 'pending',
  completed: 'completed',
  cancelled: 'cancelled',
  returned: 'returned',
}

const statusIcon: Record<string, string> = {
  pending: '⏳',
  completed: '✓',
  cancelled: '✕',
  returned: '↩',
}

export default async function ReportsPage() {
  const { ordersByStatus, revenue, recentReturns, recentCancellations } = await getReportData()
  const totalOrders = ordersByStatus.reduce((s, o) => s + o._count, 0)
  const revenueTotal = Number(revenue._sum.total ?? 0)

  return (
    <div>
      <Topbar title="Reports" />
      <div className="p-6 space-y-6">

        {/* Revenue hero card */}
        <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <p className="text-sm font-medium text-green-700 mb-1">Total Revenue — Completed Orders</p>
          <p className="text-4xl font-bold text-green-700">{formatCurrency(revenueTotal)}</p>
          <p className="text-xs text-green-600/70 mt-2">All time · {totalOrders} total orders</p>
        </div>

        {/* Orders by status */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Orders by Status</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {ordersByStatus.map(o => {
              const pct = totalOrders > 0 ? Math.round(o._count / totalOrders * 100) : 0
              return (
                <div key={o.status} className="bg-white rounded-xl p-5 border border-gray-100 shadow-(--shadow-card) hover:shadow-(--shadow-card-hover) transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-gray-500 capitalize">{o.status}</p>
                    <Badge variant={statusBadge[o.status] ?? 'neutral'}>
                      {statusIcon[o.status]} {pct}%
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{o._count}</p>
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-orange-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cancellations & Returns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cancellations */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-(--shadow-card) overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <XCircle size={15} className="text-red-400" />
              <h3 className="font-semibold text-gray-800 text-sm">Recent Cancellations</h3>
            </div>
            {recentCancellations.length === 0 ? (
              <EmptyState icon={XCircle} title="No cancellations" description="Cancelled orders will appear here." className="py-10" />
            ) : (
              <div className="divide-y divide-gray-50">
                {recentCancellations.map(c => (
                  <div key={c.id} className="px-5 py-3.5">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-800 text-sm">Order #{c.orderId}</span>
                      <span className="text-gray-400 text-xs">{formatDate(new Date(c.cancelledAt))}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{c.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Returns */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-(--shadow-card) overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <RotateCcw size={15} className="text-purple-400" />
              <h3 className="font-semibold text-gray-800 text-sm">Recent Returns</h3>
            </div>
            {recentReturns.length === 0 ? (
              <EmptyState icon={RotateCcw} title="No returns" description="Returned orders will appear here." className="py-10" />
            ) : (
              <div className="divide-y divide-gray-50">
                {recentReturns.map(r => (
                  <div key={r.id} className="px-5 py-3.5">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-800 text-sm">Order #{r.orderId}</span>
                      <span className="text-red-500 text-xs font-semibold">- {formatCurrency(Number(r.refundAmount))}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{r.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
