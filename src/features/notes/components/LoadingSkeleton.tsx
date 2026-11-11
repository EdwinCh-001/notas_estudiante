import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';

import { useAppTheme } from '@/hooks';

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  const [shimmer] = useState(() => new Animated.Value(0));
  const { colors } = useAppTheme();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1250,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  return (
    <View
      accessibilityLabel="Cargando contenido"
      className="relative gap-4 overflow-hidden"
    >
      {Array.from({ length: rows }, (_, index) => (
        <View className="gap-3 rounded-card border border-border bg-card p-4" key={index}>
          <View className="h-3 w-24 rounded-full bg-card-muted" />
          <View className="h-5 w-3/4 rounded-full bg-card-muted" />
          <View className="h-3 w-full rounded-full bg-card-muted" />
          <View className="h-3 w-2/3 rounded-full bg-card-muted" />
        </View>
      ))}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 100,
          opacity: 0.22,
          backgroundColor: colors.background,
          transform: [
            {
              translateX: shimmer.interpolate({
                inputRange: [0, 1],
                outputRange: [-120, 480],
              }),
            },
          ],
        }}
      />
    </View>
  );
}
