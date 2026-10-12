import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    clear: () => map.clear(),
  };
}

let storage;
beforeEach(() => {
  storage = fakeStorage();
});

describe('App', () => {
  it('shows an empty state before anything is created', () => {
    render(<App storage={storage} />);
    expect(screen.getByText('No notes yet.')).toBeInTheDocument();
    expect(screen.getByText('Select a note, or create a new one.')).toBeInTheDocument();
  });

  it('creates a note and edits its title', async () => {
    const user = userEvent.setup();
    render(<App storage={storage} />);

    await user.click(screen.getByRole('button', { name: /new/i }));
    await user.type(screen.getByLabelText('Note title'), 'Shopping list');

    const list = screen.getByRole('list');
    expect(within(list).getByText('Shopping list')).toBeInTheDocument();
  });

  it('filters notes with the search box', async () => {
    const user = userEvent.setup();
    render(<App storage={storage} />);

    await user.click(screen.getByRole('button', { name: /new/i }));
    await user.type(screen.getByLabelText('Note title'), 'Groceries');

    await user.click(screen.getByRole('button', { name: /new/i }));
    await user.type(screen.getByLabelText('Note title'), 'Meeting notes');

    await user.type(screen.getByLabelText('Search notes'), 'meet');

    const list = screen.getByRole('list');
    expect(within(list).getByText('Meeting notes')).toBeInTheDocument();
    expect(within(list).queryByText('Groceries')).not.toBeInTheDocument();
  });

  it('deletes the selected note', async () => {
    const user = userEvent.setup();
    render(<App storage={storage} />);

    await user.click(screen.getByRole('button', { name: /new/i }));
    await user.type(screen.getByLabelText('Note title'), 'Temporary');
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByText('No notes yet.')).toBeInTheDocument();
  });

  it('pins the selected note and reflects the state on the button', async () => {
    const user = userEvent.setup();
    render(<App storage={storage} />);

    await user.click(screen.getByRole('button', { name: /new/i }));
    await user.type(screen.getByLabelText('Note title'), 'Important');

    const pinButton = screen.getByRole('button', { name: 'Pin' });
    await user.click(pinButton);
    expect(screen.getByRole('button', { name: 'Unpin' })).toHaveAttribute('aria-pressed', 'true');
  });
});
