'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { TableRowSkeleton } from '@/components/ui/Skeleton'
import { TableEmptyState as EmptyRow } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'

type Category = { id: number; name: string; status: string; createdAt: string }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', status: 'active' })
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    const res = await fetch('/api/categories')
    setCategories(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', status: 'active' })
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (c: Category) => {
    setEditing(c)
    setForm({ name: c.name, status: c.status })
    setFormError('')
    setShowModal(true)
  }

  const save = async () => {
    if (!form.name.trim()) { setFormError('Category name is required'); return }
    setSaving(true)
    if (editing) {
      await fetch(`/api/categories/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setSaving(false)
    setShowModal(false)
    load()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/categories/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteTarget(null)
    load()
  }

  return (
    <div>
      <Topbar title="Categories" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-500">{categories.length} {categories.length === 1 ? 'category' : 'categories'}</p>
          <Button onClick={openAdd} size="md">
            <Plus size={15} /> Add Category
          </Button>
        </div>

        <Table>
          <TableHead>
            <tr>
              <TableHeader>#</TableHeader>
              <TableHeader>Name</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Created</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </tr>
          </TableHead>

          {loading ? (
            <TableRowSkeleton rows={5} cols={5} />
          ) : categories.length === 0 ? (
            <EmptyRow
              colSpan={5}
              icon={Tag}
              title="No categories yet"
              description="Add your first category to get started."
              action={<Button onClick={openAdd} size="sm"><Plus size={14} /> Add Category</Button>}
            />
          ) : (
            <TableBody>
              {categories.map((c, i) => (
                <TableRow key={c.id}>
                  <TableCell className="text-gray-400 w-10">{i + 1}</TableCell>
                  <TableCell className="font-medium text-gray-900">{c.name}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === 'active' ? 'active' : 'inactive'}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">{formatDate(new Date(c.createdAt))}</TableCell>
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
        title={editing ? 'Edit Category' : 'Add Category'}
        size="sm"
      >
        <ModalBody>
          <Input
            label="Name"
            value={form.name}
            onChange={e => { setForm({ ...form, name: e.target.value }); setFormError('') }}
            placeholder="e.g. Burgers"
            error={formError}
            autoFocus
          />
          {editing && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 transition-colors"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} loading={saving}>
            {editing ? 'Save Changes' : 'Add Category'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete category?"
        description={`"${deleteTarget?.name}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}
