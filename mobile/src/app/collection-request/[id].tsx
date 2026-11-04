import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type TextInputProps } from 'react-native';

import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
  FeedbackCard,
  FilterChip,
  ScreenHeader,
  TextField,
} from '@/components/recicla-ui';
import DateField from '@/components/date-field';
import { Colors, Layout, Radius, Spacing } from '@/constants/theme';
import { ApiError, createCollectionRequest, getCenter } from '@/services/api';
import { lookupCepReference } from '@/services/cep-lookup';
import type { CenterProfile, CollectionRequestConfirmation, CollectionRequestForm } from '@/types/api';

const initialForm: CollectionRequestForm = {
  requesterName: '', requesterPhone: '', postalCode: '', street: '', streetNumber: '',
  complement: '', neighborhood: '', city: '', state: '', preferredDate: '', preferredPeriod: '',
  notes: '',
};

const addressFields: {
  name: 'street' | 'streetNumber' | 'complement' | 'neighborhood' | 'city' | 'state';
  label: string;
  maxLength: number;
  keyboardType?: TextInputProps['keyboardType'];
}[] = [
  { name: 'street', label: 'Logradouro', maxLength: 160 },
  { name: 'streetNumber', label: 'Número', maxLength: 20 },
  { name: 'complement', label: 'Complemento (opcional)', maxLength: 100 },
  { name: 'neighborhood', label: 'Bairro', maxLength: 100 },
  { name: 'city', label: 'Município', maxLength: 100 },
  { name: 'state', label: 'UF', maxLength: 2 },
];

function validateForm(form: CollectionRequestForm, materialIds: number[]) {
  const phone = form.requesterPhone.trim().replace(/[\s()+-]/g, '');

  return {
    requesterName: form.requesterName.trim() ? undefined : 'Informe seu nome.',
    requesterPhone: /^\d{10,13}$/.test(phone) ? undefined : 'Informe um telefone válido com DDD.',
    postalCode: /^\d{8}$/.test(form.postalCode) ? undefined : 'Informe o CEP de coleta com oito dígitos.',
    street: form.street.trim() ? undefined : 'Informe o logradouro.',
    streetNumber: form.streetNumber.trim() ? undefined : 'Informe o número.',
    complement: undefined,
    neighborhood: form.neighborhood.trim() ? undefined : 'Informe o bairro.',
    city: form.city.trim() ? undefined : 'Informe o município.',
    state: /^[A-Za-z]{2}$/.test(form.state.trim()) ? undefined : 'Informe a UF com duas letras.',
    materials: materialIds.length ? undefined : 'Selecione ao menos um material.',
  };
}

export default function CollectionRequestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CollectionRequestFormScreen key={id} centerId={Number(id)} />;
}

