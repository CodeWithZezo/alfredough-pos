'use client'
import { useEffect, useRef, useState } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, Camera } from 'lucide-react'

type ScanState = 'idle' | 'starting' | 'scanning' | 'error' | 'denied'

interface Props {
  open: boolean
  onClose: () => void
  onScan: (variantId: number) => void
}

const ELEMENT_ID = 'alfredough-qr-reader'
const QR_PATTERN = /^alfredough:v:(\d+)$/

export default function QRScanner({ open, onClose, onScan }: Props) {
  const scannerRef = useRef<InstanceType<typeof import('html5-qrcode')['Html5Qrcode']> | null>(null)
  const [state, setState] = useState<ScanState>('idle')

  const stopScanner = async () => {
    if (!scannerRef.current) return
    try {
      await scannerRef.current.stop()
      scannerRef.current.clear()
    } catch {
      // already stopped or never started — safe to ignore
    }
    scannerRef.current = null
  }

  const handleClose = async () => {
    await stopScanner()
    setState('idle')
    onClose()
  }

  useEffect(() => {
    if (!open) {
      stopScanner()
      setState('idle')
      return
    }

    let cancelled = false
    setState('starting')

    const run = async () => {
      // Dynamic import keeps SSR clean and avoids issues with html5-qrcode
      // accessing `document` at module load time
      const { Html5Qrcode } = await import('html5-qrcode')

      if (cancelled) return

      const scanner = new Html5Qrcode(ELEMENT_ID)
      scannerRef.current = scanner

      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (text) => {
            const match = text.match(QR_PATTERN)
            if (!match) return // keep scanning — not our QR
            await stopScanner()
            setState('idle')
            onScan(parseInt(match[1], 10))
          },
          () => {
            // per-frame decode failure — normal while camera is moving, ignore
          },
        )
        if (!cancelled) setState('scanning')
      } catch (err: unknown) {
        if (cancelled) return
        const name = err instanceof Error ? err.name : ''
        if (name === 'NotAllowedError' || name === 'NotFoundError') {
          setState('denied')
        } else {
          setState('error')
        }
        scannerRef.current = null
      }
    }

    run()

    return () => {
      cancelled = true
      stopScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Modal open={open} onClose={handleClose} title="Scan QR Code" size="md">
      <ModalBody>
        {state === 'denied' ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <p className="text-sm font-medium text-gray-800">Camera access denied</p>
            <p className="text-xs text-gray-500">Enable camera permission in your browser settings and try again.</p>
          </div>
        ) : state === 'error' ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Camera size={22} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-800">Camera unavailable</p>
            <p className="text-xs text-gray-500">Could not access the camera. Make sure it is connected and not in use.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div
              id={ELEMENT_ID}
              className="w-full rounded-xl border border-gray-200 overflow-hidden"
              style={{ height: 320 }}
            />
            <p className="text-xs text-gray-400">
              {state === 'starting' ? 'Starting camera…' : 'Scanning…'}
            </p>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
      </ModalFooter>
    </Modal>
  )
}
