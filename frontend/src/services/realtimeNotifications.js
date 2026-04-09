import { io } from 'socket.io-client'
import { API_ORIGIN } from '@/utils/globalConstants'

function resolveSocketUrl() {
  const explicitUrl = import.meta.env.VITE_SOCKET_URL
  if (explicitUrl) {
    return explicitUrl
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'

    if (isLocalhost) {
      return `${window.location.protocol}//${hostname}:6001`
    }

    return `${window.location.protocol}//${hostname}:6001`
  }

  return API_ORIGIN
}

const SOCKET_URL = resolveSocketUrl()

let socket = null

export function connectNotificationSocket(userId, onNotification) {
  if (!userId || typeof onNotification !== 'function') {
    return null
  }

  if (socket) {
    socket.off('notification:new')
    socket.off('connect_error')
    socket.disconnect()
  }

  socket = io(SOCKET_URL, {
    path: '/socket.io',
    transports: ['polling', 'websocket'],
    upgrade: true,
    withCredentials: true,
    auth: { userId },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    forceNew: true
  })

  socket.on('connect', () => {
    socket.emit('join:user', { userId })
  })

  socket.on('notification:new', onNotification)

  socket.on('connect_error', (error) => {
    console.error('[realtime] connect_error', error.message)
  })

  return socket
}

export function disconnectNotificationSocket() {
  if (!socket) return

  socket.off('notification:new')
  socket.off('connect_error')
  socket.disconnect()
  socket = null
}