function CollectionRequestFormScreen({ centerId }: { centerId: number }) {
  const [center, setCenter] = useState<CenterProfile>();
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [materialIds, setMaterialIds] = useState<number[]>([]);
  const [cepMessage, setCepMessage] = useState('');
  const [lookingUpCep, setLookingUpCep] = useState(false);
  const latestCep = useRef('');
  const cepLookupRevision = useRef(0);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);
  const [confirmation, setConfirmation] = useState<CollectionRequestConfirmation>();

  useEffect(() => {
    if (!Number.isSafeInteger(centerId) || centerId <= 0) return;
    let active = true;
    void getCenter(centerId)
      .then((result) => { if (active) setCenter(result); })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(error instanceof ApiError && error.status === 404
          ? 'Este centro não está disponível para coleta.'
          : 'Não foi possível consultar o centro. Tente novamente.');
      });
    return () => { active = false; };
  }, [centerId, loadAttempt]);

  const validId = Number.isSafeInteger(centerId) && centerId > 0;
  const eligible = center?.isActive && center.services.offersPickup && center.materials.length > 0;

  const fieldErrors = attemptedSubmit ? validateForm(form, materialIds) : undefined;

  function updateField(name: keyof CollectionRequestForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function updatePostalCode(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const previousCep = latestCep.current;
    if (previousCep === digits) return;
    latestCep.current = digits;
    const revision = ++cepLookupRevision.current;
    setCepMessage('');
    setForm((current) => ({
      ...current,
      postalCode: digits,
      ...(previousCep.length === 8 ? { street: '', neighborhood: '', city: '', state: '' } : {}),
    }));
    setLookingUpCep(digits.length === 8);
    if (digits.length !== 8) return;

    try {
      const { address } = await lookupCepReference(digits);
      if (cepLookupRevision.current !== revision) return;
      setForm((current) => ({
        ...current,
        street: current.street || address.street || '',
        neighborhood: current.neighborhood || address.neighborhood || '',
        city: current.city || address.city || '',
        state: current.state || address.state || '',
      }));
      if (!address.street || !address.neighborhood || !address.city || !address.state) {
        setCepMessage('Complete os campos de endereço que não foram localizados.');
      }
    } catch {
      if (cepLookupRevision.current === revision) {
        setCepMessage('Não foi possível localizar o CEP. Confira os números ou preencha o endereço manualmente.');
      }
    } finally {
      if (cepLookupRevision.current === revision) setLookingUpCep(false);
    }
  }

  async function submit() {
    if (inFlight.current || confirmation || !eligible || lookingUpCep) return;
    setAttemptedSubmit(true);
    setSubmitError('');
    if (Object.values(validateForm(form, materialIds)).some(Boolean)) return;

    inFlight.current = true;
    setSubmitting(true);
    try {
      const result = await createCollectionRequest({ ...form, centerId, materialIds });
      setForm(initialForm);
      setMaterialIds([]);
      setConfirmation(result);
    } catch (error) {
      setSubmitError(error instanceof ApiError && [400, 409].includes(error.status)
        ? error.message
        : 'Não foi possível confirmar o envio. Confira com o centro antes de enviar novamente.');
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/centers');
  }

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title="Solicitar coleta"
          subtitle="Preencha as informações do atendimento."
          onBack={submitting ? undefined : goBack}
        />
        {confirmation ? (
          <FeedbackCard
            state="success"
            title="Solicitação registrada"
            description={`Protocolo: ${confirmation.protocol}. Guarde-o. Seu pedido está pendente e aguarda análise do centro.`}
            actionLabel="Acompanhar solicitação"
            onAction={() => router.push({
              pathname: '/track-collection-request',
              params: { protocol: confirmation.protocol },
            })}
          />
        ) : !validId || (center && !eligible) ? (
          <FeedbackCard state="error" title="Coleta indisponível" description="Este centro não está disponível para coleta." />
        ) : loadError ? (
          <FeedbackCard
            state="error"
            title="Centro indisponível"
            description={loadError}
            actionLabel="Tentar novamente"
            onAction={() => {
              setLoadError('');
              setLoadAttempt((current) => current + 1);
            }}
          />
        ) : !center ? (
          <FeedbackCard loading title="Carregando centro" description="Consultando a disponibilidade de coleta." />
        ) : (
          <>
            <View style={styles.step}>
              <AppText size="caption" color={Colors.light.primary}>ETAPA 1 DE 1 · DADOS DA COLETA</AppText>
            </View>
            <AppCard style={styles.center}>
              <View style={styles.marker} />
              <View style={styles.flex}>
                <AppText size="label" weight="medium">{center.name}</AppText>
                <AppText size="caption" color={Colors.light.textSecondary}>
                  {center.address.neighborhood} · {center.address.city}/{center.address.state}
                </AppText>
              </View>
            </AppCard>
            <AppText size="label" weight="semibold">Dados de contato</AppText>
            <TextField label="Nome" value={form.requesterName} onChangeText={(value) => updateField('requesterName', value)}
              maxLength={120} autoComplete="name" errorText={fieldErrors?.requesterName} state={submitting ? 'disabled' : 'default'} />
            <TextField label="Telefone com DDD" value={form.requesterPhone} onChangeText={(value) => updateField('requesterPhone', value)}
              maxLength={24} keyboardType="phone-pad" autoComplete="tel" errorText={fieldErrors?.requesterPhone} state={submitting ? 'disabled' : 'default'} />
            <AppText size="label" weight="semibold">Endereço de coleta</AppText>
            <TextField label="CEP" value={form.postalCode} keyboardType="number-pad" maxLength={9}
              autoComplete="postal-code" onChangeText={(value) => void updatePostalCode(value)}
              errorText={fieldErrors?.postalCode}
              supportingText={lookingUpCep ? 'Buscando endereço…' : cepMessage || 'Obrigatório. Informe os oito dígitos.'}
              state={submitting ? 'disabled' : 'default'} />
            {addressFields.map(({ name, label, maxLength, keyboardType }) => (
              <TextField key={name} label={label} value={form[name]} maxLength={maxLength}
                keyboardType={keyboardType} errorText={fieldErrors?.[name]}
                onChangeText={(value) => updateField(name, value)}
                state={submitting ? 'disabled' : 'default'} />
            ))}
            <AppText size="label" weight="semibold">Materiais para coleta</AppText>
            <View style={styles.materials}>
              {center.materials.map((material) => (
                <FilterChip
                  key={material.id}
                  label={material.name}
                  selected={materialIds.includes(material.id)}
                  disabled={submitting}
                  onPress={() => setMaterialIds((current) => current.includes(material.id)
                    ? current.filter((id) => id !== material.id)
                    : [...current, material.id])}
                />
              ))}
            </View>
            {fieldErrors?.materials ? (
              <AppText size="caption" color={Colors.light.danger}>{fieldErrors.materials}</AppText>
            ) : null}
            <DateField value={form.preferredDate} disabled={submitting}
              onChange={(value) => updateField('preferredDate', value)} />
            <TextField label="Período preferencial (opcional)" placeholder="Manhã ou tarde" maxLength={20}
              value={form.preferredPeriod} onChangeText={(value) => updateField('preferredPeriod', value)}
              state={submitting ? 'disabled' : 'default'} />
            <TextField label="Observações (opcional)" placeholder="Detalhes dos materiais" maxLength={500} multiline
              value={form.notes} onChangeText={(value) => updateField('notes', value)}
              state={submitting ? 'disabled' : 'default'} />
            <FeedbackCard layout="compact" showIcon={false} title="Disponibilidade de coleta"
              description="O pedido ficará pendente até a análise do centro. Data e período são preferências." />
            {fieldErrors && Object.values(fieldErrors).some(Boolean) ? (
              <AppText size="caption" color={Colors.light.danger}>Confira os campos destacados antes de enviar.</AppText>
            ) : null}
            {submitError ? (
              <FeedbackCard state="error" title="Envio não confirmado" description={submitError} />
            ) : null}
            <AppButton size="large" label={submitting ? 'Enviando…' : 'Enviar solicitação'}
              disabled={submitting || lookingUpCep} onPress={() => void submit()} />
          </>
        )}
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
  step: {
    padding: Spacing.space3,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.backgroundSuccess,
  },
  center: { flexDirection: 'row', gap: Spacing.space2 },
  marker: { width: Spacing.space1, borderRadius: Radius.full, backgroundColor: Colors.light.coral },
  flex: { flex: 1 },
  materials: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.space2 },
});
