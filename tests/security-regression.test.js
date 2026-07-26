const assert = require("assert");
const fs = require("fs");

const core = require("../lattice-core.js");
const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");

const note = {
  id: "note-1",
  relativePath: "Notes/Client.md",
  diskLastModified: 12345,
  diskContent: "# Client\n\nDisk copy",
  content: "# Client\n\nCurrent copy"
};

const validRecovery = {
  workspaceId: "workspace-a",
  relativePath: note.relativePath,
  baseLastModified: note.diskLastModified,
  baseContentHash: core.hashString(note.diskContent),
  content: "# Client\n\nRecovered private draft",
  savedAt: "2026-07-26T15:00:00.000Z"
};

assert.equal(
  core.recoveryKey("workspace-a", note),
  "lattice-recovery:workspace-a:Notes/Client.md",
  "recovery keys must include workspace identity and note path"
);
assert(core.recoveryIsValid(validRecovery, note, "workspace-a"), "matching recovery should be accepted");
assert(!core.recoveryIsValid({ ...validRecovery, workspaceId: "workspace-b" }, note, "workspace-a"), "other workspace recovery must be rejected");
assert(!core.recoveryIsValid({ ...validRecovery, relativePath: "Notes/Other.md" }, note, "workspace-a"), "other note recovery must be rejected");
assert(!core.recoveryIsValid({ ...validRecovery, baseLastModified: 98765 }, note, "workspace-a"), "changed file timestamp must reject recovery");
assert(!core.recoveryIsValid({ ...validRecovery, baseContentHash: core.hashString("changed") }, note, "workspace-a"), "changed base content must reject recovery");
assert(!core.recoveryIsValid({ ...validRecovery, content: note.content }, note, "workspace-a"), "unchanged recovery should not be offered");
assert(core.hasUsableHeading("# Real title\n\nBody"), "H1 heading should make a draft saveable");
assert(!core.hasUsableHeading("Body without heading"), "drafts without H1 headings should not be considered saveable");
assert.deepEqual(
  core.identityRegenerationBlockers({ draft: { content: "orphan text", dirty: true }, notes: [] }),
  ["draft-without-heading", "unsaved-draft"],
  "identity regeneration should block unresolved drafts"
);
assert.deepEqual(
  core.identityRegenerationBlockers({ draft: null, notes: [{ dirty: true }, { recovered: true }] }),
  ["dirty-notes", "restored-recovery"],
  "identity regeneration should detect dirty and restored notes"
);
assert.deepEqual(
  core.identityRegenerationBlockers({ draft: null, notes: [{ dirty: false, recovered: false }] }),
  [],
  "identity regeneration should proceed when no active work is pending"
);

assert(core.isLoopbackEndpoint("http://localhost:11434"), "localhost Ollama endpoint should be loopback");
assert(core.isLoopbackEndpoint("http://127.0.0.1:11434"), "127.0.0.1 Ollama endpoint should be loopback");
assert(!core.isLoopbackEndpoint("https://example.com"), "remote endpoints must not be treated as loopback");
assert(!core.isLoopbackEndpoint("not a url"), "invalid endpoints must not be treated as loopback");

function fakeDocument() {
  return {
    createElement(tagName) {
      return {
        tagName,
        className: "",
        textContent: "",
        innerHTML: "",
        children: [],
        listeners: {},
        type: "",
        append(...children) {
          this.children.push(...children);
        },
        addEventListener(type, callback) {
          this.listeners[type] = callback;
        }
      };
    }
  };
}

let clicked = false;
const card = core.createTemplateCard(fakeDocument(), {
  icon: "<img src=x onerror=alert(1)>",
  name: "<script>alert(1)</script>",
  description: "<b>bold</b>"
}, () => { clicked = true; });

assert.equal(card.tagName, "button", "template cards should be buttons");
assert.equal(card.children[0].textContent, "<img src=x onerror=alert(1)>", "template icon must be assigned as text");
assert.equal(card.children[1].textContent, "<script>alert(1)</script>", "template name must be assigned as text");
assert.equal(card.children[2].textContent, "<b>bold</b>", "template description must be assigned as text");
card.listeners.click();
assert(clicked, "template click handler should be wired");

assert(html.includes("Content-Security-Policy"), "index must include a CSP");
assert(html.includes("script-src 'self'"), "CSP must block inline script execution");
assert(html.includes('role="dialog"'), "modals must expose dialog semantics");
assert(app.includes("confirmRemoteAiEndpoint"), "remote Ollama endpoints must require confirmation");
assert(app.includes("regenerateWorkspaceIdentity"), "cloned workspaces need a regeneration path");
assert(app.includes("notes.forEach(note =>"), "identity regeneration must clear already-loaded note recovery state");
assert(app.includes("await flushAllSaves()"), "identity regeneration must flush saveable work before changing identity");
assert(app.includes("identityRegenerationBlockers"), "identity regeneration must use executable blocker policy");
assert(app.includes("clearWorkspaceRecoveryRecords(previousId)"), "identity regeneration must clear old recovery records");
assert(app.includes("LatticeCore.recoveryIsValid(note.recovery, note, state.workspaceId)"), "opening a note must revalidate in-memory recovery against current workspace");
assert(app.includes("clearRecovery(note, note.recovery)"), "discarding recovery must clear its original namespace");
assert(app.includes('openModal($("#templateManagerModal"), $("#templatesBtn"))'), "template-manager focus should restore to the top-level Templates button");
assert(html.includes('aria-valuenow="276"'), "drawer separator must expose its current value");
assert(html.includes('aria-valuenow="34"'), "horizontal separators must expose current values");
assert(app.includes("note.dirty = false"), "recovered content must not autosave as dirty");

console.log("security regression checks passed");
