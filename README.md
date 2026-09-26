# Lattice

Lattice is a local-first workspace for notes, tasks, and optional AI assistance, using your notes for context. 

Notes are saved locally to Markdown files, so you always own your data. 

It's dependency-free and OS-agnostic, so you can use it anywhere. 

It uses minimal resources, so you can run it on a potato*.

Search is fast, and all of your important info is front and center, making you more productive.

AI is designed as both a first-class assistant and optional, letting it accelerate your work when you want and only when you want.

It's helped me get a lot done - I hope it helps you, too.

## Project status

This app is currently in beta development. It's stable and works great for local personal use, but is not hardened for multi-user support, mission-critical applications, or unsecured exposure to the internet. 

Standard disclaimers apply: not guaranteed suitable for any specific purpose, and you assume all risks with use.

## Supported environment

- Chromium-based browsers are required for full workspace read/write support because Lattice uses the File System Access API.
- The bundled `lattice-server.exe` is Windows-only. Other platforms can build/adapt `server.go` or serve the folder from localhost.

## Quick start

1. Double-click `launch.cmd`.
2. Open Settings.
3. Choose the folder containing your Markdown workspace.
4. Grant read/write permission when the browser asks.

By default Lattice opens at `http://localhost:4173`.

`launch.cmd` starts `lattice-server.exe` when it is present. That executable is a tiny standalone local web server for this folder, so Lattice no longer needs Python on the host system. `launch.ps1` remains as a fallback for development copies where the executable has not been built yet.

## Multiple local instances

Create `lattice-port.txt` next to `lattice-server.exe` containing a port number such as:

```text
4174
```

Port precedence is:

1. `--port`
2. `LATTICE_PORT`
3. `lattice-port.txt`
4. `4173`

## Data storage

- Notes are plain `.md` files in the selected workspace.
- New notes are created in `Notes/`.
- Templates are stored in `.lattice/templates.json`.
- Workspace identity is stored in `.lattice/workspace.json`.
- Browser storage keeps settings, tab labels/icons, note pins, recent-note order, and emergency recovery drafts.

The included `Notes/` files are fictional sample data for testing.

Recovery drafts are scoped to a workspace identity and base file metadata. Recovered content is not autosaved until the user edits/saves it.

If you clone or copy a workspace and want the copy to have independent recovery drafts, open Settings and use `Regenerate identity` in the Workspace section. Lattice first tries to save current work, blocks if unresolved draft content remains, and clears obsolete recovery drafts for the previous identity after regeneration.

Lattice recursively loads every `.md` file in that folder. New notes, including daily notes, are created under `Notes/`.

Templates are stored permanently in `.lattice/templates.json` inside the selected workspace. The browser cache is only a fallback copy, so template edits can travel with a cloned workspace folder.

If a write fails or permission is lost, Lattice keeps a recovery copy in browser storage and restores it when that workspace is loaded again.

## Tasks

Tasks are Markdown checkboxes:

```markdown
- [ ] Send proposal @due(2026-06-24) @priority(high) @waiting(Alex)
  @note Waiting for revised pricing.
```

## Ollama and privacy

Ollama is optional. You need to have Ollama and at least one model installed to use AI features. When you ask the AI panel a question, Lattice sends your prompt and any explicitly selected context notes to the configured Ollama endpoint.

Loopback endpoints such as `http://localhost:11434` are treated as local. Remote endpoints trigger an explicit warning before note context is sent.

## Build

To rebuild the Windows local server:

```cmd
build-server.cmd
```

The script writes temporary Go cache data into ignored workspace-local folders.

## Checks

```cmd
node --check app.js
node tests/security-regression.test.js
go test ./...
go vet ./...
```

## License

MIT. See [LICENSE](LICENSE).

*not a literal potato, but you get the idea. Like a low-powered SBC or something. 
