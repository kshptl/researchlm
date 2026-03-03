import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import WorkspacePage from "@/app/(workspace)/page"

describe("semantic zoom auto", () => {
  it("renders zoom controls", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: () => ({ read: vi.fn().mockResolvedValue({ done: true, value: undefined }) })
        }
      })
    )

    render(<WorkspacePage />)
    fireEvent.click(screen.getByRole("button", { name: "Prompt" }))
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeInTheDocument()
  })
})
