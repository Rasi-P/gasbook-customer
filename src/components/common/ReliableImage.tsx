import { useState, type ImgHTMLAttributes } from 'react'
/** Network failure never leaves a broken image or starts an unbounded retry loop. */
export function ReliableImage({ src, alt = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState<string | null>(null)
  if (!src || failed === src) return <span className={props.className} role="img" aria-label={alt || 'Image unavailable'}>{alt || 'Image unavailable'}{src && <button type="button" onClick={() => setFailed(null)}>Retry image</button>}</span>
  return <img {...props} src={src} alt={alt} onError={() => setFailed(src)} />
}
