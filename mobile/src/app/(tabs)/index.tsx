import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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
  FilterChip,
  FeedbackCard,
} from '@/components/recicla-ui';
import { Colors, Spacing } from '@/constants/theme';
import { listCenters, listMaterials } from '@/services/api';
import type { CenterProfile, Material } from '@/types/api';

function centerAddress(center: CenterProfile): string {
  return [center.address.neighborhood, center.address.city, center.address.state]
    .filter(Boolean)
    .join(' · ');
}

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [centers, setCenters] = useState<CenterProfile[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadHomeData() {
      setLoading(true);
      setLoadError(null);

      const [centersResult, materialsResult] = await Promise.allSettled([
        listCenters(),
        listMaterials(),
      ]);

      if (!active) return;

      if (centersResult.status === 'fulfilled') {
        setCenters(centersResult.value);
      } else {
        setLoadError(
          centersResult.reason instanceof Error
            ? centersResult.reason.message
            : 'Não foi possível consultar os centros.',
        );
      }

      if (materialsResult.status === 'fulfilled') {
        setMaterials(materialsResult.value);
      }

      setLoading(false);
    }

    void loadHomeData();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  function openCenters(material?: string) {
    const trimmedQuery = query.trim();
    router.push({
      pathname: '/(tabs)/centers',
      params: {
        ...(trimmedQuery ? { q: trimmedQuery } : {}),
        ...(material ? { material } : {}),
      },
    });
  }

  return (
    <AppScreen>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <AppText color="#FFFFFF" size="subtitle" weight="bold">R</AppText>
          </View>
          <AppText size="subtitle" weight="bold">ReciclaPalhoça</AppText>
        </View>

        <AppText size="eyebrow" color={Colors.light.accent} weight="bold" style={styles.eyebrow}>
          RECICLAGEM NA SUA REGIÃO
        </AppText>
        <AppText size="title" weight="bold" style={styles.heroTitle}>
          Reciclar pode ser{ '\n' }mais simples.
        </AppText>
        <AppText color={Colors.light.textSecondary} size="body" style={styles.heroCopy}>
          Encontre destinos para seus materiais e descubra quais centros oferecem coleta.
        </AppText>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/location')}
          style={styles.locationPressable}>
          <AppCard style={styles.locationCard}>
            <View style={styles.locationIcon}>
              <AppText color={Colors.light.accent} size="subtitle" weight="bold">⌖</AppText>
            </View>
            <View style={styles.locationText}>
              <AppText weight="semibold">Sua localização</AppText>
              <AppText color={Colors.light.textSecondary} size="caption">
                Endereço/CEP ou localização atual
              </AppText>
            </View>
            <View style={styles.locationAction}>
              <AppText color={Colors.light.primary} size="caption" weight="semibold">
                Definir
              </AppText>
            </View>
          </AppCard>
        </Pressable>

        <View style={styles.searchBlock}>
          <AppText size="small" weight="semibold">O que você procura?</AppText>
          <TextInput
            accessibilityLabel="Buscar centros por nome ou bairro"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => openCenters()}
            placeholder="Buscar por centro ou bairro"
            placeholderTextColor={Colors.light.textSecondary}
            returnKeyType="search"
            style={styles.searchInput}
          />
          <AppButton label="Encontrar centros" onPress={() => openCenters()} />
        </View>

        {materials.length > 0 ? (
          <View style={styles.materialSection}>
            <AppText size="small" weight="semibold">Buscar por material</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {materials.slice(0, 8).map((material) => (
                <FilterChip
                  key={material.id}
                  label={material.name}
                  onPress={() => openCenters(material.slug)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <AppText size="subtitle" weight="bold">Centros em destaque</AppText>
          <Pressable accessibilityRole="button" onPress={() => openCenters()}>
            <AppText color={Colors.light.accent} weight="semibold" size="small">
              Ver todos →
            </AppText>
          </Pressable>
        </View>

        {loading ? (
          <AppCard style={styles.loadingCard}>
            <ActivityIndicator color={Colors.light.accent} />
            <AppText size="small" color={Colors.light.textSecondary}>
              Consultando centros disponíveis...
            </AppText>
          </AppCard>
        ) : loadError ? (
          <FeedbackCard
            title="Não foi possível carregar os centros"
            description={loadError}
            actionLabel="Tentar novamente"
            onAction={() => setRefreshKey((current) => current + 1)}
          />
        ) : centers.length === 0 ? (
          <FeedbackCard
            title="Nenhum centro disponível para consulta"
            description="Quando houver centros ativos com dados de atendimento e materiais cadastrados, eles aparecerão aqui."
            actionLabel="Consultar centros"
            onAction={() => openCenters()}
          />
        ) : (
          <View style={styles.featuredList}>
            {centers.slice(0, 2).map((center) => (
              <Pressable
                key={center.id}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/center/[id]',
                    params: { id: String(center.id) },
                  })
                }>
                <AppCard style={styles.featuredCard}>
                  <AppText size="eyebrow" color={Colors.light.accent} weight="bold">
                    CENTRO DE RECICLAGEM
                  </AppText>
                  <AppText weight="semibold">{center.name}</AppText>
                  <AppText size="caption" color={Colors.light.textSecondary}>
                    {center.materials.map((material) => material.name).join(' · ')}
                  </AppText>
                  <View style={styles.featuredFooter}>
                    <AppText size="caption" color={Colors.light.textSecondary}>
                      {centerAddress(center)}
                    </AppText>
                    <AppText size="caption" color={Colors.light.primary} weight="semibold">
                      Ver detalhes →
                    </AppText>
                  </View>
                </AppCard>
              </Pressable>
            ))}
          </View>
        )}

        <AppText size="caption" color={Colors.light.textSecondary} style={styles.footerNote}>
          Informações exibidas conforme os cadastros públicos dos centros.
        </AppText>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    marginTop: Spacing.two,
  },
  heroTitle: {
    marginTop: -Spacing.two,
  },
  heroCopy: {
    marginTop: -Spacing.two,
  },
  locationPressable: {
    marginTop: Spacing.one,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  locationIcon: {
    width: 32,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {
    flex: 1,
    gap: 3,
  },
  locationAction: {
    backgroundColor: Colors.light.backgroundSelected,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchBlock: {
    gap: Spacing.two,
  },
  searchInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 14,
    color: Colors.light.text,
    fontSize: 14,
  },
  materialSection: {
    gap: Spacing.two,
  },
  chipsRow: {
    gap: 8,
    paddingRight: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredList: {
    gap: Spacing.two,
  },
  featuredCard: {
    gap: 6,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  footerNote: {
    textAlign: 'center',
    marginTop: Spacing.two,
  },
});
