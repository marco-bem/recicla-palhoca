import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppCard, AppText, FeedbackCard, FilterChip, ScreenHeader, TextField } from '@/components/recicla-ui';
import TimeField from '@/components/time-field';
import { Colors, Spacing } from '@/constants/theme';
import { ApiError, deactivateOwnCenter, saveOwnCenter } from '@/services/api';
import { lookupCepReference } from '@/services/cep-lookup';
import type { CenterOpeningHour, CenterProfile, Material } from '@/types/api';

const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const fields = [
  ['name', 'Nome do centro', 160], ['publicPhone', 'Telefone público', 24], ['postalCode', 'CEP', 9],
  ['street', 'Logradouro', 160], ['streetNumber', 'Número', 20], ['neighborhood', 'Bairro', 100],
  ['city', 'Município', 100], ['state', 'UF', 2], ['addressComplement', 'Complemento (opcional)', 100],
  ['latitude', 'Latitude', 16], ['longitude', 'Longitude', 16],
] as const;

interface Props {
  token: string;
  center: CenterProfile | null;
  materials: Material[];
  onBack: () => void;
  onSaved: (center: CenterProfile) => void;
  onExpired: () => void;
}

export function CenterProfileForm({ token, center, materials, onBack, onSaved, onExpired }: Props) {
  const [form, setForm] = useState({
    name: center?.name ?? '', publicPhone: center?.publicPhone ?? '',
    postalCode: center?.address.postalCode ?? '', street: center?.address.street ?? '',
    streetNumber: center?.address.streetNumber ?? '', neighborhood: center?.address.neighborhood ?? '',
    city: center?.address.city ?? '', state: center?.address.state ?? '',
    addressComplement: center?.address.complement ?? '',
    latitude: center?.coordinates.latitude?.toString() ?? '',
    longitude: center?.coordinates.longitude?.toString() ?? '',
  });
  const [materialIds, setMaterialIds] = useState(center?.materials.map(item => item.id) ?? []);
  const [acceptsDropoff, setAcceptsDropoff] = useState(center?.services.acceptsDropoff ?? false);
  const [offersPickup, setOffersPickup] = useState(center?.services.offersPickup ?? false);
  const [hours, setHours] = useState<CenterOpeningHour[]>(center?.openingHours ?? []);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [opensAt, setOpensAt] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [editingHour, setEditingHour] = useState<number | null>(null);
  const [hoursError, setHoursError] = useState('');
  const [lookingUpCep, setLookingUpCep] = useState(false);
  const [cepMessage, setCepMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const latestCep = useRef(form.postalCode.replace(/\D/g, ''));
  const cepRevision = useRef(0);
  const hasPendingHours = selectedDays.length > 0 || Boolean(opensAt || closesAt);

  async function perform(action: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) onExpired();
      else setError(error instanceof Error ? error.message : 'Não foi possível concluir a operação.');
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  function clearHour() {
    setSelectedDays([]);
    setOpensAt('');
    setClosesAt('');
    setEditingHour(null);
    setHoursError('');
  }

  function addHour() {
    if (!selectedDays.length || !opensAt || !closesAt || opensAt >= closesAt) {
      setHoursError('Selecione os dias e informe uma abertura anterior ao fechamento.');
      return;
    }
    const entries = selectedDays.map(dayOfWeek => ({ dayOfWeek, periodNumber: 1, opensAt, closesAt }));
    setHours(current => editingHour === null
      ? [...current, ...entries]
      : current.flatMap((hour, index) => index === editingHour ? entries : [hour]));
    clearHour();
  }

  function save() {
    if (lookingUpCep) return;
    if (hasPendingHours || !hours.length) {
      setHoursError(hasPendingHours
        ? 'Adicione o horário selecionado ou limpe a seleção antes de salvar.'
        : 'Adicione ao menos um horário de atendimento.');
      return;
    }
    if (!form.latitude.trim() || !form.longitude.trim()) {
      setError('Informe a latitude e a longitude se o CEP não tiver retornado as coordenadas.');
      return;
    }

    const periods = new Map<number, number>();
    const openingHours = hours.map(hour => {
      const periodNumber = (periods.get(hour.dayOfWeek) ?? 0) + 1;
      periods.set(hour.dayOfWeek, periodNumber);
      return { ...hour, periodNumber };
    });

    void perform(async () => {
      const saved = await saveOwnCenter(token, {
        ...form,
        addressComplement: form.addressComplement.trim() || null,
        latitude: Number(form.latitude.replace(',', '.')),
        longitude: Number(form.longitude.replace(',', '.')),
        acceptsDropoff, offersPickup, materialIds, openingHours,
      }, center?.id);
      onSaved(saved);
    });
  }

  async function updatePostalCode(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const previous = latestCep.current;
    if (digits === previous) return;
    latestCep.current = digits;
    const revision = ++cepRevision.current;
    setCepMessage('');
    setLookingUpCep(digits.length === 8);
    setForm(current => ({
      ...current,
      postalCode: digits,
      ...(previous.length === 8 ? { street: '', neighborhood: '', city: '', state: '', latitude: '', longitude: '' } : {}),
    }));
    if (digits.length !== 8) return;

    try {
      const { address, coordinates } = await lookupCepReference(digits);
      if (revision !== cepRevision.current) return;
      setForm(current => ({
        ...current,
        street: current.street || address.street || '',
        neighborhood: current.neighborhood || address.neighborhood || '',
        city: current.city || address.city || '',
        state: current.state || address.state || '',
        latitude: current.latitude || coordinates?.latitude.toString() || '',
        longitude: current.longitude || coordinates?.longitude.toString() || '',
      }));
      if (!address.street || !address.neighborhood || !address.city || !address.state || !coordinates) {
        setCepMessage('Complete os dados de endereço e coordenadas que não foram localizados.');
      }
    } catch {
      if (revision === cepRevision.current) {
        setCepMessage('CEP não localizado. Confira os números ou preencha os dados manualmente.');
      }
    } finally {
      if (revision === cepRevision.current) setLookingUpCep(false);
    }
  }

  return (
    <>
      <ScreenHeader title={center ? 'Meu centro' : 'Cadastro do centro'}
        subtitle="Dados do estabelecimento e operação." onBack={busy ? undefined : onBack} />
      <AppCard style={styles.step}>
        <AppText size="caption" color={Colors.light.primary}>CADASTRO DO CENTRO · DADOS E SERVIÇOS</AppText>
      </AppCard>
      {center && !center.isActive ? <AppText size="label">Centro desativado</AppText> : null}
      {fields.map(([name, label, maxLength]) => (
        <View key={name} style={styles.field}>
          <TextField label={label} value={form[name]} maxLength={maxLength}
            state={busy ? 'disabled' : 'default'}
            keyboardType={name === 'postalCode' ? 'number-pad' : undefined}
            supportingText={name === 'postalCode' ? (lookingUpCep ? 'Buscando endereço pelo CEP…' : cepMessage) : undefined}
            onChangeText={value => {
              if (name === 'postalCode') void updatePostalCode(value);
              else setForm(current => ({ ...current, [name]: value }));
            }} />
        </View>
      ))}
      <AppText size="label" weight="semibold">Materiais recebidos</AppText>
      <View style={styles.row}>
        {materials.map(material => (
          <FilterChip key={material.id} label={material.name} disabled={busy}
            selected={materialIds.includes(material.id)}
            onPress={() => setMaterialIds(current => current.includes(material.id)
              ? current.filter(id => id !== material.id) : [...current, material.id])} />
        ))}
      </View>
      <AppText size="label" weight="semibold">Serviços oferecidos</AppText>
      <View style={styles.row}>
        <FilterChip label="Recebe entrega" selected={acceptsDropoff} disabled={busy} onPress={() => setAcceptsDropoff(value => !value)} />
        <FilterChip label="Oferece coleta" selected={offersPickup} disabled={busy} onPress={() => setOffersPickup(value => !value)} />
      </View>
      <AppText size="label" weight="semibold">Horário de atendimento</AppText>
      <AppCard style={styles.field}>
        <AppText size="body">Selecione os dias que terão o mesmo horário.</AppText>
        <View style={styles.row}>
          {days.map((day, index) => (
            <FilterChip key={day} label={day} selected={selectedDays.includes(index + 1)} disabled={busy}
              onPress={() => setSelectedDays(current => current.includes(index + 1)
                ? current.filter(dayOfWeek => dayOfWeek !== index + 1) : [...current, index + 1])} />
          ))}
        </View>
        <View style={styles.timeFields}>
          <View style={styles.timeColumn}>
            <TimeField label="Abertura" value={opensAt} onChange={setOpensAt} disabled={busy} />
          </View>
          <View style={styles.timeColumn}>
            <TimeField label="Fechamento" value={closesAt} onChange={setClosesAt} disabled={busy} />
          </View>
        </View>
        <AppButton label={editingHour === null ? 'Adicionar horário' : 'Atualizar horário'}
          variant="outline" disabled={busy} onPress={addHour} />
        {hasPendingHours ? <AppButton label="Limpar seleção" variant="text" disabled={busy} onPress={clearHour} /> : null}
        {hoursError ? <FeedbackCard title="Confira o horário" description={hoursError} state="error" /> : null}
      </AppCard>
      {hours.map((hour, index) => (
        <AppCard key={index} style={styles.field}>
          <AppText size="label">{days[hour.dayOfWeek - 1]} · {hour.opensAt.slice(0, 5)} às {hour.closesAt.slice(0, 5)}</AppText>
          <View style={styles.row}>
            <AppButton label="Editar período" variant="text" disabled={busy || hasPendingHours}
              onPress={() => {
                setEditingHour(index);
                setSelectedDays([hour.dayOfWeek]);
                setOpensAt(hour.opensAt.slice(0, 5));
                setClosesAt(hour.closesAt.slice(0, 5));
                setHoursError('');
              }} />
            <AppButton label="Remover período" variant="text" disabled={busy || editingHour !== null}
              onPress={() => setHours(current => current.filter((_, position) => position !== index))} />
          </View>
        </AppCard>
      ))}
      {error ? <FeedbackCard title="Operação não concluída" description={error} state="error" /> : null}
      <AppButton label="Salvar cadastro" loading={busy} disabled={lookingUpCep} onPress={save} />
      {center?.isActive ? (
        <>
          {deactivating ? <AppText size="body">O centro sairá da consulta pública. O histórico dos pedidos será preservado.</AppText> : null}
          <AppButton label={deactivating ? 'Confirmar desativação' : 'Desativar centro'} variant="outline" disabled={busy}
            onPress={() => {
              if (!deactivating) { setDeactivating(true); return; }
              void perform(async () => {
                await deactivateOwnCenter(token, center.id);
                onSaved({ ...center, isActive: false });
              });
            }} />
          {deactivating ? <AppButton label="Cancelar desativação" variant="text" disabled={busy} onPress={() => setDeactivating(false)} /> : null}
        </>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  step: { backgroundColor: Colors.light.backgroundSuccess, paddingVertical: Spacing.space2 },
  field: { gap: Spacing.space2 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.space2 },
  timeFields: { flexDirection: 'row', gap: Spacing.space3 },
  timeColumn: { flex: 1, minWidth: 0 },
});
