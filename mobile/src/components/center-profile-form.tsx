import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppCard, AppText, FeedbackCard, FilterChip, MaterialChip, ScreenHeader, TextField } from '@/components/recicla-ui';
import { Colors, Spacing } from '@/constants/theme';
import { ApiError, deactivateOwnCenter, saveOwnCenter } from '@/services/api';
import { lookupCepReference } from '@/services/cep-lookup';
import type { CenterOpeningHour, CenterProfile, Material } from '@/types/api';

import { materialCategory } from '@/utils/material-category';

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
  const [busy, setBusy] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);

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

  function updateHour(index: number, change: Partial<CenterOpeningHour>) {
    setHours(current => current.map((hour, position) => position === index ? { ...hour, ...change } : hour));
  }

  function save() {
    if (!form.latitude.trim() || !form.longitude.trim()) {
      setError('Informe a latitude e a longitude ou consulte o CEP para preencher as coordenadas disponíveis.');
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

  function useCep() {
    void perform(async () => {
      const { address, coordinates } = await lookupCepReference(form.postalCode);
      setForm(current => ({
        ...current,
        street: address.street || current.street,
        neighborhood: address.neighborhood || current.neighborhood,
        city: address.city || current.city,
        state: address.state || current.state,
        latitude: coordinates?.latitude.toString() ?? current.latitude,
        longitude: coordinates?.longitude.toString() ?? current.longitude,
      }));
    });
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
            onChangeText={value => setForm(current => ({ ...current, [name]: value }))} />
          {name === 'postalCode' ? <AppButton label="Preencher pelo CEP" variant="text" disabled={busy} onPress={useCep} /> : null}
        </View>
      ))}
      <AppText size="label" weight="semibold">Materiais recebidos</AppText>
      <View style={styles.row}>
        {materials.map(material => (
          <MaterialChip key={material.id} label={material.name} category={materialCategory(material.name, material.slug)} disabled={busy}
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
      {hours.map((hour, index) => (
        <AppCard key={index} style={styles.field}>
          <AppText size="label">Período {index + 1}</AppText>
          <View style={styles.row}>
            {days.map((day, dayIndex) => (
              <FilterChip key={day} label={day} selected={hour.dayOfWeek === dayIndex + 1}
                disabled={busy} onPress={() => updateHour(index, { dayOfWeek: dayIndex + 1 })} />
            ))}
          </View>
          <View style={styles.row}>
            <TextField label="Abre" placeholder="HH:MM" value={hour.opensAt} maxLength={8}
              state={busy ? 'disabled' : 'default'} style={styles.column}
              onChangeText={opensAt => updateHour(index, { opensAt })} />
            <TextField label="Fecha" placeholder="HH:MM" value={hour.closesAt} maxLength={8}
              state={busy ? 'disabled' : 'default'} style={styles.column}
              onChangeText={closesAt => updateHour(index, { closesAt })} />
          </View>
          <AppButton label="Remover período" variant="text" disabled={busy}
            onPress={() => setHours(current => current.filter((_, position) => position !== index))} />
        </AppCard>
      ))}
      <AppButton label="Adicionar horário" variant="outline" disabled={busy}
        onPress={() => setHours(current => [...current, { dayOfWeek: 1, periodNumber: 1, opensAt: '', closesAt: '' }])} />
      {error ? <FeedbackCard title="Operação não concluída" description={error} state="error" /> : null}
      <AppButton label="Salvar cadastro" loading={busy} onPress={save} />
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
  column: { flex: 1 },
});
