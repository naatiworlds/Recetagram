import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

let echo = null

export function connectNotificationSocket(userId, onNotification) {
  if (!userId || typeof onNotification !== 'function') return null

  disconnectNotificationSocket()

  echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    },
  })

  echo
    .private(`notifications.${userId}`)
    .listen('.notification.new', ({ notification }) => {
      onNotification({ notification })
    })

  return echo
}

export function disconnectNotificationSocket() {
  if (!echo) return
  echo.disconnect()
  echo = null
}
