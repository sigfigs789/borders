import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { MapContainer, GeoJSON, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GameState } from '../game/gameLogic';
import { COUNTRIES, pickIcon } from '../data/countries';
import { theme } from '../theme';

// A single dissolved world-coastline polygon (no per-country subdivisions, so
// there's nothing to draw a border along) and no text of any kind in the
// source data, so labels can never appear no matter how it's rendered.
const LAND_GEOJSON_URL =
  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector/geojson/ne_110m_land.geojson';
let landDataPromise: Promise<any> | null = null;
function getLandData() {
  if (!landDataPromise) {
    landDataPromise = fetch(LAND_GEOJSON_URL).then(r => r.json());
  }
  return landDataPromise;
}

function LandLayer() {
  const map = useMap();
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    // Dedicated pane below Leaflet's default overlayPane (z-index 400), so the
    // land shape always sits behind markers/polylines no matter which loads
    // first — GeoJSON fetches asynchronously and can otherwise mount after them.
    if (!map.getPane('land')) {
      const pane = map.createPane('land');
      pane.style.zIndex = '350';
    }
    let cancelled = false;
    getLandData().then(d => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, [map]);
  if (!data) return null;
  return (
    <GeoJSON
      data={data}
      pane="land"
      style={{
        fillColor: theme.colors.surfaceAlt,
        fillOpacity: 1,
        color: 'transparent',
        weight: 0,
      }}
      interactive={false}
    />
  );
}

// Fix Leaflet's default icon paths (CDN CSS is injected in index.web.ts)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DOT_SIZE = 20;
const EMOJI_SIZE = 26;
const ICON_GAP = 3;
const ICON_HEIGHT = EMOJI_SIZE + ICON_GAP + DOT_SIZE;
// Where the dot's center sits as a fraction of the icon's height, so a
// bounce-in scale animation grows outward from that point (the true
// coordinate anchor) rather than the div's top-left corner.
const DOT_CENTER_FRACTION = ((ICON_HEIGHT - DOT_SIZE / 2) / ICON_HEIGHT) * 100;

function makeIcon(color: string, emoji: string, bounce?: boolean) {
  return L.divIcon({
    className: '',
    html: `<div class="${bounce ? 'marker-bounce-in' : ''}" style="
      display:flex;flex-direction:column;align-items:center;
      width:${EMOJI_SIZE}px;
      transform-origin:center ${DOT_CENTER_FRACTION}%;
    ">
      <div style="font-size:22px;line-height:${EMOJI_SIZE}px;">${emoji}</div>
      <div style="
        width:${DOT_SIZE}px;height:${DOT_SIZE}px;border-radius:50%;
        background:${color};border:2px solid #fff;
        box-shadow:0 1px 4px rgba(0,0,0,0.5);
        margin-top:${ICON_GAP}px;
      "></div>
    </div>`,
    // Anchor at the dot's center (not the emoji), so the marker still points
    // at the country's true coordinate while the emoji floats above it.
    iconSize: [EMOJI_SIZE, ICON_HEIGHT],
    iconAnchor: [EMOJI_SIZE / 2, ICON_HEIGHT - DOT_SIZE / 2],
  });
}

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

  // Track whichever country was just correctly placed, so its marker can
  // bounce in. Cleared shortly after so re-renders (e.g. from panning) don't
  // replay the animation.
  const prevPathLenRef = useRef(currentPath.length);
  const [bounceCode, setBounceCode] = useState<string | null>(null);

  useEffect(() => {
    if (currentPath.length > prevPathLenRef.current) {
      const newCode = currentPath[currentPath.length - 1];
      setBounceCode(newCode);
      const t = setTimeout(() => setBounceCode(null), 500);
      prevPathLenRef.current = currentPath.length;
      return () => clearTimeout(t);
    }
    prevPathLenRef.current = currentPath.length;
  }, [currentPath.length]);

  const pathCoords = currentPath
    .map(c => COUNTRIES[c])
    .filter(Boolean)
    .map(c => [c.lat, c.lng] as [number, number]);

  const endCountry = COUNTRIES[endCode];

  return (
    <View style={styles.container}>
      <MapContainer
        style={{ width: '100%', height: '100%', background: theme.colors.surface }}
        center={[20, 10]}
        zoom={2}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
      >
        <LandLayer />

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
            icon={makeIcon(theme.colors.start, pickIcon(startCode))}
          />
        )}

        {/* Intermediate correct markers */}
        {currentPath.slice(1).filter(c => c !== endCode).map(code =>
          COUNTRIES[code] ? (
            <Marker
              key={code}
              position={[COUNTRIES[code].lat, COUNTRIES[code].lng]}
              icon={makeIcon(theme.colors.correct, pickIcon(code), code === bounceCode)}
            />
          ) : null
        )}

        {/* End marker */}
        {endCountry && (
          <Marker
            position={[endCountry.lat, endCountry.lng]}
            icon={makeIcon(theme.colors.end, pickIcon(endCode), endCode === bounceCode)}
          />
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
