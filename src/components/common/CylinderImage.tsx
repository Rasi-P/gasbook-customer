import { useState, type ImgHTMLAttributes } from 'react'
import { API_BASE_URL } from '../../lib/auth'
import { cylinderImageCandidates, type CylinderImageSubject } from '../../lib/cylinderImages'

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & { cylinder: CylinderImageSubject }

/** A cylinder type's picture: custom upload, else its weight's SABCO default, else the generic cylinder. A picture
 *  that is missing or fails to load steps down that list, so a broken image is never shown. */
export function CylinderImage({ cylinder, alt = '', ...props }: Props) {
  const candidates = cylinderImageCandidates(cylinder, API_BASE_URL)
  const key = candidates.join('\n')
  const [failed, setFailed] = useState<{ key: string; count: number }>({ key, count: 0 })
  // A new picture (uploaded, removed, or a weight change) starts again from the top of its list.
  const count = failed.key === key ? failed.count : 0
  const src = candidates[count]
  if (!src) return <span className={props.className} role="img" aria-label={alt || 'Gas cylinder'} data-cylinder-image="none" />
  return <img {...props} src={src} alt={alt} data-cylinder-image={count === 0 ? 'primary' : 'fallback'}
    onError={() => setFailed({ key, count: count + 1 })} />
}
