import { useCallback, useEffect, useState } from 'react'
import { fetchCylinderTypes, getApiErrorDetails, type CylinderTypeItem } from '../lib/auth'

export const CYLINDERS_LOADING_LABEL = 'Loading cylinders…'
export const CYLINDERS_EMPTY_LABEL = 'No cylinders are available right now.'
export const CYLINDERS_ERROR_FALLBACK = 'Unable to load cylinders right now.'

export interface CylinderTypesState {
  cylinderTypes: CylinderTypeItem[]
  isLoading: boolean
  error: string | null
  reload: () => void
}

/** Catalog loader with explicit loading / error / empty states (Explore + desktop home). */
export function useCylinderTypes(): CylinderTypesState {
  const [cylinderTypes, setCylinderTypes] = useState<CylinderTypeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let ignore = false

    setIsLoading(true)
    setError(null)

    fetchCylinderTypes()
      .then((data) => {
        if (!ignore) {
          setCylinderTypes(Array.isArray(data) ? data : [])
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setCylinderTypes([])
          setError(getApiErrorDetails(err, CYLINDERS_ERROR_FALLBACK).message)
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [reloadToken])

  const reload = useCallback(() => setReloadToken((count) => count + 1), [])

  return { cylinderTypes, isLoading, error, reload }
}
