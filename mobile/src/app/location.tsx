import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
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
  ScreenHeader,
} from '@/components/recicla-ui';
import { Colors, Spacing } from '@/constants/theme';
import { parseCoordinates } from '@/utils/coordinates';

interface CepResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  location?: {
    coordinates?: {
      latitude?: string | number;
      longitude?: string | number;
    };
  };
}


export default function LocationScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [cep, setCep] = useState('');
  const [loadingGps, setLoadingGps] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openCenters(
    coordinates: { latitude: number; longitude: number },
    referenceLabel: string,
  ) {
    router.replace({
      pathname: '/(tabs)/centers',
      params: {
        latitude: String(coordinates.latitude),
        longitude: String(coordinates.longitude),
        referenceLabel,
        ...(params.q ? { q: params.q } : {}),
      },
    });
  }

  async function useCurrentLocation() {
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

      openCenters(
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        'Minha localização',
      );
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
      const response = await fetch(
        `https://brasilapi.com.br/api/cep/v2/${digits}`,
        { headers: { Accept: 'application/json' } },
      );

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? 'CEP não encontrado. Confira os números e tente novamente.'
            : 'O serviço de CEP está indisponível no momento.',
        );
      }

      const data = (await response.json()) as CepResponse;
      const coordinates = parseCoordinates(
        data.location?.coordinates?.latitude,
        data.location?.coordinates?.longitude,
      );

      if (!coordinates) {
        throw new Error(
          'Este CEP não possui coordenadas disponíveis. Para ordenar por proximidade, use a localização atual do aparelho.',
        );
      }

      const locationLabel = [
        data.neighborhood,
        data.city,
        data.state,
      ]
        .filter(Boolean)
        .join(' · ');

      openCenters(coordinates, locationLabel || `CEP ${digits}`);
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
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Definir localização"
          subtitle="Informe um CEP ou use a localização atual"
          onBack={() => router.back()}
        />

        <AppText size="subtitle" weight="bold" style={styles.heading}>
          Encontre centros próximos de você
        </AppText>
        <AppText color={Colors.light.textSecondary} size="small">
          Escolha uma forma de definir o ponto de referência para ordenar os resultados.
        </AppText>

        <AppCard style={styles.optionCard}>
          <AppText size="eyebrow" color={Colors.light.accent} weight="bold">
            OPÇÃO 1
          </AppText>
          <AppText weight="semibold">Usar localização atual</AppText>
          <AppText size="caption" color={Colors.light.textSecondary}>
            O aplicativo solicitará permissão para acessar a localização do aparelho.
          </AppText>
          <AppButton
            label="Usar localização atual"
            onPress={() => void useCurrentLocation()}
            loading={loadingGps}
            disabled={loadingCep}
          />
        </AppCard>

        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <AppText size="eyebrow" color={Colors.light.textSecondary} weight="bold">
            OU INFORME UM CEP
          </AppText>
          <View style={styles.separatorLine} />
        </View>

        <View style={styles.cepBlock}>
          <AppText size="small" weight="semibold">CEP de referência</AppText>
          <TextInput
            accessibilityLabel="CEP de referência"
            value={cep}
            onChangeText={(value) => setCep(value.replace(/\D/g, '').slice(0, 8))}
            placeholder="Ex.: 88130-000"
            placeholderTextColor={Colors.light.textSecondary}
            keyboardType="numeric"
            maxLength={8}
            returnKeyType="done"
            onSubmitEditing={() => void searchByCep()}
            style={styles.cepInput}
          />
          <AppText size="caption" color={Colors.light.textSecondary}>
            O CEP será usado como referência aproximada para a ordenação.
          </AppText>
          <AppButton
            label="Buscar centros próximos"
            variant="secondary"
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

        <AppCard style={styles.infoCard}>
          <AppText size="eyebrow" color={Colors.light.info} weight="bold">
            COMO FUNCIONA
          </AppText>
          <AppText size="small" color={Colors.light.info}>
            Os centros serão ordenados pela distância em linha reta entre o ponto de referência e as coordenadas cadastradas por cada centro.
          </AppText>
          <AppText size="caption" color={Colors.light.info}>
            A consulta por CEP depende da disponibilidade de coordenadas para o CEP informado. Fonte: BrasilAPI / OpenStreetMap.
          </AppText>
        </AppCard>
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
  heading: {
    marginTop: Spacing.two,
  },
  optionCard: {
    marginTop: Spacing.one,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  separatorLine: {
    height: 1,
    flex: 1,
    backgroundColor: Colors.light.border,
  },
  cepBlock: {
    gap: Spacing.two,
  },
  cepInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 11,
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.light.text,
  },
  infoCard: {
    backgroundColor: Colors.light.backgroundSelected,
    borderColor: Colors.light.backgroundSelected,
  },
});
