import { GameState, buildShareText, getScoreEmoji } from '@game/gameLogic';
import { COUNTRIES } from '@data/countries';

interface Props {
  gameState: GameState;
  puzzleNumber: number;
  onClose: () => void;
  onNewPuzzle: () => void;
}

export function ResultModal({ gameState, puzzleNumber, onClose, onNewPuzzle }: Props) {
  const { isWon, guesses, optimalPath, startCode, endCode } = gameState;
  const correct = guesses.filter(g => g.isOnPath && g.code !== endCode).length;
  const total = guesses.length;
  const optimal = optimalPath.length - 2;
  const emoji = getScoreEmoji(gameState);

  function share() {
    const text = buildShareText(gameState, puzzleNumber);
    navigator.clipboard?.writeText(text).catch(() => {});
    alert('Copied to clipboard!');
  }

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

        <button onClick={share} style={btnStyle('#4ecdc4', '#000')}>Share Result</button>
        <button onClick={() => { onNewPuzzle(); onClose(); }} style={outlineBtn}>↺ New Random Puzzle</button>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer', fontSize: 13 }}>Close</button>
      </div>
    </div>
  );
}

function btnStyle(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, border: 'none', borderRadius: 999, padding: '12px 24px', width: '100%', fontSize: 16, fontWeight: 700, cursor: 'pointer' };
}

const outlineBtn: React.CSSProperties = {
  background: 'none', color: '#4ecdc4', border: '1.5px solid #4ecdc4',
  borderRadius: 999, padding: '11px 24px', width: '100%', fontSize: 15, fontWeight: 600, cursor: 'pointer',
};
