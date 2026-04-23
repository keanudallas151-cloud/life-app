import { useCallback, useEffect, useState } from "react"

/**
 * Drop-in replacement for `@github/spark/hooks`' `useKV` that persists to
 * `localStorage`. Preserves the same signature so Spark-generated code works
 * unchanged inside life-app.
 *
 *   const [value, setValue, deleteValue] = useKV("my-key", defaultValue)
 */
export function useKV<T>(
  key: string,
  defaultValue: T,
): [T, (next: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue
    try {
      const raw = window.localStorage.getItem(key)
      return raw == null ? defaultValue : (JSON.parse(raw) as T)
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* quota or serialization error — ignore */
    }
  }, [key, value])

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) => (typeof next === "function" ? (next as (p: T) => T)(prev) : next))
  }, [])

  const del = useCallback(() => {
    if (typeof window !== "undefined") {
      try { window.localStorage.removeItem(key) } catch { /* ignore */ }
    }
    setValue(defaultValue)
  }, [key, defaultValue])

  return [value, set, del]
}
