import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Animated, Platform, Text, View } from 'react-native';

import { BrandMark } from '@/components/common';
import { AuthLayout } from '@/components/layouts';
import { Button } from '@/components/ui';
import { APP_TAGLINE } from '@/constants';
import { useAppTheme } from '@/hooks';

export default function WelcomeScreen() {
  const router = useRouter();
  const [float] = useState(() => new Animated.Value(0));
  const { colors } = useAppTheme();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1900,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1900,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [float]);

  return (
    <AuthLayout>
      <View className="flex-1 justify-center gap-8">
        <BrandMark />

        <View className="gap-4">
          <Text className="text-display font-semibold text-foreground">
            Tus apuntes,{'\n'}sin perder el hilo.
          </Text>
          <Text className="pr-4 text-subtitle text-muted-foreground">
            {APP_TAGLINE}.
          </Text>
        </View>

        <Animated.View
          accessibilityLabel="Ilustración de una libreta de apuntes"
          style={{
            transform: [
              {
                translateY: float.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -5],
                }),
              },
            ],
          }}
        >
          <View className="gap-3 rounded-card border border-border bg-card p-5">
            <View className="h-1 w-12 rounded-full bg-accent" />
            <Text className="text-overline font-semibold uppercase tracking-widest text-primary">
              APUNTES
            </Text>
            <View className="gap-2.5 pt-1">
              <View className="h-3 w-4/5 rounded-full bg-card-muted" />
              <View className="h-3 w-full rounded-full bg-card-muted" />
              <View className="h-3 w-3/5 rounded-full bg-card-muted" />
            </View>
            <View className="mt-1 h-px bg-border" />
            <View className="flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-accent" />
              <View className="h-2 w-20 rounded-full bg-card-muted" />
            </View>
          </View>
        </Animated.View>

        <View className="gap-4">
          <Button
            fullWidth
            label="Comenzar"
            onPress={() => router.push('./login')}
            rightIcon={
              <ArrowRight
                color={colors.primaryForeground}
                size={18}
                strokeWidth={2.4}
              />
            }
            size="lg"
          />
          <Text className="text-center text-caption text-muted-foreground">
            Menos ruido. Más espacio para aprender.
          </Text>
        </View>
      </View>
    </AuthLayout>
  );
}
