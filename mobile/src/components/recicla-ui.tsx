import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { AppIcon } from '@/components/app-icons';
import {
  BorderWidth,
  Colors,
  Fonts,
  Layout,
  Radius,
  Spacing,
  Typography,
} from '@/constants/theme';

export function AppScreen({
  children,
  backgroundColor = Colors.light.backgroundCanvas,
}: {
  children: ReactNode;
  backgroundColor?: string;
}) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
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

export type AppTextSize =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bodyLarge'
  | 'label'
  | 'eyebrow'
  | 'caption'
  | 'small'
  | 'body'
  | 'subtitle'
  | 'title'
  | 'button';

export type AppTextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

const textSizes: Record<AppTextSize, TextStyle> = {
  display: Typography.display,
  h1: Typography.h1,
  h2: Typography.h2,
  h3: Typography.h3,
  bodyLarge: Typography.bodyLarge,
  label: Typography.label,
  eyebrow: { ...Typography.label, letterSpacing: 0.7 },
  caption: Typography.caption,
  small: Typography.label,
  body: Typography.body,
  subtitle: Typography.h3,
  title: Typography.h1,
  button: Typography.button,
};

const textWeights: Record<AppTextWeight, TextStyle> = {
  regular: { fontFamily: Fonts.regular, fontWeight: '400' },
  medium: { fontFamily: Fonts.medium, fontWeight: '500' },
  semibold: { fontFamily: Fonts.semibold, fontWeight: '600' },
  bold: { fontFamily: Fonts.bold, fontWeight: '700' },
};

export function AppText({
  children,
  size = 'body',
  color = Colors.light.textPrimary,
  weight = 'regular',
  style,
  numberOfLines,
  accessibilityLabel,
}: {
  children: ReactNode;
  size?: AppTextSize;
  color?: string;
  weight?: AppTextWeight;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  accessibilityLabel?: string;
}) {
  return (
    <Text
      accessibilityLabel={accessibilityLabel}
      numberOfLines={numberOfLines}
      style={[styles.text, textSizes[size], textWeights[weight], { color }, style]}>
      {children}
    </Text>
  );
}

type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type AppButtonSize = 'medium' | 'large';

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const unavailable = disabled || loading;
  const height = size === 'large' ? 56 : 48;
  const colors = {
    primary: {
      background: Colors.light.primary,
      pressed: Colors.light.primaryPressed,
      text: Colors.light.textOnPrimary,
    },
    secondary: {
      background: Colors.light.backgroundSelected,
      pressed: Colors.light.backgroundSelected,
      text: Colors.light.primary,
    },
    outline: {
      background: Colors.light.surface,
      pressed: Colors.light.backgroundSelected,
      text: Colors.light.primary,
    },
    text: {
      background: 'transparent',
      pressed: Colors.light.backgroundSelected,
      text: Colors.light.primary,
    },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: unavailable }}
      disabled={unavailable}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          minHeight: height,
          paddingVertical: size === 'large' ? Spacing.space4 : Spacing.space3,
        },
        {
          backgroundColor: unavailable
            ? variant === 'text'
              ? 'transparent'
              : Colors.light.backgroundDisabled
            : pressed
              ? colors.pressed
              : colors.background,
        },
        variant === 'outline' && {
          borderWidth: BorderWidth.default,
          borderColor: unavailable
            ? Colors.light.backgroundDisabled
            : pressed
              ? Colors.light.focusBorder
              : Colors.light.border,
        },
        pressed && !unavailable && styles.buttonPressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.light.textOnPrimary : colors.text} />
      ) : (
        <AppText
          color={unavailable ? Colors.light.textDisabled : colors.text}
          size="button"
          weight="semibold">
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

export function AppIconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 'medium',
  disabled = false,
  style,
}: {
  icon: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  size?: 'medium' | 'large' | 'touch';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const dimension = size === 'touch' ? 56 : size === 'large' ? 48 : 44;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { width: dimension, height: dimension },
        disabled && styles.iconButtonDisabled,
        pressed && !disabled && styles.iconButtonPressed,
        style,
      ]}>
      {icon}
    </Pressable>
  );
}

