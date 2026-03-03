import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import WorkspacePage from "@/app/(workspace)/page"

describe("workspace resume", () => {
  it("renders persistence status", () => {
    render(<WorkspacePage />)
    expect(screen.getByText("Local persistence ready")).toBeInTheDocument()
  })
})
