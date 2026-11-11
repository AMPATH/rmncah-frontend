
import type { StorageAdapter } from '../storage/storage.interface'

export interface Identifiable {
  id: string
}

export class LocalRepository<T extends Identifiable> {
  private readonly storage: StorageAdapter
  private readonly storageKey: string

  constructor(
    storage: StorageAdapter,
    storageKey: string,
  ) {
    this.storage = storage
    this.storageKey = storageKey
  }

  getAll(): T[] {
    return this.storage.get<T[]>(this.storageKey, [])
  }

  findById(id: string): T | undefined {
    return this.getAll().find((record) => record.id === id)
  }

  create(record: T): T {
    const records = this.getAll()

    if (records.some((item) => item.id === record.id)) {
      throw new Error(
        `A record with ID "${record.id}" already exists.`,
      )
    }

    this.storage.set(this.storageKey, [...records, record])

    return record
  }

  update(
    id: string,
    changes: Partial<Omit<T, 'id'>>,
  ): T | null {
    const records = this.getAll()

    const recordIndex = records.findIndex(
      (record) => record.id === id,
    )

    if (recordIndex === -1) {
      return null
    }

    const updatedRecord: T = {
      ...records[recordIndex],
      ...changes,
      id,
    }

    const updatedRecords = [...records]
    updatedRecords[recordIndex] = updatedRecord

    this.storage.set(this.storageKey, updatedRecords)

    return updatedRecord
  }

  delete(id: string): boolean {
    const records = this.getAll()

    const updatedRecords = records.filter(
      (record) => record.id !== id,
    )

    if (updatedRecords.length === records.length) {
      return false
    }

    this.storage.set(this.storageKey, updatedRecords)

    return true
  }

  replaceAll(records: T[]): void {
    this.storage.set(this.storageKey, records)
  }
}
