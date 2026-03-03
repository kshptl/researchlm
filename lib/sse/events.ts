import type { NormalizedStreamEvent } from "@/lib/providers/adapter-types"

export function encodeSseEvent(event: NormalizedStreamEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`
}

export function encodeSsePing(): string {
  return ": ping\n\n"
}
