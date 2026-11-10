import { useRouter } from 'expo-router';
import { ArrowRight, BookOpen, Check, Clock3 } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { BrandMark } from '@/components/common';
import { AuthLayout } from '@/components/layouts';
import { Button, Card } from '@/components/ui';
import { APP_TAGLINE } from '@/constants';
import { useAppTheme } from '@/hooks';

const PREVIEW_TAGS = ['Apuntes', 'Tareas', 'Exámenes'] as const;

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <AuthLayout>
      <View className="flex-1 justify-center gap-7">
        <BrandMark />

        <View className="gap-4">
          <View className="flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-accent" />
            <Text className="text-overline font-semibold uppercase text-primary">
              Tu espacio para pensar
            </Text>
          </View>

          <Text className="text-display font-semibold text-foreground">
            Tus ideas,{'\n'}siempre en orden.
          </Text>
          <Text className="pr-4 text-subtitle text-muted-foreground">
            {APP_TAGLINE}
          </Text>
        </View>

        <Card className="gap-4" padding="md" variant="elevated">
          <View className="flex-row items-center justify-between">
            <Text className="text-overline font-semibold uppercase text-muted-foreground">
              Una vista de tu espacio
            </Text>
            <View className="flex-row items-center gap-1.5 rounded-badge bg-accent-soft px-2.5 py-1">
              <View className="h-1.5 w-1.5 rounded-full bg-accent" />
              <Text className="text-overline font-semibold uppercase text-accent">
                En marcha
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft">
              <BookOpen color={colors.accent} size={20} strokeWidth={2} />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-label font-semibold text-foreground">
                Cálculo diferencial
              </Text>
              <Text className="text-caption text-muted-foreground">
                3 apuntes · actualizado hoy
              </Text>
            </View>
          </View>

          <View className="gap-2 rounded-card border border-border bg-background px-4 py-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-overline font-semibold uppercase text-primary">
                Apunte reciente
              </Text>
              <Clock3 color={colors.mutedForeground} size={14} />
            </View>
            <Text className="text-body font-medium text-foreground">
              Regla de la cadena
            </Text>
            <Text className="text-caption text-muted-foreground">
              Ejemplos y ejercicios listos para repasar.
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {PREVIEW_TAGS.map((tag, index) => (
              <View
                className="flex-row items-center gap-1.5 rounded-badge border border-border bg-card px-3 py-1.5"
                key={tag}
              >
                {index === 0 ? (
                  <Check color={colors.accent} size={12} strokeWidth={2.5} />
                ) : null}
                <Text className="text-caption font-medium text-foreground-secondary">
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </Card>

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
