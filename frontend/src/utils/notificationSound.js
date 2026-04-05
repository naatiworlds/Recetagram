let audioContext = null

function getAudioContext() {
  if (audioContext) return audioContext

  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null

  audioContext = new Ctx()
  return audioContext
}

export async function playNotificationSound() {
  try {
    const context = getAudioContext()
    if (!context) return

    if (context.state === 'suspended') {
      await context.resume()
    }

    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, context.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(660, context.currentTime + 0.2)

    gainNode.gain.setValueAtTime(0.0001, context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.1, context.currentTime + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.25)

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + 0.25)
  } catch (error) {
    console.warn('[notification-sound] no se pudo reproducir sonido', error)
  }
}
