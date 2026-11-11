export interface StudentProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string;
  email: string;
  provider: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileDraft {
  firstName: string;
  lastName: string;
  username: string;
}
