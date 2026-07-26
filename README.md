# Lattice

Lattice is a local-first Markdown workspace for notes, tasks, templates, and optional Ollama-assisted querying.

Project status: early prototype. The app is useful for personal testing, but it is not yet a hardened multi-platform release.

## Supported environment

- Windows is the primary tested launcher target.
- Chromium-based browsers are required for full workspace read/write support because Lattice uses the File System Access API.
- The bundled `lattice-server.exe` is Windows-only. Other platforms can build/adapt `server.go` or serve the folder from localhost.

## Quick start

1. Double-click `launch.cmd`.
2. Open Settings.
3. Choose the folder containing your Markdown workspace.
4. Grant read/write permission when the browser asks.

By default Lattice opens at `http://localhost:4173`.

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

## Tasks

Tasks are Markdown checkboxes:

```markdown
- [ ] Send proposal @due(2026-06-24) @priority(high) @waiting(Alex)
  @note Waiting for revised pricing.
```

## Ollama and privacy

Ollama is optional. When you ask the AI panel a question, Lattice sends your prompt and any explicitly selected context notes to the configured Ollama endpoint.

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
