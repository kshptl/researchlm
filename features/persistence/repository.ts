import { openDatabase } from "@/lib/idb/database"

async function putRecord<T extends { id: string }>(storeName: string, record: T): Promise<void> {
  const db = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite")
    tx.objectStore(storeName).put(record)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function getRecord<T>(storeName: string, id: string): Promise<T | undefined> {
  const db = await openDatabase()
  return await new Promise<T | undefined>((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly")
    const req = tx.objectStore(storeName).get(id)
    req.onsuccess = () => resolve(req.result as T | undefined)
    req.onerror = () => reject(req.error)
  })
}

export const persistenceRepository = {
  putRecord,
  getRecord
}
