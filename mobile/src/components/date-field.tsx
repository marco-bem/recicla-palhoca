import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Platform, View } from 'react-native';

import { AppButton, AppText } from '@/components/recicla-ui';
import { formatDateField, type DateFieldProps } from '@/components/date-field-format';
import { Spacing } from '@/constants/theme';

export default function DateField({ value, onChange, disabled }: DateFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ gap: Spacing.space1 }}>
      <AppText size="label" weight="medium">Data preferencial (opcional)</AppText>
      <AppButton
        label={value ? formatDateField(value) : 'Selecionar data · DD/MM/AAAA'}
        variant="outline"
        disabled={disabled}
        onPress={() => setOpen(true)}
      />
      {open && !disabled ? (
        <DateTimePicker
          value={value ? new Date(`${value}T12:00:00`) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
          presentation={Platform.OS === 'android' ? 'dialog' : 'inline'}
          locale={Platform.OS === 'ios' ? 'pt-BR' : undefined}
          onDismiss={() => setOpen(false)}
          onValueChange={(_event, date) => {
            setOpen(false);
            const year = String(date.getFullYear()).padStart(4, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            onChange(`${year}-${month}-${day}`);
          }}
        />
      ) : null}
      {value ? <AppButton label="Limpar data" variant="text" disabled={disabled} onPress={() => {
        setOpen(false);
        onChange('');
      }} /> : null}
    </View>
  );
}
