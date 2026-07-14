'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Plus, Trash2, History, AlertTriangle, ArchiveX } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { TableRowSkeleton } from '@/components/ui/Skeleton'
import { TableEmptyState } from '@/components/ui/EmptyState'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'

type Stock = { id: number; name: string; quantity: number; unit: string; minStock: number; updatedAt: string }
type HistoryEntry = { id: number; action: string; quantity: number; note?: string; createdAt: string }

const actionBadgeVariant: Record<string, 'completed' | 'cancelled' | 'neutral' | 'inactive'> = {
  add: 'completed',
  use: 'cancelled',
  update: 'neutral',
  delete: 'inactive',
}

export default function InventoryPage() {
  const [stock, setStock] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addSaving, setAddSaving] = useState(false)
  const [actionModal, setActionModal] = useState<{ item: Stock; type: 'add' | 'use' | 'update' } | null>(null)
  const [actionSubmitting, setActionSubmitting] = useState(false)
  const [historyModal, setHistoryModal] = useState<{ item: Stock; entries: HistoryEntry[] } | null>(null)
  const [form, setForm] = useState({ name: '', quantity: '', unit: '', minStock: '0' })
  const [actionQty, setActionQty] = useState('')
  const [actionNote, setActionNote] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Stock | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    const res = await fetch('/api/inventory')
    setStock(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addStock = async () => {
    setAddSaving(true)
    await fetch('/api/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setAddSaving(false)
    setShowAddModal(false)
    setForm({ name: '', quantity: '', unit: '', minStock: '0' })
    load()
  }

  const doAction = async () => {
    if (!actionModal) return
    setActionSubmitting(true)
    await fetch(`/api/inventory/${actionModal.item.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: actionModal.type, quantity: actionQty, note: actionNote }),
    })
    setActionSubmitting(false)
    setActionModal(null)
    setActionQty('')
    setActionNote('')
    load()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/inventory/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteTarget(null)
    load()
  }

  const showHistory = async (item: Stock) => {
    const res = await fetch(`/api/inventory/${item.id}`)
    setHistoryModal({ item, entries: await res.json() })
  }

  const lowStockCount = stock.filter(s => Number(s.quantity) <= Number(s.minStock)).length

  const actionLabel: Record<string, string> = { add: 'Add Stock', use: 'Use Stock', update: 'Set Stock' }

  return (
    <div>
      <Topbar title="Inventory" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500">{stock.length} {stock.length === 1 ? 'item' : 'items'}</p>
            {lowStockCount > 0 && (
              <span className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-medium">
                <AlertTriangle size={11} /> {lowStockCount} low stock
              </span>
            )}
          </div>
          <Button onClick={() => setShowAddModal(true)} size="md">
            <Plus size={15} /> Add Stock Item
          </Button>
        </div>

        <Table>
          <TableHead>
            <tr>
              <TableHeader>Name</TableHeader>
              <TableHeader>Quantity</TableHeader>
              <TableHeader>Unit</TableHeader>
              <TableHeader>Min Stock</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </tr>
          </TableHead>

          {loading ? (
            <TableRowSkeleton rows={6} cols={6} />
          ) : stock.length === 0 ? (
            <TableEmptyState
              colSpan={6}
              icon={ArchiveX}
              title="No stock items"
              description="Add your first item to start tracking kitchen inventory."
              action={<Button onClick={() => setShowAddModal(true)} size="sm"><Plus size={14} /> Add Item</Button>}
            />
          ) : (
            <TableBody>
              {stock.map(s => {
                const isLow = Number(s.quantity) <= Number(s.minStock)
                return (
                  <TableRow key={s.id} className={isLow ? 'bg-red-50/40' : ''}>
                    <TableCell className="font-medium text-gray-900">{s.name}</TableCell>
                    <TableCell className={cn('font-semibold', isLow ? 'text-red-600' : 'text-gray-700')}>
                      {Number(s.quantity).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-500">{s.unit}</TableCell>
                    <TableCell className="text-gray-500">{Number(s.minStock).toLocaleString()}</TableCell>
                    <TableCell>
                      {isLow ? (
                        <Badge variant="low">
                          <AlertTriangle size={10} className="mr-1" /> Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="ok">OK</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {/* Primary stock actions */}
                        <Button size="sm" variant="ghost"
                          onClick={() => { setActionModal({ item: s, type: 'add' }); setActionQty(''); setActionNote('') }}
                          className="text-green-700 hover:bg-green-50 hover:text-green-800"
                        >
                          Add
                        </Button>
                        <Button size="sm" variant="ghost"
                          onClick={() => { setActionModal({ item: s, type: 'use' }); setActionQty(''); setActionNote('') }}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          Use
                        </Button>
                        <Button size="sm" variant="ghost"
                          onClick={() => { setActionModal({ item: s, type: 'update' }); setActionQty(''); setActionNote('') }}
                          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          Set
                        </Button>

                        {/* Divider */}
                        <div className="w-px h-4 bg-gray-200 mx-0.5" aria-hidden="true" />

                        {/* Secondary actions */}
                        <Button size="sm" variant="ghost" icon
                          aria-label={`View history for ${s.name}`}
                          onClick={() => showHistory(s)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <History size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" icon
                          aria-label={`Delete ${s.name}`}
                          onClick={() => setDeleteTarget(s)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          )}
        </Table>
      </div>

      {/* Add Stock Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Stock Item" size="sm">
        <ModalBody>
          <Input
            label="Item Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Flour"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Initial Quantity"
              type="number"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
              placeholder="0"
            />
            <Input
              label="Unit"
              value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })}
              placeholder="e.g. kg"
            />
          </div>
          <Input
            label="Min Stock Alert"
            type="number"
            value={form.minStock}
            onChange={e => setForm({ ...form, minStock: e.target.value })}
            placeholder="0"
            hint="Alert when quantity falls to or below this value"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={addSaving}>Cancel</Button>
          <Button variant="primary" onClick={addStock} loading={addSaving}>Add Item</Button>
        </ModalFooter>
      </Modal>

      {/* Action Modal */}
      <Modal
        open={!!actionModal}
        onClose={() => setActionModal(null)}
        title={actionModal ? `${actionLabel[actionModal.type]} — ${actionModal.item.name}` : ''}
        size="sm"
      >
        <ModalBody>
          <Input
            label={`Quantity (${actionModal?.item.unit ?? ''})`}
            type="number"
            value={actionQty}
            onChange={e => setActionQty(e.target.value)}
            placeholder="0"
            autoFocus
          />
          <Input
            label="Note (optional)"
            value={actionNote}
            onChange={e => setActionNote(e.target.value)}
            placeholder="Optional note"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setActionModal(null)} disabled={actionSubmitting}>Cancel</Button>
          <Button variant="primary" onClick={doAction} loading={actionSubmitting}>Confirm</Button>
        </ModalFooter>
      </Modal>

      {/* History Modal */}
      <Modal
        open={!!historyModal}
        onClose={() => setHistoryModal(null)}
        title={historyModal ? `Stock History — ${historyModal.item.name}` : ''}
        size="lg"
      >
        <div className="max-h-80 overflow-y-auto space-y-2">
          {historyModal?.entries.length === 0 ? (
            <EmptyState icon={History} title="No history yet" description="Actions on this item will appear here." />
          ) : historyModal?.entries.map(e => (
            <div key={e.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
              <Badge variant={actionBadgeVariant[e.action] ?? 'neutral'} className="shrink-0 capitalize">
                {e.action}
              </Badge>
              <span className="font-medium text-gray-700">{Number(e.quantity).toLocaleString()} {historyModal.item.unit}</span>
              <span className="text-gray-500 flex-1 truncate">{e.note ?? ''}</span>
              <span className="text-gray-400 text-xs shrink-0">{new Date(e.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete stock item?"
        description={`"${deleteTarget?.name}" and its history will be permanently deleted.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}
