import { useMemo, useState } from 'react';
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  Marker,
} from '@maplibre/maplibre-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/recicla-ui';
import { Colors, Elevation, Radius, Spacing } from '@/constants/theme';
import type { CenterProfile, Coordinates } from '@/types/api';

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

type CentersMapProps = {
  centers: CenterProfile[];
  reference: Coordinates | null;
  onSelectCenter: (id: number) => void;
};

type MapPoint = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

function isValidCoordinate(
  latitude: number | null,
  longitude: number | null,
): latitude is number {
  return (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function getCamera(points: Coordinates[]) {
  if (points.length === 0) {
    return { center: [0, 0] as [number, number], zoom: 1 };
  }

  const longitudes = points.map((point) => point.longitude);
  const latitudes = points.map((point) => point.latitude);
  const west = Math.min(...longitudes);
  const east = Math.max(...longitudes);
  const south = Math.min(...latitudes);
  const north = Math.max(...latitudes);
  const center: [number, number] = [
    (west + east) / 2,
    (south + north) / 2,
  ];
  const span = Math.max(east - west, north - south);

  if (points.length === 1 || span < 0.005) {
    return { center, zoom: 13 };
  }

  const zoom = Math.max(8, Math.min(14, Math.log2(360 / span) - 1));
  return { center, zoom };
}

export default function CentersMap({
  centers,
  reference,
  onSelectCenter,
}: CentersMapProps) {
  const [mapError, setMapError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [selection, setSelection] = useState<{
    centerSetKey: string;
    centerId: number;
  } | null>(null);

  const mapCenters = useMemo<MapPoint[]>(
    () =>
      centers.flatMap((center) => {
        const { latitude, longitude } = center.coordinates;
        if (!isValidCoordinate(latitude, longitude)) return [];

        return [
          {
            id: center.id,
            name: center.name,
            latitude,
            longitude: longitude as number,
          },
        ];
      }),
    [centers],
  );

  const centerSetKey = mapCenters.map((center) => center.id).join(':');
  const selectedCenterId =
    selection?.centerSetKey === centerSetKey ? selection.centerId : null;

  const referenceData = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: reference
        ? [
            {
              type: 'Feature' as const,
              geometry: {
                type: 'Point' as const,
                coordinates: [
                  reference.longitude,
                  reference.latitude,
                ] as [number, number],
              },
              properties: {},
            },
          ]
        : [],
    }),
    [reference],
  );

  const camera = useMemo(() => {
    const points: Coordinates[] = mapCenters.map((center) => ({
      latitude: center.latitude,
      longitude: center.longitude,
    }));
    if (reference) points.push(reference);
    return getCamera(points);
  }, [mapCenters, reference]);

  if (mapError) {
    return (
      <View style={styles.error}>
        <AppText weight="semibold">Não foi possível carregar o mapa.</AppText>
        <AppText size="small" color={Colors.light.textSecondary}>
          Confira sua conexão com a internet e tente novamente.
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setMapError(false);
            setRetryKey((current) => current + 1);
          }}
          style={styles.retryButton}>
          <AppText color={Colors.light.primary} weight="semibold">
            Tentar novamente
          </AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Map
        key={retryKey}
        style={styles.map}
        mapStyle={STYLE_URL}
        attribution
        logo
        compass={false}
        attributionPosition={{ bottom: 8, right: 8 }}
        onDidFailLoadingMap={() => setMapError(true)}>
        <Camera center={camera.center} zoom={camera.zoom} duration={500} />
        {mapCenters.map((center) => (
          <Marker
            key={center.id}
            id={`center-${center.id}`}
            lngLat={[center.longitude, center.latitude]}
            anchor="bottom"
            onPress={() => {
              if (selectedCenterId === center.id) {
                onSelectCenter(center.id);
                return;
              }

              setSelection({ centerSetKey, centerId: center.id });
            }}>
            <View style={styles.markerContent}>
              {selectedCenterId === center.id ? (
                <View style={styles.centerLabel}>
                  <AppText
                    size="small"
                    weight="semibold"
                    numberOfLines={2}
                    style={styles.centerName}>
                    {center.name}
                  </AppText>
                  <AppText size="caption" color={Colors.light.textSecondary}>
                    Toque para abrir detalhes
                  </AppText>
                </View>
              ) : null}
              <View style={styles.centerPin} />
            </View>
          </Marker>
        ))}
        <GeoJSONSource id="reference-location" data={referenceData}>
          <Layer
            id="reference-location-ring"
            type="circle"
            style={{
              circleRadius: 10,
              circleColor: Colors.light.info,
              circleStrokeColor: Colors.light.surface,
              circleStrokeWidth: 3,
            }}
          />
          <Layer
            id="reference-location-center"
            type="circle"
            style={{
              circleRadius: 3,
              circleColor: Colors.light.surface,
            }}
          />
        </GeoJSONSource>
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 460,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.backgroundCanvas,
  },
  map: {
    flex: 1,
  },
  markerContent: {
    alignItems: 'center',
  },
  centerLabel: {
    alignItems: 'center',
    maxWidth: 240,
    marginBottom: Spacing.space2,
    paddingHorizontal: Spacing.space3,
    paddingVertical: Spacing.space2,
    gap: Spacing.space1,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surface,
    ...Elevation.level1,
  },
  centerName: {
    textAlign: 'center',
  },
  centerPin: {
    width: 22,
    height: 22,
    borderWidth: 3,
    borderColor: Colors.light.surface,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.primary,
    ...Elevation.level1,
  },
  error: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.backgroundCanvas,
  },
  retryButton: {
    minHeight: 44,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
