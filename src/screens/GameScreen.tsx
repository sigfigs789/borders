import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useGame } from '../hooks/useGame';
import { CountryInput } from '../components/CountryInput';
import { PathDisplay } from '../components/PathDisplay';
import { GuessHistory } from '../components/GuessHistory';
import { ResultModal } from '../components/ResultModal';
import { HelpModal } from '../components/HelpModal';
import { COUNTRIES } from '../data/countries';
import { getGuessesRemaining } from '../game/gameLogic';
import { theme } from '../theme';

export function GameScreen() {
  const { gameState, puzzleNumber, dateString, stats, loading, submitGuess, resetForTesting } =
    useGame();
  const [showResult, setShowResult] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackColor, setFeedbackColor] = useState(theme.colors.correct);
  const feedbackAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (gameState?.isComplete) {
      const delay = setTimeout(() => setShowResult(true), 800);
      return () => clearTimeout(delay);
    }
  }, [gameState?.isComplete]);

  function showFeedback(text: string, color: string) {
    setFeedbackText(text);
    setFeedbackColor(color);
    feedbackAnim.setValue(1);
    Animated.sequence([
      Animated.delay(1200),
      Animated.timing(feedbackAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  function handleSelect(country: { code: string; name: string }) {
    if (!gameState || gameState.isComplete) return;

    const alreadyGuessed = gameState.guesses.some(g => g.code === country.code);
    if (alreadyGuessed) {
      showFeedback('Already guessed!', theme.colors.adjacent);
      return;
    }

    const lastInPath = gameState.currentPath[gameState.currentPath.length - 1];
    const neighbors = COUNTRIES[lastInPath]?.neighbors ?? [];
    const isNeighbor = neighbors.includes(country.code);

    submitGuess(country.code);

    if (country.code === gameState.endCode && isNeighbor) {
      showFeedback('You made it!', theme.colors.correct);
    } else if (isNeighbor) {
      showFeedback(`${country.name} borders ${COUNTRIES[lastInPath]?.name}!`, theme.colors.correct);
    } else {
      showFeedback(`${country.name} doesn't border ${COUNTRIES[lastInPath]?.name}`, theme.colors.wrong);
    }
  }

  if (loading || !gameState) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading puzzle…</Text>
      </SafeAreaView>
    );
  }

  const remaining = getGuessesRemaining(gameState);
  const startName = COUNTRIES[gameState.startCode]?.name ?? gameState.startCode;
  const endName = COUNTRIES[gameState.endCode]?.name ?? gameState.endCode;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowHelp(true)} style={styles.iconBtn}>
          <Text style={styles.iconBtnText}>?</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.appName}>BORDERS</Text>
          <Text style={styles.puzzleNum}>#{puzzleNumber}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowResult(true)} style={styles.iconBtn}>
          <Text style={styles.iconBtnText}>📊</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Date */}
        <Text style={styles.date}>{dateString}</Text>

        {/* Puzzle header */}
        <View style={styles.puzzleHeader}>
          <Text style={styles.routeLabel}>Find a route from</Text>
          <View style={styles.routeRow}>
            <View style={[styles.countryBadge, { backgroundColor: theme.colors.start }]}>
              <Text style={styles.countryBadgeText}>{startName}</Text>
            </View>
            <Text style={styles.routeSep}>to</Text>
            <View style={[styles.countryBadge, { backgroundColor: theme.colors.end }]}>
              <Text style={styles.countryBadgeText}>{endName}</Text>
            </View>
          </View>
          <Text style={styles.optimalHint}>
            Optimal: {gameState.optimalPath.length - 2} step{gameState.optimalPath.length - 2 !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Path display */}
        <View style={styles.section}>
          <PathDisplay gameState={gameState} />
        </View>

        {/* Guess history tiles */}
        <View style={styles.section}>
          <GuessHistory guesses={gameState.guesses} maxGuesses={gameState.maxGuesses} />
        </View>

        {/* Feedback toast */}
        <Animated.View style={[styles.feedback, { opacity: feedbackAnim }]}>
          <Text style={[styles.feedbackText, { color: feedbackColor }]}>{feedbackText}</Text>
        </Animated.View>

        {/* Input */}
        {!gameState.isComplete && (
          <View style={styles.section}>
            <Text style={styles.inputLabel}>
              Guess a country bordering{' '}
              <Text style={{ color: theme.colors.primary }}>
                {COUNTRIES[gameState.currentPath[gameState.currentPath.length - 1]]?.name}
              </Text>
            </Text>
            <CountryInput onSelect={handleSelect} disabled={gameState.isComplete} />
          </View>
        )}

        {gameState.isComplete && (
          <TouchableOpacity style={styles.resultsBtn} onPress={() => setShowResult(true)}>
            <Text style={styles.resultsBtnText}>
              {gameState.isWon ? '🎉 See Results' : '📊 See Results'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Dev reset button — remove before shipping */}
        {__DEV__ && (
          <TouchableOpacity style={styles.devBtn} onPress={resetForTesting}>
            <Text style={styles.devBtnText}>DEV: New Puzzle</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <ResultModal
        visible={showResult}
        onClose={() => setShowResult(false)}
        gameState={gameState}
        puzzleNumber={puzzleNumber}
        stats={stats}
      />

      <HelpModal visible={showHelp} onClose={() => setShowHelp(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontSize: theme.font.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  headerCenter: {
    alignItems: 'center',
  },
  appName: {
    color: theme.colors.text,
    fontSize: theme.font.lg,
    fontWeight: '800',
    letterSpacing: 4,
  },
  puzzleNum: {
    color: theme.colors.textMuted,
    fontSize: 11,
    letterSpacing: 1,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    paddingBottom: 40,
  },
  date: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  puzzleHeader: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  routeLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  countryBadge: {
    borderRadius: theme.radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  countryBadgeText: {
    color: '#fff',
    fontSize: theme.font.md,
    fontWeight: '700',
  },
  routeSep: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
  },
  optimalHint: {
    color: theme.colors.textDim,
    fontSize: theme.font.sm,
  },
  section: {
    gap: theme.spacing.xs,
  },
  inputLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
    marginBottom: 2,
  },
  feedback: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  feedbackText: {
    fontSize: theme.font.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultsBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  resultsBtnText: {
    color: '#000',
    fontSize: theme.font.md,
    fontWeight: '700',
  },
  devBtn: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  devBtnText: {
    color: theme.colors.textDim,
    fontSize: theme.font.sm,
  },
});
