'use client'
import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Printer } from 'lucide-react'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Receipt, type ReceiptData } from '@/components/receipt/Receipt'

interface ReceiptModalProps {
  open: boolean
  onClose: () => void
  data: ReceiptData | null
}

export default function ReceiptModal({ open, onClose, data }: ReceiptModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({ contentRef })

  return (
    <Modal open={open} onClose={onClose} title="Receipt" size="sm">
      <ModalBody>
        {data && (
          <div className="bg-gray-50 rounded-xl p-3 max-h-[60vh] overflow-y-auto">
            <Receipt ref={contentRef} data={data} />
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button variant="primary" onClick={() => handlePrint()} disabled={!data}>
          <Printer size={14} /> Print
        </Button>
      </ModalFooter>
    </Modal>
  )
}
