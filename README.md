# React Notes

A small note-taking app built with React hooks: create, edit, pin, search and
delete notes, with everything persisted to `localStorage`. Logic lives in pure
modules so it can be tested without a DOM, and the UI is covered end-to-end with
[Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

## Features

- Create, edit, pin/unpin and delete notes
- Live search across titles and bodies (case-insensitive)
- Pinned notes sort to the top, then by most-recently updated
- Automatic persistence to `localStorage`
- Two-pane layout that collapses to a single column on small screens
- Accessible controls (labelled inputs, `aria-pressed` on the pin toggle)

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm test         # run the test suite once
npm run build    # production build into dist/
```

## Project layout

```
src/lib/notes.js        Pure helpers: makeNote, createNote, updateNote,
                        removeNote, togglePin, sortNotes, filterNotes, notePreview
src/lib/notes.test.js   Tests for the pure helpers
src/hooks/useNotes.js   React state: CRUD + search + persistence (injectable storage)
src/hooks/useNotes.test.jsx  Hook tests, including a reload/persist check
src/App.jsx             Two-pane UI (sidebar list + editor)
src/App.test.jsx        Component tests driving real user interactions
src/styles.css          Styling, with a responsive breakpoint
```

### Design notes

- `src/lib/notes.js` has no React dependency at all. Every function is a pure
  transform of a note array, which makes the rules trivial to unit test.
- `updateNote` always preserves a note's `id` (even if a patch tries to change it)
  and bumps `updatedAt`.
- `useNotes(storage)` accepts an injected `Storage`-like object, so tests can
  pass a tiny in-memory fake instead of touching `localStorage`.

## Tests

```bash
npm test
```

Covers creation/ordering, id-preserving updates, removal, pinning, sorting,
search filtering, previews, and a full persist → reload round-trip.

## License

MIT
