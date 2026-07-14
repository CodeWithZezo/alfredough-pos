'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
import { Plus, Minus, ShoppingCart, Package, X, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState } from '@/components/ui/EmptyState'
import QRScanner from '@/components/ui/QRScanner'
import ReceiptModal from '@/components/receipt/ReceiptModal'
import { type ReceiptData } from '@/components/receipt/Receipt'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Variant = { id: number; name: string; price: number; stock: number; lowStockThreshold: number }
type Product = { id: number; name: string; category: { name: string }; variants: Variant[] }
type Customer = { id: number; name: string; phone: string }
type CartItem = { variantId: number; productName: string; variantName: string; unitPrice: number; quantity: number; notes: string; stock: number }

const ORDER_TYPES = [
  { value: 'dine_in',  label: 'Dine In' },
  { value: 'takeaway', label: 'Takeaway' },
  { value: 'delivery', label: 'Delivery' },
] as const

export default function NewOrderPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [orderType, setOrderType] = useState('dine_in')
  const [serviceCharge, setServiceCharge] = useState('0')
  const [discountType, setDiscountType] = useState('')
  const [discountValue, setDiscountValue] = useState('0')
  const [deliveryFee, setDeliveryFee] = useState('0')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanError, setScanError] = useState('')
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts)
    fetch('/api/customers').then(r => r.json()).then(setCustomers)
  }, [])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.name.toLowerCase().includes(search.toLowerCase())
  )

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  )

  const addToCart = (product: Product, variant: Variant) => {
    setSubmitError('')
    setCart(prev => {
      const existing = prev.find(i => i.variantId === variant.id)
      if (existing) {
        if (existing.quantity + 1 > variant.stock) {
          setSubmitError(`Only ${variant.stock} ${product.name} (${variant.name}) in stock`)
          return prev
        }
        return prev.map(i => i.variantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { variantId: variant.id, productName: product.name, variantName: variant.name, unitPrice: Number(variant.price), quantity: 1, notes: '', stock: variant.stock }]
    })
  }

  const updateQty = (variantId: number, qty: number) => {
    if (qty <= 0) return setCart(prev => prev.filter(i => i.variantId !== variantId))
    const item = cart.find(i => i.variantId === variantId)
    if (item && qty > item.stock) {
      setSubmitError(`Only ${item.stock} ${item.productName} (${item.variantName}) in stock`)
      return
    }
    setSubmitError('')
    setCart(prev => prev.map(i => i.variantId === variantId ? { ...i, quantity: qty } : i))
  }

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const discountAmount = discountType === 'percentage' ? subtotal * Number(discountValue) / 100 : Number(discountValue)
  const total = subtotal + Number(serviceCharge) + Number(deliveryFee) - discountAmount

  const handleScan = (variantId: number) => {
    setScannerOpen(false)
    const all = products.flatMap(p => p.variants.map(v => ({ product: p, variant: v })))
    const hit = all.find(x => x.variant.id === variantId)
    const showErr = (msg: string) => {
      setScanError(msg)
      setTimeout(() => setScanError(''), 3000)
    }
    if (!hit) return showErr('Unknown QR code — try again')
    if (hit.variant.stock === 0) return showErr(`Out of stock: ${hit.product.name} (${hit.variant.name})`)
    addToCart(hit.product, hit.variant)
  }

  const submit = async () => {
    if (cart.length === 0) { setSubmitError('Add at least one item to the order'); return }
    setSaving(true)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: selectedCustomer?.id ?? null,
        orderType,
        items: cart.map(i => ({ variantId: i.variantId, quantity: i.quantity, unitPrice: i.unitPrice })),
        serviceCharge,
        discountType: discountType || null,
        discountValue,
        deliveryFee,
        notes,
      }),
    })
    setSaving(false)
    if (res.status === 409) {
      const { detail } = await res.json()
      setSubmitError(`Stock changed — ${detail}`)
      return
    }
    if (!res.ok) {
      setSubmitError('Failed to place order — please try again')
      return
    }
    const order = await res.json()
    setReceiptData({
      orderId: order.id,
      createdAt: order.createdAt,
      orderType,
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      notes: notes || undefined,
      items: cart.map(i => ({
        name: i.productName,
        variantName: i.variantName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.unitPrice * i.quantity,
      })),
      subtotal,
      serviceCharge: Number(serviceCharge),
      deliveryFee: Number(deliveryFee),
      discountAmount,
      total,
    })
    setReceiptOpen(true)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="New Order" />

      {/* Main layout: stacks on mobile, side-by-side on lg+ */}
      <div className="flex flex-col-reverse lg:flex-row gap-5 p-5 flex-1 lg:h-[calc(100vh-64px)] overflow-hidden">

        {/* ── Left: Product Picker ─────────────────── */}
        <div className="flex flex-col gap-4 flex-1 min-w-0 lg:overflow-hidden">
          <div className="flex gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search products or categories..."
            />
            <Button variant="secondary" size="md" onClick={() => setScannerOpen(true)} className="shrink-0">
              <ScanLine size={15} /> Scan QR
            </Button>
          </div>
          {scanError && (
            <p className="text-xs text-red-500 -mt-2">{scanError}</p>
          )}
          <div className="lg:overflow-y-auto space-y-3 pr-1">
            {filtered.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No products found"
                description={search ? 'Try a different search term.' : 'No active products available.'}
              />
            ) : filtered.map(p => {
              return (
                <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-(--shadow-card) p-4">
                  <div className="font-semibold text-gray-900 text-sm">{p.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5 mb-3">{p.category.name}</div>
                  <div className="flex flex-wrap gap-2">
                    {p.variants.map(v => {
                      const inCart = cart.find(i => i.variantId === v.id)
                      const outOfStock = v.stock === 0
                      const lowStock = !outOfStock && v.stock <= v.lowStockThreshold
                      return (
                        <button
                          key={v.id}
                          onClick={() => !outOfStock && addToCart(p, v)}
                          disabled={outOfStock}
                          className={cn(
                            'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 border',
                            outOfStock
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : 'bg-orange-50 hover:bg-orange-100 active:bg-orange-200 text-orange-700 border-orange-200'
                          )}
                        >
                          {!outOfStock && <Plus size={11} />}
                          {v.name} — {formatCurrency(Number(v.price))}
                          {outOfStock && (
                            <span className="text-[10px] uppercase tracking-wide ml-1">Out of stock</span>
                          )}
                          {lowStock && (
                            <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full font-medium ml-1">
                              Only {v.stock} left
                            </span>
                          )}
                          {inCart && !outOfStock && (
                            <span className="ml-1 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                              {inCart.quantity}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Right: Order Summary ─────────────────── */}
        <div className="w-full lg:w-96 shrink-0 flex flex-col gap-4 lg:overflow-y-auto">

          {/* Order Details card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-(--shadow-card) p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm">Order Details</h3>

            {/* Order type — segmented button group */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">Order Type</label>
              <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                {ORDER_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setOrderType(value)}
                    className={cn(
                      'flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
                      orderType === value
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer search */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-xs font-medium text-gray-500">Customer <span className="text-gray-300">(optional)</span></label>
              {selectedCustomer ? (
                <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-orange-800">{selectedCustomer.name}</p>
                    <p className="text-xs text-orange-600">{selectedCustomer.phone}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedCustomer(null); setCustomerSearch('') }}
                    className="text-orange-400 hover:text-orange-600 p-1 rounded transition-colors"
                    aria-label="Remove customer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <Input
                    value={customerSearch}
                    onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true) }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 150)}
                    placeholder="Search by name or phone..."
                  />
                  {showCustomerDropdown && customerSearch && filteredCustomers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 border border-gray-200 rounded-xl bg-white shadow-(--shadow-dropdown) max-h-36 overflow-y-auto">
                      {filteredCustomers.slice(0, 5).map(c => (
                        <button
                          key={c.id}
                          onMouseDown={() => { setSelectedCustomer(c); setCustomerSearch(c.name); setShowCustomerDropdown(false) }}
                          className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                        >
                          <span className="font-medium text-gray-800">{c.name}</span>
                          <span className="text-gray-400 ml-2 text-xs">{c.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Cart */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-(--shadow-card) p-4 flex flex-col gap-3">
            <h3 className="font-semibold text-gray-900 text-sm">Cart</h3>
            {cart.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="Cart is empty"
                description="Add products from the left panel."
                className="py-8"
              />
            ) : (
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.variantId} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-800 truncate">{item.productName}</div>
                      <div className="text-xs text-gray-500">{item.variantName} · {formatCurrency(item.unitPrice)}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQty(item.variantId, item.quantity - 1)}
                        className="w-6 h-6 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-xs font-semibold w-5 text-center text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.variantId, item.quantity + 1)}
                        className="w-6 h-6 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <div className="text-xs font-semibold text-gray-800 w-16 text-right">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Charges & totals */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-(--shadow-card) p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <Input
                label="Service Charge"
                type="number"
                value={serviceCharge}
                onChange={e => setServiceCharge(e.target.value)}
              />
              <Input
                label="Delivery Fee"
                type="number"
                value={deliveryFee}
                onChange={e => setDeliveryFee(e.target.value)}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Discount Type</label>
                <select
                  value={discountType}
                  onChange={e => setDiscountType(e.target.value)}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 transition-colors ${discountType ? 'text-gray-900' : 'text-gray-400'}`}
                >
                  <option value="">None</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="amount">Fixed (Rs.)</option>
                </select>
              </div>
              <Input
                label="Discount Value"
                type="number"
                value={discountValue}
                onChange={e => setDiscountValue(e.target.value)}
                disabled={!discountType}
              />
            </div>

            {/* Totals breakdown */}
            <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {Number(serviceCharge) > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Service Charge</span>
                  <span>{formatCurrency(Number(serviceCharge))}</span>
                </div>
              )}
              {Number(deliveryFee) > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(Number(deliveryFee))}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-red-500 font-medium">
                  <span>Discount</span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-sm pt-1.5 border-t border-gray-100">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {submitError && (
              <p role="alert" className="text-xs text-red-500 text-center">{submitError}</p>
            )}

            <Button
              onClick={submit}
              loading={saving}
              disabled={cart.length === 0}
              size="lg"
              className="w-full"
            >
              {saving ? 'Placing Order…' : 'Place Order'}
            </Button>
          </div>
        </div>
      </div>

      <QRScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />

      <ReceiptModal
        open={receiptOpen}
        onClose={() => { setReceiptOpen(false); router.push('/orders') }}
        data={receiptData}
      />
    </div>
  )
}
