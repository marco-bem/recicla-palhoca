import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Platform, View } from 'react-native';

import { AppButton, AppText } from '@/components/recicla-ui';
import { Spacing } from '@/constants/theme';

export interface TimeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function TimeField({ label, value, onChange, disabled }: TimeFieldProps) {
  const [pickedTime, setPickedTime] = useState<Date>();
  const isAndroid = Platform.OS === 'android';

  function confirm(time: Date) {
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    onChange(`${hours}:${minutes}`);
    setPickedTime(undefined);
  }

  return (
    <View style={{ gap: Spacing.space1 }}>
      <AppText size="label" weight="medium">{label}</AppText>
      <AppButton
        label={pickedTime && !isAndroid ? `Confirmar ${label.toLowerCase()}` : value || `Selecionar ${label.toLowerCase()}`}
        variant="outline"
        disabled={disabled}
        onPress={() => {
          if (pickedTime) {
            if (!isAndroid) confirm(pickedTime);
            return;
          }
          const [hour, minute] = (value || '08:00').split(':').map(Number);
          setPickedTime(new Date(2000, 0, 1, hour, minute));
        }}
      />
      {pickedTime && !disabled ? (
        <DateTimePicker
          value={pickedTime}
          mode="time"
          display={isAndroid ? 'default' : 'spinner'}
          presentation={isAndroid ? 'dialog' : 'inline'}
          is24Hour
          locale={isAndroid ? undefined : 'pt-BR'}
          onDismiss={() => setPickedTime(undefined)}
          onValueChange={(_event, time) => {
            if (isAndroid) confirm(time);
            else setPickedTime(time);
          }}
        />
      ) : null}
    </View>
  );
}
