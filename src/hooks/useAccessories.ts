import { useEffect, useState } from 'react'
import { fetchAccessories, type Accessory } from '../lib/products'
export function useAccessories() {
  const [products, setProducts] = useState<Accessory[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [reload, setReload] = useState(0)
  useEffect(() => { let live = true; setLoading(true); setError(''); fetchAccessories().then(rows => { if (live) setProducts(rows) }).catch(() => { if (live) setError('Could not load accessories.') }).finally(() => { if (live) setLoading(false) }); return () => { live = false } }, [reload])
  return { products, error, loading, retry: () => setReload(n => n + 1) }
}
