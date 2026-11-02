const APP_CHANNEL = 'recicla-palhoca-app';
const MAP_CHANNEL = 'recicla-palhoca-map';
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const MAPLIBRE_URL = 'https://unpkg.com/maplibre-gl@6.16.0/dist/maplibre-gl.mjs';

function notify(type, payload = {}) {
  window.parent.postMessage(
    { channel: MAP_CHANNEL, type, ...payload },
    window.location.origin,
  );
}

function isValidCoordinate(latitude, longitude) {
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

function toCenterFeatureCollection(centers) {
  return {
    type: 'FeatureCollection',
    features: centers
      .filter((center) =>
        Number.isSafeInteger(center.id) &&
        typeof center.name === 'string' &&
        isValidCoordinate(center.latitude, center.longitude),
      )
      .map((center) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [center.longitude, center.latitude],
        },
        properties: {
          id: center.id,
          name: center.name,
        },
      })),
  };
}

function toReferenceFeatureCollection(reference) {
  if (
    !reference ||
    !isValidCoordinate(reference.latitude, reference.longitude)
  ) {
    return { type: 'FeatureCollection', features: [] };
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [reference.longitude, reference.latitude],
        },
        properties: {},
      },
    ],
  };
}

function fitToFeatures(map, centers, reference) {
  const points = centers.features.map(
    (feature) => feature.geometry.coordinates,
  );

  if (
    reference &&
    isValidCoordinate(reference.latitude, reference.longitude)
  ) {
    points.push([reference.longitude, reference.latitude]);
  }

  if (points.length === 0) return;

  const longitudes = points.map(([longitude]) => longitude);
  const latitudes = points.map(([, latitude]) => latitude);
  const west = Math.min(...longitudes);
  const east = Math.max(...longitudes);
  const south = Math.min(...latitudes);
  const north = Math.max(...latitudes);

  if (
    points.length === 1 ||
    (Math.abs(east - west) < 0.005 && Math.abs(north - south) < 0.005)
  ) {
    map.flyTo({
      center: points[0],
      zoom: 13,
      duration: 500,
    });
    return;
  }

  map.fitBounds(
    [
      [west, south],
      [east, north],
    ],
    {
      padding: { top: 64, right: 64, bottom: 64, left: 64 },
      maxZoom: 14,
      duration: 500,
    },
  );
}

async function startMap() {
  try {
    const maplibregl = await import(MAPLIBRE_URL);
    const map = new maplibregl.Map({
      container: 'map',
      style: STYLE_URL,
      center: [0, 0],
      zoom: 1,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'top-right',
    );

    let styleLoaded = false;

    map.on('error', () => {
      if (!styleLoaded) {
        notify('error', {
          message: 'Não foi possível carregar o mapa de base.',
        });
      }
    });

    map.on('load', () => {
      styleLoaded = true;

      map.addSource('centers', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'center-points',
        type: 'circle',
        source: 'centers',
        paint: {
          'circle-radius': 11,
          'circle-color': '#126B50',
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 3,
        },
      });

      map.addSource('reference-location', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'reference-location-ring',
        type: 'circle',
        source: 'reference-location',
        paint: {
          'circle-radius': 10,
          'circle-color': '#086FAF',
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 3,
        },
      });
      map.addLayer({
        id: 'reference-location-center',
        type: 'circle',
        source: 'reference-location',
        paint: {
          'circle-radius': 3,
          'circle-color': '#FFFFFF',
        },
      });

      map.on('mouseenter', 'center-points', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'center-points', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('click', 'center-points', (event) => {
        const id = Number(event.features?.[0]?.properties?.id);
        if (Number.isSafeInteger(id)) {
          notify('center-selected', { id });
        }
      });

      notify('ready');
    });

    window.addEventListener('message', (event) => {
      if (
        event.source !== window.parent ||
        event.origin !== window.location.origin
      ) {
        return;
      }

      const message = event.data;
      if (
        message?.channel !== APP_CHANNEL ||
        message.type !== 'map-update' ||
        !styleLoaded
      ) {
        return;
      }

      const payload = message.payload ?? {};
      const centers = toCenterFeatureCollection(
        Array.isArray(payload.centers) ? payload.centers : [],
      );
      const reference = payload.reference ?? null;

      map.getSource('centers')?.setData(centers);
      map
        .getSource('reference-location')
        ?.setData(toReferenceFeatureCollection(reference));

      map.once('idle', () => {
        notify('data-updated', { centerCount: centers.features.length });
      });
      fitToFeatures(map, centers, reference);
    });
  } catch {
    notify('error', {
      message: 'Não foi possível inicializar o mapa. Verifique a conexão e tente novamente.',
    });
  }
}

void startMap();
