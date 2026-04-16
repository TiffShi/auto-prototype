import { useState, useEffect, useCallback } from 'react'
import { searchMusic } from '../api/client.js'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await searchMusic(query.trim())
        setResults(res.data)
      } catch (err) {
        setError(err.message)
        setResults(null)
      } finally {
        setIsLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults(null)
    setError(null)
  }, [])

  return { query, setQuery, results, isLoading, error, clearSearch }
}