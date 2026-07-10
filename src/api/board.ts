import type { BoardNote, BoardNoteInput, BoardSettings } from 'types/board';
import { deleteRequest, getRequest, patchRequest, postRequest } from 'api/client';

export const getBoardSettings = (): Promise<BoardSettings | undefined> => getRequest<BoardSettings>('/board/settings');

export const updateBoardSettings = (patch: Partial<BoardSettings>): Promise<BoardSettings | void> =>
  patchRequest<Partial<BoardSettings>, BoardSettings>('/board/settings', patch);

export const getBoardNotes = (): Promise<BoardNote[] | undefined> => getRequest<BoardNote[]>('/board/notes');

export const createBoardNote = (input: BoardNoteInput): Promise<BoardNote> =>
  postRequest<BoardNoteInput, BoardNote>('/board/notes', input);

export const updateBoardNote = (id: string, patch: Partial<BoardNoteInput>): Promise<BoardNote | void> =>
  patchRequest<Partial<BoardNoteInput>, BoardNote>(`/board/notes/${id}`, patch);

export const removeBoardNote = (id: string): Promise<void> => deleteRequest(`/board/notes/${id}`);
