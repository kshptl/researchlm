import { describe, expect, it } from "vitest"
import { levelFromZoom, resolveSemanticLevel } from "@/features/semantic-levels/state"

describe("semantic level logic", () => {
  it("maps zoom to reduced level", () => {
    expect(levelFromZoom(0.2)).toBe("keywords")
    expect(levelFromZoom(1)).toBe("all")
  })

  it("prefers manual mode level", () => {
    expect(resolveSemanticLevel({ mode: "manual", level: "summary" }, 0.1)).toBe("summary")
  })
})
