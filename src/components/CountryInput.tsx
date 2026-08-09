import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Country, searchCountries } from '../data/countries';
import { theme } from '../theme';

interface Props {
  onSelect: (country: Country) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CountryInput({ onSelect, disabled, placeholder = 'Search for a country...' }: Props) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Country[]>([]);
  const inputRef = useRef<TextInput>(null);

  function handleChange(text: string) {
    setQuery(text);
    setSuggestions(searchCountries(text));
  }

  function handleSelect(country: Country) {
    onSelect(country);
    setQuery('');
    setSuggestions([]);
    Keyboard.dismiss();
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={[styles.input, disabled && styles.inputDisabled]}
          value={query}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textDim}
          editable={!disabled}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              setQuery('');
              setSuggestions([]);
            }}
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {suggestions.length > 0 && (
        <View style={styles.dropdown}>
          {suggestions.map(country => (
            <TouchableOpacity
              key={country.code}
              style={styles.suggestion}
              onPress={() => handleSelect(country)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText}>{country.name}</Text>
              <Text style={styles.codeText}>{country.code}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 100,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.font.md,
    fontFamily: 'System',
  },
  inputDisabled: {
    opacity: 0.4,
  },
  clearBtn: {
    paddingLeft: theme.spacing.sm,
  },
  clearText: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
  },
  dropdown: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 4,
    overflow: 'hidden',
  },
  suggestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  suggestionText: {
    color: theme.colors.text,
    fontSize: theme.font.md,
  },
  codeText: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
    fontFamily: 'monospace',
  },
});
