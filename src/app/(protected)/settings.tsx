import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { ChevronRight, KeyRound, Moon, Monitor, Sun } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { useAppTheme } from '@/hooks';
import type { ThemeMode } from '@/types';
import {
  AppScreen,
  ScreenHeading,
} from '@/features/notes/components';

const modes: {
  value: ThemeMode;
  label: string;
  detail: string;
  icon: typeof Sun;
}[] = [
  { value: 'system', label: 'Sistema', detail: 'Usa el tema del dispositivo', icon: Monitor },
  { value: 'light', label: 'Claro', detail: 'Siempre con apariencia clara', icon: Sun },
  { value: 'dark', label: 'Oscuro', detail: 'Siempre con apariencia oscura', icon: Moon },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { mode, setMode, colors } = useAppTheme();
  const version = Constants.expoConfig?.version ?? '—';

  return (
    <AppScreen>
      <View className="gap-6">
        <ScreenHeading
          back
          title="Configuración"
          subtitle="Ajusta Student Notes a tu manera."
        />

        <View className="gap-2">
          <Text className="px-1 text-overline font-semibold uppercase tracking-widest text-muted-foreground">
            APARIENCIA
          </Text>
          <Card className="gap-1" padding="sm">
            {modes.map(({ value, label, detail, icon: Icon }) => {
              const selected = mode === value;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  className={`min-h-16 flex-row items-center gap-3 rounded-input px-2 ${
                    selected ? 'bg-accent-soft' : ''
                  }`}
                  key={value}
                  onPress={() => setMode(value)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.82 : 1,
                    transform: [{ scale: pressed ? 0.99 : 1 }],
                  })}
                >
                  <View
                    className={`h-9 w-9 items-center justify-center rounded-full ${
                      selected ? 'bg-primary' : 'bg-card-muted'
                    }`}
                  >
                    <Icon
                      color={selected ? colors.primaryForeground : colors.mutedForeground}
                      size={17}
                    />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-label font-semibold text-foreground">
                      {label}
                    </Text>
                    <Text className="text-overline text-muted-foreground">
                      {detail}
                    </Text>
                  </View>
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border ${
                      selected ? 'border-primary' : 'border-border-strong'
                    }`}
                  >
                    {selected ? (
                      <View className="h-2.5 w-2.5 rounded-full bg-primary" />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </Card>
        </View>

        <View className="gap-2">
          <Text className="px-1 text-overline font-semibold uppercase tracking-widest text-muted-foreground">
            CUENTA
          </Text>
          <Card padding="none">
            <Pressable
              className="min-h-14 flex-row items-center gap-3 px-4"
              onPress={() => router.push('/change-password')}
              style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
            >
              <KeyRound color={colors.foregroundSecondary} size={18} />
              <Text className="flex-1 text-label text-foreground">
                Cambiar contraseña
              </Text>
              <ChevronRight color={colors.mutedForeground} size={17} />
            </Pressable>
          </Card>
        </View>

        <View className="gap-2">
          <Text className="px-1 text-overline font-semibold uppercase tracking-widest text-muted-foreground">
            APLICACIÓN
          </Text>
          <Card className="gap-3" padding="md">
            <View className="flex-row items-center justify-between">
              <Text className="text-label text-foreground">Versión</Text>
              <Text className="text-caption text-muted-foreground">{version}</Text>
            </View>
            <View className="h-px bg-border" />
            <View className="gap-1">
              <Text className="text-label font-medium text-foreground">
                Diseñada para tus ideas
              </Text>
              <Text className="text-caption text-muted-foreground">
                Un espacio personal para tus notas y temas de estudio.
              </Text>
            </View>
          </Card>
        </View>
      </View>
    </AppScreen>
  );
}
