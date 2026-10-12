let counter = 0;

/** Generate a reasonably unique id without external dependencies. */
export function genId() {
  counter += 1;
  return `n_${Date.now().toString(36)}_${counter.toString(36)}`;
}

/** Build a single note object. */
export function makeNote({ id, title = '', body = '', pinned = false, now = Date.now() } = {}) {
  return {
    id: id ?? genId(),
    title,
    body,
    pinned,
    createdAt: now,
    updatedAt: now,
  };
}

/** Add a note to the front of the list. */
export function createNote(notes, fields = {}) {
  const note = makeNote(fields);
  return [note, ...notes];
}

/**
 * Patch a note by id. The `id` is always preserved, and `updatedAt` is bumped
 * unless the caller supplies their own `now` in the patch.
 */
export function updateNote(notes, id, patch, now = Date.now()) {
  return notes.map((note) =>
    note.id === id ? { ...note, ...patch, id: note.id, updatedAt: now } : note,
  );
}

export function removeNote(notes, id) {
  return notes.filter((note) => note.id !== id);
}

export function togglePin(notes, id) {
  return notes.map((note) => (note.id === id ? { ...note, pinned: !note.pinned } : note));
}

/** Pinned notes first, then most recently updated. */
export function sortNotes(notes) {
  return [...notes].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt,
  );
}

/** Case-insensitive search across title and body. */
export function filterNotes(notes, query) {
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return notes;
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(q) || note.body.toLowerCase().includes(q),
  );
}

/** First line of a note for list previews. */
export function notePreview(note, length = 72) {
  const source = note.title.trim() || note.body.trim() || 'Untitled note';
  const single = source.replace(/\s+/g, ' ');
  return single.length > length ? `${single.slice(0, length - 1)}…` : single;
}
