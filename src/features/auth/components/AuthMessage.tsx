import { AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { useAppTheme } from '@/hooks';

interface AuthMessageProps {
  message: string;
  variant?: 'error' | 'success';
}

export function AuthMessage({
  message,
  variant = 'error',
}: AuthMessageProps) {
  const { colors } = useAppTheme();
  const color = variant === 'error' ? colors.danger : colors.success;
  const Icon = variant === 'error' ? AlertCircle : CheckCircle2;

  return (
    <View
      accessibilityLiveRegion="polite"
      className="flex-row items-start gap-2 rounded-input border border-border bg-card px-3 py-3"
      accessibilityRole={variant === 'error' ? 'alert' : 'text'}
    >
      <Icon color={color} size={18} />
      <Text className="flex-1 text-caption text-foreground-secondary">
        {message}
      </Text>
    </View>
  );
}
