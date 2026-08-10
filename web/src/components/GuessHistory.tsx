import { GuessResult } from '@game/gameLogic';

export function GuessHistory({ guesses, maxGuesses }: { guesses: GuessResult[]; maxGuesses: number }) {
  const remaining = maxGuesses - guesses.length;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: 1 }}>Guesses</span>
        <span style={{ fontSize: 12, color: remaining <= 2 ? '#c0392b' : '#7f8c8d', fontWeight: remaining <= 2 ? 700 : 400 }}>
          {remaining} remaining
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {Array.from({ length: maxGuesses }).map((_, i) => {
          const g = guesses[i];
          return (
            <div key={i} style={{
              borderRadius: 6, padding: '6px 8px', minWidth: 44, textAlign: 'center',
              background: !g ? '#2a2a4a' : g.isOnPath ? '#27ae60' : '#c0392b',
              transition: 'background 0.2s',
            }}>
              {g && <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>{g.name.split(' ')[0]}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
