import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { GameState } from '../game/gameLogic';
import { COUNTRIES } from '../data/countries';
import { theme } from '../theme';

interface Props {
  gameState: GameState;
}

export function PathDisplay({ gameState }: Props) {
  const { startCode, endCode, currentPath, guesses, isComplete, isWon, optimalPath } = gameState;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Start country */}
        <CountryNode code={startCode} type="start" />

        {/* Intermediate guesses on the path */}
        {currentPath.slice(1).map((code, i) => (
          <React.Fragment key={code}>
            <Arrow />
            <CountryNode code={code} type={code === endCode ? 'end' : 'correct'} />
          </React.Fragment>
        ))}

        {/* If end not yet reached, show placeholder */}
        {!currentPath.includes(endCode) && (
          <>
            <Arrow dashed />
            <CountryNode code={endCode} type="end" dimmed />
          </>
        )}
      </ScrollView>

      {/* Wrong guesses row */}
      {guesses.some(g => !g.isOnPath) && (
        <View style={styles.wrongRow}>
          <Text style={styles.wrongLabel}>Dead ends: </Text>
          <Text style={styles.wrongNames}>
            {guesses
              .filter(g => !g.isOnPath)
              .map(g => g.name)
              .join(', ')}
          </Text>
        </View>
      )}

      {/* Show optimal path on game over */}
      {isComplete && !isWon && (
        <View style={styles.optimalRow}>
          <Text style={styles.optimalLabel}>One path: </Text>
          <Text style={styles.optimalPath}>
            {optimalPath.map(c => COUNTRIES[c]?.name ?? c).join(' → ')}
          </Text>
        </View>
      )}
    </View>
  );
}

function CountryNode({
  code,
  type,
  dimmed,
}: {
  code: string;
  type: 'start' | 'end' | 'correct';
  dimmed?: boolean;
}) {
  const name = COUNTRIES[code]?.name ?? code;
  const short = name.length > 12 ? name.slice(0, 11) + '…' : name;

  const bg =
    type === 'start'
      ? theme.colors.start
      : type === 'end'
      ? theme.colors.end
      : theme.colors.correct;

  return (
    <View style={[styles.node, { backgroundColor: bg }, dimmed && styles.nodeDimmed]}>
      <Text style={styles.nodeCode}>{code}</Text>
      <Text style={styles.nodeName}>{short}</Text>
    </View>
  );
}

function Arrow({ dashed }: { dashed?: boolean }) {
  return (
    <View style={styles.arrowContainer}>
      <Text style={[styles.arrow, dashed && styles.arrowDashed]}>{dashed ? '···' : '→'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scroll: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  node: {
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 72,
  },
  nodeDimmed: {
    opacity: 0.45,
  },
  nodeCode: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'monospace',
    opacity: 0.8,
  },
  nodeName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  arrowContainer: {
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  arrow: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  arrowDashed: {
    opacity: 0.4,
    letterSpacing: 1,
  },
  wrongRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  wrongLabel: {
    color: theme.colors.wrong,
    fontSize: theme.font.sm,
    fontWeight: '600',
  },
  wrongNames: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
    flex: 1,
    flexWrap: 'wrap',
  },
  optimalRow: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    marginHorizontal: theme.spacing.sm,
  },
  optimalLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  optimalPath: {
    color: theme.colors.primary,
    fontSize: theme.font.sm,
    lineHeight: 18,
  },
});
