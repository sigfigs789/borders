import { useEffect, useRef } from 'react';
import { GameState } from '@game/gameLogic';
import { COUNTRIES } from '@data/countries';

const COLORS = { start: '#3498db', correct: '#27ae60', end: '#9b59b6', dim: '#4a4a6a' };

export function PathDisplay({ gameState }: { gameState: GameState }) {
  const { startCode, endCode, currentPath, guesses, isComplete, isWon, optimalPath } = gameState;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' });
  }, [currentPath.length]);

  const wrongGuesses = guesses.filter(g => !g.isOnPath);

  return (
    <div>
      <div ref={scrollRef} style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', gap: 6, padding: '8px 4px', scrollbarWidth: 'none' }}>
        <Node code={startCode} color={COLORS.start} />
        {currentPath.slice(1).map(code => (
          <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Arrow />
            <Node code={code} color={code === endCode ? COLORS.end : COLORS.correct} animate />
          </div>
        ))}
        {!currentPath.includes(endCode) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#4a4a6a', fontSize: 13 }}>···</span>
            <Node code={endCode} color={COLORS.end} dim />
          </div>
        )}
      </div>

      {wrongGuesses.length > 0 && (
        <p style={{ fontSize: 13, color: '#7f8c8d', marginTop: 4, paddingLeft: 4 }}>
          <span style={{ color: '#c0392b', fontWeight: 600 }}>Dead ends: </span>
          {wrongGuesses.map(g => g.name).join(', ')}
        </p>
      )}

      {isComplete && !isWon && (
        <div style={{ marginTop: 10, padding: 12, background: '#1a1a2e', borderRadius: 8 }}>
          <p style={{ fontSize: 12, color: '#7f8c8d', fontWeight: 600, marginBottom: 4 }}>ONE PATH:</p>
          <p style={{ fontSize: 13, color: '#4ecdc4', lineHeight: 1.6 }}>
            {optimalPath.map(c => COUNTRIES[c]?.name ?? c).join(' → ')}
          </p>
        </div>
      )}
    </div>
  );
}

function Node({ code, color, dim, animate }: { code: string; color: string; dim?: boolean; animate?: boolean }) {
  const name = COUNTRIES[code]?.name ?? code;
  const short = name.length > 12 ? name.slice(0, 11) + '…' : name;
  return (
    <div style={{
      background: color, borderRadius: 6, padding: '7px 11px', minWidth: 68,
      opacity: dim ? 0.4 : 1, textAlign: 'center', flexShrink: 0,
      animation: animate ? 'popIn 0.25s cubic-bezier(.34,1.56,.64,1)' : undefined,
    }}>
      <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 10, fontFamily: 'monospace' }}>{code}</div>
      <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{short}</div>
    </div>
  );
}

function Arrow() {
  return <span style={{ color: '#4a4a6a', fontSize: 14, flexShrink: 0 }}>→</span>;
}
