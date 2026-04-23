const audioContext =
  typeof window !== 'undefined'
    ? new (window.AudioContext || (window as any).webkitAudioContext)()
    : null

let globalVolume = 0.5

export const setGlobalVolume = (volume: number) => {
  globalVolume = Math.max(0, Math.min(1, volume))
}

export const getGlobalVolume = () => globalVolume

const ensureAudioReady = async () => {
  if (!audioContext) return false

  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume()
    } catch {
      return false
    }
  }

  return true
}

const now = () => audioContext?.currentTime ?? 0

const setGainEnvelope = (
  gainNode: GainNode,
  startTime: number,
  startGain: number,
  endTime: number,
  endGain: number = 0.001
) => {
  const volumeAdjustedStartGain = startGain * globalVolume
  const volumeAdjustedEndGain = endGain * globalVolume
  
  gainNode.gain.cancelScheduledValues(startTime)
  gainNode.gain.setValueAtTime(volumeAdjustedStartGain, startTime)
  gainNode.gain.exponentialRampToValueAtTime(
    Math.max(volumeAdjustedEndGain, 0.001),
    endTime
  )
}

export const playButtonSound = async (enabled: boolean = true) => {
  if (!enabled || !audioContext) return
  if (!(await ensureAudioReady())) return

  const t = now()
  const osc1 = audioContext.createOscillator()
  const osc2 = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  osc1.connect(gainNode)
  osc2.connect(gainNode)
  gainNode.connect(audioContext.destination)

  osc1.frequency.setValueAtTime(700, t)
  osc2.frequency.setValueAtTime(950, t + 0.04)
  osc1.type = 'sine'
  osc2.type = 'sine'

  setGainEnvelope(gainNode, t, 0.025, t + 0.12)

  osc1.start(t)
  osc2.start(t + 0.04)
  osc1.stop(t + 0.1)
  osc2.stop(t + 0.14)
}

export const playDeleteSound = async (enabled: boolean = true) => {
  if (!enabled || !audioContext) return
  if (!(await ensureAudioReady())) return

  const t = now()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(320, t)
  oscillator.frequency.exponentialRampToValueAtTime(180, t + 0.08)
  oscillator.type = 'sine'

  setGainEnvelope(gainNode, t, 0.025, t + 0.08)

  oscillator.start(t)
  oscillator.stop(t + 0.08)
}

export const playEditSound = async (enabled: boolean = true) => {
  if (!enabled || !audioContext) return
  if (!(await ensureAudioReady())) return

  const t = now()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(750, t)
  oscillator.frequency.linearRampToValueAtTime(950, t + 0.12)
  oscillator.type = 'triangle'

  setGainEnvelope(gainNode, t, 0.025, t + 0.12)

  oscillator.start(t)
  oscillator.stop(t + 0.12)
}

export const playCompleteSound = async (enabled: boolean = true) => {
  if (!enabled || !audioContext) return
  if (!(await ensureAudioReady())) return

  const t = now()
  const osc1 = audioContext.createOscillator()
  const osc2 = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  osc1.connect(gainNode)
  osc2.connect(gainNode)
  gainNode.connect(audioContext.destination)

  osc1.frequency.setValueAtTime(520, t)
  osc2.frequency.setValueAtTime(780, t + 0.04)
  osc1.type = 'sine'
  osc2.type = 'sine'

  setGainEnvelope(gainNode, t, 0.03, t + 0.18)

  osc1.start(t)
  osc2.start(t + 0.04)
  osc1.stop(t + 0.16)
  osc2.stop(t + 0.2)
}

export const playAddSound = async (enabled: boolean = true) => {
  if (!enabled || !audioContext) return
  if (!(await ensureAudioReady())) return

  const t = now()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(700, t)
  oscillator.frequency.linearRampToValueAtTime(980, t + 0.08)
  oscillator.type = 'sine'

  setGainEnvelope(gainNode, t, 0.025, t + 0.08)

  oscillator.start(t)
  oscillator.stop(t + 0.08)
}

