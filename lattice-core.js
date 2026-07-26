(function (root) {
  "use strict";

  function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
  }

  function noteStorageKey(note) {
    return note?.relativePath || note?.id || "";
  }

  function recoveryKey(workspaceId, note) {
    return `lattice-recovery:${workspaceId || "no-workspace"}:${noteStorageKey(note)}`;
  }

  function recoveryIsValid(recovery, note, workspaceId) {
    if (!recovery || !note || recovery.workspaceId !== workspaceId) return false;
    if (recovery.relativePath && recovery.relativePath !== note.relativePath) return false;
    if (recovery.baseLastModified && recovery.baseLastModified !== note.diskLastModified) return false;
    if (recovery.baseContentHash && recovery.baseContentHash !== hashString(note.diskContent || "")) return false;
    return Boolean(recovery.content && recovery.content !== note.content);
  }

  function hasUsableHeading(content) {
    return /^#\s+\S.+$/m.test(String(content || ""));
  }

  function identityRegenerationBlockers(workspace) {
    const blockers = [];
    const draft = workspace?.draft;
    const notes = Array.isArray(workspace?.notes) ? workspace.notes : [];
    if (draft && String(draft.content || "").trim() && !draft.fileHandle && !hasUsableHeading(draft.content)) {
      blockers.push("draft-without-heading");
    }
    if (draft && String(draft.content || "").trim() && draft.dirty && !draft.fileHandle) {
      blockers.push("unsaved-draft");
    }
    if (notes.some(note => note?.dirty)) blockers.push("dirty-notes");
    if (notes.some(note => note?.recovered)) blockers.push("restored-recovery");
    return [...new Set(blockers)];
  }

  function isLoopbackEndpoint(endpoint) {
    try {
      const url = new URL(endpoint);
      return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname);
    } catch {
      return false;
    }
  }

  function createTemplateCard(documentRef, template, onClick) {
    const card = documentRef.createElement("button");
    card.className = "template-card";
    const icon = documentRef.createElement("span");
    icon.textContent = template.icon;
    const name = documentRef.createElement("strong");
    name.textContent = template.name;
    const description = documentRef.createElement("small");
    description.textContent = template.description;
    card.append(icon, name, description);
    if (onClick) card.addEventListener("click", () => onClick(template));
    return card;
  }

  const core = {
    createTemplateCard,
    hashString,
    hasUsableHeading,
    identityRegenerationBlockers,
    isLoopbackEndpoint,
    noteStorageKey,
    recoveryIsValid,
    recoveryKey
  };

  if (typeof module !== "undefined" && module.exports) module.exports = core;
  root.LatticeCore = core;
})(typeof globalThis !== "undefined" ? globalThis : this);
