
import type { StorageAdapter } from './storage.interface'

const STORAGE_PREFIX = 'emonc:v1:'

export class LocalStorageAdapter implements StorageAdapter {
  get<T>(key: string, fallback: T): T {
    try {
      const storedValue = localStorage.getItem(
        `${STORAGE_PREFIX}${key}`,
      )

      if (storedValue === null) {
        return fallback
      }

      return JSON.parse(storedValue) as T
    } catch (error) {
      console.error(
        `Failed to read local storage key: ${key}`,
        error,
      )

      return fallback
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(
        `${STORAGE_PREFIX}${key}`,
        JSON.stringify(value),
      )
    } catch (error) {
      console.error(
        `Failed to save local storage key: ${key}`,
        error,
      )

      throw error
    }
  }

  remove(key: string): void {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
  }

  clear(): void {
    const keysToRemove: string[] = []

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)

      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key)
    })
  }
}