export const playCategorySound = async (enabled: boolean = true) => {
  if (!enabled || !audioContext) return
  if (!(await ensureAudioReady())) return

  const t = now()
  const osc1 = audioContext.createOscillator()
  const osc2 = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  osc1.connect(gainNode)
  osc2.connect(gainNode)
  gainNode.connect(audioContext.destination)

  osc1.frequency.setValueAtTime(750, t)
  osc2.frequency.setValueAtTime(1050, t + 0.06)
  osc1.type = 'triangle'
  osc2.type = 'triangle'

  setGainEnvelope(gainNode, t, 0.04, t + 0.18)

  osc1.start(t)
  osc2.start(t + 0.06)
  osc1.stop(t + 0.18)
  osc2.stop(t + 0.24)
}

export const playFilterSound = async (enabled: boolean = true) => {
  if (!enabled || !audioContext) return
  if (!(await ensureAudioReady())) return

  const t = now()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(1100, t)
  oscillator.type = 'sine'

  setGainEnvelope(gainNode, t, 0.025, t + 0.06)

  oscillator.start(t)
  oscillator.stop(t + 0.06)
}

export const playSearchSound = async (enabled: boolean = true) => {
  if (!enabled || !audioContext) return
  if (!(await ensureAudioReady())) return

  const t = now()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(800, t)
  oscillator.frequency.linearRampToValueAtTime(1200, t + 0.08)
  oscillator.type = 'sine'

  setGainEnvelope(gainNode, t, 0.025, t + 0.08)

  oscillator.start(t)
  oscillator.stop(t + 0.08)
}

export const playNavigationSound = async (enabled: boolean = true) => {
  if (!enabled || !audioContext) return
  if (!(await ensureAudioReady())) return

  const t = now()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(700, t)
  oscillator.type = 'sine'

  setGainEnvelope(gainNode, t, 0.03, t + 0.07)

  oscillator.start(t)
  oscillator.stop(t + 0.07)
}

export const playPopupOpenSound = async (enabled: boolean = true) => {
  if (!enabled || !audioContext) return
  if (!(await ensureAudioReady())) return

  const t = now()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(600, t)
  oscillator.frequency.linearRampToValueAtTime(900, t + 0.1)
  oscillator.type = 'sine'

  setGainEnvelope(gainNode, t, 0.035, t + 0.1)

  oscillator.start(t)
  oscillator.stop(t + 0.1)
}

export const playPopupCloseSound = async (enabled: boolean = true) => {
  if (!enabled || !audioContext) return
  if (!(await ensureAudioReady())) return

  const t = now()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(900, t)
  oscillator.frequency.linearRampToValueAtTime(600, t + 0.08)
  oscillator.type = 'sine'

  setGainEnvelope(gainNode, t, 0.03, t + 0.08)

  oscillator.start(t)
  oscillator.stop(t + 0.08)
}

export const playBulkActionSound = async (enabled: boolean = true) => {
  if (!enabled || !audioContext) return
  if (!(await ensureAudioReady())) return

  const t = now()
  const osc1 = audioContext.createOscillator()
  const osc2 = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  osc1.connect(gainNode)
  osc2.connect(gainNode)
  gainNode.connect(audioContext.destination)

  osc1.frequency.setValueAtTime(500, t)
  osc2.frequency.setValueAtTime(750, t + 0.05)
  osc1.type = 'square'
  osc2.type = 'square'

  setGainEnvelope(gainNode, t, 0.02, t + 0.2)

  osc1.start(t)
  osc2.start(t + 0.05)
  osc1.stop(t + 0.2)
  osc2.stop(t + 0.25)
}

export const playWarningSound = async (enabled: boolean = true) => {
  if (!enabled || !audioContext) return
  if (!(await ensureAudioReady())) return

  const t = now()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(450, t)
  oscillator.type = 'sawtooth'

  setGainEnvelope(gainNode, t, 0.025, t + 0.15)

  oscillator.start(t)
  oscillator.stop(t + 0.15)
}

