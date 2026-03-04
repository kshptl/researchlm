export async function* parseSseDataLines(stream: ReadableStream<Uint8Array>): AsyncGenerator<string, void, void> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ""

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith("data:")) {
        continue
      }
      const payload = trimmed.slice(5).trim()
      if (!payload || payload === "[DONE]") {
        continue
      }
      yield payload
    }
  }
}
