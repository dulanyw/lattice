# Contributing

Lattice is currently an early prototype. Contributions should keep the app local-first, dependency-light, and transparent about data movement.

Before submitting changes:

```cmd
node --check app.js
go test ./...
go vet ./...
```

For UI changes, verify the app in a Chromium-based browser served from localhost.
