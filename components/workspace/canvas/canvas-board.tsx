"use client"

import React from "react"
import { useMemo, useState } from "react"
import { ExpandActions } from "@/components/workspace/canvas/expand-actions"
import { NodeCard } from "@/components/workspace/canvas/node-card"
import { SemanticLevelSelector } from "@/components/workspace/semantic/semantic-level-selector"
import { useGeneration } from "@/features/generation/use-generation"
import { extractTextToNode } from "@/features/graph-model/text-extraction"
import type { GraphNode } from "@/features/graph-model/types"
import { representationForLevel } from "@/features/semantic-levels/representation"
import { resolveSemanticLevel } from "@/features/semantic-levels/state"

function createSeedNode(): GraphNode {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    workspaceId: "local-workspace",
    canvasId: "root",
    type: "topic",
    content: "Moving to San Francisco",
    position: { x: 0, y: 0 },
    createdAt: now,
    updatedAt: now
  }
}

export function CanvasBoard() {
  const [nodes, setNodes] = useState<GraphNode[]>([createSeedNode()])
  const [zoom, setZoom] = useState(1)
  const [semanticMode, setSemanticMode] = useState<"auto" | "manual">("auto")
  const [manualLevel, setManualLevel] = useState<"all" | "lines" | "summary" | "keywords">("all")
  const selectedNode = nodes[0]
  const generation = useGeneration({
    provider: "openai",
    model: "gpt-4o-mini",
    credential: "placeholder-local-byok-key"
  })

  const generatedPreview = useMemo(() => {
    const node = nodes.find((item) => item.type === "generated")
    return node?.content ?? ""
  }, [nodes])

  const displayLevel = resolveSemanticLevel({ mode: semanticMode, level: manualLevel }, zoom)

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <SemanticLevelSelector
          mode={semanticMode}
          level={manualLevel}
          onModeChange={setSemanticMode}
          onLevelChange={setManualLevel}
        />
        <ExpandActions
          disabled={generation.isStreaming}
          onSelect={async (intent) => {
            if (!selectedNode) {
              return
            }

            const raw = await generation.runIntent(intent, selectedNode.content)
            const now = new Date().toISOString()

            setNodes((current) => [
              ...current,
              {
                id: crypto.randomUUID(),
                workspaceId: selectedNode.workspaceId,
                canvasId: selectedNode.canvasId,
                type: "generated",
                content: raw,
                position: { x: selectedNode.position.x + 96, y: selectedNode.position.y + 96 },
                sourceNodeId: selectedNode.id,
                createdAt: now,
                updatedAt: now
              }
            ])
          }}
        />
        {generation.error ? <p className="text-xs text-red-600">{generation.error}</p> : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {nodes.map((node) => (
          <NodeCard
            key={node.id}
            id={node.id}
            content={representationForLevel(node.content, displayLevel)}
            onChange={(id, content) => {
              setNodes((current) =>
                current.map((item) =>
                  item.id === id
                    ? {
                        ...item,
                        content,
                        updatedAt: new Date().toISOString()
                      }
                    : item
                )
              )
            }}
          />
        ))}
      </div>

      <div className="flex gap-2">
        {generatedPreview ? (
          <button
            type="button"
            className="rounded-md border border-[hsl(var(--border))] px-3 py-2 text-xs"
            onClick={() => {
              const generated = nodes.find((item) => item.type === "generated")
              if (!generated) {
                return
              }
              const extracted = extractTextToNode(generated, generated.content.slice(0, 48))
              setNodes((current) => [...current, extracted])
            }}
          >
            Extract first snippet as new node
          </button>
        ) : null}
          <button
            type="button"
            className="rounded-md border border-[hsl(var(--border))] px-3 py-2 text-xs"
            onClick={() => setZoom((current) => Math.max(0.2, current - 0.2))}
          >
            Zoom out
          </button>
          <button
            type="button"
            className="rounded-md border border-[hsl(var(--border))] px-3 py-2 text-xs"
            onClick={() => setZoom((current) => Math.min(1, current + 0.2))}
          >
            Zoom in
          </button>
      </div>
    </section>
  )
}
