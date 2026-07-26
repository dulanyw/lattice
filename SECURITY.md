# Security

Lattice is local-first but not yet a security-hardened product.

## Reporting

For now, report issues directly to the project maintainer before sharing exploit details publicly.

## Privacy model

- Markdown files stay in the workspace folder selected by the user.
- Browser storage may contain settings, pins, recent-note metadata, and recovery drafts.
- Ollama requests send the user prompt and selected note context to the configured endpoint.
- Remote Ollama endpoints require confirmation before sending note context.

Do not place secrets in sample workspaces intended for publication.
