export type GenerationIntent =
  | "prompt"
  | "explain"
  | "questions"
  | "subtopics"
  | "summarize";

export interface GenerationMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

export interface GenerationRequest {
  id?: string;
  provider: string;
  model: string;
  intent: GenerationIntent;
  messages: GenerationMessage[];
  auth:
    | { type: "api-key"; credential: string }
    | {
        type: "oauth";
        access: string;
        refresh?: string;
        expires?: number;
        accountId?: string;
        enterpriseUrl?: string;
      }
    | { type: "wellknown"; key: string; token: string }
    | { type: "aws-profile"; profile: string; region?: string }
    | { type: "aws-env-chain"; region?: string };
  providerConfig?: {
    apiBaseUrl?: string;
    npmPackage?: string;
    providerName?: string;
    envKeys?: string[];
  };
  workspaceContext?: {
    workspaceId?: string;
    canvasId?: string;
    sourceNodeId?: string;
  };
}

export type GenerationStatus =
  | "pending"
  | "streaming"
  | "completed"
  | "failed"
  | "cancelled";

export interface GenerationAttempt {
  id: string;
  requestId: string;
  attemptNumber: number;
  triggerType: "initial" | "manual-retry";
  retryContextId?: string;
  status: GenerationStatus;
  createdAt: string;
  completedAt?: string;
}

export interface LocalGenerationLog {
  id: string;
  requestId: string;
  eventType: string;
  provider: GenerationRequest["provider"];
  outcome: "ok" | "failed";
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface SemanticViewState {
  workspaceId: string;
  canvasId: string;
  mode: "auto" | "manual";
  manualLevel?: "all" | "lines" | "summary" | "keywords";
}
