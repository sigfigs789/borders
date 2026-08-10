import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GameState } from '../game/gameLogic';
import { COUNTRIES } from '../data/countries';
import { theme } from '../theme';

// Fix Leaflet's default icon paths (CDN CSS is injected in index.web.ts)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function makeIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:2px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const startIcon = makeIcon(theme.colors.start);
const correctIcon = makeIcon(theme.colors.correct);
const endIcon = makeIcon(theme.colors.end);

function FitBounds({ codes }: { codes: string[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = codes
      .map(c => COUNTRIES[c])
      .filter(Boolean)
      .map(c => [c.lat, c.lng] as [number, number]);
    if (pts.length === 0) return;
    if (pts.length === 1) {
      map.setView(pts[0], 4, { animate: true });
    } else {
      map.fitBounds(L.latLngBounds(pts).pad(0.35), { animate: true, maxZoom: 5 });
    }
  }, [codes.join(',')]);
  return null;
}

interface Props {
  gameState: GameState;
}

export function GameMap({ gameState }: Props) {
  const { startCode, endCode, currentPath } = gameState;
  const visibleCodes = Array.from(new Set([...currentPath, endCode]));

  const pathCoords = currentPath
    .map(c => COUNTRIES[c])
    .filter(Boolean)
    .map(c => [c.lat, c.lng] as [number, number]);

  const endCountry = COUNTRIES[endCode];

  return (
    <View style={styles.container}>
      <MapContainer
        style={{ width: '100%', height: '100%' }}
        center={[20, 10]}
        zoom={2}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution=""
        />

        <FitBounds codes={visibleCodes} />

        {/* Solid line along current path */}
        {pathCoords.length > 1 && (
          <Polyline
            positions={pathCoords}
            pathOptions={{ color: theme.colors.correct, weight: 3, opacity: 0.9 }}
          />
        )}

        {/* Dashed line from last path country to destination */}
        {!currentPath.includes(endCode) && pathCoords.length > 0 && endCountry && (
          <Polyline
            positions={[pathCoords[pathCoords.length - 1], [endCountry.lat, endCountry.lng]]}
            pathOptions={{ color: theme.colors.end, weight: 2, opacity: 0.5, dashArray: '6 6' }}
          />
        )}

        {/* Start marker */}
        {COUNTRIES[startCode] && (
          <Marker
            position={[COUNTRIES[startCode].lat, COUNTRIES[startCode].lng]}
            icon={startIcon}
          />
        )}

        {/* Intermediate correct markers */}
        {currentPath.slice(1).filter(c => c !== endCode).map(code =>
          COUNTRIES[code] ? (
            <Marker
              key={code}
              position={[COUNTRIES[code].lat, COUNTRIES[code].lng]}
              icon={correctIcon}
            />
          ) : null
        )}

        {/* End marker */}
        {endCountry && (
          <Marker position={[endCountry.lat, endCountry.lng]} icon={endIcon} />
        )}
      </MapContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
