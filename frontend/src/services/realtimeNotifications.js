import { io } from 'socket.io-client'
import { API_ORIGIN } from '@/utils/globalConstants'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? API_ORIGIN

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
    transports: ['websocket'],
    withCredentials: true,
    auth: { userId }
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
