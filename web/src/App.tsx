import { useState, useEffect, useRef } from 'react';
import { COUNTRIES } from '@data/countries';
import { getGuessesRemaining } from '@game/gameLogic';
import { useGame } from './hooks/useGame';
import { GameMap } from './components/GameMap';
import { CountryInput } from './components/CountryInput';
import { PathDisplay } from './components/PathDisplay';
import { GuessHistory } from './components/GuessHistory';
import { ResultModal } from './components/ResultModal';
import { HelpModal } from './components/HelpModal';

export default function App() {
  const { gameState, puzzleNumber, dateString, submitGuess, newPuzzle } = useGame();
  const [showResult, setShowResult] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
  const [shake, setShake] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (gameState?.isComplete) {
      const t = setTimeout(() => setShowResult(true), 700);
      return () => clearTimeout(t);
    }
  }, [gameState?.isComplete]);

  function showFeedback(text: string, color: string) {
    clearTimeout(feedbackTimer.current);
    setFeedback({ text, color });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 1600);
  }

  function handleSelect(country: { code: string; name: string }) {
    if (!gameState || gameState.isComplete) return;
    const alreadyGuessed = gameState.guesses.some(g => g.code === country.code);
    if (alreadyGuessed) { showFeedback('Already guessed!', '#e67e22'); return; }

    const lastInPath = gameState.currentPath[gameState.currentPath.length - 1];
    const isNeighbor = (COUNTRIES[lastInPath]?.neighbors ?? []).includes(country.code);
    const isWin = isNeighbor && country.code === gameState.endCode;

    submitGuess(country.code);

    if (isWin) {
      showFeedback('You made it! 🎉', '#27ae60');
    } else if (isNeighbor) {
      showFeedback(`${country.name} borders ${COUNTRIES[lastInPath]?.name}! ✓`, '#27ae60');
    } else {
      showFeedback(`${country.name} doesn't border ${COUNTRIES[lastInPath]?.name}`, '#c0392b');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  if (!gameState) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#4ecdc4', fontSize: 18 }}>Loading…</div>
      </div>
    );
  }

  const nextCountry = COUNTRIES[gameState.currentPath[gameState.currentPath.length - 1]]?.name ?? '';

  return (
    <>
      <style>{`
        @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 40%{transform:translateX(10px)} 60%{transform:translateX(-8px)} 80%{transform:translateX(8px)} }
        ::-webkit-scrollbar { display: none; }
        * { box-sizing: border-box; }
        button:focus-visible { outline: 2px solid #4ecdc4; outline-offset: 2px; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 540, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0f0f1a' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #2a2a4a' }}>
          <button onClick={() => setShowHelp(true)} style={iconBtn}>?</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 4, color: '#ecf0f1' }}>BORDERS</div>
            <div style={{ fontSize: 11, color: '#7f8c8d', letterSpacing: 1 }}>#{puzzleNumber}</div>
          </div>
          <button onClick={() => setShowResult(true)} style={iconBtn}>📊</button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: 1 }}>{dateString}</p>

          {/* Puzzle card */}
          <div style={{ background: '#1a1a2e', borderRadius: 12, padding: '16px 20px', textAlign: 'center', border: '1px solid #2a2a4a', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 11, color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: 1 }}>Find a route from</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={badge('#3498db')}>{COUNTRIES[gameState.startCode]?.name}</span>
              <span style={{ color: '#7f8c8d', fontSize: 14 }}>to</span>
              <span style={badge('#9b59b6')}>{COUNTRIES[gameState.endCode]?.name}</span>
            </div>
            <p style={{ fontSize: 13, color: '#4a4a6a' }}>Optimal: {gameState.optimalPath.length - 2} steps</p>
          </div>

          {/* Map */}
          <GameMap gameState={gameState} />

          {/* Path */}
          <PathDisplay gameState={gameState} />

          {/* Guess history */}
          <GuessHistory guesses={gameState.guesses} maxGuesses={gameState.maxGuesses} />

          {/* Feedback */}
          <div style={{ minHeight: 28, textAlign: 'center' }}>
            {feedback && (
              <p style={{ color: feedback.color, fontSize: 15, fontWeight: 600, animation: 'popIn .15s ease' }}>
                {feedback.text}
              </p>
            )}
          </div>

          {/* Input */}
          {!gameState.isComplete ? (
            <div style={{ animation: shake ? 'shake .4s ease' : undefined }}>
              <p style={{ fontSize: 13, color: '#7f8c8d', marginBottom: 6 }}>
                Guess a country bordering <span style={{ color: '#4ecdc4' }}>{nextCountry}</span>
              </p>
              <CountryInput onSelect={handleSelect} />
            </div>
          ) : (
            <button onClick={() => setShowResult(true)} style={btnStyle('#4ecdc4', '#000')}>
              {gameState.isWon ? '🎉 See Results' : '📊 See Results'}
            </button>
          )}

          <button
            onClick={() => newPuzzle(gameState.startCode, gameState.endCode)}
            style={{ background: 'none', border: '1px solid #2a2a4a', color: '#7f8c8d', borderRadius: 8, padding: '10px', fontSize: 13, cursor: 'pointer', width: '100%' }}
          >
            ↺ New random puzzle
          </button>
        </div>
      </div>

      {showResult && (
        <ResultModal
          gameState={gameState}
          puzzleNumber={puzzleNumber}
          onClose={() => setShowResult(false)}
          onNewPuzzle={() => newPuzzle(gameState.startCode, gameState.endCode)}
        />
      )}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
}

const iconBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: '50%', background: '#1a1a2e',
  border: 'none', color: '#ecf0f1', fontSize: 16, fontWeight: 700, cursor: 'pointer',
};

function badge(bg: string): React.CSSProperties {
  return { background: bg, color: '#fff', borderRadius: 6, padding: '7px 16px', fontSize: 16, fontWeight: 700 };
}

function btnStyle(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, border: 'none', borderRadius: 999, padding: '14px', width: '100%', fontSize: 16, fontWeight: 700, cursor: 'pointer' };
}
