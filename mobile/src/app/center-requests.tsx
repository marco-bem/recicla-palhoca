import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icons';
import { formatDateField } from '@/components/date-field-format';
import {
  AppButton, AppCard, AppScreen, AppText, FeedbackCard, FilterChip, ScreenHeader, StatusBadge, TextField,
} from '@/components/recicla-ui';
import { Colors, Layout, Spacing } from '@/constants/theme';
import { ApiError, getManagedRequest, listManagedRequests, loginCenterManager, updateManagedRequest } from '@/services/api';
import type { CollectionRequestStatus, ManagedCollectionRequest } from '@/types/api';

type Status = CollectionRequestStatus['status'];
const labels = { PENDENTE: 'Pendente', ACEITA: 'Aceita', RECUSADA: 'Recusada', CONCLUIDA: 'Concluída' };
const tones = { PENDENTE: 'warning', ACEITA: 'success', RECUSADA: 'error', CONCLUIDA: 'info' } as const;
const filters = [
  { label: 'Pendentes', value: 'PENDENTE' },
  { label: 'Aceitas', value: 'ACEITA' },
  { label: 'Todas', value: undefined },
  { label: 'Recusadas', value: 'RECUSADA' },
  { label: 'Concluídas', value: 'CONCLUIDA' },
] as const;

