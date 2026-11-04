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
import { Colors, Layout, Radius, Spacing } from '@/constants/theme';
import { ApiError, createCollectionRequest, getCenter } from '@/services/api';
import type { CenterProfile, CollectionRequestConfirmation, CollectionRequestForm } from '@/types/api';

const initialForm: CollectionRequestForm = {
  requesterName: '', requesterPhone: '', postalCode: '', street: '', streetNumber: '',
  complement: '', neighborhood: '', city: '', state: '', preferredDate: '', preferredPeriod: '',
  notes: '',
};

const addressFields: {
  name: keyof CollectionRequestForm;
  label: string;
  maxLength: number;
  keyboardType?: TextInputProps['keyboardType'];
}[] = [
  { name: 'postalCode', label: 'CEP', maxLength: 9, keyboardType: 'number-pad' },
  { name: 'street', label: 'Logradouro', maxLength: 160 },
  { name: 'streetNumber', label: 'Número', maxLength: 20 },
  { name: 'complement', label: 'Complemento (opcional)', maxLength: 100 },
  { name: 'neighborhood', label: 'Bairro', maxLength: 100 },
  { name: 'city', label: 'Município', maxLength: 100 },
  { name: 'state', label: 'UF', maxLength: 2 },
];

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

  function updateField(name: keyof CollectionRequestForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit() {
    if (inFlight.current || confirmation || !eligible) return;
    const required = [form.requesterName, form.requesterPhone, form.postalCode, form.street,
      form.streetNumber, form.neighborhood, form.city, form.state];
    if (required.some((value) => !value.trim()) || !materialIds.length) {
      setSubmitError('Preencha os dados obrigatórios e selecione ao menos um material.');
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    setSubmitError('');
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
            actionLabel="Voltar"
            onAction={goBack}
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
              maxLength={120} autoComplete="name" state={submitting ? 'disabled' : 'default'} />
            <TextField label="Telefone com DDD" value={form.requesterPhone} onChangeText={(value) => updateField('requesterPhone', value)}
              maxLength={24} keyboardType="phone-pad" autoComplete="tel" state={submitting ? 'disabled' : 'default'} />
            <AppText size="label" weight="semibold">Endereço de coleta</AppText>
            {addressFields.map(({ name, label, maxLength, keyboardType }) => (
              <TextField key={name} label={label} value={form[name]} maxLength={maxLength}
                keyboardType={keyboardType} onChangeText={(value) => updateField(name, value)}
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
            <TextField label="Data preferencial (opcional)" placeholder="AAAA-MM-DD" maxLength={10}
              value={form.preferredDate} onChangeText={(value) => updateField('preferredDate', value)}
              state={submitting ? 'disabled' : 'default'} />
            <TextField label="Período preferencial (opcional)" placeholder="Manhã ou tarde" maxLength={20}
              value={form.preferredPeriod} onChangeText={(value) => updateField('preferredPeriod', value)}
              state={submitting ? 'disabled' : 'default'} />
            <TextField label="Observações (opcional)" placeholder="Detalhes dos materiais" maxLength={500} multiline
              value={form.notes} onChangeText={(value) => updateField('notes', value)}
              state={submitting ? 'disabled' : 'default'} />
            <FeedbackCard layout="compact" title="Disponibilidade de coleta"
              description="O pedido ficará pendente até a análise do centro. Data e período são preferências." />
            {submitError ? (
              <FeedbackCard state="error" title="Envio não confirmado" description={submitError} />
            ) : null}
            <AppButton size="large" label={submitting ? 'Enviando…' : 'Enviar solicitação'}
              disabled={submitting} onPress={() => void submit()} />
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
