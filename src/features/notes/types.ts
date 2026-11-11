export type NoteId = string;
export type CategoryId = string;

export interface Note {
  id: NoteId;
  userId: string;
  categoryId: CategoryId | null;
  title: string;
  content: string;
  color: string;
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteDraft {
  title: string;
  content: string;
  categoryId: CategoryId | null;
  color: string;
  isFavorite: boolean;
  isPinned: boolean;
}

export interface NoteCategory {
  id: CategoryId;
  userId: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface CategoryDraft {
  name: string;
  color: string;
  icon: string;
}

export type NoteFilter =
  | 'all'
  | 'favorites'
  | 'pinned'
  | 'archived'
  | 'recent';

export interface NoteQuery {
  filter?: NoteFilter;
  categoryId?: CategoryId;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface DashboardSummary {
  totalNotes: number;
  favoriteNotes: number;
  totalCategories: number;
  latestUpdate: string | null;
  recentNotes: Note[];
  categories: (NoteCategory & { noteCount: number })[];
}