export default function CenterRequestsScreen() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [centerName, setCenterName] = useState('');
  const [requests, setRequests] = useState<ManagedCollectionRequest[]>([]);
  const [selected, setSelected] = useState<ManagedCollectionRequest>();
  const [view, setView] = useState<'panel' | 'list'>('panel');
  const [filter, setFilter] = useState<Status>();
  const [refusing, setRefusing] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  async function perform(action: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401 && token) signOut();
      setError(error instanceof ApiError && error.status !== 0
        ? error.message : 'Não foi possível concluir a operação. Tente novamente.');
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function login() {
    const session = await loginCenterManager(email.trim(), password);
    setPassword('');
    const dashboard = await listManagedRequests(session);
    setCenterName(dashboard.centerName);
    setRequests(dashboard.requests);
    setToken(session);
  }

  function signOut() {
    setToken('');
    setPassword('');
    setCenterName('');
    setRequests([]);
    setSelected(undefined);
    setView('panel');
    setFilter(undefined);
    setRefusing(false);
    setReason('');
    setError('');
  }

  async function showRequests(nextView: 'panel' | 'list', nextFilter?: Status) {
    const data = await listManagedRequests(token, nextFilter);
    setRequests(data.requests);
    setFilter(nextFilter);
    setSelected(undefined);
    setView(nextView);
    setRefusing(false);
    setReason('');
  }

  async function changeStatus(status: Exclude<Status, 'PENDENTE'>) {
    if (!selected) return;
    if (status === 'RECUSADA' && !reason.trim()) {
      setError('Informe a justificativa da recusa.');
      return;
    }
    await perform(async () => {
      const updated = await updateManagedRequest(token, selected.protocol, status, reason.trim());
      setSelected({ ...selected, status: updated.status });
      setRefusing(false);
      setReason('');
    });
  }

  function openRequest(protocol: string) {
    void perform(async () => {
      setSelected(await getManagedRequest(token, protocol));
    });
  }

  function requestCard(request: ManagedCollectionRequest) {
    return (
      <AppCard key={request.protocol} style={styles.card}>
        <View style={styles.row}>
          <AppText size="caption" weight="semibold">{request.protocol}</AppText>
          <StatusBadge label={labels[request.status]} status={tones[request.status]} />
        </View>
        <AppText size="h3" weight="semibold">{request.centerName}</AppText>
        <AppText size="body" color={Colors.light.textSecondary}>{request.materials.join(' · ')}</AppText>
        <AppText size="caption" color={Colors.light.textSecondary}>Solicitado em {formatDateField(request.requestedAt)}</AppText>
        <AppButton label="Ver detalhes" variant="outline" disabled={busy} onPress={() => openRequest(request.protocol)} />
      </AppCard>
    );
  }

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!token ? (
          <>
            <ScreenHeader title="Área do centro" subtitle="Acesse as solicitações do seu centro."
              onBack={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} />
            <AppCard style={styles.card}>
              <TextField label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none"
                keyboardType="email-address" autoComplete="email" state={busy ? 'disabled' : 'default'} />
              <TextField label="Senha" value={password} onChangeText={setPassword} secureTextEntry
                state={busy ? 'disabled' : 'default'} />
              <AppButton label="Entrar" loading={busy} onPress={() => void perform(login)} />
            </AppCard>
          </>
        ) : selected ? (
          <>
            <ScreenHeader title="Detalhe da solicitação" subtitle={selected.protocol}
              onBack={() => void perform(() => showRequests(view, filter))} />
            <AppCard style={styles.card}>
              <AppText size="label">{selected.protocol}</AppText>
              <StatusBadge label={labels[selected.status]} status={tones[selected.status]} />
            </AppCard>
            <AppCard style={styles.card}>
              <AppText size="caption">SOLICITANTE</AppText>
              <AppText size="h3" weight="semibold">{selected.requesterName}</AppText>
            </AppCard>
            <AppCard style={[styles.card, styles.info]}>
              <View style={styles.row}><AppIcon name="map-pin" size={18} color={Colors.light.info} />
                <AppText size="caption" color={Colors.light.info}>LOCAL DE COLETA</AppText></View>
              <AppText size="body">{selected.address}</AppText>
            </AppCard>
            <AppCard style={styles.card}>
              <AppText size="caption">MATERIAIS</AppText>
              <AppText size="body">{selected.materials.join(' · ')}</AppText>
            </AppCard>
            <AppCard style={styles.card}>
              <View style={styles.row}><AppIcon name="clock" size={18} />
                <AppText size="caption">PREFERÊNCIA DE ATENDIMENTO</AppText></View>
              <AppText size="body">{[
                selected.preferredDate && formatDateField(selected.preferredDate), selected.preferredPeriod,
              ].filter(Boolean).join(' · ') || 'Sem preferência informada'}</AppText>
              <AppText size="caption">Solicitado em {formatDateField(selected.requestedAt)}</AppText>
            </AppCard>
            {selected.status === 'PENDENTE' ? (
              <>
                <AppButton label="Aceitar solicitação" size="large" disabled={busy} onPress={() => void changeStatus('ACEITA')} />
                {refusing ? (
                  <TextField label="Justificativa da recusa" value={reason} onChangeText={setReason} multiline maxLength={500}
                    state={busy ? 'disabled' : 'default'} />
                ) : null}
                <AppButton label={refusing ? 'Confirmar recusa' : 'Recusar solicitação'} variant="outline" disabled={busy}
                  onPress={() => refusing ? void changeStatus('RECUSADA') : setRefusing(true)} />
              </>
            ) : selected.status === 'ACEITA' ? (
              <AppButton label="Concluir solicitação" size="large" disabled={busy} onPress={() => void changeStatus('CONCLUIDA')} />
            ) : null}
            <AppButton label="Atualizar detalhes" variant="text" disabled={busy} onPress={() => openRequest(selected.protocol)} />
          </>
        ) : view === 'panel' ? (
          <>
            <AppText size="caption" color={Colors.light.info}>ÁREA DO CENTRO</AppText>
            <AppText size="h1" weight="bold">Olá, responsável!</AppText>
            <AppText size="body" color={Colors.light.textSecondary}>{centerName}</AppText>
            <AppCard style={[styles.card, styles.hero]}>
              <AppText size="h3" weight="semibold" color={Colors.light.textOnPrimary}>Visão geral do centro</AppText>
              <AppText size="body" color={Colors.light.textOnPrimary}>Acompanhe as solicitações recebidas.</AppText>
            </AppCard>
            <View style={styles.row}>
              <AppCard style={[styles.counter, styles.pending]}>
                <AppText size="caption" color={Colors.light.warning}>PENDENTES</AppText>
                <AppText size="h1" weight="bold">{requests.filter((item) => item.status === 'PENDENTE').length}</AppText>
              </AppCard>
              <AppCard style={[styles.counter, styles.accepted]}>
                <AppText size="caption" color={Colors.light.success}>ACEITAS</AppText>
                <AppText size="h1" weight="bold">{requests.filter((item) => item.status === 'ACEITA').length}</AppText>
              </AppCard>
            </View>
            <AppButton label="Ver solicitações" disabled={busy} onPress={() => void perform(() => showRequests('list', 'PENDENTE'))} />
            <AppText size="h3" weight="semibold">Solicitações recentes</AppText>
            {requests.slice(0, 3).map(requestCard)}
            {!requests.length ? <AppText size="body">Nenhuma solicitação recebida.</AppText> : null}
            <AppButton label="Sair" variant="text" disabled={busy} onPress={signOut} />
          </>
        ) : (
          <>
            <ScreenHeader title="Solicitações recebidas" subtitle="Pedidos encaminhados ao centro."
              onBack={() => void perform(() => showRequests('panel'))} />
            <View style={styles.row}>
              {filters.map((option) => (
                <FilterChip key={option.label} label={option.label} selected={filter === option.value} disabled={busy}
                  onPress={() => void perform(() => showRequests('list', option.value))} />
              ))}
            </View>
            {requests.map(requestCard)}
            {!requests.length ? <FeedbackCard title="Nenhuma solicitação" description="Nenhum pedido corresponde ao filtro selecionado." /> : null}
            <FeedbackCard layout="compact" title="Atendimento"
              description="Abra um pedido para conferir os dados e decidir sobre o atendimento." />
          </>
        )}
        {busy ? <AppText size="caption">Carregando…</AppText> : null}
        {error ? <FeedbackCard title="Operação não concluída" description={error} state="error" /> : null}
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
  card: { gap: Spacing.space2 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.space2 },
  counter: { flex: 1, gap: Spacing.space1 },
  pending: { backgroundColor: Colors.light.backgroundWarning },
  accepted: { backgroundColor: Colors.light.backgroundSuccess },
  hero: { backgroundColor: Colors.light.primary },
  info: { backgroundColor: Colors.light.backgroundInfo },
});
