import { StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icons';
import { AppButton, AppCard, AppText, StatusBadge } from '@/components/recicla-ui';
import { Colors, Radius, Spacing } from '@/constants/theme';

interface RequestOutcomeProps {
  title: string;
  eyebrow: string;
  description: string;
  label: string;
  value: string;
  note: string;
  primary: { label: string; onPress: () => void };
  secondary: { label: string; onPress: () => void };
  tone?: 'success' | 'error';
  pending?: boolean;
  busy?: boolean;
}

export function RequestOutcome({
  title, eyebrow, description, label, value, note, primary, secondary,
  tone = 'success', pending, busy,
}: RequestOutcomeProps) {
  const color = tone === 'error' ? Colors.light.danger : Colors.light.success;
  const backgroundColor = tone === 'error' ? Colors.light.backgroundDanger : Colors.light.backgroundSuccess;
  return (
    <View style={styles.layout}>
      <View style={[styles.mark, { backgroundColor }]}>
        <AppIcon name={tone === 'error' ? 'alert-circle' : 'check-circle'} size={48} color={color} />
      </View>
      <AppText size="caption" color={color} style={styles.center}>{eyebrow}</AppText>
      <AppText size="display" weight="bold" style={styles.center}>{title}</AppText>
      <AppText size="body" color={Colors.light.textSecondary} style={styles.center}>{description}</AppText>
      <AppCard style={[styles.status, !pending && { backgroundColor }]}>
        <AppText size="caption" color={Colors.light.textSecondary}>{label}</AppText>
        <AppText size="h1" color={color} weight="bold" style={styles.center}>{value}</AppText>
        {pending ? <StatusBadge label="Pendente" status="warning" /> : null}
      </AppCard>
      <AppCard style={styles.note}>
        <AppIcon name="info" size={20} color={Colors.light.info} />
        <AppText size="body" style={styles.noteText}>{note}</AppText>
      </AppCard>
      <View style={styles.actions}>
        <AppButton {...primary} size="large" disabled={busy} />
        <AppButton {...secondary} variant="text" disabled={busy} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: { gap: Spacing.space4, paddingTop: Spacing.space12 },
  mark: { alignSelf: 'center', width: 100, height: 100, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.space2 },
  center: { textAlign: 'center' },
  status: { alignItems: 'center', gap: Spacing.space2, marginTop: Spacing.space2 },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.space2, backgroundColor: Colors.light.backgroundInfo, borderWidth: 0 },
  noteText: { flex: 1 },
  actions: { gap: Spacing.space1, marginTop: Spacing.space4 },
});
