import { lazy, Suspense, useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { downloadReceipt, fetchReceipt, receiptTarget } from '../../lib/receipt'
import type { ReceiptData } from '../../lib/receipt'
import '../../styles/receipt.css'

const ReceiptPreview = lazy(() => import('./ReceiptPreview'))

export function ReceiptActions({ order, showDownload = true }: { order: { id: number; history_source?: string; source_id?: number }; showDownload?: boolean }) {
  const target = receiptTarget(order)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [document, setDocument] = useState<{ receipt: ReceiptData; blob: Blob } | null>(null)
  const [printReady, setPrintReady] = useState(false)
  const controller = useRef<AbortController | null>(null)
  const generation = useRef(0)
  const dialog = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const close = useCallback(() => {
    controller.current?.abort()
    generation.current++
    setOpen(false); setDocument(null); setBusy(false); setPrintReady(false); setError('')
  }, [])
  useEffect(() => () => { controller.current?.abort(); generation.current++ }, [target.source, target.id])
  useEffect(() => {
    if (!open) return
    const previous = trigger.current
    const overflow = window.document.body.style.overflow
    window.document.body.style.overflow = 'hidden'
    dialog.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close() }
      if (event.key === 'Tab') {
        const nodes = dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
        const first = nodes?.[0], last = nodes?.[nodes.length - 1]
        const active = window.document.activeElement
        const outside = active === dialog.current || !dialog.current?.contains(active)
        if (event.shiftKey && (active === first || outside)) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && (active === last || outside)) { event.preventDefault(); first?.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [open, close])

  async function load(preview: boolean) {
    if (busy) return
    const version = ++generation.current
    controller.current?.abort()
    controller.current = new AbortController()
    if (preview && !open) trigger.current = window.document.activeElement as HTMLElement | null
    setError(''); setBusy(true); setDocument(null); setPrintReady(false)
    if (preview) setOpen(true)
    try {
      const receipt = await fetchReceipt(target.source, target.id, controller.current.signal)
      if (version !== generation.current) return
      const { generateReceiptPdf } = await import('../../lib/receiptPdf')
      const blob = await generateReceiptPdf(receipt)
      if (version !== generation.current) return
      if (preview) setDocument({ receipt, blob })
      else downloadReceipt(blob, receipt.number)
    } catch (err) {
      if (version === generation.current) setError(err instanceof Error ? err.message : 'Unable to prepare the receipt. Please try again.')
    } finally {
      if (version === generation.current) setBusy(false)
    }
  }

  return <div className="receipt-actions">
    <button type="button" disabled={busy} onClick={() => void load(true)}>View Receipt</button>
    {showDownload && <button type="button" disabled={busy} onClick={() => void load(false)}>Download PDF</button>}
    {busy && !open && <span role="status">Preparing PDF…</span>}
    {error && !open && <span role="alert">{error}</span>}
    {open && createPortal(<div className="receipt-overlay">
      <div ref={dialog} className="receipt-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <header className="receipt-toolbar">
          <h2 id={titleId}>Receipt{document ? ` · ${document.receipt.number}` : ''}</h2>
          <div>
            <button type="button" disabled={!printReady} onClick={() => window.print()}>Print</button>
            <button type="button" disabled={!document} onClick={() => document && downloadReceipt(document.blob, document.receipt.number)}>Download PDF</button>
            <button type="button" onClick={close}>Close</button>
          </div>
        </header>
        <div className="receipt-preview-body">
          {busy && <p role="status">Preparing your receipt…</p>}
          {error && <div role="alert"><p>{error}</p><button type="button" onClick={() => void load(true)}>Try Again</button></div>}
          {document && <Suspense fallback={<p role="status">Loading preview…</p>}>
            <ReceiptPreview blob={document.blob} onReady={setPrintReady} />
          </Suspense>}
        </div>
      </div>
    </div>, window.document.body)}
  </div>
}
