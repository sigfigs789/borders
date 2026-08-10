import { useEffect, useState } from 'react';
import { MapContainer, GeoJSON, Marker, Polyline, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GameState } from '@game/gameLogic';
import { COUNTRIES } from '@data/countries';

const COLORS = { start: '#3498db', correct: '#27ae60', end: '#9b59b6' };

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
      style={{ fillColor: '#16213e', fillOpacity: 1, color: 'transparent', weight: 0 }}
      interactive={false}
    />
  );
}

const DOT_SIZE = 18;

function icon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${DOT_SIZE}px;height:${DOT_SIZE}px;border-radius:50%;background:${color};
      border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.6);
    "></div>`,
    iconSize: [DOT_SIZE, DOT_SIZE],
    iconAnchor: [DOT_SIZE / 2, DOT_SIZE / 2],
  });
}

function FitBounds({ codes }: { codes: string[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = codes.map(c => COUNTRIES[c]).filter(Boolean).map(c => [c.lat, c.lng] as [number, number]);
    if (!pts.length) return;
    if (pts.length === 1) map.setView(pts[0], 4, { animate: true });
    else map.fitBounds(L.latLngBounds(pts).pad(0.4), { animate: true, maxZoom: 5 });
  }, [codes.join(',')]);
  return null;
}

export function GameMap({ gameState }: { gameState: GameState }) {
  const { startCode, endCode, currentPath } = gameState;
  const visibleCodes = Array.from(new Set([...currentPath, endCode]));
  const pathCoords = currentPath.map(c => COUNTRIES[c]).filter(Boolean).map(c => [c.lat, c.lng] as [number, number]);
  const end = COUNTRIES[endCode];

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MapContainer
        style={{ width: '100%', height: '100%', background: '#1a1a2e' }}
        center={[20, 15]}
        zoom={2}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom
        dragging
        doubleClickZoom
      >
        <LandLayer />
        <ZoomControl position="bottomright" />
        <FitBounds codes={visibleCodes} />

        {pathCoords.length > 1 && (
          <Polyline positions={pathCoords} pathOptions={{ color: COLORS.correct, weight: 3 }} />
        )}
        {!currentPath.includes(endCode) && pathCoords.length > 0 && end && (
          <Polyline
            positions={[pathCoords[pathCoords.length - 1], [end.lat, end.lng]]}
            pathOptions={{ color: COLORS.end, weight: 2, opacity: 0.5, dashArray: '6 6' }}
          />
        )}

        {COUNTRIES[startCode] && (
          <Marker
            position={[COUNTRIES[startCode].lat, COUNTRIES[startCode].lng]}
            icon={icon(COLORS.start)}
          />
        )}
        {currentPath.slice(1).filter(c => c !== endCode).map(code =>
          COUNTRIES[code] ? (
            <Marker
              key={code}
              position={[COUNTRIES[code].lat, COUNTRIES[code].lng]}
              icon={icon(COLORS.correct)}
            />
          ) : null
        )}
        {end && (
          <Marker position={[end.lat, end.lng]} icon={icon(COLORS.end)} />
        )}
      </MapContainer>
    </div>
  );
}
