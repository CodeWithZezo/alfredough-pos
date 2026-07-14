'use client'
import { forwardRef } from 'react'
import { BUSINESS_INFO } from '@/lib/business'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export type ReceiptItem = {
  name: string
  variantName?: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type ReceiptData = {
  orderId: number
  createdAt: string | Date
  orderType: string
  cashierName?: string
  customerName?: string
  customerPhone?: string
  items: ReceiptItem[]
  subtotal: number
  serviceCharge: number
  deliveryFee: number
  discountAmount: number
  total: number
  notes?: string
}

type ApiOrder = {
  id: number
  createdAt: string
  orderType: string
  notes?: string | null
  subtotal: number | string
  serviceCharge: number | string
  deliveryFee: number | string
  discountAmount: number | string
  total: number | string
  admin?: { name: string } | null
  customer?: { name: string; phone: string } | null
  items: {
    quantity: number
    unitPrice: number | string
    subtotal: number | string
    variant: { name: string; product: { name: string } }
  }[]
}

export function orderToReceiptData(order: ApiOrder): ReceiptData {
  return {
    orderId: order.id,
    createdAt: order.createdAt,
    orderType: order.orderType,
    cashierName: order.admin?.name,
    customerName: order.customer?.name,
    customerPhone: order.customer?.phone,
    notes: order.notes ?? undefined,
    items: order.items.map(i => ({
      name: i.variant.product.name,
      variantName: i.variant.name,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      subtotal: Number(i.subtotal),
    })),
    subtotal: Number(order.subtotal),
    serviceCharge: Number(order.serviceCharge),
    deliveryFee: Number(order.deliveryFee),
    discountAmount: Number(order.discountAmount),
    total: Number(order.total),
  }
}

interface ReceiptProps {
  data: ReceiptData
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(function Receipt({ data }, ref) {
  return (
    <div ref={ref} className="w-[302px] mx-auto bg-white text-gray-900 font-mono text-xs p-3">
      <style>{'@media print { @page { size: 80mm auto; margin: 0; } }'}</style>

      <div className="text-center space-y-0.5 mb-2">
        <p className="text-sm font-bold">{BUSINESS_INFO.name}</p>
        <p className="text-[11px] text-gray-600">{BUSINESS_INFO.tagline}</p>
        <p className="text-[11px] text-gray-600">{BUSINESS_INFO.address}</p>
        <p className="text-[11px] text-gray-600">{BUSINESS_INFO.phone}</p>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2" />

      <div className="space-y-0.5">
        <div className="flex justify-between">
          <span>Order #</span>
          <span>{data.orderId}</span>
        </div>
        <div className="flex justify-between">
          <span>Date</span>
          <span>{formatDateTime(data.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span>Type</span>
          <span className="capitalize">{data.orderType.replace('_', ' ')}</span>
        </div>
        {data.cashierName && (
          <div className="flex justify-between">
            <span>Cashier</span>
            <span>{data.cashierName}</span>
          </div>
        )}
        {data.customerName && (
          <div className="flex justify-between">
            <span>Customer</span>
            <span>{data.customerName}</span>
          </div>
        )}
        {data.customerPhone && (
          <div className="flex justify-between">
            <span>Phone</span>
            <span>{data.customerPhone}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-gray-400 my-2" />

      <div className="space-y-1">
        {data.items.map((item, i) => (
          <div key={i}>
            <div>{item.name}{item.variantName ? ` (${item.variantName})` : ''}</div>
            <div className="flex justify-between text-gray-600">
              <span>{item.quantity} x {formatCurrency(item.unitPrice)}</span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-gray-400 my-2" />

      <div className="space-y-0.5">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(data.subtotal)}</span>
        </div>
        {data.serviceCharge > 0 && (
          <div className="flex justify-between">
            <span>Service Charge</span>
            <span>{formatCurrency(data.serviceCharge)}</span>
          </div>
        )}
        {data.deliveryFee > 0 && (
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>{formatCurrency(data.deliveryFee)}</span>
          </div>
        )}
        {data.discountAmount > 0 && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>- {formatCurrency(data.discountAmount)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-gray-400 my-2" />

      <div className="flex justify-between text-sm font-bold">
        <span>Total</span>
        <span>{formatCurrency(data.total)}</span>
      </div>

      {data.notes && (
        <>
          <div className="border-t border-dashed border-gray-400 my-2" />
          <p className="text-[11px] text-gray-600">Note: {data.notes}</p>
        </>
      )}

      <div className="border-t border-dashed border-gray-400 my-2" />

      <p className="text-center text-[11px] text-gray-600">{BUSINESS_INFO.footerMessage}</p>
    </div>
  )
})
