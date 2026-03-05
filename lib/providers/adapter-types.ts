import type { GenerationRequest } from "@/features/generation/types";

export type StreamEventType =
  | "start"
  | "delta"
  | "tool_delta"
  | "usage"
  | "error"
  | "done";

export interface NormalizedStreamEvent {
  type: StreamEventType;
  data: Record<string, unknown>;
}

export interface ProviderCapabilities {
  supportsTools: boolean;
  supportsJsonMode: boolean;
  supportsVision: boolean;
}

export interface ProviderAdapter {
  name: string;
  capabilities: ProviderCapabilities;
  stream(
    request: GenerationRequest,
  ): AsyncGenerator<NormalizedStreamEvent, void, void>;
}
