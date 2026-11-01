import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AppIcon } from '@/components/app-icons';
import {
  AppCard,
  AppScreen,
  AppText,
  CenterCard,
  FeedbackCard,
  FilterChip,
  LocationSummary,
  ScreenHeader,
  TextField,
} from '@/components/recicla-ui';
import { Colors, Layout, Spacing } from '@/constants/theme';
import { useLocationReference } from '@/contexts/location-reference-context';
import { listCenters, listMaterials } from '@/services/api';
import { lookupCepReference } from '@/services/cep-lookup';
import { reverseGeocodeCoordinates } from '@/services/reverse-geocoding';
import { distanceKm, formatDistance, sortCentersByDistance } from '@/utils/distance';
import type { CenterProfile, Coordinates, Material } from '@/types/api';
import type { LocationAddress } from '@/types/location';

function readParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
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

function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function centerService(center: CenterProfile): string {
  if (center.services.offersPickup) return 'Coleta disponível';
  if (center.services.acceptsDropoff) return 'Recebe entrega no local';
  return centerAddress(center);
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
  const hasMatchingLocationAddress = Boolean(
    referenceAddress && Object.values(referenceAddress).some(Boolean),
  );
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

  useEffect(() => {
    if (!reference || hasMatchingLocationAddress) return;

    let active = true;
    const cepFromLabel = /^CEP\s+([\d-]+)$/i.exec(referenceLabel)?.[1];
    const cepDigits = cepFromLabel?.replace(/\D/g, '');
    const validCep = cepDigits?.length === 8 ? cepDigits : null;
    const source = validCep ? 'cep' : 'gps';
    const addressRequest = validCep
      ? lookupCepReference(validCep).then((result) => result.address)
      : reverseGeocodeCoordinates(reference);

    void addressRequest
      .then((address) => {
        if (active) {
          setLocationReference({
            coordinates: reference,
            source,
            label: referenceLabel || 'Localização definida',
            address,
          });
        }
      })
      .catch(() => {
        if (active) {
          setLocationReference({
            coordinates: reference,
            source,
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
    hasMatchingLocationAddress,
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

  function applySearch(value = query) {
    const trimmed = value.trim();
    const normalized = normalizeSearch(trimmed);
    const matchingMaterial = normalized.length >= 3
      ? materials.find((material) =>
          normalizeSearch(material.name).includes(normalized) ||
          normalizeSearch(material.slug).includes(normalized),
        )
      : undefined;

    setSelectedMaterial(matchingMaterial?.slug ?? '');
    setAppliedQuery(matchingMaterial ? '' : trimmed);
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

        <LocationSummary
          title={reference ? 'Sua localização' : 'Defina sua localização'}
          description={
            reference
              ? neighborhoodLine || streetLine || referenceLabel || 'Localização definida'
              : 'Use GPS ou informe um CEP para ordenar por proximidade'
          }
          onPress={openLocation}
          style={styles.locationSummary}
        />

        <TextField
          label="Buscar centros"
          value={query}
          onChangeText={setQuery}
          placeholder="Nome, bairro ou material"
          accessibilityLabel="Buscar centros por nome, bairro ou material"
          leadingIcon={<AppIcon name="search" size={20} color={Colors.light.textSecondary} />}
          returnKeyType="search"
          onSubmitEditing={() => applySearch()}
          style={styles.searchField}
        />

        <View style={styles.filterSection}>
          <AppText size="label" weight="medium">Filtrar resultados</AppText>
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
              label="Com coleta"
              selected={offersPickup}
              onPress={() => setOffersPickup((current) => !current)}
            />
            <FilterChip
              label="Todos"
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
          </ScrollView>
        </View>

        <View style={styles.resultsHeader}>
          <AppText size="h3" weight="semibold">
            {loading ? 'Consultando centros...' : `${sortedCenters.length} ${sortedCenters.length === 1 ? 'centro encontrado' : 'centros encontrados'}`}
          </AppText>
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

              const service = centerService(center);
              const metadata = [distance, service].filter(Boolean).join(' · ');

              return (
                <CenterCard
                  key={center.id}
                  name={center.name}
                  materials={center.materials.map((material) => material.name).join(' · ')}
                  distance={metadata}
                  eyebrow="CENTRO DE RECICLAGEM"
                  style={styles.resultCard}
                  onPress={() =>
                    router.push({
                      pathname: '/center/[id]',
                      params: { id: String(center.id) },
                    })
                  }
                />
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
    paddingHorizontal: Layout.screenHorizontalInset,
    paddingTop: Layout.screenTopInset,
    paddingBottom: Spacing.space6,
    gap: Spacing.space4,
  },
  locationSummary: {
    backgroundColor: Colors.light.backgroundSuccess,
    borderColor: Colors.light.backgroundSuccess,
  },
  searchField: {
    gap: Spacing.space2,
  },
  filterSection: {
    gap: Spacing.space3,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: Spacing.space3,
  },
  resultsHeader: {
    marginTop: 2,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsList: {
    gap: Spacing.space3,
  },
  resultCard: {
    minHeight: 154,
  },
  disclaimer: {
    marginTop: 0,
  },
});