export const playErrorSound = async (enabled: boolean = true) => {
  if (!enabled || !audioContext) return
  if (!(await ensureAudioReady())) return

  const t = now()
  const osc1 = audioContext.createOscillator()
  const osc2 = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  osc1.connect(gainNode)
  osc2.connect(gainNode)
  gainNode.connect(audioContext.destination)

  osc1.frequency.setValueAtTime(350, t)
  osc2.frequency.setValueAtTime(220, t + 0.03)
  osc1.type = 'sawtooth'
  osc2.type = 'sawtooth'

  setGainEnvelope(gainNode, t, 0.03, t + 0.2)

  osc1.start(t)
  osc2.start(t + 0.03)
  osc1.stop(t + 0.18)
  osc2.stop(t + 0.22)
}

export const playAddTaskSound = playAddSound
export const playUncompleteSound = playDeleteSound
export const playExportSound = async (enabled: boolean = true) => {
  if (!enabled || !audioContext) return
  if (!(await ensureAudioReady())) return

  const t = now()
  const osc1 = audioContext.createOscillator()
  const osc2 = audioContext.createOscillator()
  const osc3 = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  osc1.connect(gainNode)
  osc2.connect(gainNode)
  osc3.connect(gainNode)
  gainNode.connect(audioContext.destination)

  osc1.frequency.setValueAtTime(600, t)
  osc2.frequency.setValueAtTime(800, t + 0.05)
  osc3.frequency.setValueAtTime(1000, t + 0.1)
  osc1.type = 'sine'
  osc2.type = 'sine'
  osc3.type = 'sine'

  setGainEnvelope(gainNode, t, 0.03, t + 0.25)

  osc1.start(t)
  osc2.start(t + 0.05)
  osc3.start(t + 0.1)
  osc1.stop(t + 0.2)
  osc2.stop(t + 0.25)
  osc3.stop(t + 0.3)
}

export const playSuccessSound = async (enabled: boolean = true) => {
  if (!enabled || !audioContext) return
  if (!(await ensureAudioReady())) return

  const t = now()
  const osc1 = audioContext.createOscillator()
  const osc2 = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  osc1.connect(gainNode)
  osc2.connect(gainNode)
  gainNode.connect(audioContext.destination)

  osc1.frequency.setValueAtTime(700, t)
  osc2.frequency.setValueAtTime(1050, t + 0.06)
  osc1.type = 'sine'
  osc2.type = 'sine'

  setGainEnvelope(gainNode, t, 0.035, t + 0.18)

  osc1.start(t)
  osc2.start(t + 0.06)
  osc1.stop(t + 0.16)
  osc2.stop(t + 0.2)
}

export const playColorPickSound = async (enabled: boolean = true) => {
  if (!enabled || !audioContext) return
  if (!(await ensureAudioReady())) return

  const t = now()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(900, t)
  oscillator.type = 'sine'

  setGainEnvelope(gainNode, t, 0.02, t + 0.05)

  oscillator.start(t)
  oscillator.stop(t + 0.05)
}

export const playPrioritySound = async (priority: 'low' | 'medium' | 'high', enabled: boolean = true) => {
  if (!enabled || !audioContext) return
  if (!(await ensureAudioReady())) return

  const t = now()
  
  if (priority === 'low') {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(450, t)
    oscillator.type = 'sine'

    setGainEnvelope(gainNode, t, 0.02, t + 0.08)

    oscillator.start(t)
    oscillator.stop(t + 0.08)
  } else if (priority === 'medium') {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(600, t)
    oscillator.frequency.linearRampToValueAtTime(750, t + 0.1)
    oscillator.type = 'sine'

    setGainEnvelope(gainNode, t, 0.025, t + 0.1)

    oscillator.start(t)
    oscillator.stop(t + 0.1)
  } else if (priority === 'high') {
    const osc1 = audioContext.createOscillator()
    const osc2 = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    osc1.connect(gainNode)
    osc2.connect(gainNode)
    gainNode.connect(audioContext.destination)

    osc1.frequency.setValueAtTime(800, t)
    osc2.frequency.setValueAtTime(1100, t + 0.05)
    osc1.type = 'sine'
    osc2.type = 'sine'

    setGainEnvelope(gainNode, t, 0.03, t + 0.15)

    osc1.start(t)
    osc2.start(t + 0.05)
    osc1.stop(t + 0.12)
    osc2.stop(t + 0.17)
  }
}