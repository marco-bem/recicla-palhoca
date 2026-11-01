import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AppIcon } from '@/components/app-icons';
import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
  FeedbackCard,
  MaterialChip,
  ScreenHeader,
  StatusBadge,
} from '@/components/recicla-ui';
import { Colors, Layout, Radius, Spacing } from '@/constants/theme';
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

type MaterialCategory = keyof typeof Colors.light.category;

function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function materialCategory(name: string, slug: string): MaterialCategory | undefined {
  const value = normalizeSearch(`${name} ${slug}`);

  if (/papel|papelao|paper/.test(value)) return 'paper';
  if (/plastic/.test(value)) return 'plastic';
  if (/vidro|glass/.test(value)) return 'glass';
  if (/metal|aluminio|aco|ferro/.test(value)) return 'metal';
  if (/lamp|eletron|pilha|bateria/.test(value)) return 'electronics';
  if (/organ|oleo/.test(value)) return 'organic';

  return undefined;
}

function formatTime(value: string): string {
  return value.slice(0, 5);
}

function groupedHours(center: CenterProfile): { day: string; periods: string }[] {
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

function formatAddress(center: CenterProfile): string[] {
  const { address } = center;
  const streetLine = [address.street, address.streetNumber, address.complement]
    .filter(Boolean)
    .join(', ');
  const neighborhoodLine = address.neighborhood;
  const cityLine = [address.city, address.state].filter(Boolean).join('/');
  const postalCode = address.postalCode ? `CEP ${address.postalCode}` : '';

  return [streetLine, neighborhoodLine, cityLine, postalCode].filter(Boolean);
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

    setContactError(null);

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
          subtitle="Informações do ponto de entrega."
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
            state="error"
          />
        ) : center ? (
          <>
            <AppCard style={styles.summaryCard}>
              <AppText size="eyebrow" color={Colors.light.highlight} weight="semibold">
                CENTRO DE RECICLAGEM
              </AppText>
              <AppText size="h2" color={Colors.light.textOnPrimary} weight="semibold">
                {center.name}
              </AppText>
              <AppText size="small" color={Colors.light.textOnPrimary}>
                {[center.address.city, center.address.state].filter(Boolean).join(' · ')}
              </AppText>
            </AppCard>

            <View style={styles.badges}>
              <StatusBadge
                label={center.isActive ? 'Centro ativo' : 'Inativo'}
                status={center.isActive ? 'success' : 'warning'}
              />
              {center.services.acceptsDropoff ? (
                <StatusBadge label="Entrega no local" status="info" />
              ) : null}
              {center.services.offersPickup ? (
                <StatusBadge label="Coleta disponível" status="success" />
              ) : null}
              {!center.services.acceptsDropoff && !center.services.offersPickup ? (
                <StatusBadge label="Serviços não informados" status="neutral" />
              ) : null}
            </View>

            <View style={styles.section}>
              <AppText size="h3" weight="semibold">Materiais aceitos</AppText>
              {center.materials.length > 0 ? (
                <View style={styles.materials}>
                  {center.materials.map((material) => (
                    <MaterialChip
                      key={material.id}
                      label={material.name}
                      category={materialCategory(material.name, material.slug)}
                    />
                  ))}
                </View>
              ) : (
                <AppText size="small" color={Colors.light.textSecondary}>
                  Nenhum material informado para este centro.
                </AppText>
              )}
            </View>

            <AppCard style={styles.hoursCard}>
              <View style={styles.cardHeading}>
                <AppIcon name="clock" size={20} color={Colors.light.primary} />
                <AppText size="label" weight="medium">
                  Horários de atendimento
                </AppText>
              </View>
              {groupedHours(center).length > 0 ? (
                <View style={styles.hoursList}>
                  {groupedHours(center).map((item) => (
                    <View key={item.day} style={styles.hourRow}>
                      <AppText size="small" color={Colors.light.textSecondary}>
                        {item.day}
                      </AppText>
                      <AppText size="small" weight="semibold">
                        {item.periods}
                      </AppText>
                    </View>
                  ))}
                </View>
              ) : (
                <AppText size="small" color={Colors.light.textSecondary}>
                  Horários não informados.
                </AppText>
              )}
            </AppCard>

            <AppCard style={styles.addressCard}>
              <View style={styles.cardHeading}>
                <AppIcon name="map-pin" size={20} color={Colors.light.accent} />
                <AppText size="label" weight="medium">
                  Endereço
                </AppText>
              </View>
              <View style={styles.addressLines}>
                {formatAddress(center).map((line, index) => (
                  <AppText
                    key={`${index}-${line}`}
                    size={index === 0 ? 'body' : 'caption'}
                    color={index === 0 ? Colors.light.textPrimary : Colors.light.textSecondary}
                    weight={index === 0 ? 'medium' : 'regular'}>
                    {line}
                  </AppText>
                ))}
              </View>
              <View style={styles.contactRow}>
                <View style={styles.contactCopy}>
                  <AppText size="eyebrow" color={Colors.light.accent} weight="semibold">
                    TELEFONE PÚBLICO
                  </AppText>
                  <AppText size="small">
                    {center.publicPhone.trim() || 'Telefone não informado'}
                  </AppText>
                </View>
              </View>
              {contactError ? (
                <AppText size="caption" color={Colors.light.danger}>
                  {contactError}
                </AppText>
              ) : null}
            </AppCard>

            <AppText size="caption" color={Colors.light.textSecondary}>
              Confirme horários e condições diretamente com o estabelecimento.
            </AppText>

            <AppButton
              label="Ligar para o centro"
              onPress={() => void callCenter()}
              size="large"
              disabled={!center.publicPhone.trim()}
              style={styles.callButton}
            />
          </>
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
    gap: Spacing.space4,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryCard: {
    minHeight: 126,
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    borderRadius: Radius.lg,
    padding: Spacing.space4,
    gap: Spacing.space2,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  section: {
    gap: Spacing.space3,
  },
  materials: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hoursCard: {
    gap: Spacing.space3,
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hoursList: {
    gap: 8,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: Spacing.space1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  addressCard: {
    backgroundColor: Colors.light.backgroundInfo,
    borderColor: Colors.light.backgroundInfo,
    gap: 10,
  },
  addressLines: {
    gap: Spacing.space1,
    paddingLeft: Spacing.space8,
  },
  contactRow: {
    marginTop: Spacing.space1,
    paddingTop: Spacing.space3,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  contactCopy: {
    gap: Spacing.space1,
  },
  callButton: {
    width: '100%',
  },
});
