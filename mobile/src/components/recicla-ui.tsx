import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

export function AppScreen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

export function AppCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function AppText({
  children,
  size = 'body',
  color = Colors.light.text,
  weight = 'regular',
  style,
}: {
  children: ReactNode;
  size?: 'eyebrow' | 'caption' | 'small' | 'body' | 'subtitle' | 'title';
  color?: string;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      style={[
        styles.text,
        textSizes[size],
        textWeights[weight],
        { color },
        style,
      ]}>
      {children}
    </Text>
  );
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const backgroundColor =
    variant === 'primary'
      ? Colors.light.primary
      : variant === 'secondary'
        ? Colors.light.backgroundSelected
        : variant === 'outline'
          ? Colors.light.backgroundElement
          : 'transparent';
  const foregroundColor =
    variant === 'primary' ? '#FFFFFF' : Colors.light.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderWidth: variant === 'outline' ? 1 : 0 },
        variant === 'outline' && { borderColor: Colors.light.border },
        (disabled || loading) && styles.buttonDisabled,
        pressed && !disabled && !loading && styles.buttonPressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={foregroundColor} />
      ) : (
        <AppText color={foregroundColor} weight="semibold" size="small">
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

export function FilterChip({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        selected ? styles.chipSelected : styles.chipUnselected,
      ]}>
      <AppText
        size="small"
        weight={selected ? 'semibold' : 'medium'}
        color={selected ? Colors.light.primary : Colors.light.textSecondary}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={onBack}
        style={styles.backButton}>
        <AppText color={Colors.light.primary} size="subtitle" weight="medium">
          ‹
        </AppText>
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText size="subtitle" weight="bold">
          {title}
        </AppText>
        {subtitle ? (
          <AppText size="caption" color={Colors.light.textSecondary}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

export function FeedbackCard({
  title,
  description,
  actionLabel,
  onAction,
  loading = false,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
}) {
  return (
    <AppCard style={styles.feedback}>
      {loading ? <ActivityIndicator color={Colors.light.accent} /> : null}
      <AppText size="body" weight="semibold">
        {title}
      </AppText>
      <AppText size="small" color={Colors.light.textSecondary}>
        {description}
      </AppText>
      {actionLabel && onAction ? (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          style={styles.feedbackButton}
        />
      ) : null}
    </AppCard>
  );
}

const textSizes = StyleSheet.create({
  eyebrow: { fontSize: 10, lineHeight: 14, letterSpacing: 0.8 },
  caption: { fontSize: 11, lineHeight: 16 },
  small: { fontSize: 13, lineHeight: 19 },
  body: { fontSize: 15, lineHeight: 22 },
  subtitle: { fontSize: 19, lineHeight: 26 },
  title: { fontSize: 27, lineHeight: 34 },
});

const textWeights = StyleSheet.create({
  regular: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semibold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: Colors.light.backgroundElement,
    borderColor: Colors.light.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  text: {
    fontFamily: 'System',
  },
  button: {
    minHeight: 48,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  chip: {
    minHeight: 34,
    borderRadius: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: Colors.light.backgroundSelected,
    borderColor: Colors.light.backgroundSelected,
  },
  chipUnselected: {
    backgroundColor: Colors.light.backgroundElement,
    borderColor: Colors.light.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundSelected,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  feedback: {
    marginTop: Spacing.three,
    alignItems: 'flex-start',
  },
  feedbackButton: {
    marginTop: Spacing.one,
    alignSelf: 'flex-start',
  },
});
