import { useLocalSearchParams } from 'expo-router';

import { NoteEditor } from '@/features/notes/components/NoteEditor';

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <NoteEditor noteId={id} />;
}
