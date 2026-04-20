import { useEffect, useRef, useCallback } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL

export function useWebSocket(hospitalId, onMessage) {
  const wsRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const mountedRef = useRef(true)
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  const connect = useCallback(() => {
    if (!hospitalId || !mountedRef.current) return

    try {
      const ws = new WebSocket(`${WS_URL}/ws/${hospitalId}`)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('[WS] Connected to hospital', hospitalId)
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current)
          reconnectTimerRef.current = null
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessageRef.current?.(data)
        } catch (e) {
          console.warn('[WS] Failed to parse message', e)
        }
      }

      ws.onerror = (err) => {
        console.warn('[WS] Error', err)
      }

      ws.onclose = () => {
        console.log('[WS] Disconnected')
        if (mountedRef.current) {
          reconnectTimerRef.current = setTimeout(connect, 3000)
        }
      }

      // Ping every 30s to keep alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'PING' }))
        }
      }, 30000)

      ws._pingInterval = pingInterval
    } catch (e) {
      console.error('[WS] Failed to connect', e)
    }
  }, [hospitalId])

  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      if (wsRef.current) {
        if (wsRef.current._pingInterval) clearInterval(wsRef.current._pingInterval)
        wsRef.current.close()
      }
    }
  }, [connect])

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  return { send }
}