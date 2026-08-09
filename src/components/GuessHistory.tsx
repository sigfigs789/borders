import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GuessResult } from '../game/gameLogic';
import { theme } from '../theme';

interface Props {
  guesses: GuessResult[];
  maxGuesses: number;
}

export function GuessHistory({ guesses, maxGuesses }: Props) {
  const remaining = maxGuesses - guesses.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Guesses</Text>
        <Text style={[styles.remaining, remaining <= 2 && styles.remainingWarning]}>
          {remaining} remaining
        </Text>
      </View>

      <View style={styles.tileRow}>
        {Array.from({ length: maxGuesses }).map((_, i) => {
          const guess = guesses[i];
          if (!guess) {
            return <View key={i} style={[styles.tile, styles.tileEmpty]} />;
          }
          return (
            <View
              key={i}
              style={[
                styles.tile,
                guess.isOnPath ? styles.tileCorrect : styles.tileWrong,
              ]}
            >
              <Text style={styles.tileText} numberOfLines={1}>
                {guess.name.split(' ')[0]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  headerText: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  remaining: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
  },
  remainingWarning: {
    color: theme.colors.wrong,
    fontWeight: '700',
  },
  tileRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tile: {
    borderRadius: theme.radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 44,
    alignItems: 'center',
  },
  tileEmpty: {
    backgroundColor: theme.colors.guessDefault,
    width: 44,
    height: 32,
  },
  tileCorrect: {
    backgroundColor: theme.colors.correct,
  },
  tileWrong: {
    backgroundColor: theme.colors.wrong,
  },
  tileText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
