export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
  if (!('vibrate' in navigator)) return

  const patterns: Record<string, number | number[]> = {
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
