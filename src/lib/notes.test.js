import { describe, it, expect } from 'vitest';
import {
  createNote,
  filterNotes,
  makeNote,
  notePreview,
  removeNote,
  sortNotes,
  togglePin,
  updateNote,
} from './notes.js';

describe('notes library', () => {
  it('makes a note with sensible defaults', () => {
    const note = makeNote({ now: 1000 });
    expect(note).toMatchObject({ title: '', body: '', pinned: false, createdAt: 1000, updatedAt: 1000 });
    expect(typeof note.id).toBe('string');
  });

  it('prepends new notes and gives them unique ids', () => {
    const a = createNote([], { title: 'A' })[0];
    const list = createNote([a], { title: 'B' });
    expect(list).toHaveLength(2);
    expect(list[0].title).toBe('B');
    expect(list[0].id).not.toBe(a.id);
  });

  it('updates a note, preserves its id and bumps updatedAt', () => {
    const note = makeNote({ id: 'x', title: 'old', now: 1 });
    const [updated] = updateNote([note], 'x', { title: 'new', id: 'hacked' }, 5);
    expect(updated.title).toBe('new');
    expect(updated.id).toBe('x');
    expect(updated.updatedAt).toBe(5);
  });

  it('does not touch other notes when updating', () => {
    const a = makeNote({ id: 'a', title: 'A' });
    const b = makeNote({ id: 'b', title: 'B' });
    const result = updateNote([a, b], 'a', { title: 'A2' }, 9);
    expect(result[1]).toBe(b);
  });

  it('removes a note by id', () => {
    const a = makeNote({ id: 'a' });
    const b = makeNote({ id: 'b' });
    expect(removeNote([a, b], 'a')).toEqual([b]);
  });

  it('toggles the pinned flag', () => {
    const note = makeNote({ id: 'a', pinned: false });
    expect(togglePin([note], 'a')[0].pinned).toBe(true);
  });

  it('sorts pinned first, then by most recently updated', () => {
    const fresh = makeNote({ id: 'fresh', now: 30 });
    const pinnedOld = { ...makeNote({ id: 'pin', now: 1 }), pinned: true };
    const older = makeNote({ id: 'old', now: 10 });
    const order = sortNotes([older, fresh, pinnedOld]).map((n) => n.id);
    expect(order).toEqual(['pin', 'fresh', 'old']);
  });

  it('filters by title and body, case-insensitively', () => {
    const a = makeNote({ id: 'a', title: 'Groceries', body: 'milk' });
    const b = makeNote({ id: 'b', title: 'Work', body: 'deploy the MILK service' });
    const c = makeNote({ id: 'c', title: 'Ideas' });
    expect(filterNotes([a, b, c], 'milk').map((n) => n.id)).toEqual(['a', 'b']);
    expect(filterNotes([a, b, c], '  ').map((n) => n.id)).toEqual(['a', 'b', 'c']);
  });

  it('previews a note title, or falls back to body / Untitled', () => {
    expect(notePreview(makeNote({ title: 'Hello' }))).toBe('Hello');
    expect(notePreview(makeNote({ body: 'Body text' }))).toBe('Body text');
    expect(notePreview(makeNote({}))).toBe('Untitled note');
  });

  it('truncates long previews', () => {
    const long = 'x'.repeat(200);
    expect(notePreview(makeNote({ title: long }), 20)).toHaveLength(20);
  });
});