export function FilterChip({
  label,
  selected = false,
  disabled = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : styles.chipUnselected,
        disabled && styles.chipDisabled,
        pressed && !disabled && styles.chipPressed,
      ]}>
      <AppText
        size="label"
        weight="medium"
        color={
          disabled
            ? Colors.light.textDisabled
            : selected
              ? Colors.light.primary
              : Colors.light.textPrimary
        }>
        {label}
      </AppText>
    </Pressable>
  );
}

export function MaterialChip({
  label,
  category,
  selected = false,
  disabled = false,
  onPress,
}: {
  label: string;
  category?: keyof typeof Colors.light.category;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const backgroundColor = category
    ? Colors.light.category[category]
    : Colors.light.surface;
  const dotColor = category
    ? {
        paper: Colors.light.accent,
        plastic: Colors.light.accent,
        glass: Colors.light.eco,
        metal: Colors.light.warning,
        electronics: Colors.light.info,
        organic: Colors.light.warning,
      }[category]
    : undefined;

  const content = (
    <View style={styles.materialChipContent}>
      {dotColor ? (
        <View style={[styles.materialChipDot, { backgroundColor: dotColor }]} />
      ) : null}
      <AppText
        size="label"
        weight="medium"
        color={disabled ? Colors.light.textDisabled : Colors.light.textPrimary}>
        {label}
      </AppText>
    </View>
  );
  const chipStyle = [
    styles.materialChip,
    { backgroundColor },
    !category && styles.materialChipUncategorized,
    selected && styles.materialChipSelected,
    disabled && styles.chipDisabled,
  ];

  if (!onPress) return <View style={chipStyle}>{content}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        ...chipStyle,
        pressed && !disabled && styles.chipPressed,
      ]}>
      {content}
    </Pressable>
  );
}

export function StatusBadge({
  label,
  status = 'info',
  style,
}: {
  label: string;
  status?: 'info' | 'success' | 'warning' | 'error' | 'neutral';
  style?: StyleProp<ViewStyle>;
}) {
  const appearance = {
    info: { background: Colors.light.backgroundInfo, text: Colors.light.info },
    success: { background: Colors.light.backgroundSuccess, text: Colors.light.success },
    warning: { background: Colors.light.backgroundWarning, text: Colors.light.warning },
    error: { background: Colors.light.backgroundDanger, text: Colors.light.danger },
    neutral: { background: Colors.light.backgroundCanvas, text: Colors.light.textSecondary },
  }[status];

  return (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: appearance.background },
        status === 'neutral' && {
          borderWidth: BorderWidth.default,
          borderColor: Colors.light.border,
        },
        style,
      ]}>
      <AppText size="caption" weight="semibold" color={appearance.text}>
        {label}
      </AppText>
    </View>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  supportingText,
  errorText,
  state = 'default',
  accessibilityLabel,
  leadingIcon,
  inputStyle,
  style,
  ...inputProps
}: {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  supportingText?: string;
  errorText?: string;
  state?: 'default' | 'focused' | 'error' | 'disabled';
  accessibilityLabel?: string;
  leadingIcon?: ReactNode;
  inputStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
} & Pick<
  TextInputProps,
  | 'autoCapitalize'
  | 'autoComplete'
  | 'keyboardType'
  | 'maxLength'
  | 'multiline'
  | 'onSubmitEditing'
  | 'returnKeyType'
  | 'secureTextEntry'
