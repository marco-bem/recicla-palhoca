import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Platform,
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
  ScreenHeader,
  TextField,
} from '@/components/recicla-ui';
import { useLocationReference } from '@/contexts/location-reference-context';
import { Colors, Layout, Radius, Spacing } from '@/constants/theme';
import { lookupCepReference } from '@/services/cep-lookup';
import type { LocationReference } from '@/types/location';

const LOCATION_TIMEOUT_MS = 20_000;
const LOCATION_TIMEOUT_ERROR = 'LOCATION_TIMEOUT';

function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(LOCATION_TIMEOUT_ERROR)),
      timeoutMs,
    );

    operation.then(
      (result) => {
        clearTimeout(timeout);
        resolve(result);
      },
      (reason: unknown) => {
        clearTimeout(timeout);
        reject(reason);
      },
    );
  });
}

function formatPostalCode(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length === 8
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : value;
}

export default function LocationScreen() {
  const params = useLocalSearchParams<{ q?: string; material?: string }>();
  const { setLocationReference } = useLocationReference();
  const [cep, setCep] = useState('');
  const [loadingGps, setLoadingGps] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gpsRequestId = useRef(0);

  function openCenters(reference: LocationReference) {
    setLocationReference(reference);

    router.replace({
      pathname: '/(tabs)/centers',
      params: {
        latitude: String(reference.coordinates.latitude),
        longitude: String(reference.coordinates.longitude),
        referenceLabel: reference.label,
        ...(params.q ? { q: params.q } : {}),
        ...(params.material ? { material: params.material } : {}),
      },
    });
  }

  async function requestCurrentLocation() {
    const requestId = ++gpsRequestId.current;
    setError(null);
    setLoadingGps(true);

    try {
      const permission = await withTimeout(
        Location.requestForegroundPermissionsAsync(),
        LOCATION_TIMEOUT_MS,
      );
      if (requestId !== gpsRequestId.current) return;

      if (permission.status !== 'granted') {
        setError(
          'A permissão de localização não foi concedida. Você ainda pode buscar pela opção de CEP.',
        );
        return;
      }

      const position = await withTimeout(
        Location.getCurrentPositionAsync({
          accuracy: Platform.OS === 'android' ? Location.Accuracy.High : Location.Accuracy.Balanced,
          // GPS works without requiring Google's network-assisted location on Android.
          mayShowUserSettingsDialog: false,
        }),
        LOCATION_TIMEOUT_MS,
      );
      if (requestId !== gpsRequestId.current) return;

      const coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      openCenters({
        coordinates,
        source: 'gps',
        label: 'Minha localização',
        address: null,
      });
    } catch (reason) {
      if (requestId === gpsRequestId.current) {
        setError(
          reason instanceof Error && reason.message === LOCATION_TIMEOUT_ERROR
            ? 'A localização demorou para responder. Confira o GPS ou informe um CEP.'
            : 'Não foi possível obter a localização deste aparelho. Confira as permissões ou informe um CEP.',
        );
      }
    } finally {
      if (requestId === gpsRequestId.current) setLoadingGps(false);
    }
  }

  async function searchByCep() {
    const digits = cep.replace(/\D/g, '');
    setError(null);

    if (digits.length !== 8) {
      setError('Informe um CEP com oito dígitos.');
      return;
    }

    // A busca por CEP substitui uma tentativa de GPS que ainda esteja pendente.
    gpsRequestId.current += 1;
    setLoadingGps(false);
    setLoadingCep(true);

    try {
      const result = await lookupCepReference(digits);
      const { coordinates, address } = result;

      if (!coordinates) {
        throw new Error(
          'Este CEP não possui coordenadas disponíveis. O endereço foi localizado, mas use o GPS para ordenar por proximidade.',
        );
      }

      const label = address.street
        ? `CEP ${formatPostalCode(address.postalCode ?? digits)}`
        : `CEP ${formatPostalCode(digits)}`;

      openCenters({
        coordinates,
        source: 'cep',
        label,
        address,
      });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Não foi possível consultar este CEP.',
      );
    } finally {
      setLoadingCep(false);
    }
  }

  return (
    <AppScreen backgroundColor={Colors.light.surface}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Definir localização"
          subtitle="Escolha como informar seu ponto de referência."
          onBack={() => router.back()}
        />

        <AppText size="subtitle" weight="bold" style={styles.heading}>
          Encontre centros perto de você
        </AppText>
        <AppText color={Colors.light.textSecondary} size="small">
          Sua localização será usada para ordenar os resultados pela proximidade.
        </AppText>

        <AppCard style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <View style={styles.locationIcon}><AppIcon name="map-pin" color={Colors.light.primary} /></View>
            <View style={styles.optionCopy}>
              <AppText size="h3" weight="semibold">Usar localização atual</AppText>
              <AppText size="body" color={Colors.light.textSecondary}>
                Use o GPS do aparelho para encontrar centros próximos.
              </AppText>
            </View>
          </View>
          <AppButton
            label="Usar localização atual"
            onPress={() => void requestCurrentLocation()}
            loading={loadingGps}
            disabled={loadingCep}
          />
        </AppCard>

        <View style={styles.separator}>
          <AppText size="caption" color={Colors.light.textSecondary}>
            OU INFORME UM CEP
          </AppText>
        </View>

        <View style={styles.cepBlock}>
          <AppText size="small" weight="semibold">CEP de referência</AppText>
          <TextField
            accessibilityLabel="CEP de referência"
            value={cep}
            onChangeText={(value) => setCep(value.replace(/\D/g, '').slice(0, 8))}
            placeholder="Ex.: 88130-000"
            keyboardType="numeric"
            maxLength={8}
            returnKeyType="done"
            onSubmitEditing={() => void searchByCep()}
          />
          <AppText size="caption" color={Colors.light.textSecondary}>
            O CEP será usado como referência aproximada para a ordenação.
          </AppText>
          <AppButton
            label="Buscar centros próximos"
            onPress={() => void searchByCep()}
            loading={loadingCep}
          />
        </View>

        {error ? (
          <FeedbackCard
            title="Não foi possível definir a localização"
            description={error}
          />
        ) : null}

      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Layout.screenHorizontalInset,
    paddingTop: Layout.screenTopInset,
    paddingBottom: Spacing.space16,
    gap: Spacing.space4,
  },
  heading: {
    marginTop: Spacing.space2,
  },
  optionCard: {
    marginTop: Spacing.space1,
  },
  optionHeader: { flexDirection: 'row', gap: Spacing.space3, marginBottom: Spacing.space3 },
  optionCopy: { flex: 1, gap: Spacing.space1 },
  locationIcon: { width: 48, height: 48, borderRadius: Radius.md, backgroundColor: Colors.light.backgroundSuccess, alignItems: 'center', justifyContent: 'center' },
  separator: { alignItems: 'center' },
  cepBlock: {
    gap: Spacing.space2,
  },

});
