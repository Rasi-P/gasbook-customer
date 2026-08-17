import { useState, useEffect, useCallback } from 'react'
import type { PaginatedResponse } from '../lib/api-queries'

interface UsePaginatedQueryOptions<T, P> {
  fetchFn: (params: P) => Promise<PaginatedResponse<T>>
  defaultParams: P
}

export function usePaginatedQuery<T, P extends { page?: number }>({
  fetchFn,
  defaultParams,
}: UsePaginatedQueryOptions<T, P>) {
  const [data, setData] = useState<T[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Track parameters, especially page
  const [params, setParams] = useState<P>(defaultParams)

  const executeQuery = useCallback(async (currentParams: P) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetchFn(currentParams)
      setData(response.results || [])
      setCount(response.count || 0)
    } catch (err: any) {
      console.error('Paginated query error:', err)
      setError(err.message || 'Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }, [fetchFn])

  // Fetch when params change
  useEffect(() => {
    executeQuery(params)
  }, [params, executeQuery])

  // Change page handler
  const setPage = (page: number) => {
    setParams((prev) => ({ ...prev, page }))
  }

  // Update filters and reset page to 1
  const updateFilters = (newParams: Partial<Omit<P, 'page'>>) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
      page: 1, // Always reset to page 1 on filter change
    }))
  }

  const reload = () => executeQuery(params)

  return {
    data,
    count,
    isLoading,
    error,
    params,
    setPage,
    updateFilters,
    reload,
  }
}
