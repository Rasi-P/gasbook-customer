import { useEffect, useState } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = workerUrl

/** Render the actual downloadable PDF, including its pagination, on mobile as well as desktop. */
export default function ReceiptPreview({ blob, onReady }: { blob: Blob; onReady: (ready: boolean) => void }) {
  const [pages, setPages] = useState<{ image: string; text: string }[]>([])
  const [error, setError] = useState(false)
  const [zoom, setZoom] = useState(false)
  useEffect(() => {
    let cancelled = false
    let task: ReturnType<typeof getDocument> | undefined
    onReady(false)
    async function render() {
      const bytes = new Uint8Array(await blob.arrayBuffer())
      if (cancelled) return
      task = getDocument({ data: bytes })
      const document = await task.promise
      const rendered = []
      for (let i = 1; i <= document.numPages; i++) {
        if (cancelled) return
        const page = await document.getPage(i)
        const canvas = window.document.createElement('canvas')
        const viewport = page.getViewport({ scale: 2 })
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        await page.render({ canvas, viewport }).promise
        const text = (await page.getTextContent()).items.map(item => 'str' in item ? item.str : '').join(' ')
        rendered.push({ image: canvas.toDataURL('image/png'), text })
        canvas.width = canvas.height = 0
        page.cleanup()
      }
      if (!cancelled) { setPages(rendered); onReady(true) }
    }
    render().catch(() => { if (!cancelled) setError(true) }).finally(() => { void task?.destroy() })
    return () => { cancelled = true; void task?.destroy() }
  }, [blob, onReady])
  if (error) return <p role="alert">The preview could not be rendered. You can still download the PDF above.</p>
  if (!pages.length) return <p role="status">Preparing receipt preview…</p>
  return <>
    <div className="receipt-preview-controls"><span>{pages.length} {pages.length === 1 ? 'page' : 'pages'} · A4</span>
      <button type="button" onClick={() => setZoom(value => !value)}>{zoom ? 'Fit width' : 'Zoom in'}</button>
    </div>
    <div className={`receipt-pages${zoom ? ' receipt-pages--zoom' : ''}`}>
      {pages.map((page, index) => <figure className="receipt-page" key={index}>
        <img src={page.image} alt={`Receipt page ${index + 1}`} />
        <figcaption className="receipt-screen-reader">Page {index + 1}: {page.text}</figcaption>
      </figure>)}
    </div>
  </>
}
