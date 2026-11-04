import { useId, useState } from 'react';
import { View } from 'react-native';

import { AppIcon } from '@/components/app-icons';
import { AppButton, AppText } from '@/components/recicla-ui';
import { formatDateField, type DateFieldProps } from '@/components/date-field-format';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function DateField({ value, onChange, disabled }: DateFieldProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: Spacing.space1 }}>
      <label htmlFor={id}>
        <AppText size="label" weight="medium">Data preferencial (opcional)</AppText>
      </label>
      <div style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 48,
        paddingInline: Spacing.space3,
        border: `1px solid ${focused ? Colors.light.focusBorder : Colors.light.border}`,
        borderRadius: Radius.md,
        background: disabled ? Colors.light.backgroundDisabled : Colors.light.surface,
      }}>
        <AppText size="body" color={value ? Colors.light.textPrimary : Colors.light.textSecondary}>
          {formatDateField(value)}
        </AppText>
        <span aria-hidden="true" style={{ display: 'flex' }}>
          <AppIcon name="calendar" size={20} color={disabled ? Colors.light.textSecondary : Colors.light.primary} />
        </span>
        <input
          id={id}
          lang="pt-BR"
          type="date"
          value={value}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onClick={(event) => event.currentTarget.showPicker?.()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && event.currentTarget.showPicker) {
              event.preventDefault();
              event.currentTarget.showPicker();
            }
          }}
          onChange={(event) => onChange(event.currentTarget.value)}
          style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer' }}
        />
      </div>
      {value ? <AppButton label="Limpar data" variant="text" disabled={disabled} onPress={() => onChange('')} /> : null}
    </View>
  );
}
