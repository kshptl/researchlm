export function joinProviderUrl(baseUrl: string, path: string): URL {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
  const normalizedPath = path.replace(/^\/+/, "")
  return new URL(normalizedPath, normalizedBase)
}
