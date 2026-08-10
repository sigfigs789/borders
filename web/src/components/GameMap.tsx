import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GameState } from '@game/gameLogic';
import { COUNTRIES } from '@data/countries';

const COLORS = { start: '#3498db', correct: '#27ae60', end: '#9b59b6' };

function icon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.6)"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
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
        {/* Dark Gray Canvas "Base" layer only (no "Reference" overlay) — this base
            tileset is land/water shading only, by design with no borders or labels;
            those live in a separate overlay we're intentionally not adding. */}
        <TileLayer url="https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}" />
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
          <Marker position={[COUNTRIES[startCode].lat, COUNTRIES[startCode].lng]} icon={icon(COLORS.start)} />
        )}
        {currentPath.slice(1).filter(c => c !== endCode).map(code =>
          COUNTRIES[code] ? <Marker key={code} position={[COUNTRIES[code].lat, COUNTRIES[code].lng]} icon={icon(COLORS.correct)} /> : null
        )}
        {end && <Marker position={[end.lat, end.lng]} icon={icon(COLORS.end)} />}
      </MapContainer>
    </div>
  );
}
