import type { ReactElement } from 'react';
import { FlatList, View, type ListRenderItem } from 'react-native';

import { LoadingSkeleton } from './LoadingSkeleton';
import type { Note } from '../types';

interface NotesFeedProps {
  notes: Note[];
  header: ReactElement;
  empty: ReactElement;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  renderNote: ListRenderItem<Note>;
}

export function NotesFeed({
  notes,
  header,
  empty,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  renderNote,
}: NotesFeedProps) {
  return (
    <FlatList
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
      data={notes}
      initialNumToRender={8}
      keyboardShouldPersistTaps="handled"
      keyExtractor={(item) => item.id}
      ListEmptyComponent={loading ? <LoadingSkeleton rows={2} /> : empty}
      ListFooterComponent={
        loadingMore ? (
          <View className="py-4">
            <LoadingSkeleton rows={1} />
          </View>
        ) : undefined
      }
      ListHeaderComponent={header}
      maxToRenderPerBatch={8}
      onEndReached={() => {
        if (hasMore && !loading && !loadingMore) onLoadMore();
      }}
      onEndReachedThreshold={0.45}
      renderItem={renderNote}
      removeClippedSubviews
      showsVerticalScrollIndicator={false}
      updateCellsBatchingPeriod={50}
      windowSize={7}
      ItemSeparatorComponent={() => <View className="h-2" />}
    />
  );
}
