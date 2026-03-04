# Lessons Learned

- 2026-03-02: When user feedback says front-end planning is lacking, expand planning artifacts with explicit UI interaction contracts (layout, canvas capabilities, node taxonomy, undo/redo depth, and platform scope) before regenerating tasks.
- 2026-03-04: When both local installs and an upstream open-source repo exist, prioritize upstream source code as the primary truth for behavior parity mapping and use local binaries only as secondary verification.
- 2026-03-04: Before stating a fix works, always run verification commands first and report concrete results (at minimum targeted tests plus project test/typecheck if available).
- 2026-03-04: Model/provider selection UX must exist at the initial generation entry point, not only in post-generation detail panels, so the very first request is explicitly user-controlled.
- 2026-03-04: Before pushing, confirm and use the exact target branch requested by the user (for example `main`) and avoid pushing feature branches unless explicitly asked.
