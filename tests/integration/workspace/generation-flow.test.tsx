import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import WorkspacePage from "@/app/(workspace)/page"

describe("workspace generation flow", () => {
  it("renders expand controls", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode("event: delta\\ndata: hi\\n\\n") })
              .mockResolvedValueOnce({ done: true, value: undefined })
          })
        }
      })
    )

    render(<WorkspacePage />)
    expect(screen.getByText("Prompt")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Prompt"))
  })
})
