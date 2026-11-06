import { router, useLocalSearchParams, usePathname } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icons';
import { AppButton, AppCard, AppScreen, AppText, FeedbackCard, ScreenHeader, StatusBadge, TextField } from '@/components/recicla-ui';
import { formatDateField } from '@/components/date-field-format';
import { Colors, Layout, Spacing } from '@/constants/theme';
import { ApiError, lookupCollectionRequest } from '@/services/api';
import type { CollectionRequestStatus } from '@/types/api';

const statusLabels: Record<CollectionRequestStatus['status'], string> = {
  PENDENTE: 'Pendente',
  ACEITA: 'Aceita',
  RECUSADA: 'Recusada',
  CONCLUIDA: 'Concluída',
};

const statusPresentation = {
  PENDENTE: { title: 'Aguardando confirmação', tone: 'warning', background: Colors.light.backgroundWarning },
  ACEITA: { title: 'Aceita pelo centro', tone: 'success', background: Colors.light.backgroundSuccess },
  RECUSADA: { title: 'Recusada pelo centro', tone: 'error', background: Colors.light.backgroundDanger },
  CONCLUIDA: { title: 'Atendimento concluído', tone: 'success', background: Colors.light.backgroundSuccess },
} as const;

export default function TrackCollectionRequestScreen() {
  const isTab = usePathname() === '/requests';
  const { protocol: initialProtocol } = useLocalSearchParams<{ protocol?: string }>();
  const [protocol, setProtocol] = useState(initialProtocol ?? '');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<CollectionRequestStatus>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);

  async function lookup() {
    if (inFlight.current) return;
    setResult(undefined);
    if (!protocol.trim() || !phone.trim()) {
      setError('Informe o protocolo e o telefone usado na solicitação.');
      return;
    }
    inFlight.current = true;
    setLoading(true);
    setError('');
    try {
      setResult(await lookupCollectionRequest(protocol, phone));
    } catch (error) {
      setError(error instanceof ApiError && [400, 404].includes(error.status)
        ? error.message
        : 'Não foi possível consultar a solicitação agora. Tente novamente.');
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }

  function clearFeedback() {
    setResult(undefined);
    setError('');
  }

  const presentation = result ? statusPresentation[result.status] : undefined;
  return (
    <AppScreen backgroundColor={Colors.light.surface}>
      <ScrollView key={result ? 'status' : 'form'} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader title={result ? 'Acompanhar pedido' : isTab ? 'Minhas solicitações' : 'Acompanhar solicitação'}
          subtitle={result ? `Protocolo ${result.protocol}` : 'Consulte o status da sua coleta.'}
          onBack={result ? clearFeedback : isTab ? undefined : () => router.canGoBack() ? router.back() : router.replace('/(tabs)')} />
        {!result ? <AppCard style={styles.form}>
          <TextField label="Protocolo" value={protocol} autoCapitalize="none"
            state={loading ? 'disabled' : 'default'}
            onChangeText={(value) => { setProtocol(value); clearFeedback(); }} />
          <TextField label="Telefone usado na solicitação" value={phone} keyboardType="phone-pad"
            maxLength={24} state={loading ? 'disabled' : 'default'}
            onChangeText={(value) => { setPhone(value); clearFeedback(); }} />
          <AppButton label={loading ? 'Consultando…' : 'Consultar status'} loading={loading}
            onPress={() => void lookup()} />
        </AppCard> : null}
        {error ? <FeedbackCard state="error" title="Consulta não concluída" description={error} /> : null}
        {result && presentation ? (
          <>
            <AppCard style={[styles.summary, { backgroundColor: presentation.background }]}>
              <StatusBadge label={statusLabels[result.status]} status={presentation.tone} style={styles.badge} />
              <AppText size="h3" weight="semibold">{presentation.title}</AppText>
              <AppText size="caption" color={Colors.light.textSecondary}>Protocolo {result.protocol}</AppText>
            </AppCard>
            <AppText size="h3" weight="semibold">Etapas do pedido</AppText>
            <AppCard style={styles.summary}>
              <View style={styles.timelineRow}>
                <View style={[styles.dot, styles.sent]} />
                <AppText size="body">Solicitação enviada</AppText>
              </View>
              <View style={styles.timelineRow}>
                <View style={[styles.dot, { backgroundColor: presentation.tone === 'error' ? Colors.light.danger : Colors.light.primary }]} />
                <AppText size="body">{presentation.title}</AppText>
              </View>
              {result.status === 'PENDENTE' || result.status === 'ACEITA' ? (
                <View style={styles.timelineRow}>
                  <View style={styles.dot} />
                  <AppText size="body" color={Colors.light.textSecondary}>Atendimento</AppText>
                </View>
              ) : null}
            </AppCard>
            <AppCard style={[styles.summary, styles.info]}>
              <AppText size="label" weight="semibold">Centro</AppText>
              <AppText size="body">{result.centerName}</AppText>
              {result.preferredDate ? <AppText size="body">Data preferencial: {formatDateField(result.preferredDate)}</AppText> : null}
              {result.preferredPeriod ? <AppText size="body">Período preferencial: {result.preferredPeriod}</AppText> : null}
            </AppCard>
            <AppCard style={[styles.summary, styles.info]}>
              <View style={styles.addressHeading}>
                <AppIcon name="map-pin" size={18} color={Colors.light.info} />
                <AppText size="label" weight="semibold">Endereço informado</AppText>
              </View>
              <AppText size="body">{result.address}</AppText>
            </AppCard>
            <AppCard style={styles.summary}>
              <AppText size="label" weight="semibold">Materiais</AppText>
              <AppText size="body">{result.materials.join(' · ')}</AppText>
            </AppCard>
            <AppButton label="Consultar novamente" onPress={() => void lookup()} />
            <AppButton label="Voltar à consulta" variant="text" onPress={clearFeedback} />
          </>
        ) : null}
        {isTab ? <AppButton label="Encontrar outro centro" variant="outline"
          onPress={() => router.push('/(tabs)/centers')} /> : null}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Layout.screenHorizontalInset,
    paddingTop: Layout.screenTopInset,
    paddingBottom: Spacing.space6,
    gap: Spacing.space3,
  },
  form: { gap: Spacing.space3 },
  summary: { gap: Spacing.space2 },
  badge: { alignSelf: 'flex-start' },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.space2 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.light.border },
  sent: { backgroundColor: Colors.light.eco },
  addressHeading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.space2 },
  info: { backgroundColor: Colors.light.backgroundInfo },
});
