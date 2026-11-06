import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppIcon, BrandMark } from '@/components/app-icons';
import { CenterIcon } from '@/components/center-icon';
import { CenterProfileForm } from '@/components/center-profile-form';
import { RequestOutcome } from '@/components/request-outcome';
import { formatDateField } from '@/components/date-field-format';
import {
  AppButton, AppCard, AppScreen, AppText, FeedbackCard, FilterChip, ScreenHeader, StatusBadge, TextField,
} from '@/components/recicla-ui';
import { Colors, Layout, Radius, Spacing } from '@/constants/theme';
import { ApiError, getManagedRequest, getOwnCenter, listManagedRequests, listMaterials, loginCenterManager, registerCenterManager, updateManagedRequest } from '@/services/api';
import type { CenterProfile, CollectionRequestStatus, ManagedCollectionRequest, Material } from '@/types/api';

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
  const [registering, setRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<CenterProfile | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [outcome, setOutcome] = useState<'ACEITA' | 'RECUSADA'>();
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

  async function openProfile(session: string) {
    const [center, catalog] = await Promise.all([getOwnCenter(session), listMaterials()]);
    setProfile(center);
    setMaterials(catalog);
    setEditing(true);
  }

  async function login() {
    const session = await loginCenterManager(email.trim(), password);
    setPassword('');
    try {
      const dashboard = await listManagedRequests(session);
      setCenterName(dashboard.centerName);
      setRequests(dashboard.requests);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 404) throw error;
      await openProfile(session);
    }
    setToken(session);
  }

  async function register() {
    if (password.length < 10 || password !== confirmation) {
      setError('Use uma senha com pelo menos 10 caracteres e confirme a mesma senha.');
      return;
    }
    await perform(async () => {
      const catalog = await listMaterials();
      const session = await registerCenterManager(fullName.trim(), email.trim(), password);
      setPassword('');
      setConfirmation('');
      setRegistering(false);
      setProfile(null);
      setMaterials(catalog);
      setToken(session);
      setEditing(true);
    });
  }

  function signOut() {
    setToken('');
    setPassword('');
    setCenterName('');
    setEditing(false);
    setProfile(null);
    setOutcome(undefined);
    setRegistering(false);
    setConfirmation('');
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
    setCenterName(data.centerName);
    setOutcome(undefined);
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
      if (status === 'ACEITA' || status === 'RECUSADA') setOutcome(status);
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
    <AppScreen backgroundColor={Colors.light.surface}>
      <ScrollView key={!token ? (registering ? 'register' : 'login') : editing ? 'profile' : outcome ?? selected?.protocol ?? view}
        contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!token ? (
          <>
            {registering ? (
              <ScreenHeader title="Criar conta" subtitle="Primeiro, identifique o responsável."
                onBack={() => { setRegistering(false); setPassword(''); setConfirmation(''); setError(''); }} />
            ) : (
              <View style={styles.row}>
                <View style={styles.brand}><BrandMark size={30} /></View>
                <AppText size="h2" weight="semibold">ReciclaPalhoça</AppText>
              </View>
            )}
            {!registering ? <AppText size="caption" color={Colors.light.info}>ÁREA DO RESPONSÁVEL</AppText> : null}
            <AppText size={registering ? 'h2' : 'h1'} weight="bold">
              {registering ? 'Acesso do responsável' : 'Seu centro, mais conectado.'}
            </AppText>
            <AppText size="body" color={Colors.light.textSecondary}>
              {registering ? 'Use um e-mail válido. A conta ficará vinculada a um único centro.'
                : 'Acesse para atualizar seu cadastro e acompanhar as solicitações de coleta.'}
            </AppText>
            {registering ? <TextField label="Nome completo" value={fullName} onChangeText={setFullName}
              autoComplete="name" state={busy ? 'disabled' : 'default'} /> : null}
            <TextField label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none"
              keyboardType="email-address" autoComplete="email" state={busy ? 'disabled' : 'default'} />
            <TextField label="Senha" value={password} onChangeText={setPassword} secureTextEntry
              placeholder={registering ? 'Mínimo de 10 caracteres' : 'Digite sua senha'}
              state={busy ? 'disabled' : 'default'} />
            {registering ? <TextField label="Confirmar senha" value={confirmation}
              onChangeText={setConfirmation} secureTextEntry state={busy ? 'disabled' : 'default'} /> : null}
            <AppButton label={registering ? 'Criar conta e continuar' : 'Entrar'} size="large" loading={busy}
              onPress={() => void (registering ? register() : perform(login))} />
            <AppButton label={registering ? 'Já tenho uma conta' : 'Primeiro acesso? Criar conta'} variant="outline" disabled={busy}
              onPress={() => { setRegistering(!registering); setPassword(''); setConfirmation(''); setError(''); }} />
            {!registering ? <AppButton label="Voltar ao aplicativo cidadão" disabled={busy}
              onPress={() => router.dismissTo('/(tabs)')} /> : null}
          </>
        ) : editing ? (
          <CenterProfileForm token={token} center={profile} materials={materials}
            onExpired={() => { signOut(); setError('Sua sessão expirou. Entre novamente.'); }}
            onBack={() => {
              if (!profile) { signOut(); return; }
              setEditing(false);
            }}
            onSaved={(center) => {
              setProfile(center);
              setCenterName(center.name);
              setEditing(false);
              void perform(() => showRequests('panel'));
            }} />
        ) : selected && outcome ? (
          <RequestOutcome
            title={outcome === 'ACEITA' ? 'Solicitação aceita!' : 'Solicitação recusada'}
            eyebrow="STATUS ATUALIZADO"
            description={`Pedido ${selected.protocol}`}
            label="NOVO STATUS"
            value={outcome === 'ACEITA' ? 'Aceita pelo centro' : 'Recusada pelo centro'}
            tone={outcome === 'ACEITA' ? 'success' : 'error'}
            note="O cidadão verá a atualização ao consultar o acompanhamento."
            busy={busy}
            primary={{ label: 'Voltar às solicitações', onPress: () => void perform(() => showRequests('list', filter)) }}
            secondary={{ label: 'Ir ao painel do centro', onPress: () => void perform(() => showRequests('panel')) }}
          />
        ) : selected ? (
          <>
            <ScreenHeader title="Detalhe da solicitação" subtitle={selected.protocol}
              onBack={() => void perform(() => showRequests(view, filter))} />
            <AppCard style={[styles.card, selected.status === 'PENDENTE' && styles.pending]}>
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
              <View style={styles.heroText}>
              <AppText size="h3" weight="semibold" color={Colors.light.textOnPrimary}>Visão geral do centro</AppText>
              <AppText size="body" color={Colors.light.textOnPrimary}>Acompanhe as solicitações recebidas.</AppText>
              </View>
              <View style={styles.heroIcon}><CenterIcon panel /></View>
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
            <AppText size="h3" weight="semibold">Ações rápidas</AppText>
            <View style={styles.row}>
              <AppButton style={styles.quickAction} label="Ver solicitações" disabled={busy}
                onPress={() => void perform(() => showRequests('list', 'PENDENTE'))} />
              <AppButton style={styles.quickAction} label="Editar meu centro" variant="outline" disabled={busy}
                onPress={() => void perform(() => openProfile(token))} />
            </View>
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
      {token && !selected && !editing ? (
        <View style={styles.navigation}>
          <CenterNavItem label="Painel" icon="home" active={view === 'panel'} busy={busy}
            onPress={() => void perform(() => showRequests('panel'))} />
          <CenterNavItem label="Solicitações" icon="clipboard-list" active={view === 'list'} busy={busy}
            onPress={() => void perform(() => showRequests('list', 'PENDENTE'))} />
          <CenterNavItem label="Meu centro" icon="center" active={false} busy={busy}
            onPress={() => void perform(() => openProfile(token))} />
        </View>
      ) : null}
    </AppScreen>
  );
}

