import React, { useRef, useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { GameState } from '../game/gameLogic';
import { COUNTRIES } from '../data/countries';
import { theme } from '../theme';

const DOT_SIZE = 20;
// Fraction of the marker's height where the dot's center sits (it's the
// whole marker here, but kept as a fraction for a stable, centered anchor).
const MARKER_ANCHOR_Y = 0.5;

// How long the bounce-in animation runs — the marker's `tracksViewChanges`
// window on the map should stay open at least this long, then close for perf.
const BOUNCE_MS = 500;

function MarkerDot({ color, bounce }: { color: string; bounce?: boolean }) {
  const scale = useRef(new Animated.Value(bounce ? 0 : 1)).current;

  useEffect(() => {
    if (!bounce) return;
    scale.setValue(0);
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 160,
      useNativeDriver: true,
    }).start();
  }, [bounce]);

  return (
    <Animated.View style={[markerStyles.dot, { backgroundColor: color, transform: [{ scale }] }]} />
  );
}

const markerStyles = StyleSheet.create({
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
});

interface Props {
  gameState: GameState;
}

function getBoundingRegion(codes: string[]) {
  const coords = codes
    .map(c => COUNTRIES[c])
    .filter(Boolean)
    .map(c => ({ lat: c.lat, lng: c.lng }));

  if (coords.length === 0) {
    return { latitude: 20, longitude: 0, latitudeDelta: 100, longitudeDelta: 160 };
  }

  const lats = coords.map(c => c.lat);
  const lngs = coords.map(c => c.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latDelta = Math.max((maxLat - minLat) * 1.8, 15);
  const lngDelta = Math.max((maxLng - minLng) * 1.8, 20);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.min(latDelta, 130),
    longitudeDelta: Math.min(lngDelta, 180),
  };
}

export function GameMap({ gameState }: Props) {
  const mapRef = useRef<MapView>(null);
  const { startCode, endCode, currentPath } = gameState;

  // All codes to keep in view: current path + always show destination
  const visibleCodes = Array.from(new Set([...currentPath, endCode]));

  // Track whichever country was just correctly placed, so its marker can
  // bounce in. Cleared after the animation window so tracksViewChanges can
  // go back to false (react-native-maps re-snapshots the marker bitmap on
  // every render while it's true, which is costly to leave on).
  const prevPathLenRef = useRef(currentPath.length);
  const [bounceCode, setBounceCode] = useState<string | null>(null);

  useEffect(() => {
    if (currentPath.length > prevPathLenRef.current) {
      const newCode = currentPath[currentPath.length - 1];
      setBounceCode(newCode);
      const t = setTimeout(() => setBounceCode(null), BOUNCE_MS);
      prevPathLenRef.current = currentPath.length;
      return () => clearTimeout(t);
    }
    prevPathLenRef.current = currentPath.length;
  }, [currentPath.length]);

  useEffect(() => {
    if (!mapRef.current) return;
    const region = getBoundingRegion(visibleCodes);
    mapRef.current.animateToRegion(region, 600);
  }, [currentPath.length]);

  const pathCoords = currentPath
    .map(code => COUNTRIES[code])
    .filter(Boolean)
    .map(c => ({ latitude: c.lat, longitude: c.lng }));

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={getBoundingRegion(visibleCodes)}
        mapType="mutedStandard"
        showsCompass={false}
        showsScale={false}
        showsUserLocation={false}
        zoomEnabled
        scrollEnabled
        zoomControlEnabled
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {/* Drawn path polyline */}
        {pathCoords.length > 1 && (
          <Polyline
            coordinates={pathCoords}
            strokeColor={theme.colors.correct}
            strokeWidth={2.5}
            lineDashPattern={[]}
          />
        )}

        {/* Dashed line from last path country to destination */}
        {!currentPath.includes(endCode) && pathCoords.length > 0 && COUNTRIES[endCode] && (
          <Polyline
            coordinates={[
              pathCoords[pathCoords.length - 1],
              { latitude: COUNTRIES[endCode].lat, longitude: COUNTRIES[endCode].lng },
            ]}
            strokeColor={theme.colors.end}
            strokeWidth={1.5}
            lineDashPattern={[6, 6]}
          />
        )}

        {/* Start marker */}
        {COUNTRIES[startCode] && (
          <Marker
            coordinate={{ latitude: COUNTRIES[startCode].lat, longitude: COUNTRIES[startCode].lng }}
            title={COUNTRIES[startCode].name}
            anchor={{ x: 0.5, y: MARKER_ANCHOR_Y }}
          >
            <MarkerDot color={theme.colors.start} />
          </Marker>
        )}

        {/* Intermediate path markers (not start/end) */}
        {currentPath.slice(1).filter(c => c !== endCode).map(code => (
          COUNTRIES[code] ? (
            <Marker
              key={code}
              coordinate={{ latitude: COUNTRIES[code].lat, longitude: COUNTRIES[code].lng }}
              title={COUNTRIES[code].name}
              anchor={{ x: 0.5, y: MARKER_ANCHOR_Y }}
              tracksViewChanges={code === bounceCode}
            >
              <MarkerDot color={theme.colors.correct} bounce={code === bounceCode} />
            </Marker>
          ) : null
        ))}

        {/* End marker */}
        {COUNTRIES[endCode] && (
          <Marker
            coordinate={{ latitude: COUNTRIES[endCode].lat, longitude: COUNTRIES[endCode].lng }}
            title={COUNTRIES[endCode].name}
            anchor={{ x: 0.5, y: MARKER_ANCHOR_Y }}
            tracksViewChanges={endCode === bounceCode}
          >
            <MarkerDot color={theme.colors.end} bounce={endCode === bounceCode} />
          </Marker>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  map: {
    flex: 1,
  },
});
