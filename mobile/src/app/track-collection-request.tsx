import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AppButton, AppCard, AppScreen, AppText, FeedbackCard, ScreenHeader, TextField } from '@/components/recicla-ui';
import { Layout, Spacing } from '@/constants/theme';
import { ApiError, lookupCollectionRequest } from '@/services/api';
import type { CollectionRequestStatus } from '@/types/api';

const statusLabels: Record<CollectionRequestStatus['status'], string> = {
  PENDENTE: 'Pendente',
  ACEITA: 'Aceita',
  RECUSADA: 'Recusada',
  CONCLUIDA: 'Concluída',
};

export default function TrackCollectionRequestScreen() {
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

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Acompanhar solicitação" subtitle="Consulte o status da sua coleta."
          onBack={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} />
        <AppCard style={styles.form}>
          <TextField label="Protocolo" value={protocol} autoCapitalize="none"
            state={loading ? 'disabled' : 'default'}
            onChangeText={(value) => { setProtocol(value); clearFeedback(); }} />
          <TextField label="Telefone usado na solicitação" value={phone} keyboardType="phone-pad"
            maxLength={24} state={loading ? 'disabled' : 'default'}
            onChangeText={(value) => { setPhone(value); clearFeedback(); }} />
          <AppButton label={loading ? 'Consultando…' : 'Consultar status'} loading={loading}
            onPress={() => void lookup()} />
        </AppCard>
        {error ? <FeedbackCard state="error" title="Consulta não concluída" description={error} /> : null}
        {result ? (
          <AppCard style={styles.form}>
            <AppText size="label">Status atual</AppText>
            <AppText size="h3" weight="semibold">{statusLabels[result.status]}</AppText>
            <AppText size="body">Protocolo: {result.protocol}</AppText>
          </AppCard>
        ) : null}
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
});
