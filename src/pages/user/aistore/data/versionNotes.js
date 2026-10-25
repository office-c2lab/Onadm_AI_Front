export function normalizeVersionNotes(notes) {
  if (Array.isArray(notes)) return notes.filter(Boolean);
  if (typeof notes === 'string' && notes.trim()) return [notes.trim()];
  return [];
}

export function getLatestVersionNotes(tool) {
  const historyNotes = normalizeVersionNotes(tool.versionHistory?.[0]?.notes);
  if (historyNotes.length) return historyNotes;

  const updateNotes = normalizeVersionNotes(tool.updateNotes);
  if (updateNotes.length) return updateNotes;

  return normalizeVersionNotes(tool.releaseNotes);
}
