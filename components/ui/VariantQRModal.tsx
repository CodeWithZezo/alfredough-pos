'use client'
import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

type QRVariant = { id: number; name: string; price: number; productName: string; categoryName: string }

interface Props {
  open: boolean
  onClose: () => void
  variant: QRVariant
}

export default function VariantQRModal({ open, onClose, variant }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!open || !canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, `alfredough:v:${variant.id}`, {
      width: 240,
      margin: 2,
      color: { dark: '#111827', light: '#ffffff' },
    })
  }, [open, variant.id])

  return (
    <Modal open={open} onClose={onClose} title="Variant QR Code" size="sm">
      <ModalBody>
        <div className="flex flex-col items-center gap-4">
          <canvas
            ref={canvasRef}
            className="rounded-xl border border-gray-100"
          />
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">{variant.productName}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {variant.name} · {formatCurrency(variant.price)}
            </p>
            <p className="text-[11px] text-gray-400 mt-2 font-mono">
              alfredough:v:{variant.id}
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  )
}
