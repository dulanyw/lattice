# Lattice manual release test plan

Use this checklist before presenting a staged build as more than a prototype. Run it against the release candidate directory, not a private note workspace.

## Browser smoke

- Launch Lattice from the staged release directory.
- Confirm the page title, note drawer, task panel, Markdown editor, Settings, Tags, Templates, and AI panel render without console errors.
- Open Templates, then Manage templates, then close the manager. Keyboard focus should return to the top-level Templates button.
- Tab through an unpinned note row. The pin button should become visible when focused.
- Use keyboard arrows on each resizer. The drawer/task/AI separators should move and their `aria-valuenow` values should update.

## Workspace and recovery

- Select a disposable workspace folder with sample Markdown files.
- Create a new draft without an H1 and try Settings → Regenerate identity. Lattice should block and tell you to resolve current work first.
- Add an H1 to that draft and save it. Regenerate identity again; the saved note should remain available after the rescan.
- Create or simulate a recovery draft, accept the restore prompt, and regenerate identity. Lattice should save or block before changing identity; accepted recovered content should not silently disappear.
- After successful regeneration, obsolete recovery drafts for the old identity should be cleared from browser storage.

## File and permission failure modes

- Remove browser folder permission and confirm Lattice asks for permission rather than losing edits.
- Modify an open note on disk outside Lattice, then edit/save in Lattice. The app should detect the external change and preserve the local draft as recovery.
- Try long filenames, Unicode H1 titles, malformed frontmatter, and read-only files/folders.

## Accessibility pass

- Complete one keyboard-only pass through top navigation, note drawer, task grid, editor toolbar, modals, and resizers.
- Run at least one screen-reader smoke pass in a Chromium browser.
- Confirm modal names, focus traps, focus restoration, separator names/values, and visible focus states.

## Release hygiene

- Verify `git status --short --ignored` is clean in the release repository.
- Verify `lattice-server.exe --version` matches `VERSION`.
- Verify `CHECKSUMS.txt` matches the binary being published.
- Compare release contents against `RELEASE_ALLOWLIST.txt`.
