export type GenerationIntent = "prompt" | "explain" | "questions" | "subtopics"

export interface GenerationMessage {
  role: "system" | "user" | "assistant" | "tool"
  content: string
}

export interface GenerationRequest {
  provider: "openai" | "anthropic" | "gemini" | "openrouter" | "github-models"
  model: string
  intent: GenerationIntent
  messages: GenerationMessage[]
  auth: {
    type: "api-key" | "oauth"
    credential: string
  }
  workspaceContext?: {
    workspaceId?: string
    canvasId?: string
    sourceNodeId?: string
  }
}

export type GenerationStatus = "pending" | "streaming" | "completed" | "failed" | "cancelled"

export interface SemanticViewState {
  workspaceId: string
  canvasId: string
  mode: "auto" | "manual"
  manualLevel?: "all" | "lines" | "summary" | "keywords"
}
