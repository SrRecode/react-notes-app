import { useEffect, useRef, useState } from 'react';
import { useNotes } from './hooks/useNotes.js';
import { notePreview } from './lib/notes.js';

export default function App({ storage } = {}) {
  const { visible, notes, query, setQuery, add, update, remove, pin } = useNotes(storage);
  const [selectedId, setSelectedId] = useState(null);
  const titleRef = useRef(null);

  const selected = notes.find((note) => note.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId && !notes.some((note) => note.id === selectedId)) {
      setSelectedId(notes[0]?.id ?? null);
    }
  }, [notes, selectedId]);

  function handleNew() {
    const created = add({ title: '', body: '' });
    setSelectedId(created.id);
    window.requestAnimationFrame?.(() => titleRef.current?.focus());
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar__top">
          <h1>Notes</h1>
          <button type="button" className="btn btn--primary" onClick={handleNew}>
            + New
          </button>
        </div>

        <input
          type="search"
          className="search"
          placeholder="Search notes…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search notes"
        />

        <ul className="list">
          {visible.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                className={`card${note.id === selectedId ? ' card--active' : ''}`}
                onClick={() => setSelectedId(note.id)}
              >
                <span className="card__title">{notePreview(note)}</span>
                <span className="card__meta">
                  {note.pinned ? '📌 ' : ''}
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </button>
            </li>
          ))}
          {visible.length === 0 && (
            <li className="empty">{notes.length === 0 ? 'No notes yet.' : 'No matches.'}</li>
          )}
        </ul>
      </aside>

      <main className="editor">
        {selected ? (
          <>
            <div className="editor__bar">
              <button
                type="button"
                className={`btn btn--ghost${selected.pinned ? ' is-active' : ''}`}
                onClick={() => pin(selected.id)}
                aria-pressed={selected.pinned}
              >
                {selected.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => remove(selected.id)}
              >
                Delete
              </button>
            </div>

            <input
              ref={titleRef}
              className="editor__title"
              placeholder="Note title"
              value={selected.title}
              onChange={(event) => update(selected.id, { title: event.target.value })}
              aria-label="Note title"
            />
            <textarea
              className="editor__body"
              placeholder="Start writing…"
              value={selected.body}
              onChange={(event) => update(selected.id, { body: event.target.value })}
              aria-label="Note body"
            />
            <footer className="editor__footer">
              {selected.body.length} characters · saved {new Date(selected.updatedAt).toLocaleTimeString()}
            </footer>
          </>
        ) : (
          <div className="editor__empty">
            <p>Select a note, or create a new one.</p>
          </div>
        )}
      </main>
    </div>
  );
}