>) {
  const [focused, setFocused] = useState(false);
  const isDisabled = state === 'disabled';
  const isError = state === 'error' || Boolean(errorText);
  const isFocused = state === 'focused' || focused;

  const input = (
    <TextInput
      {...inputProps}
      accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.light.textSecondary}
      editable={!isDisabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.input,
        leadingIcon ? styles.inputWithIconText : undefined,
        !leadingIcon && isFocused && !isError && styles.inputFocused,
        !leadingIcon && isError && styles.inputError,
        isDisabled && styles.inputDisabled,
        inputStyle,
      ]}
    />
  );

  return (
    <View style={[styles.field, style]}>
      {label ? <AppText size="label" weight="medium">{label}</AppText> : null}
      {leadingIcon ? (
        <View
          style={[
            styles.inputWithLeadingIcon,
            isFocused && !isError && styles.inputFocused,
            isError && styles.inputError,
            isDisabled && styles.inputDisabled,
          ]}>
          <View style={styles.inputLeadingIcon}>{leadingIcon}</View>
          {input}
        </View>
      ) : input}
      {errorText || supportingText ? (
        <AppText
          size="caption"
          color={isError ? Colors.light.danger : Colors.light.textSecondary}>
          {errorText ?? supportingText}
        </AppText>
      ) : null}
    </View>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  backIcon,
  showBack = true,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backIcon?: ReactNode;
  showBack?: boolean;
}) {
  return (
    <View style={styles.header}>
      {showBack && onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={onBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}>
          {backIcon ?? (
            <AppIcon name="chevron-left" size={24} color={Colors.light.iconPrimary} />
          )}
        </Pressable>
      ) : null}
      <View style={styles.headerCopy}>
        <AppText size="h3" weight="semibold" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText size="caption" color={Colors.light.textSecondary} numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

type FeedbackState = 'loading' | 'empty' | 'error' | 'success';

export function FeedbackCard({
  title,
  description,
  actionLabel,
  onAction,
  loading = false,
  state,
  layout = 'stacked',
  style,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
  state?: FeedbackState;
  layout?: 'stacked' | 'compact';
  style?: StyleProp<ViewStyle>;
}) {
  const feedbackState = state ?? (loading ? 'loading' : 'empty');
  const appearance = {
    loading: { background: Colors.light.backgroundSelected, icon: Colors.light.accent },
    empty: { background: Colors.light.backgroundInfo, icon: Colors.light.info },
    error: { background: Colors.light.backgroundDanger, icon: Colors.light.danger },
    success: { background: Colors.light.backgroundSuccess, icon: Colors.light.success },
  }[feedbackState];

  if (layout === 'compact') {
    return (
      <View
        style={[
          styles.feedbackCompact,
          { backgroundColor: appearance.background },
          feedbackState === 'empty' && styles.feedbackCompactEmpty,
          style,
        ]}>
        <View style={styles.feedbackIcon}>
          {loading || feedbackState === 'loading' ? (
            <ActivityIndicator color={appearance.icon} />
          ) : (
            <AppIcon
              name={
                feedbackState === 'success'
                  ? 'check-circle'
                  : feedbackState === 'error'
                    ? 'alert-circle'
                    : 'info'
              }
              size={24}
              color={appearance.icon}
            />
          )}
        </View>
        <View style={styles.feedbackCopy}>
          <AppText size="h3" weight="semibold">{title}</AppText>
          <AppText size="body" color={Colors.light.textSecondary}>{description}</AppText>
          {actionLabel && onAction ? (
            <AppButton label={actionLabel} onPress={onAction} variant="secondary" style={styles.feedbackButton} />
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <AppCard
      style={[
        styles.feedback,
        state ? { backgroundColor: appearance.background } : null,
        state === 'empty' && styles.feedbackCompactEmpty,
        style,
      ]}>
      {loading || feedbackState === 'loading' ? (
        <ActivityIndicator color={appearance.icon} />
      ) : null}
      <AppText size="body" weight="semibold">{title}</AppText>
      <AppText size="small" color={Colors.light.textSecondary}>{description}</AppText>
      {actionLabel && onAction ? (
        <AppButton label={actionLabel} onPress={onAction} variant="secondary" style={styles.feedbackButton} />
      ) : null}
    </AppCard>
  );
}

export function LocationSummary({
  title,
  description,
  actionLabel,
  onPress,
  style,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[title, description, actionLabel].filter(Boolean).join('. ')}
      onPress={onPress}
      style={({ pressed }) => [
        styles.locationSummary,
        pressed && styles.locationSummaryPressed,
        style,
      ]}>
      <View style={styles.locationIconBackground}>
        <AppIcon name="map-pin" size={22} color={Colors.light.accent} />
      </View>
      <View style={styles.locationSummaryCopy}>
        <AppText size="label" weight="medium">{title}</AppText>
        <AppText size="caption" color={Colors.light.textSecondary}>{description}</AppText>
      </View>
      <AppIcon name="chevron-right" size={20} color={Colors.light.iconPrimary} />
    </Pressable>
  );
}

export function CenterCard({
  name,
  materials,
  distance,
  serviceLabel,
  eyebrow,
  statusLabel,
  status = 'neutral',
  emphasis = 'standard',
  layout = 'standard',
  accentColor = Colors.light.coral,
  disabled = false,
  onPress,
  style,
}: {
  name: string;
  materials?: string;
  distance?: string;
  serviceLabel?: string;
  eyebrow?: string;
  statusLabel?: string;
  status?: 'info' | 'success' | 'warning' | 'error' | 'neutral';
  emphasis?: 'standard' | 'featured';
  layout?: 'standard' | 'compact';
  accentColor?: string;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.centerCard,
        layout === 'compact' && styles.centerCardCompact,
        emphasis === 'featured' && styles.centerCardFeatured,
        disabled && styles.centerCardDisabled,
        pressed && !disabled && styles.centerCardPressed,
        style,
      ]}>
      {layout === 'compact' ? (
        <>
          <View style={[styles.centerCardAccent, { backgroundColor: accentColor }]} />
          <View style={styles.centerCardCompactCopy}>
            {statusLabel ? (
              <StatusBadge label={statusLabel} status={status} />
            ) : eyebrow ? (
              <AppText size="caption" color={Colors.light.textSecondary}>{eyebrow}</AppText>
            ) : null}
            <AppText
              size="h3"
              weight="semibold"
              color={disabled ? Colors.light.textDisabled : Colors.light.textPrimary}
              numberOfLines={1}>
              {name}
            </AppText>
            {materials ? (
              <AppText
                size="caption"
                color={disabled ? Colors.light.textDisabled : Colors.light.textSecondary}
                numberOfLines={1}>
                {materials}
              </AppText>
            ) : null}
            {serviceLabel ? (
              <AppText
                size="caption"
                color={disabled ? Colors.light.textDisabled : Colors.light.textSecondary}
                numberOfLines={1}>
                {serviceLabel}
              </AppText>
            ) : null}
          </View>
          {onPress ? (
            <AppIcon name="chevron-right" size={20} color={Colors.light.textSecondary} />
          ) : null}
        </>
      ) : (
        <>
          {eyebrow || statusLabel ? (
            <View style={styles.centerCardTop}>
              {eyebrow ? (
                <AppText size="caption" color={Colors.light.textSecondary}>{eyebrow}</AppText>
              ) : <View style={styles.centerCardSpacer} />}
              {statusLabel ? <StatusBadge label={statusLabel} status={status} /> : null}
            </View>
          ) : null}
          <AppText
            size="h3"
            weight="semibold"
            color={disabled ? Colors.light.textDisabled : Colors.light.textPrimary}>
            {name}
          </AppText>
          {materials ? (
            <AppText size="body" color={disabled ? Colors.light.textDisabled : Colors.light.textSecondary}>
              {materials}
            </AppText>
          ) : null}
          {serviceLabel ? (
            <AppText size="caption" color={disabled ? Colors.light.textDisabled : Colors.light.textSecondary}>
              {serviceLabel}
            </AppText>
          ) : null}
          {distance || onPress ? (
            <View style={styles.centerCardFooter}>
              <AppText size="caption" color={disabled ? Colors.light.textDisabled : Colors.light.textSecondary}>
                {distance ?? ''}
              </AppText>
              {onPress ? (
                <AppText size="label" color={disabled ? Colors.light.textDisabled : Colors.light.primary} weight="medium">
                  Ver detalhes →
                </AppText>
              ) : null}
            </View>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.backgroundCanvas,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: Layout.contentMaxWidth,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.border,
    borderWidth: BorderWidth.default,
    borderRadius: Radius.lg,
    padding: Spacing.space4,
    gap: Spacing.space2,
  },
  text: {
    includeFontPadding: false,
  },
  button: {
    minHeight: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.space4,
    gap: Spacing.space2,
  },
  buttonPressed: { opacity: 0.92 },
  iconButton: {
    borderWidth: BorderWidth.default,
    borderColor: Colors.light.border,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surface,
  },
  iconButtonPressed: {
    backgroundColor: Colors.light.backgroundSelected,
    borderColor: Colors.light.focusBorder,
  },
  iconButtonDisabled: {
    backgroundColor: Colors.light.backgroundDisabled,
    borderColor: Colors.light.backgroundDisabled,
  },
  chip: {
    minHeight: 36,
    borderRadius: Radius.full,
    borderWidth: BorderWidth.default,
    paddingHorizontal: Spacing.space3,
    paddingVertical: Spacing.space1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: Colors.light.backgroundSelected,
    borderColor: Colors.light.focusBorder,
  },
  chipUnselected: {
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.border,
  },
  chipDisabled: {
    backgroundColor: Colors.light.backgroundDisabled,
    borderColor: Colors.light.backgroundDisabled,
  },
  chipPressed: { opacity: 0.8 },
  materialChip: {
    minHeight: 36,
    borderWidth: BorderWidth.default,
    borderColor: 'transparent',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.space3,
    paddingVertical: Spacing.space1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  materialChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.space2,
  },
  materialChipDot: {
    width: Spacing.space2,
    height: Spacing.space2,
    borderRadius: Radius.full,
  },
  materialChipUncategorized: { borderColor: Colors.light.border },
  materialChipSelected: { borderColor: Colors.light.focusBorder },
  statusBadge: {
    minHeight: 28,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.space2,
    paddingVertical: Spacing.space1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: { gap: Spacing.space2 },
  input: {
    minHeight: 48,
    borderWidth: BorderWidth.default,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.space3,
    paddingVertical: Spacing.space2,
    color: Colors.light.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
  },
  inputWithLeadingIcon: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: BorderWidth.default,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surface,
    paddingLeft: Spacing.space3,
  },
  inputLeadingIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWithIconText: {
    flex: 1,
    minHeight: 46,
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.space2,
    paddingVertical: Spacing.space2,
  },
  inputFocused: { borderColor: Colors.light.focusBorder },
  inputError: { borderColor: Colors.light.danger },
  inputDisabled: {
    backgroundColor: Colors.light.backgroundDisabled,
    color: Colors.light.textDisabled,
  },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.space1,
    gap: Spacing.space3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: { backgroundColor: Colors.light.backgroundSelected },
  headerCopy: { flex: 1, gap: Spacing.space1 },
  feedback: {
    marginTop: Spacing.space3,
    alignItems: 'flex-start',
  },
  feedbackButton: {
    marginTop: Spacing.space1,
    alignSelf: 'flex-start',
  },
  feedbackCompact: {
    minHeight: 116,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.space4,
    borderRadius: Radius.lg,
    gap: Spacing.space3,
  },
  feedbackCompactEmpty: {
    borderWidth: BorderWidth.default,
    borderColor: Colors.light.border,
  },
  feedbackIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackCopy: { flex: 1, gap: Spacing.space1 },
  locationSummary: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.space3,
    gap: Spacing.space3,
    backgroundColor: Colors.light.surface,
    borderWidth: BorderWidth.default,
    borderColor: Colors.light.border,
    borderRadius: Radius.lg,
  },
  locationSummaryPressed: { backgroundColor: Colors.light.backgroundSelected },
  locationIconBackground: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.backgroundInfo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationSummaryCopy: { flex: 1, gap: Spacing.space1 },
  centerCard: {
    minHeight: 176,
    width: '100%',
    borderWidth: BorderWidth.default,
    borderColor: Colors.light.border,
    borderRadius: Radius.lg,
    padding: Spacing.space4,
    gap: Spacing.space2,
    backgroundColor: Colors.light.surface,
  },
  centerCardCompact: {
    minHeight: 94,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.space3,
    paddingLeft: 28,
    paddingRight: Spacing.space3,
    gap: Spacing.space2,
  },
  centerCardAccent: {
    position: 'absolute',
    left: Spacing.space3,
    top: Spacing.space3,
    width: 6,
    height: 66,
    borderRadius: 3,
  },
  centerCardCompactCopy: {
    flex: 1,
    gap: Spacing.space1,
  },
  centerCardFeatured: {
    borderWidth: 2,
    borderColor: Colors.light.eco,
  },
  centerCardPressed: {
    backgroundColor: Colors.light.backgroundSelected,
    borderColor: Colors.light.focusBorder,
  },
  centerCardDisabled: {
    backgroundColor: Colors.light.backgroundDisabled,
    borderColor: Colors.light.backgroundDisabled,
  },
  centerCardTop: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.space2,
  },
  centerCardSpacer: { flex: 1 },
  centerCardFooter: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.space1,
    marginTop: 'auto',
  },
});
