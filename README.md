# ResearchLM

ResearchLM is a node-based workspace for exploring ideas with LLMs.

## Features

- Build branching prompt trees and compare outputs.
- Use your own provider credentials and switch models.
- Follow up from highlighted response text.
- Save and resume chats locally.

## Download

Desktop builds are published on GitHub Releases:

```text
https://github.com/kshptl/researchlm/releases
```

Note: desktop builds are currently unsigned, so Windows/macOS may show a security warning before first launch.

## Run Locally

Web:

```bash
npm ci
npm run dev
```

Desktop (Electron + Next.js dev server):

```bash
npm ci
npm run dev:desktop
```

## Privacy

- Provider keys are BYOK.
- Workspace/chat state is stored locally.

## License

MIT. See `LICENSE`.
