import { useState, useRef } from 'react';
import { Country, searchCountries } from '@data/countries';

export function CountryInput({ onSelect, disabled }: { onSelect: (c: Country) => void; disabled?: boolean }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Country[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    setSuggestions(searchCountries(val));
  }

  function handleSelect(c: Country) {
    onSelect(c);
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && suggestions[0]) handleSelect(suggestions[0]);
    if (e.key === 'Escape') { setQuery(''); setSuggestions([]); }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: '#1a1a2e', border: '1.5px solid #2a2a4a', borderRadius: 10, padding: '0 14px' }}>
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKey}
          disabled={disabled}
          placeholder="Search for a country…"
          autoComplete="off"
          spellCheck={false}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: '#ecf0f1', fontSize: 16, padding: '13px 0',
            opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setSuggestions([]); }}
            style={{ background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer', fontSize: 14, padding: '0 0 0 8px' }}>
            ✕
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div style={{
          // Opens upward: the input sits near the bottom of the screen on
          // mobile, so a downward dropdown would get clipped by the layout.
          position: 'absolute', bottom: '100%', left: 0, right: 0, zIndex: 100,
          background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 10,
          marginBottom: 4, maxHeight: '40vh', overflowY: 'auto', boxShadow: '0 -8px 24px rgba(0,0,0,.4)',
        }}>
          {suggestions.map((c, i) => (
            <button key={c.code} onClick={() => handleSelect(c)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                width: '100%', padding: '11px 16px', background: 'none', border: 'none',
                borderBottom: i < suggestions.length - 1 ? '1px solid #2a2a4a' : 'none',
                color: '#ecf0f1', fontSize: 15, cursor: 'pointer', textAlign: 'left',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#16213e')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <span>{c.name}</span>
              <span style={{ color: '#7f8c8d', fontSize: 12, fontFamily: 'monospace' }}>{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
