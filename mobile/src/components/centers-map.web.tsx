import { useEffect, useMemo, useRef, useState } from 'react';
import { createElement, type CSSProperties } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/recicla-ui';
import { Colors, Radius } from '@/constants/theme';
import type { CenterProfile, Coordinates } from '@/types/api';

const APP_CHANNEL = 'recicla-palhoca-app';
const MAP_CHANNEL = 'recicla-palhoca-map';

type CentersMapProps = {
  centers: CenterProfile[];
  reference: Coordinates | null;
  onSelectCenter: (id: number) => void;
};

type MapMessage = {
  channel?: unknown;
  type?: unknown;
  id?: unknown;
  message?: unknown;
};

function hasValidCoordinates(
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

export default function CentersMap({
  centers,
  reference,
  onSelectCenter,
}: CentersMapProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [frameLoaded, setFrameLoaded] = useState(false);

  const mapCenters = useMemo(
    () =>
      centers.flatMap((center) => {
        const { latitude, longitude } = center.coordinates;
        if (!hasValidCoordinates(latitude, longitude)) return [];

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

  useEffect(() => {
    function handleMessage(event: MessageEvent<MapMessage>) {
      const frame = iframeRef.current;
      if (
        !frame ||
        event.source !== frame.contentWindow ||
        event.origin !== window.location.origin
      ) {
        return;
      }

      const message = event.data;
      if (message?.channel !== MAP_CHANNEL) return;

      if (message.type === 'ready') {
        setMapReady(true);
        setMapError(false);
      } else if (message.type === 'error') {
        setMapError(true);
      } else if (
        message.type === 'center-selected' &&
        typeof message.id === 'number' &&
        Number.isSafeInteger(message.id)
      ) {
        onSelectCenter(message.id);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSelectCenter]);

  useEffect(() => {
    if (!mapReady) return;

    iframeRef.current?.contentWindow?.postMessage(
      {
        channel: APP_CHANNEL,
        type: 'map-update',
        payload: {
          centers: mapCenters,
          reference,
        },
      },
      window.location.origin,
    );
  }, [mapCenters, mapReady, reference]);

  useEffect(() => {
    if (!frameLoaded || mapReady || mapError) return;

    const timeout = window.setTimeout(() => setMapError(true), 20000);
    return () => window.clearTimeout(timeout);
  }, [frameLoaded, mapReady, mapError]);

  return (
    <View style={styles.container}>
      {createElement('iframe', {
        ref: iframeRef,
        src: '/map.html',
        title: 'Mapa interativo dos centros de reciclagem',
        onLoad: () => setFrameLoaded(true),
        style: {
          display: 'block',
          width: '100%',
          height: '100%',
          border: 0,
        } satisfies CSSProperties,
      })}
      {!mapReady && !mapError ? (
        <View pointerEvents="none" style={styles.loading}>
          <ActivityIndicator color={Colors.light.primary} />
          <AppText size="small" color={Colors.light.textSecondary}>
            Carregando mapa...
          </AppText>
        </View>
      ) : null}
      {mapError ? (
        <View style={styles.error}>
          <AppText weight="semibold" color={Colors.light.textPrimary}>
            Não foi possível carregar o mapa.
          </AppText>
          <AppText size="small" color={Colors.light.textSecondary}>
            Confira sua conexão com a internet e volte a tentar.
          </AppText>
        </View>
      ) : null}
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
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.backgroundCanvas,
  },
  error: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
    backgroundColor: Colors.light.backgroundCanvas,
  },
});
