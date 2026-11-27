import { useEffect, useState } from 'react'
import { getCurrentUser, getApiErrorDetails } from '../lib/auth'
import { fetchAccessories, type Accessory } from '../lib/products'
export function useAccessories() {
  const [products, setProducts] = useState<Accessory[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [reload, setReload] = useState(0)
  useEffect(() => {
    let live = true
    setLoading(true); setError('')
    getCurrentUser().then(async user => {
      if (typeof user.capabilities?.accessories !== 'boolean') throw new Error('Feature availability is unavailable.')
      const active = user.capabilities.accessories
      const rows = active ? await fetchAccessories() : []
      if (live) { setProducts(rows); setEnabled(active) }
    }).catch(err => { if (live) { setProducts([]); setEnabled(null); setError(getApiErrorDetails(err, 'Could not load accessories.').message) } })
      .finally(() => { if (live) setLoading(false) })
    return () => { live = false }
  }, [reload])
  return { products, error, loading, enabled, retry: () => setReload(n => n + 1) }
}
