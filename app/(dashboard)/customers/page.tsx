'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { TableRowSkeleton } from '@/components/ui/Skeleton'
import { TableEmptyState } from '@/components/ui/EmptyState'
import { SearchInput } from '@/components/ui/SearchInput'

type Customer = { id: number; name: string; phone: string; address?: string; createdAt: string; _count: { orders: number } }

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async (q = '') => {
    const res = await fetch(`/api/customers?search=${q}`)
    setCustomers(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSearch = (v: string) => { setSearch(v); load(v) }

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', phone: '', address: '' })
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (c: Customer) => {
    setEditing(c)
    setForm({ name: c.name, phone: c.phone, address: c.address ?? '' })
    setErrors({})
    setShowModal(true)
  }

  const validate = () => {
    const e: typeof errors = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    return e
  }

  const save = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    if (editing) {
      await fetch(`/api/customers/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setSaving(false)
    setShowModal(false)
    load(search)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/customers/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteTarget(null)
    load(search)
  }

  return (
    <div>
      <Topbar title="Customers" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6 gap-4">
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Search by name or phone..."
            className="max-w-xs flex-1"
          />
          <Button onClick={openAdd} size="md">
            <Plus size={15} /> Add Customer
          </Button>
        </div>

        <Table>
          <TableHead>
            <tr>
              <TableHeader>Name</TableHeader>
              <TableHeader>Phone</TableHeader>
              <TableHeader>Address</TableHeader>
              <TableHeader>Orders</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </tr>
          </TableHead>

          {loading ? (
            <TableRowSkeleton rows={5} cols={5} />
          ) : customers.length === 0 ? (
            <TableEmptyState
              colSpan={5}
              icon={Users}
              title="No customers found"
              description={search ? 'Try a different search term.' : 'Add your first customer to get started.'}
              action={!search ? <Button onClick={openAdd} size="sm"><Plus size={14} /> Add Customer</Button> : undefined}
            />
          ) : (
            <TableBody>
              {customers.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-gray-900">{c.name}</TableCell>
                  <TableCell className="text-gray-600">{c.phone}</TableCell>
                  <TableCell className="text-gray-500 max-w-50 truncate">{c.address ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant="neutral">{c._count.orders} orders</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost" size="sm" icon
                        aria-label={`Edit ${c.name}`}
                        onClick={() => openEdit(c)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost" size="sm" icon
                        aria-label={`Delete ${c.name}`}
                        onClick={() => setDeleteTarget(c)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Customer' : 'Add Customer'}
        size="sm"
      >
        <ModalBody>
          <Input
            label="Name"
            value={form.name}
            onChange={e => { setForm({ ...form, name: e.target.value }); setErrors(p => ({ ...p, name: '' })) }}
            placeholder="Customer name"
            error={errors.name}
            autoFocus
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors(p => ({ ...p, phone: '' })) }}
            placeholder="+92 3XX XXXXXXX"
            error={errors.phone}
          />
          <Input
            label="Address"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="Optional"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} loading={saving}>
            {editing ? 'Save Changes' : 'Add Customer'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete customer?"
        description={`"${deleteTarget?.name}" will be permanently removed. All associated order history is preserved.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}
