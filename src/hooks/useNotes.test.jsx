import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { NOTES_STORAGE_KEY, useNotes } from './useNotes.js';

function fakeStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    clear: () => map.clear(),
    get size() {
      return map.size;
    },
  };
}

describe('useNotes', () => {
  let storage;
  beforeEach(() => {
    storage = fakeStorage();
  });

  it('starts empty', () => {
    const { result } = renderHook(() => useNotes(storage));
    expect(result.current.notes).toEqual([]);
    expect(result.current.visible).toEqual([]);
  });

  it('adds notes, newest first, and returns the created note', () => {
    const { result } = renderHook(() => useNotes(storage));
    let created;
    act(() => {
      created = result.current.add({ title: 'First' });
    });
    act(() => {
      result.current.add({ title: 'Second' });
    });
    expect(typeof created.id).toBe('string');
    expect(result.current.notes.map((n) => n.title)).toEqual(['Second', 'First']);
  });

  it('updates and removes notes', () => {
    const { result } = renderHook(() => useNotes(storage));
    act(() => result.current.add({ title: 'Draft' }));
    const id = result.current.notes[0].id;
    act(() => result.current.update(id, { title: 'Final' }));
    expect(result.current.notes[0].title).toBe('Final');
    act(() => result.current.remove(id));
    expect(result.current.notes).toEqual([]);
  });

  it('pins notes so they sort to the top', () => {
    const { result } = renderHook(() => useNotes(storage));
    act(() => result.current.add({ title: 'A' }));
    act(() => result.current.add({ title: 'B' }));
    const olderId = result.current.notes[1].id;
    act(() => result.current.pin(olderId));
    expect(result.current.visible[0].id).toBe(olderId);
    expect(result.current.visible[0].pinned).toBe(true);
  });

  it('filters the visible list by query', () => {
    const { result } = renderHook(() => useNotes(storage));
    act(() => result.current.add({ title: 'Apples' }));
    act(() => result.current.add({ title: 'Bananas' }));
    act(() => result.current.setQuery('ban'));
    expect(result.current.visible.map((n) => n.title)).toEqual(['Bananas']);
  });

  it('persists notes to storage and reloads them', () => {
    const first = renderHook(() => useNotes(storage));
    act(() => first.result.current.add({ title: 'Persisted' }));

    const raw = storage.getItem(NOTES_STORAGE_KEY);
    expect(JSON.parse(raw)[0].title).toBe('Persisted');

    const second = renderHook(() => useNotes(storage));
    expect(second.result.current.notes[0].title).toBe('Persisted');
  });
});
