type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

type HapticPatternMap = {
  [key in HapticType]: number | number[]
}

export const triggerHaptic = (type: HapticType = 'light') => {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return

  const patterns: HapticPatternMap = {
    light: 10,
    medium: 20,
    heavy: 30,
    success: [10, 50, 10],
    warning: [20, 100, 20],
    error: [30, 100, 30, 100, 30],
  }

  const pattern = patterns[type]
  if (Array.isArray(pattern)) {
    navigator.vibrate(pattern)
  } else {
    navigator.vibrate(pattern)
  }
}
