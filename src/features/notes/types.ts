/**
 * Notes domain contracts. CRUD, repositories and screens are intentionally
 * out of scope for this foundation.
 */
export type NoteId = string;

export interface Note {
  id: NoteId;
  title: string;
  content: string;
  subjectId?: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteDraft {
  title: string;
  content: string;
  subjectId?: string;
  tags?: string[];
}