function CenterNavItem({ label, icon, active, busy, onPress }: {
  label: string; icon: 'home' | 'clipboard-list' | 'center';
  active: boolean; busy: boolean; onPress: () => void;
}) {
  const color = active ? Colors.light.primary : Colors.light.textSecondary;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: active, disabled: busy }}
      disabled={busy} onPress={onPress} style={[styles.navItem, active && styles.accepted]}>
      {icon === 'center' ? <CenterIcon /> : <AppIcon name={icon} size={20} color={color} />}
      <AppText size="caption" color={color}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Layout.screenHorizontalInset,
    paddingTop: Layout.screenTopInset,
    paddingBottom: Spacing.space6,
    gap: Spacing.space3,
  },
  brand: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md, backgroundColor: Colors.light.primary },
  quickAction: { flexGrow: 1 },
  navigation: { flexDirection: 'row', minHeight: Layout.bottomTabHeight, padding: Spacing.space1, borderTopWidth: 1, borderTopColor: Colors.light.border },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.space1, borderRadius: Radius.md },
  card: { gap: Spacing.space2 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.space2 },
  counter: { flex: 1, gap: Spacing.space1 },
  pending: { backgroundColor: Colors.light.backgroundWarning },
  accepted: { backgroundColor: Colors.light.backgroundSuccess },
  hero: { backgroundColor: Colors.light.primary, flexDirection: 'row', alignItems: 'center' },
  heroText: { flex: 1, gap: Spacing.space2 },
  heroIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full, backgroundColor: Colors.light.eco },
  info: { backgroundColor: Colors.light.backgroundInfo },
});
