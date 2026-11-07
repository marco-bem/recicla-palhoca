import { useId } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/recicla-ui';
import type { TimeFieldProps } from '@/components/time-field';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import './time-field.css';

export default function TimeField({ label, value, onChange, disabled }: TimeFieldProps) {
  const id = useId();

  return (
    <View style={{ gap: Spacing.space1 }}>
      <label htmlFor={id}><AppText size="label" weight="medium">{label}</AppText></label>
      <input
        id={id}
        className="recicla-time-input"
        lang="pt-BR"
        type="time"
        step={60}
        value={value}
        disabled={disabled}
        onChange={event => onChange(event.currentTarget.value)}
        style={{
          boxSizing: 'border-box', display: 'block', width: '100%', minWidth: 0, maxWidth: '100%',
          minHeight: 48, WebkitAppearance: 'none',
          paddingInline: Spacing.space2, border: `1px solid ${Colors.light.border}`,
          borderRadius: Radius.md, background: disabled ? Colors.light.backgroundDisabled : Colors.light.surface,
          color: Colors.light.textPrimary,
          fontFamily: `"${Typography.bodyLarge.fontFamily}", system-ui, sans-serif`,
          fontSize: Typography.bodyLarge.fontSize,
          fontWeight: Typography.bodyLarge.fontWeight,
        }}
      />
    </View>
  );
}
