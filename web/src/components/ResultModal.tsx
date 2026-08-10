import { useState } from 'react';
import { GameState, buildShareText, getScoreEmoji } from '@game/gameLogic';
import { COUNTRIES } from '@data/countries';

interface Props {
  gameState: GameState;
  puzzleNumber: number;
  onClose: () => void;
  onNewPuzzle: () => void;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Draws the same result card shown in the modal onto a canvas, so it can be
// copied/downloaded as an actual image rather than just text. When
// `spoilerFree` is off, the guessed country names are listed below the
// colored squares; when on, only the squares (which don't reveal which
// country was guessed) are shown.
function renderResultCard(gameState: GameState, puzzleNumber: number, spoilerFree: boolean): HTMLCanvasElement {
  const { isWon, guesses, optimalPath, startCode, endCode } = gameState;
  const correct = guesses.filter(g => g.isOnPath && g.code !== endCode).length;
  const total = guesses.length;
  const optimal = optimalPath.length - 2;
  const emoji = getScoreEmoji(gameState);

  const W = 600;
  const PER_ROW = 10;
  const rows = Math.max(1, Math.ceil(guesses.length / PER_ROW));
  const namesHeight = spoilerFree ? 0 : 44 + guesses.length * 24;
  const H = 400 + rows * 26 + namesHeight;

  const canvas = document.createElement('canvas');
  const scale = 2; // render at 2x for a crisp image
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = '#16213e';
  roundRect(ctx, 0, 0, W, H, 24);
  ctx.fill();

  let y = 56;
  ctx.fillStyle = '#7f8c8d';
  ctx.font = '700 15px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(`MAP TRAIL #${puzzleNumber}`, W / 2, y);

  y += 66;
  ctx.font = '48px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(isWon ? emoji : '❌', W / 2, y);

  y += 46;
  ctx.fillStyle = '#ecf0f1';
  ctx.font = '700 24px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(isWon ? 'Nice route!' : 'Better luck tomorrow', W / 2, y);

  y += 50;
  const startName = COUNTRIES[startCode]?.name ?? startCode;
  const endName = COUNTRIES[endCode]?.name ?? endCode;
  const arrow = '  →  ';
  ctx.font = '600 19px -apple-system, BlinkMacSystemFont, sans-serif';
  const w1 = ctx.measureText(startName).width;
  const w2 = ctx.measureText(arrow).width;
  const w3 = ctx.measureText(endName).width;
  let x = W / 2 - (w1 + w2 + w3) / 2;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#3498db';
  ctx.fillText(startName, x, y);
  x += w1;
  ctx.fillStyle = '#7f8c8d';
  ctx.fillText(arrow, x, y);
  x += w2;
  ctx.fillStyle = '#9b59b6';
  ctx.fillText(endName, x, y);
  ctx.textAlign = 'center';

  y += 62;
  const stats: [string, number, string][] = [
    ['GUESSES', total, '#ecf0f1'],
    ['CORRECT', correct, '#27ae60'],
    ['OPTIMAL', optimal, '#4ecdc4'],
  ];
  const colW = W / 3;
  stats.forEach(([label, val, color], i) => {
    const cx = colW * i + colW / 2;
    ctx.fillStyle = color;
    ctx.font = '700 28px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(String(val), cx, y);
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '600 11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(label, cx, y + 22);
  });

  y += 60;
  const tile = 20;
  const gap = 4;
  const perRow = Math.min(guesses.length, PER_ROW) || 1;
  const gridW = perRow * (tile + gap) - gap;
  const gridX = W / 2 - gridW / 2;
  guesses.forEach((g, i) => {
    const col = i % PER_ROW;
    const row = Math.floor(i / PER_ROW);
    const px = gridX + col * (tile + gap);
    const py = y + row * (tile + gap);
    ctx.fillStyle = g.isOnPath ? '#27ae60' : '#c0392b';
    roundRect(ctx, px, py, tile, tile, 3);
    ctx.fill();
  });

  if (!spoilerFree) {
    let ny = y + Math.ceil(guesses.length / PER_ROW) * (tile + gap) + 20;
    const textX = W / 2 - 130;
    ctx.textAlign = 'left';
    guesses.forEach(g => {
      ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(g.isOnPath ? '🟩' : '🟥', textX, ny);
      ctx.fillStyle = '#ecf0f1';
      ctx.font = '600 13px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(g.name, textX + 26, ny);
      ny += 24;
    });
    ctx.textAlign = 'center';
  }

  return canvas;
}

export function ResultModal({ gameState, puzzleNumber, onClose, onNewPuzzle }: Props) {
  const { isWon, guesses, optimalPath, startCode, endCode } = gameState;
  const correct = guesses.filter(g => g.isOnPath && g.code !== endCode).length;
  const total = guesses.length;
  const optimal = optimalPath.length - 2;
  const emoji = getScoreEmoji(gameState);
  const [status, setStatus] = useState<'idle' | 'copied' | 'downloaded' | 'failed'>('idle');
  const [spoilerFree, setSpoilerFree] = useState(false);

  function share() {
    const canvas = renderResultCard(gameState, puzzleNumber, spoilerFree);
    canvas.toBlob(async blob => {
      if (!blob) {
        setStatus('failed');
        setTimeout(() => setStatus('idle'), 1600);
        return;
      }
      // Copy the image directly — no share-sheet dialog. Only if the
      // browser can't write images to the clipboard do we fall back to
      // downloading the PNG instead.
      try {
        if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
          throw new Error('Clipboard image write unsupported');
        }
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setStatus('copied');
      } catch {
        try {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `map-trail-${puzzleNumber}.png`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          setStatus('downloaded');
        } catch {
          // Last resort: copy the text summary so the user still has something.
          navigator.clipboard?.writeText(buildShareText(gameState, puzzleNumber, spoilerFree)).catch(() => {});
          setStatus('failed');
        }
      }
      setTimeout(() => setStatus('idle'), 1800);
    }, 'image/png');
  }

