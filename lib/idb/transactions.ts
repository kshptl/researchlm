import { openDatabase } from "@/lib/idb/database"

export async function runIntentTransaction<T>(storeNames: string[], fn: (tx: IDBTransaction) => T): Promise<T> {
  const db = await openDatabase()
  const tx = db.transaction(storeNames, "readwrite")
  const result = fn(tx)

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })

  return result
}
