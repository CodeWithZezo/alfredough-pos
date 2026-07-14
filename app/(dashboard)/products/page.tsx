'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Plus, Pencil, Trash2, Package, X, AlertTriangle, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { TableRowSkeleton } from '@/components/ui/Skeleton'
import { TableEmptyState } from '@/components/ui/EmptyState'
import VariantQRModal from '@/components/ui/VariantQRModal'
import { formatCurrency } from '@/lib/utils'

type Variant = { id?: number; name: string; price: string; stock: number; lowStockThreshold: number }
type FormVariant = { id?: number; name: string; price: string; stock: string; lowStockThreshold: string }
type Product = { id: number; name: string; description?: string; categoryId: number; basePrice: number; status: string; category: { name: string }; variants: Variant[] }
type Category = { id: number; name: string }
type AdjustTarget = { variantId: number; variantName: string; productName: string }
type QRVariant = { id: number; name: string; price: number; productName: string; categoryName: string }

const DEFAULT_VARIANT: FormVariant = { name: 'Regular', price: '', stock: '100', lowStockThreshold: '20' }
const EMPTY_VARIANT: FormVariant = { name: '', price: '', stock: '100', lowStockThreshold: '20' }
const INP = 'border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 transition-colors bg-white'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', description: '', categoryId: '', basePrice: '', status: 'active' })
  const [variants, setVariants] = useState<FormVariant[]>([DEFAULT_VARIANT])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [adjustTarget, setAdjustTarget] = useState<AdjustTarget | null>(null)
  const [adjustAction, setAdjustAction] = useState<'add' | 'use' | 'set'>('add')
  const [adjustQty, setAdjustQty] = useState('')
  const [adjustSubmitting, setAdjustSubmitting] = useState(false)

  const [qrVariant, setQrVariant] = useState<QRVariant | null>(null)

  const load = async () => {
    const [p, c] = await Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ])
    setProducts(p); setCategories(c); setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', description: '', categoryId: '', basePrice: '', status: 'active' })
    setVariants([DEFAULT_VARIANT])
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({ name: p.name, description: p.description ?? '', categoryId: String(p.categoryId), basePrice: String(p.basePrice), status: p.status })
    setVariants(p.variants.map(v => ({ id: v.id, name: v.name, price: String(v.price), stock: String(v.stock), lowStockThreshold: String(v.lowStockThreshold) })))
    setErrors({})
    setShowModal(true)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Product name is required'
    if (!form.categoryId) e.categoryId = 'Category is required'
    if (!form.basePrice) e.basePrice = 'Base price is required'
    return e
  }

  const save = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    const body = { ...form, variants }
    if (editing) {
      await fetch(`/api/products/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setSaving(false)
    setShowModal(false)
    load()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/products/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteTarget(null)
    load()
  }

  const openAdjust = (variantId: number, variantName: string, productName: string) => {
    setAdjustTarget({ variantId, variantName, productName })
    setAdjustAction('add')
    setAdjustQty('')
  }

  const submitAdjust = async () => {
    if (!adjustTarget) return
    setAdjustSubmitting(true)
    await fetch(`/api/variants/${adjustTarget.variantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: adjustAction, quantity: Number(adjustQty) }),
    })
    setAdjustSubmitting(false)
    setAdjustTarget(null)
    load()
  }

  const lowStockVariantCount = products.flatMap(p => p.variants).filter(v => v.stock <= v.lowStockThreshold).length

  const segBtn = (label: string, value: 'add' | 'use' | 'set') => (
    <button
      type="button"
      onClick={() => setAdjustAction(value)}
      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${adjustAction === value ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
    >
      {label}
    </button>
  )

  return (
    <div>
      <Topbar title="Products" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500">{products.length} {products.length === 1 ? 'product' : 'products'}</p>
            {lowStockVariantCount > 0 && (
              <span className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-medium">
                <AlertTriangle size={11} /> {lowStockVariantCount} low stock variants
              </span>
            )}
          </div>
          <Button onClick={openAdd} size="md">
            <Plus size={15} /> Add Product
          </Button>
        </div>

        <Table>
          <TableHead>
            <tr>
              <TableHeader>Name</TableHeader>
              <TableHeader>Category</TableHeader>
              <TableHeader>Base Price</TableHeader>
              <TableHeader>Variants</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </tr>
          </TableHead>

          {loading ? (
            <TableRowSkeleton rows={5} cols={6} />
          ) : products.length === 0 ? (
            <TableEmptyState
              colSpan={6}
              icon={Package}
              title="No products yet"
              description="Add your first product to start taking orders."
              action={<Button onClick={openAdd} size="sm"><Plus size={14} /> Add Product</Button>}
            />
          ) : (
            <TableBody>
              {products.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-gray-900">{p.name}</TableCell>
                  <TableCell className="text-gray-600">{p.category.name}</TableCell>
                  <TableCell className="text-gray-700">{formatCurrency(Number(p.basePrice))}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {p.variants.map((v, i) => {
                        const isLow = v.stock <= v.lowStockThreshold
                        return (
                          <div key={v.id ?? i} className="flex items-center gap-1.5 text-xs">
                            <span className="text-gray-500">{v.name} ·</span>
                            {isLow ? (
                              <Badge variant="low">
                                <AlertTriangle size={10} className="mr-1" />{v.stock} in stock
                              </Badge>
                            ) : (
                              <span className="text-gray-600">{v.stock} in stock</span>
                            )}
                            <Button
                              size="sm" variant="ghost"
                              onClick={() => openAdjust(v.id!, v.name, p.name)}
                              className="text-blue-600 hover:bg-blue-50 h-5 px-1.5 text-xs"
                            >
                              Adjust
                            </Button>
                            <Button
                              size="sm" variant="ghost" icon
                              aria-label="Show QR code"
                              onClick={() => setQrVariant({ id: v.id!, name: v.name, price: Number(v.price), productName: p.name, categoryName: p.category.name })}
                              className="text-gray-500 hover:text-gray-700 h-5 w-5"
                            >
                              <QrCode size={12} />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.status === 'active' ? 'active' : 'inactive'}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost" size="sm" icon
                        aria-label={`Edit ${p.name}`}
                        onClick={() => openEdit(p)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost" size="sm" icon
                        aria-label={`Delete ${p.name}`}
                        onClick={() => setDeleteTarget(p)}
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
        title={editing ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <ModalBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Product Name"
                value={form.name}
                onChange={e => { setForm({ ...form, name: e.target.value }); setErrors(p => ({ ...p, name: '' })) }}
                placeholder="e.g. Chicken Burger"
                error={errors.name}
                autoFocus
              />
            </div>
            <div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  value={form.categoryId}
                  onChange={e => { setForm({ ...form, categoryId: e.target.value }); setErrors(p => ({ ...p, categoryId: '' })) }}
                  className={`w-full border rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${form.categoryId ? 'text-gray-900' : 'text-gray-400'} ${errors.categoryId ? 'border-red-400 focus:ring-red-400/20' : 'border-gray-300 focus:border-orange-400 focus:ring-orange-400/20'}`}
                >
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId}</p>}
              </div>
            </div>
            <div>
              <Input
                label="Base Price (Rs.)"
                type="number"
                value={form.basePrice}
                onChange={e => { setForm({ ...form, basePrice: e.target.value }); setErrors(p => ({ ...p, basePrice: '' })) }}
                placeholder="0"
                error={errors.basePrice}
              />
            </div>
            <div className="col-span-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 transition-colors resize-none"
                />
              </div>
            </div>
            {editing && (
              <div>
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
              </div>
            )}
          </div>

          {/* Variants */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Variants</label>
              <Button
                variant="ghost" size="sm"
                onClick={() => setVariants([...variants, EMPTY_VARIANT])}
                className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
              >
                <Plus size={13} /> Add Variant
              </Button>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              {/* Column labels */}
              <div className="flex gap-2 items-center px-1">
                <span className="w-36 text-xs text-gray-400">Name</span>
                <span className="w-24 text-xs text-gray-400">Price</span>
                <span className="w-20 text-xs text-gray-400">Stock</span>
                <span className="w-20 text-xs text-gray-400">Low at</span>
              </div>
              {variants.map((v, i) => {
                const upd = (field: keyof FormVariant, val: string) => { const nv = [...variants]; nv[i] = { ...nv[i], [field]: val }; setVariants(nv) }
                return (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={v.name}
                      onChange={e => upd('name', e.target.value)}
                      className={`w-36 min-w-0 ${INP}`}
                      placeholder="Size (e.g. Small)"
                    />
                    <input
                      type="number"
                      value={v.price}
                      onChange={e => upd('price', e.target.value)}
                      className={`w-24 ${INP}`}
                      placeholder="Price"
                    />
                    <input
                      type="number"
                      value={v.stock}
                      onChange={e => upd('stock', e.target.value)}
                      className={`w-20 ${INP}`}
                      placeholder="100"
                    />
                    <input
                      type="number"
                      value={v.lowStockThreshold}
                      onChange={e => upd('lowStockThreshold', e.target.value)}
                      className={`w-20 ${INP}`}
                      placeholder="20"
                    />
                    {variants.length > 1 && (
                      <Button
                        variant="ghost" size="sm" icon
                        aria-label="Remove variant"
                        onClick={() => setVariants(variants.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                      >
                        <X size={14} />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} loading={saving}>
            {editing ? 'Save Changes' : 'Add Product'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal
        open={!!adjustTarget}
        onClose={() => setAdjustTarget(null)}
        title={adjustTarget ? `Adjust Stock — ${adjustTarget.productName} · ${adjustTarget.variantName}` : ''}
        size="sm"
      >
        <ModalBody className="space-y-4">
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {segBtn('Add', 'add')}
            {segBtn('Use', 'use')}
            {segBtn('Set', 'set')}
          </div>
          <Input
            label="Quantity"
            type="number"
            value={adjustQty}
            onChange={e => setAdjustQty(e.target.value)}
            placeholder="0"
            autoFocus
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setAdjustTarget(null)} disabled={adjustSubmitting}>Cancel</Button>
          <Button variant="primary" onClick={submitAdjust} loading={adjustSubmitting}>Confirm</Button>
        </ModalFooter>
      </Modal>

      {/* QR Modal */}
      {qrVariant && (
        <VariantQRModal
          open={!!qrVariant}
          onClose={() => setQrVariant(null)}
          variant={qrVariant}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete product?"
        description={`"${deleteTarget?.name}" will be permanently deleted along with its variants.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}
