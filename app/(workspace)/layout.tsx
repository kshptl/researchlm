import type { ReactNode } from "react"

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-screen p-4">{children}</main>
}
