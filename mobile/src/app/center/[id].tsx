import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
  FeedbackCard,
  ScreenHeader,
} from '@/components/recicla-ui';
import { Colors, Spacing } from '@/constants/theme';
import { getCenter } from '@/services/api';
import type { CenterProfile } from '@/types/api';

const WEEK_DAYS = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

function formatAddress(center: CenterProfile): string[] {
  const { address } = center;
  return [
    `${address.street}, ${address.streetNumber}`,
    address.complement,
    address.neighborhood,
    `${address.city}/${address.state}`,
    `CEP ${address.postalCode}`,
  ].filter((value): value is string => Boolean(value));
}

function formatTime(value: string): string {
  return value.slice(0, 5);
}

function groupedHours(center: CenterProfile): Array<{ day: string; periods: string }> {
  return WEEK_DAYS.map((day, index) => {
    const dayOfWeek = index + 1;
    const periods = center.openingHours
      .filter((hour) => hour.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.periodNumber - b.periodNumber)
      .map((hour) => `${formatTime(hour.opensAt)}–${formatTime(hour.closesAt)}`)
      .join(' · ');

    return { day, periods };
  }).filter((item) => item.periods.length > 0);
}

export default function CenterDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Number(params.id);
  const [center, setCenter] = useState<CenterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [contactError, setContactError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCenter() {
      if (!Number.isSafeInteger(id) || id <= 0) {
        setError('O identificador do centro é inválido.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getCenter(id);
        if (active) setCenter(data);
      } catch (reason) {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : 'Não foi possível consultar os detalhes do centro.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCenter();

    return () => {
      active = false;
    };
  }, [id, refreshKey]);

  async function callCenter() {
    if (!center) return;
    const phone = center.publicPhone.replace(/[^\d+]/g, '');
    if (!phone) return;

    try {
      await Linking.openURL(`tel:${phone}`);
    } catch {
      setContactError('Não foi possível abrir o aplicativo de telefone neste dispositivo.');
    }
  }

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Detalhes do centro"
          subtitle={center?.name ?? 'Informações públicas'}
          onBack={() => router.back()}
        />

        {loading ? (
          <AppCard style={styles.loadingCard}>
            <ActivityIndicator color={Colors.light.accent} />
            <AppText size="small" color={Colors.light.textSecondary}>
              Carregando detalhes do centro...
            </AppText>
          </AppCard>
        ) : error ? (
          <FeedbackCard
            title="Não foi possível abrir este centro"
            description={error}
            actionLabel="Tentar novamente"
            onAction={() => setRefreshKey((current) => current + 1)}
          />
        ) : center ? (
          <>
            <AppCard style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <View style={styles.centerMark}>
                  <AppText color={Colors.light.primary} size="subtitle" weight="bold">
                    {center.name.trim().charAt(0).toUpperCase()}
                  </AppText>
                </View>
                <View style={styles.summaryCopy}>
                  <AppText color="#FFFFFF" size="body" weight="bold">
                    {center.name}
                  </AppText>
                  <AppText color="#DCEFFA" size="caption">
                    Centro ativo · {center.address.city}/{center.address.state}
                  </AppText>
                </View>
              </View>
              <View style={styles.badges}>
                {center.services.acceptsDropoff ? (
                  <View style={styles.serviceBadge}>
                    <AppText color="#FFFFFF" size="caption" weight="medium">
                      Recebe entrega
                    </AppText>
                  </View>
                ) : null}
                {center.services.offersPickup ? (
                  <View style={styles.serviceBadge}>
                    <AppText color="#FFFFFF" size="caption" weight="medium">
                      Coleta disponível
                    </AppText>
                  </View>
                ) : null}
              </View>
            </AppCard>

            <AppCard>
              <AppText size="eyebrow" color={Colors.light.accent} weight="bold">
                ENDEREÇO DO CENTRO
              </AppText>
              {formatAddress(center).map((line, index) => (
                <AppText key={`${index}-${line}`} size="small" weight={index === 0 ? 'semibold' : 'regular'}>
                  {line}
                </AppText>
              ))}
              <View style={styles.contactRow}>
                <View style={styles.contactText}>
                  <AppText size="eyebrow" color={Colors.light.accent} weight="bold">
                    TELEFONE PÚBLICO
                  </AppText>
                  <AppText size="small">{center.publicPhone}</AppText>
                  {contactError ? (
                    <AppText size="caption" color={Colors.light.danger}>
                      {contactError}
                    </AppText>
                  ) : null}
                </View>
                <AppButton
                  label="Ligar"
                  variant="secondary"
                  onPress={() => void callCenter()}
                  style={styles.callButton}
                />
              </View>
            </AppCard>

            <AppCard>
              <AppText size="eyebrow" color={Colors.light.accent} weight="bold">
                MATERIAIS ACEITOS
              </AppText>
              <AppText weight="semibold">Materiais recebidos</AppText>
              <View style={styles.materials}>
                {center.materials.map((material) => (
                  <View key={material.id} style={styles.materialPill}>
                    <AppText size="caption" color={Colors.light.primary} weight="medium">
                      {material.name}
                    </AppText>
                  </View>
                ))}
              </View>
            </AppCard>

            <AppCard>
              <AppText size="eyebrow" color={Colors.light.accent} weight="bold">
                HORÁRIOS
              </AppText>
              <AppText weight="semibold">Atendimento</AppText>
              {groupedHours(center).map((item) => (
                <View key={item.day} style={styles.hourRow}>
                  <AppText size="small">{item.day}</AppText>
                  <AppText size="small" weight="semibold">
                    {item.periods}
                  </AppText>
                </View>
              ))}
            </AppCard>

            <AppCard style={styles.serviceCard}>
              <AppText size="eyebrow" color={Colors.light.accent} weight="bold">
                SERVIÇOS
              </AppText>
              {center.services.acceptsDropoff ? (
                <AppText size="small" weight="semibold">Recebimento de materiais no local</AppText>
              ) : null}
              {center.services.offersPickup ? (
                <AppText size="small" weight="semibold">Coleta no endereço do solicitante</AppText>
              ) : null}
              {!center.services.acceptsDropoff && !center.services.offersPickup ? (
                <AppText size="small" color={Colors.light.textSecondary}>
                  Não há serviços públicos informados para este centro.
                </AppText>
              ) : null}
              {center.services.offersPickup ? (
                <AppText size="caption" color={Colors.light.textSecondary}>
                  A disponibilidade da coleta deve ser confirmada diretamente com o centro.
                </AppText>
              ) : null}
            </AppCard>
          </>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    borderRadius: 18,
    gap: Spacing.three,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  centerMark: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: Colors.light.backgroundSelected,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCopy: {
    flex: 1,
    gap: 4,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceBadge: {
    backgroundColor: '#1F77A8',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  contactText: {
    flex: 1,
    gap: 3,
  },
  callButton: {
    minHeight: 40,
    paddingHorizontal: 16,
  },
  materials: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.one,
  },
  materialPill: {
    backgroundColor: Colors.light.backgroundSelected,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    gap: Spacing.two,
  },
  serviceCard: {
    marginBottom: Spacing.two,
  },
});
