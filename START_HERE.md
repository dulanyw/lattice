# Starting Lattice

1. Double-click `launch.cmd`.
2. Lattice opens at `http://localhost:4173` by default.
3. Open Settings and choose the folder that will hold your Markdown workspace.
4. Approve read/write access when the browser asks.

`launch.cmd` starts `lattice-server.exe` when it is present. That executable is a tiny standalone local web server for this folder, so Lattice no longer needs Python on the host system. `launch.ps1` remains as a fallback for development copies where the executable has not been built yet.

To run multiple Lattice folders at the same time, give each copy its own port. Create a file named `lattice-port.txt` next to `lattice-server.exe` containing only the port number, for example:

```text
4174
```

Port selection order is: command-line `--port`, `LATTICE_PORT` environment variable, `lattice-port.txt`, then the default `4173`.

Lattice recursively loads every `.md` file in that folder. New notes, including daily notes, are created under `Notes/`.

Templates are stored permanently in `.lattice/templates.json` inside the selected workspace. The browser cache is only a fallback copy, so template edits can travel with a cloned workspace folder.

Task metadata is stored directly in Markdown:

```markdown
- [ ] Send proposal @due(2026-06-24) @priority(high)
  @waiting(Alex)
  @note Waiting for revised pricing.
```

If a write fails or permission is lost, Lattice keeps a recovery copy in browser storage and restores it when that workspace is loaded again.