  const shareLabel =
    status === 'copied' ? 'Copied image!' :
    status === 'downloaded' ? 'Image downloaded' :
    status === 'failed' ? 'Copied text instead' :
    'Copy Result Image';

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, zIndex: 1000,
    }}>
      <div style={{
        background: '#16213e', borderRadius: 16, padding: 32, width: '100%',
        maxWidth: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 52 }}>{isWon ? emoji : '❌'}</div>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>{isWon ? 'Nice route!' : 'Better luck tomorrow'}</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15 }}>
          <span style={{ color: '#3498db', fontWeight: 600 }}>{COUNTRIES[startCode]?.name}</span>
          <span style={{ color: '#7f8c8d' }}>→</span>
          <span style={{ color: '#9b59b6', fontWeight: 600 }}>{COUNTRIES[endCode]?.name}</span>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {[['Guesses', total], ['Correct', correct], ['Optimal', optimal]].map(([label, val]) => (
            <div key={label as string} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: label === 'Correct' ? '#27ae60' : label === 'Optimal' ? '#4ecdc4' : '#ecf0f1' }}>{val}</div>
              <div style={{ fontSize: 11, color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
          {guesses.map((g, i) => (
            <div key={i} style={{ width: 20, height: 20, borderRadius: 3, background: g.isOnPath ? '#27ae60' : '#c0392b' }} />
          ))}
        </div>

        <ToggleSwitch checked={spoilerFree} onChange={setSpoilerFree} label="Spoiler Free" />

        <button onClick={share} style={btnStyle('#4ecdc4', '#000')}>{shareLabel}</button>
        <button onClick={() => { onNewPuzzle(); onClose(); }} style={outlineBtn}>↺ New Random Puzzle</button>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer', fontSize: 13 }}>Close</button>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      <span style={{
        width: 36, height: 20, borderRadius: 999, background: checked ? '#4ecdc4' : '#2a2a4a',
        position: 'relative', transition: 'background 0.15s', flexShrink: 0,
      }}>
        <span style={{
          position: 'absolute', top: 2, left: checked ? 18 : 2, width: 16, height: 16,
          borderRadius: '50%', background: '#fff', transition: 'left 0.15s',
        }} />
      </span>
      <span style={{ fontSize: 13, color: '#7f8c8d' }}>{label}</span>
    </button>
  );
}

function btnStyle(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, border: 'none', borderRadius: 999, padding: '12px 24px', width: '100%', fontSize: 16, fontWeight: 700, cursor: 'pointer' };
}

const outlineBtn: React.CSSProperties = {
  background: 'none', color: '#4ecdc4', border: '1.5px solid #4ecdc4',
  borderRadius: 999, padding: '11px 24px', width: '100%', fontSize: 15, fontWeight: 600, cursor: 'pointer',
};
