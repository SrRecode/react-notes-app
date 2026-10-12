import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createNote,
  filterNotes,
  removeNote,
  sortNotes,
  togglePin,
  updateNote,
} from '../lib/notes.js';

export const NOTES_STORAGE_KEY = 'react-notes-app.notes';

function loadNotes(storage) {
  try {
    const raw = storage.getItem(NOTES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Notes state with CRUD, pinning, search and persistence.
 *
 * @param {Storage} [storage] injectable storage (defaults to localStorage)
 */
export function useNotes(storage = globalThis.localStorage) {
  const [notes, setNotes] = useState(() => loadNotes(storage));
  const [query, setQuery] = useState('');

  useEffect(() => {
    try {
      storage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [notes, storage]);

  const add = useCallback((fields = {}) => {
    const created = createNote([], fields)[0];
    setNotes((prev) => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback((id, patch) => {
    setNotes((prev) => updateNote(prev, id, patch));
  }, []);

  const remove = useCallback((id) => {
    setNotes((prev) => removeNote(prev, id));
  }, []);

  const pin = useCallback((id) => {
    setNotes((prev) => togglePin(prev, id));
  }, []);

  const visible = useMemo(() => sortNotes(filterNotes(notes, query)), [notes, query]);

  return { notes, visible, query, setQuery, add, update, remove, pin };
}
