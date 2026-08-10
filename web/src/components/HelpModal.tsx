export function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: 0, zIndex: 1000,
    }}>
      <div style={{
        background: '#16213e', borderRadius: '16px 16px 0 0', padding: 28,
        width: '100%', maxWidth: 540, maxHeight: '85vh', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        <div style={{ width: 36, height: 4, background: '#2a2a4a', borderRadius: 2, alignSelf: 'center' }} />
        <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center' }}>How to Play</h2>

        {[
          ['🌍', 'The Goal', 'Find a path between two countries by guessing countries that share a land border.'],
          ['🟩', 'Green = On the path', 'Your guess borders the last correct country and advances the route.'],
          ['🟥', 'Red = Dead end', "Your guess doesn't border the last correctly placed country."],
          ['📏', 'Guesses', 'You get the optimal path length + 5 bonus guesses. Fewer guesses = better score.'],
          ['⭐', 'Scoring', '✨ Perfect · ⭐ One extra · ✅ Completed · ❌ Failed'],
        ].map(([icon, title, text]) => (
          <div key={title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 22, lineHeight: '26px', flexShrink: 0 }}>{icon}</span>
            <div>
              <p style={{ fontWeight: 600, marginBottom: 3 }}>{title}</p>
              <p style={{ color: '#7f8c8d', fontSize: 14, lineHeight: 1.5 }}>{text}</p>
            </div>
          </div>
        ))}

        <div style={{ background: '#1a1a2e', borderRadius: 10, padding: 16 }}>
          <p style={{ color: '#4ecdc4', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Example</p>
          <p style={{ fontSize: 14, marginBottom: 6 }}>
            <span style={{ color: '#3498db' }}>Portugal</span> → <span style={{ color: '#9b59b6' }}>Russia</span>
          </p>
          <p style={{ color: '#7f8c8d', fontSize: 13 }}>Portugal → Spain → France → Germany → Poland → Belarus → Russia</p>
        </div>

        <button onClick={onClose} style={{ background: '#4ecdc4', color: '#000', border: 'none', borderRadius: 999, padding: '13px', width: '100%', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
          Got it!
        </button>
      </div>
    </div>
  );
}
