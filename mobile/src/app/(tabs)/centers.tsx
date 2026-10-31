import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
  FeedbackCard,
  FilterChip,
  ScreenHeader,
} from '@/components/recicla-ui';
import { Colors, Spacing } from '@/constants/theme';
import { useLocationReference } from '@/contexts/location-reference-context';
import { listCenters, listMaterials } from '@/services/api';
import { reverseGeocodeCoordinates } from '@/services/reverse-geocoding';
import { distanceKm, formatDistance, sortCentersByDistance } from '@/utils/distance';
import type { CenterProfile, Coordinates, Material } from '@/types/api';
import type { LocationAddress } from '@/types/location';

function readParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function formatPostalCode(value?: string): string | null {
  if (!value) return null;
  const digits = value.replace(/\\D/g, '');
  return digits.length === 8
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : value;
}

function centerAddress(center: CenterProfile): string {
  return [
    center.address.street,
    center.address.streetNumber,
    center.address.neighborhood,
    `${center.address.city}/${center.address.state}`,
  ]
    .filter(Boolean)
    .join(', ');
}

type CentersRouteParams = {
  q?: string;
  material?: string;
  latitude?: string;
  longitude?: string;
  referenceLabel?: string;
}

export default function CentersScreen() {
  const params = useLocalSearchParams<'/(tabs)/centers', CentersRouteParams>();
  const initialQuery = readParam(params.q);
  const initialMaterial = readParam(params.material);

  return (
    <CentersScreenContent
      key={`${initialQuery}|${initialMaterial}`}
      initialQuery={initialQuery}
      initialMaterial={initialMaterial}
    />
  );
}

