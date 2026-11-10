import { Text, View } from 'react-native';

import { useAppTheme } from '@/hooks';

interface PasswordStrengthProps {
  password: string;
}

const labels = ['Débil', 'Media', 'Buena', 'Excelente'] as const;

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { colors } = useAppTheme();
  const requirements = [
    password.length >= 8 && password.length <= 20,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9\s]/.test(password),
  ];
  const score = requirements.filter(Boolean).length;
  const isExcellent =
    score === requirements.length &&
    password.length >= 12 &&
    /[a-z]/.test(password);
  const level = isExcellent ? 4 : score === 4 ? 3 : score >= 2 ? 2 : 1;
  const label = labels[level - 1];
  const strengthColor =
    level === 1 ? colors.danger : level === 2 ? colors.warning : colors.success;

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-caption text-muted-foreground">
          Seguridad de contraseña
        </Text>
        <Text className="text-caption font-semibold" style={{ color: strengthColor }}>
          {label}
        </Text>
      </View>

      <View className="flex-row gap-1.5" accessibilityLabel={`Seguridad ${label}`}>
        {labels.map((item, index) => (
          <View
            className="h-1.5 flex-1 rounded-full bg-border"
            key={item}
            style={{
              backgroundColor: index < level ? strengthColor : colors.border,
            }}
          />
        ))}
      </View>

      <View className="gap-1">
        <RequirementRow
          label="Entre 8 y 20 caracteres"
          met={requirements[0]}
        />
        <RequirementRow label="Una letra mayúscula" met={requirements[1]} />
        <RequirementRow label="Un número y un símbolo" met={requirements[2] && requirements[3]} />
      </View>
    </View>
  );
}

function RequirementRow({ label, met }: { label: string; met: boolean }) {
  const { colors } = useAppTheme();

  return (
    <Text
      className="text-caption"
      style={{ color: met ? colors.success : colors.mutedForeground }}
    >
      {met ? '✓' : '·'} {label}
    </Text>
  );
}
