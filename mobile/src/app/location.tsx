import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
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
    setError(null);
    setLoadingGps(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setError(
          'A permissão de localização não foi concedida. Você ainda pode buscar pela opção de CEP.',
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
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
    } catch {
      setError(
        'Não foi possível obter a localização deste aparelho. Confira as permissões ou informe um CEP.',
      );
    } finally {
      setLoadingGps(false);
    }
  }

  async function searchByCep() {
    const digits = cep.replace(/\D/g, '');
    setError(null);

    if (digits.length !== 8) {
      setError('Informe um CEP com oito dígitos.');
      return;
    }

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
            disabled={loadingGps}
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
