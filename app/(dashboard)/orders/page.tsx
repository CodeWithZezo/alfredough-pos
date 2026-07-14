'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Plus, ShoppingCart, Printer } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { TableRowSkeleton } from '@/components/ui/Skeleton'
import { TableEmptyState } from '@/components/ui/EmptyState'
import ReceiptModal from '@/components/receipt/ReceiptModal'
import { orderToReceiptData, type ReceiptData } from '@/components/receipt/Receipt'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Order = {
  id: number; status: string; orderType: string; total: number;
  customer?: { name: string }; admin: { name: string }; createdAt: string;
  items: { quantity: number; variant: { name: string; product: { name: string } } }[]
}

const tabs = ['all', 'pending', 'completed', 'cancelled', 'returned'] as const
type Tab = typeof tabs[number]

const statusBadge: Record<string, BadgeVariant> = {
  pending: 'pending',
  completed: 'completed',
  cancelled: 'cancelled',
  returned: 'returned',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('all')
  const [selected, setSelected] = useState<Order | null>(null)
  const [actionModal, setActionModal] = useState<'cancel' | 'return' | null>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [refund, setRefund] = useState('')
  const [refundError, setRefundError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)

  const load = async (status: Tab = 'all') => {
    setLoading(true)
    const res = await fetch(`/api/orders${status !== 'all' ? `?status=${status}` : ''}`)
    setOrders(await res.json())
    setLoading(false)
  }

  useEffect(() => { load(tab) }, [tab])

  const openAction = (order: Order, type: 'cancel' | 'return') => {
    setSelected(order)
    setActionModal(type)
    setReason('')
    setReasonError('')
    setRefund('')
    setRefundError('')
  }

  const closeAction = () => {
    setActionModal(null)
    setSelected(null)
    setReason('')
    setReasonError('')
    setRefund('')
    setRefundError('')
  }

  const doAction = async () => {
    if (!selected) return
    if (!reason.trim()) { setReasonError('Reason is required'); return }
    if (actionModal === 'return' && Number(refund) > Number(selected.total)) {
      setRefundError(`Refund cannot exceed order total (${formatCurrency(selected.total)})`)
      return
    }
    setSubmitting(true)
    const res = await fetch(`/api/orders/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: actionModal === 'cancel' ? 'cancelled' : 'returned',
        reason,
        refundAmount: refund,
        adminId: 1,
      }),
    })
    setSubmitting(false)
    if (!res.ok) {
      const { error } = await res.json()
      setRefundError(error ?? 'Failed to process — please try again')
      return
    }
    closeAction()
    load(tab)
  }

  const openReceipt = async (id: number) => {
    const res = await fetch(`/api/orders/${id}`)
    const order = await res.json()
    setReceiptData(orderToReceiptData(order))
    setReceiptOpen(true)
  }

  const markComplete = async (id: number) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed', adminId: 1 }),
    })
    load(tab)
  }

  return (
    <div>
      <Topbar title="Orders" />
      <div className="p-6">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
          {/* Tab filter */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-150',
                  tab === t
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <Link href="/orders/new">
            <Button size="md">
              <Plus size={15} /> New Order
            </Button>
          </Link>
        </div>

        <Table>
          <TableHead>
            <tr>
              <TableHeader>#ID</TableHeader>
              <TableHeader>Customer</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Items</TableHeader>
              <TableHeader>Total</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </tr>
          </TableHead>

          {loading ? (
            <TableRowSkeleton rows={8} cols={8} />
          ) : orders.length === 0 ? (
            <TableEmptyState
              colSpan={8}
              icon={ShoppingCart}
              title="No orders found"
              description={tab !== 'all' ? `No ${tab} orders.` : 'Start by creating a new order.'}
              action={tab === 'all' ? (
                <Link href="/orders/new">
                  <Button size="sm"><Plus size={14} /> New Order</Button>
                </Link>
              ) : undefined}
            />
          ) : (
            <TableBody>
              {orders.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-gray-500 text-xs">#{o.id}</TableCell>
                  <TableCell className="text-gray-700">{o.customer?.name ?? <span className="text-gray-400 italic">Walk-in</span>}</TableCell>
                  <TableCell className="text-gray-600 capitalize">{o.orderType.replace('_', '-')}</TableCell>
                  <TableCell className="text-gray-500">{o.items.length}</TableCell>
                  <TableCell className="font-semibold text-gray-800">{formatCurrency(Number(o.total))}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadge[o.status] ?? 'neutral'}>{o.status}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">{formatDate(new Date(o.createdAt))}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm" variant="ghost" icon
                        aria-label={`Print receipt for order #${o.id}`}
                        onClick={() => openReceipt(o.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Printer size={14} />
                      </Button>
                      {o.status === 'pending' && (
                        <>
                          <Button size="sm" variant="primary" onClick={() => markComplete(o.id)}>
                            Complete
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => openAction(o, 'cancel')}>
                            Cancel
                          </Button>
                        </>
                      )}
                      {o.status === 'completed' && (
                        <Button size="sm" variant="secondary" onClick={() => openAction(o, 'return')}>
                          Return
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </div>

      {/* Cancel / Return Modal */}
      <Modal
        open={!!actionModal && !!selected}
        onClose={closeAction}
        title={`${actionModal === 'cancel' ? 'Cancel' : 'Return'} Order #${selected?.id}`}
        description={actionModal === 'cancel' ? 'Provide a reason for cancelling this order.' : 'Provide a reason and optional refund amount.'}
        size="sm"
      >
        <ModalBody>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Reason *</label>
            <textarea
              value={reason}
              onChange={e => { setReason(e.target.value); setReasonError('') }}
              rows={3}
              className={cn(
                'w-full border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors resize-none',
                'focus:outline-none focus:ring-2 focus:ring-offset-0',
                reasonError
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                  : 'border-gray-300 focus:border-orange-400 focus:ring-orange-400/20'
              )}
            />
            {reasonError && <p className="text-xs text-red-500">{reasonError}</p>}
          </div>
          {actionModal === 'return' && (
            <Input
              label="Refund Amount (Rs.)"
              type="number"
              min={0}
              max={selected?.total}
              value={refund}
              onChange={e => { setRefund(e.target.value); setRefundError('') }}
              placeholder="0"
              hint={!refundError ? `Leave blank if no refund. Max ${formatCurrency(selected?.total ?? 0)}` : undefined}
              error={refundError}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={closeAction} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant={actionModal === 'cancel' ? 'destructive' : 'primary'}
            onClick={doAction}
            loading={submitting}
          >
            Confirm {actionModal === 'cancel' ? 'Cancellation' : 'Return'}
          </Button>
        </ModalFooter>
      </Modal>

      <ReceiptModal open={receiptOpen} onClose={() => setReceiptOpen(false)} data={receiptData} />
    </div>
  )
}
