import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AppIcon, BrandMark } from '@/components/app-icons';
import {
  AppCard,
  AppScreen,
  AppText,
  CenterCard,
  FeedbackCard,
  LocationSummary,
  MaterialChip,
  TextField,
} from '@/components/recicla-ui';
import { Colors, Layout, Radius, Spacing } from '@/constants/theme';
import { listCenters, listMaterials } from '@/services/api';
import type { CenterProfile, Material } from '@/types/api';

type MaterialCategory = keyof typeof Colors.light.category;

function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function materialCategory(material: Material): MaterialCategory | undefined {
  const value = normalizeSearch(`${material.slug} ${material.name}`);

  if (/papel|paper/.test(value)) return 'paper';
  if (/plastic/.test(value)) return 'plastic';
  if (/vidro|glass/.test(value)) return 'glass';
  if (/metal/.test(value)) return 'metal';
  if (/lamp|eletron|bateria|pilha/.test(value)) return 'electronics';
  if (/organ|oleo/.test(value)) return 'organic';

  return undefined;
}

function centerServiceLabel(center: CenterProfile): string | undefined {
  if (center.services.offersPickup) return 'Coleta disponível';
  if (center.services.acceptsDropoff) return 'Recebe entrega no local';
  return undefined;
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

  function openCenters(materialSlug?: string) {
    const trimmedQuery = query.trim();
    const normalizedQuery = normalizeSearch(trimmedQuery);
    const matchingMaterial = materialSlug || !normalizedQuery
      ? undefined
      : materials.find((material) =>
          normalizeSearch(material.name).includes(normalizedQuery) ||
          normalizeSearch(material.slug).includes(normalizedQuery),
        );
    const selectedMaterial = materialSlug ?? matchingMaterial?.slug;

    router.push({
      pathname: '/(tabs)/centers',
      params: {
        ...(trimmedQuery && !matchingMaterial && !materialSlug
          ? { q: trimmedQuery }
          : {}),
        ...(selectedMaterial ? { material: selectedMaterial } : {}),
      },
    });
  }

  return (
    <AppScreen backgroundColor={Colors.light.surface}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <BrandMark size={28} />
          </View>
          <AppText size="h3" weight="semibold">ReciclaPalhoça</AppText>
        </View>

        <AppCard style={styles.heroCard}>
          <View style={styles.heroMark}>
            <BrandMark size={44} color={Colors.light.primary} />
          </View>
          <AppText
            size="caption"
            color={Colors.light.highlight}
            weight="semibold"
            style={styles.heroEyebrow}>
            RECICLAGEM NA SUA REGIÃO
          </AppText>
          <AppText size="h1" color={Colors.light.textOnPrimary} weight="bold" style={styles.heroTitle}>
            Reciclar fica{ '\n' }mais fácil.
          </AppText>
          <AppText size="small" color={Colors.light.textOnPrimary} style={styles.heroCopy}>
            Encontre pontos para entregar materiais ou solicitar coleta.
          </AppText>
        </AppCard>

        <LocationSummary
          title="Defina sua localização"
          description="CEP, endereço ou GPS"
          onPress={() => router.push('/location')}
        />

        <View style={styles.searchBlock}>
          <AppText size="label" weight="medium">O que você quer reciclar?</AppText>
          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por material ou centro"
            accessibilityLabel="Buscar por material ou centro"
            leadingIcon={<AppIcon name="search" size={20} color={Colors.light.textSecondary} />}
            returnKeyType="search"
            onSubmitEditing={() => openCenters()}
          />
        </View>

        {materials.length > 0 ? (
          <View style={styles.materialSection}>
            <AppText size="h3" weight="semibold">Explore por material</AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}>
              {materials.slice(0, 4).map((material) => (
                <MaterialChip
                  key={material.id}
                  label={material.name}
                  category={materialCategory(material)}
                  onPress={() => openCenters(material.slug)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <AppText size="h3" weight="semibold">Centros disponíveis</AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver todos os centros"
            onPress={() => openCenters()}
            style={styles.seeAll}>
            <AppText color={Colors.light.primary} weight="medium" size="label">
              Ver todos
            </AppText>
            <AppIcon name="chevron-right" size={16} color={Colors.light.primary} />
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
            state="error"
          />
        ) : centers.length === 0 ? (
          <FeedbackCard
            title="Nenhum centro disponível para consulta"
            description="Quando houver centros ativos com dados de atendimento e materiais cadastrados, eles aparecerão aqui."
            actionLabel="Consultar centros"
            onAction={() => openCenters()}
            state="empty"
          />
        ) : (
          <View style={styles.featuredList}>
            {centers.slice(0, 1).map((center) => (
              <CenterCard
                key={center.id}
                name={center.name}
                materials={center.materials.map((material) => material.name).join(' · ')}
                serviceLabel={centerServiceLabel(center)}
                eyebrow="CENTRO DE RECICLAGEM"
                layout="compact"
                accentColor={Colors.light.coral}
                onPress={() =>
                  router.push({
                    pathname: '/center/[id]',
                    params: { id: String(center.id) },
                  })
                }
              />
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
    paddingHorizontal: Layout.screenHorizontalInset,
    paddingTop: 36,
    paddingBottom: Spacing.space6,
    gap: 18,
  },
  brandRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    minHeight: 190,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    borderRadius: Radius.xl,
    padding: Layout.cardInset,
    gap: 0,
  },
  heroMark: {
    position: 'absolute',
    top: 18,
    right: 20,
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.eco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEyebrow: {
    marginBottom: 10,
  },
  heroTitle: {
    maxWidth: 225,
  },
  heroCopy: {
    maxWidth: 225,
    marginTop: 8,
  },
  searchBlock: {
    gap: Spacing.space2,
  },
  materialSection: {
    gap: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.space2,
    paddingRight: Spacing.space3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredList: {
    gap: Spacing.space3,
  },
  footerNote: {
    marginTop: 0,
  },
});
