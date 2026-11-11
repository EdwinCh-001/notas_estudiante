import {
  Archive,
  Bookmark,
  Pin,
  Star,
} from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks';

import type { Note, NoteCategory } from '../types';

interface NoteRowProps {
  note: Note;
  category?: NoteCategory;
  onPress: () => void;
  onToggleFavorite?: () => void;
  onTogglePinned?: () => void;
  onArchive?: () => void;
}

export function NoteRow({
  note,
  category,
  onPress,
  onToggleFavorite,
  onTogglePinned,
  onArchive,
}: NoteRowProps) {
  const { colors } = useAppTheme();
  const preview = note.content.replace(/\s+/g, ' ').trim();

  return (
    <Pressable
      accessibilityRole="button"
      className="mb-2 overflow-hidden rounded-card border border-border bg-card"
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.995 : 1 }],
      })}
    >
      <View className="flex-row">
        <View style={{ width: 4, backgroundColor: note.color }} />
        <View className="flex-1 gap-3 p-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text
                className="text-body font-semibold text-foreground"
                numberOfLines={1}
              >
                {note.title}
              </Text>
              <Text
                className="text-caption leading-5 text-muted-foreground"
                numberOfLines={2}
              >
                {preview || 'Sin contenido adicional'}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              {note.isPinned ? (
                <Pin color={colors.primary} fill={colors.primary} size={15} />
              ) : null}
              {onArchive ? (
                <Pressable
                  accessibilityLabel={
                    note.isArchived ? 'Desarchivar nota' : 'Archivar nota'
                  }
                  accessibilityRole="button"
                  accessibilityState={{ selected: note.isArchived }}
                  hitSlop={8}
                  onPress={(event) => {
                    event.stopPropagation();
                    onArchive();
                  }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.65 : 1,
                    transform: [{ scale: pressed ? 0.9 : 1 }],
                  })}
                >
                  <Archive color={colors.mutedForeground} size={17} />
                </Pressable>
              ) : null}
              {onToggleFavorite ? (
                <Pressable
                  accessibilityLabel={
                    note.isFavorite ? 'Quitar de favoritas' : 'Añadir a favoritas'
                  }
                  accessibilityRole="button"
                  accessibilityState={{ selected: note.isFavorite }}
                  hitSlop={8}
                  onPress={(event) => {
                    event.stopPropagation();
                    onToggleFavorite();
                  }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.65 : 1,
                    transform: [{ scale: pressed ? 0.9 : 1 }],
                  })}
                >
                  <Star
                    color={note.isFavorite ? colors.warning : colors.mutedForeground}
                    fill={note.isFavorite ? colors.warning : 'transparent'}
                    size={18}
                  />
                </Pressable>
              ) : null}
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              {category ? (
                <View className="flex-row items-center gap-1.5 rounded-badge bg-card-muted px-2.5 py-1">
                  <View
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <Text className="text-overline text-foreground-secondary">
                    {category.name}
                  </Text>
                </View>
              ) : null}
              {onTogglePinned ? (
                <Pressable
                  accessibilityLabel={note.isPinned ? 'Desfijar nota' : 'Fijar nota'}
                  accessibilityRole="button"
                  accessibilityState={{ selected: note.isPinned }}
                  className="min-h-8 flex-row items-center gap-1 px-1"
                  onPress={(event) => {
                    event.stopPropagation();
                    onTogglePinned();
                  }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.65 : 1,
                    transform: [{ scale: pressed ? 0.9 : 1 }],
                  })}
                >
                  <Bookmark
                    color={note.isPinned ? colors.primary : colors.mutedForeground}
                    size={14}
                  />
                </Pressable>
              ) : null}
            </View>
            <Text className="text-overline text-muted-foreground">
              {formatCompactDate(note.updatedAt)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function formatCompactDate(value: string): string {
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}