function CentersScreenContent({
  initialQuery,
  initialMaterial,
}: {
  initialQuery: string;
  initialMaterial: string;
}) {
  const params = useLocalSearchParams<'/(tabs)/centers', CentersRouteParams>();
  const { locationReference, setLocationReference } = useLocationReference();
  const [query, setQuery] = useState(initialQuery);
  const [appliedQuery, setAppliedQuery] = useState(initialQuery);
  const [selectedMaterial, setSelectedMaterial] = useState(initialMaterial);
  const [offersPickup, setOffersPickup] = useState(false);
  const [centers, setCenters] = useState<CenterProfile[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const latitudeValue = readParam(params.latitude);
  const longitudeValue = readParam(params.longitude);
  const latitude = latitudeValue ? Number(latitudeValue) : Number.NaN;
  const longitude = longitudeValue ? Number(longitudeValue) : Number.NaN;
  const reference = useMemo<Coordinates | null>(() => {
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return null;
    }
    return { latitude, longitude };
  }, [latitude, longitude]);
  const referenceLabel = readParam(params.referenceLabel);
  const hasMatchingLocationReference = Boolean(
    reference &&
      locationReference &&
      Math.abs(locationReference.coordinates.latitude - reference.latitude) < 0.0000001 &&
      Math.abs(locationReference.coordinates.longitude - reference.longitude) < 0.0000001,
  );
  const referenceAddress: LocationAddress | null = hasMatchingLocationReference
    ? locationReference?.address ?? null
    : null;
  const streetLine = [
    referenceAddress?.street ?? referenceAddress?.placeName,
    referenceAddress?.streetNumber,
  ]
    .filter(Boolean)
    .join(', ');
  const cityLine = [referenceAddress?.city, referenceAddress?.state]
    .filter(Boolean)
    .join('/');
  const neighborhoodLine = [referenceAddress?.neighborhood, cityLine]
    .filter(Boolean)
    .join(' · ');
  const postalCode = formatPostalCode(referenceAddress?.postalCode);

  useEffect(() => {
    if (!reference || hasMatchingLocationReference) return;

    let active = true;
    void reverseGeocodeCoordinates(reference)
      .then((address) => {
        if (active) {
          setLocationReference({
            coordinates: reference,
            source: 'gps',
            label: referenceLabel || 'Localização definida',
            address,
          });
        }
      })
      .catch(() => {
        if (active) {
          setLocationReference({
            coordinates: reference,
            source: 'gps',
            label: referenceLabel || 'Localização definida',
            address: null,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [
    reference,
    hasMatchingLocationReference,
    referenceLabel,
    setLocationReference,
  ]);

  useEffect(() => {
    let active = true;

    listMaterials()
      .then((data) => {
        if (active) setMaterials(data);
      })
      .catch(() => {
        if (active) setMaterials([]);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadCenters() {
      setLoading(true);
      setError(null);

      try {
        const data = await listCenters({
          q: appliedQuery,
          material: selectedMaterial || undefined,
          offersPickup: offersPickup ? true : undefined,
        });
        if (active) setCenters(data);
      } catch (reason) {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : 'Não foi possível consultar os centros.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCenters();

    return () => {
      active = false;
    };
  }, [appliedQuery, selectedMaterial, offersPickup, refreshKey]);

  const sortedCenters = useMemo(
    () => sortCentersByDistance(centers, reference),
    [centers, reference],
  );

  function openLocation() {
    router.push({
      pathname: '/location',
      params: {
        ...(appliedQuery ? { q: appliedQuery } : {}),
        ...(selectedMaterial ? { material: selectedMaterial } : {}),
      },
    });
  }

  return (
    <AppScreen>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title={reference ? 'Centros próximos' : 'Centros disponíveis'}
          subtitle={reference ? 'Ordenados pela distância aproximada' : 'Consulte os centros disponíveis'}
          onBack={() => router.back()}
        />

        <Pressable accessibilityRole="button" onPress={openLocation}>
          <AppCard style={styles.locationCard}>
            <View style={styles.locationText}>
              <AppText size="eyebrow" color={Colors.light.accent} weight="bold">
                PONTO DE REFERÊNCIA
              </AppText>
              <AppText weight="semibold">
                {reference
                  ? streetLine || referenceLabel || 'Localização definida'
                  : 'Defina sua localização'}
              </AppText>
              <AppText size="caption" color={Colors.light.textSecondary}>
                {reference
                  ? neighborhoodLine || 'Endereço não identificado; distância calculada pelas coordenadas'
                  : 'Use o GPS ou informe um CEP para ordenar por proximidade'}
              </AppText>
              {reference && postalCode ? (
                <AppText size="caption" color={Colors.light.textSecondary}>
                  CEP {postalCode}
                </AppText>
              ) : null}
            </View>
            <AppText size="small" color={Colors.light.primary} weight="semibold">
              {reference ? 'Alterar' : 'Definir'}
            </AppText>
          </AppCard>
        </Pressable>

        <View style={styles.searchRow}>
          <TextInput
            accessibilityLabel="Buscar centros por nome ou bairro"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => setAppliedQuery(query.trim())}
            placeholder="Buscar por nome ou bairro"
            placeholderTextColor={Colors.light.textSecondary}
            returnKeyType="search"
            style={styles.searchInput}
          />
          <AppButton
            label="Buscar"
            onPress={() => setAppliedQuery(query.trim())}
            style={styles.searchButton}
          />
        </View>

        <View style={styles.filterSection}>
          <AppText size="small" weight="semibold">Filtrar por</AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}>
            <FilterChip
              label="Próximos"
              selected={Boolean(reference)}
              onPress={openLocation}
            />
            <FilterChip
              label="Todos os materiais"
              selected={!selectedMaterial}
              onPress={() => setSelectedMaterial('')}
            />
            {materials.map((material) => (
              <FilterChip
                key={material.id}
                label={material.name}
                selected={selectedMaterial === material.slug}
                onPress={() =>
                  setSelectedMaterial((current) =>
                    current === material.slug ? '' : material.slug,
                  )
                }
              />
            ))}
            <FilterChip
              label="Com coleta"
              selected={offersPickup}
              onPress={() => setOffersPickup((current) => !current)}
            />
          </ScrollView>
        </View>

        <View style={styles.resultsHeader}>
          <AppText weight="bold">
            {loading ? 'Consultando centros...' : `${sortedCenters.length} ${sortedCenters.length === 1 ? 'centro encontrado' : 'centros encontrados'}`}
          </AppText>
          {reference ? (
            <AppText size="caption" color={Colors.light.textSecondary}>
              Distância em linha reta
            </AppText>
          ) : null}
        </View>

        {loading ? (
          <AppCard style={styles.loadingCard}>
            <ActivityIndicator color={Colors.light.accent} />
            <AppText size="small" color={Colors.light.textSecondary}>
              Carregando resultados da API...
            </AppText>
          </AppCard>
        ) : error ? (
          <FeedbackCard
            title="Não foi possível consultar os centros"
            description={error}
            actionLabel="Tentar novamente"
            onAction={() => setRefreshKey((current) => current + 1)}
          />
        ) : sortedCenters.length === 0 ? (
          <FeedbackCard
            title="Nenhum centro encontrado"
            description="Ajuste a busca ou os filtros. A consulta apresenta somente centros públicos cadastrados e disponíveis na API."
            actionLabel="Limpar filtros"
            onAction={() => {
              setQuery('');
              setAppliedQuery('');
              setSelectedMaterial('');
              setOffersPickup(false);
            }}
          />
        ) : (
          <View style={styles.resultsList}>
            {sortedCenters.map((center) => {
              const hasCoordinates =
                center.coordinates.latitude !== null &&
                center.coordinates.longitude !== null;
              const distance =
                reference && hasCoordinates
                  ? formatDistance(
                      distanceKm(reference, {
                        latitude: center.coordinates.latitude as number,
                        longitude: center.coordinates.longitude as number,
                      }),
                    )
                  : null;

              return (
                <Pressable
                  key={center.id}
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({
                      pathname: '/center/[id]',
                      params: { id: String(center.id) },
                    })
                  }>
                  <AppCard style={styles.resultCard}>
                    <AppText size="eyebrow" color={Colors.light.accent} weight="semibold">
                      CENTRO DE RECICLAGEM
                    </AppText>
                    <AppText size="body" weight="semibold">
                      {center.name}
                    </AppText>
                    <AppText size="caption" color={Colors.light.textSecondary}>
                      {center.materials.map((material) => material.name).join(' · ')}
                    </AppText>
                    <View style={styles.resultFooter}>
                      <View style={styles.resultDescription}>
                        {distance ? (
                          <AppText size="small" color={Colors.light.accent} weight="semibold">
                            {distance}
                          </AppText>
                        ) : null}
                        <AppText size="caption" color={Colors.light.textSecondary}>
                          {center.services.offersPickup
                            ? 'Coleta disponível'
                            : center.services.acceptsDropoff
                              ? 'Recebe entrega no local'
                              : centerAddress(center)}
                        </AppText>
                      </View>
                      <View style={styles.detailsButton}>
                        <AppText size="caption" color={Colors.light.primary} weight="semibold">
                          Ver detalhes →
                        </AppText>
                      </View>
                    </View>
                  </AppCard>
                </Pressable>
              );
            })}
          </View>
        )}
        <AppText size="caption" color={Colors.light.textSecondary} style={styles.disclaimer}>
          A distância é uma estimativa em linha reta e não representa trajeto por ruas.
        </AppText>
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
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    padding: 14,
  },
  locationText: {
    flex: 1,
    gap: 3,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 12,
    fontSize: 13,
    color: Colors.light.text,
  },
  searchButton: {
    minHeight: 46,
    paddingHorizontal: 14,
  },
  filterSection: {
    gap: Spacing.two,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 12,
  },
  resultsHeader: {
    gap: 4,
    marginTop: Spacing.one,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsList: {
    gap: Spacing.two,
  },
  resultCard: {
    gap: 7,
  },
  resultFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  resultDescription: {
    flex: 1,
    gap: 2,
  },
  detailsButton: {
    backgroundColor: Colors.light.backgroundSelected,
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  disclaimer: {
    textAlign: 'center',
    marginTop: Spacing.one,
  },
});
