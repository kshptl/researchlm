"use client"

import React from "react"
import { useEffect, useMemo, useState } from "react"
import { CanvasBoard } from "@/components/workspace/canvas/canvas-board"
import { HierarchyControls } from "@/components/workspace/hierarchy/hierarchy-controls"
import { HierarchyView } from "@/components/workspace/hierarchy/hierarchy-view"
import { PersistenceStatus } from "@/components/workspace/provider-settings/persistence-status"
import { ProviderCredentialsForm } from "@/components/workspace/provider-settings/provider-credentials-form"
import { createChildCanvas } from "@/features/hierarchy-model/state"
import { setActiveCanvas } from "@/features/hierarchy-model/navigation"
import { saveCredential } from "@/lib/auth/credential-store"
import type { Canvas, HierarchyLink } from "@/features/graph-model/types"

function rootCanvas(): Canvas {
  const now = new Date().toISOString()
  return {
    id: "root",
    workspaceId: "local-workspace",
    topic: "Root Topic",
    depth: 0,
    createdAt: now,
    updatedAt: now
  }
}

export default function WorkspacePage() {
  const title = useMemo(() => "Sensecape Exploration Workspace", [])
  const [canvases, setCanvases] = useState<Canvas[]>([rootCanvas()])
  const [links, setLinks] = useState<HierarchyLink[]>([])
  const [navigation, setNavigation] = useState({ activeCanvasId: "root" })
  const [persistenceStatus, setPersistenceStatus] = useState<"idle" | "saving" | "error">("idle")

  const activeCanvas = canvases.find((canvas) => canvas.id === navigation.activeCanvasId) ?? canvases[0]

  useEffect(() => {
    const savedCanvasId = localStorage.getItem("sensecape:activeCanvasId")
    if (savedCanvasId) {
      setNavigation((current) => setActiveCanvas(current, savedCanvasId))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("sensecape:activeCanvasId", navigation.activeCanvasId)
  }, [navigation.activeCanvasId])

  return (
    <section className="mx-auto max-w-6xl space-y-4">
      <header className="rounded-md border border-[hsl(var(--border))] bg-white p-4">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-slate-600">Local-first multilevel exploration and sensemaking.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="rounded-md border border-[hsl(var(--border))] bg-white p-4">
          <HierarchyControls
            onAddBroadTopic={() => {
              const now = new Date().toISOString()
              const canvas: Canvas = {
                id: crypto.randomUUID(),
                workspaceId: "local-workspace",
                topic: "Broad Topic",
                depth: 0,
                createdAt: now,
                updatedAt: now
              }
              setCanvases((current) => [...current, canvas])
            }}
            onAddSubtopic={() => {
              if (!activeCanvas) {
                return
              }
              const child = createChildCanvas(activeCanvas, `Subtopic ${canvases.length}`)
              setCanvases((current) => [...current, child])
              setLinks((current) => [
                ...current,
                {
                  id: crypto.randomUUID(),
                  workspaceId: activeCanvas.workspaceId,
                  parentCanvasId: activeCanvas.id,
                  childCanvasId: child.id,
                  linkType: "subtopic",
                  createdAt: new Date().toISOString()
                }
              ])
            }}
            onAddSibling={() => {
              const now = new Date().toISOString()
              setCanvases((current) => [
                ...current,
                {
                  id: crypto.randomUUID(),
                  workspaceId: "local-workspace",
                  topic: "Sibling Topic",
                  depth: activeCanvas?.depth ?? 0,
                  parentCanvasId: activeCanvas?.parentCanvasId,
                  createdAt: now,
                  updatedAt: now
                }
              ])
            }}
          />
          <div className="mt-4">
            <CanvasBoard />
          </div>
          <div className="mt-4">
            <PersistenceStatus status={persistenceStatus} onRetry={() => setPersistenceStatus("saving")} />
          </div>
        </div>
        <div className="space-y-3">
          <HierarchyView
            canvases={canvases}
            links={links}
            activeCanvasId={navigation.activeCanvasId}
            onSelectCanvas={(id) => setNavigation((current) => setActiveCanvas(current, id))}
          />
          <ProviderCredentialsForm
            onSave={({ provider, type, credential }) => {
              saveCredential(provider, type, credential)
              setPersistenceStatus("idle")
            }}
          />
        </div>
      </div>
    </section>
  )
}
