import { act, render, screen, waitFor } from '@testing-library/react';
import { Content } from './Content';
import { listNotes } from '../services/noteStorage';

// The drawing canvas needs a real 2D context, which jsdom does not provide.
jest.mock('../Components/Canvas', () => () => <div data-testid="canvas" />);
jest.mock('../services/noteStorage', () => ({
  listNotes: jest.fn(),
  noteUrl: (name) => `/api/notes/files/${name}`,
}));

const notes = [{ id: 2, name: 'b.png', status: true }, { id: 1, name: 'a.png', status: true }];

beforeEach(() => {
  jest.useFakeTimers();
  listNotes.mockReset();
  listNotes.mockResolvedValue(notes);
});

afterEach(() => {
  jest.useRealTimers();
});

// Mounts and lets the initial fetch settle before assertions run.
async function mount() {
  let utils;
  await act(async () => {
    utils = render(<Content />);
  });
  return utils;
}

// Advances timers and lets the pending fetch promise settle.
async function advance(ms) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

test('fetches once on mount and then every 15 seconds', async () => {
  await mount();
  await waitFor(() => expect(listNotes).toHaveBeenCalledTimes(1));

  await advance(14999);
  expect(listNotes).toHaveBeenCalledTimes(1);

  await advance(1);
  expect(listNotes).toHaveBeenCalledTimes(2);

  await advance(15000);
  expect(listNotes).toHaveBeenCalledTimes(3);
});

test('pauses while a note is focused and resumes once deselected', async () => {
  await mount();
  await waitFor(() => expect(listNotes).toHaveBeenCalledTimes(1));

  const [note] = await screen.findAllByAltText('Note');
  await act(async () => {
    note.click();
  });

  expect(screen.getByText(/PAUSED/)).toBeInTheDocument();

  // No refresh happens across two full cycles while the preview is open.
  await advance(45000);
  expect(listNotes).toHaveBeenCalledTimes(1);

  await act(async () => {
    screen.getByAltText('Note preview').click();
  });

  await advance(15000);
  expect(listNotes).toHaveBeenCalledTimes(2);
});

test('runs a single interval and clears it on unmount', async () => {
  const { unmount } = await mount();
  await waitFor(() => expect(listNotes).toHaveBeenCalledTimes(1));

  await advance(15000);
  expect(listNotes).toHaveBeenCalledTimes(2);

  unmount();
  await advance(60000);
  expect(listNotes).toHaveBeenCalledTimes(2);
  expect(jest.getTimerCount()).toBe(0);
});

test('keeps note positions stable across refreshes', async () => {
  await mount();
  const before = (await screen.findAllByAltText('Note')).map((n) => n.style.left);

  await advance(15000);
  const after = (await screen.findAllByAltText('Note')).map((n) => n.style.left);

  expect(after).toEqual(before);
});
