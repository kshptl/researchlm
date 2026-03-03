type StoredCredential = {
  id: string
  provider: string
  authType: "api-key" | "oauth"
  encryptedValue: string
  updatedAt: string
}

const memoryStore = new Map<string, StoredCredential>()

function encode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64")
}

export function saveCredential(provider: string, authType: "api-key" | "oauth", rawValue: string): StoredCredential {
  const record: StoredCredential = {
    id: crypto.randomUUID(),
    provider,
    authType,
    encryptedValue: encode(rawValue),
    updatedAt: new Date().toISOString()
  }
  memoryStore.set(record.id, record)
  return record
}

export function getCredentialRef(id: string): StoredCredential | undefined {
  return memoryStore.get(id)
}
