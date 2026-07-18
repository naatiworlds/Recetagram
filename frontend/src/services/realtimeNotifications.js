import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

let echo = null

export function connectNotificationSocket(userId, onNotification) {
  if (!userId || typeof onNotification !== 'function') return null

  // Vite replaces env variables at build time. Do not instantiate Echo/Pusher
  // when realtime has not been configured in the deployment; Pusher throws
  // synchronously for an empty app key and would otherwise interrupt login.
  const appKey = import.meta.env.VITE_REVERB_APP_KEY?.trim()
  if (!appKey) {
    console.warn('Realtime notifications are disabled: VITE_REVERB_APP_KEY is not configured.')
    return null
  }

  disconnectNotificationSocket()

  echo = new Echo({
    broadcaster: 'reverb',
    key: appKey,
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
