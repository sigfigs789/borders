import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import { GameState, buildShareText, getScoreEmoji } from '../game/gameLogic';
import { COUNTRIES } from '../data/countries';
import { GameStats } from '../utils/storage';
import { theme } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onReset: () => void;
  gameState: GameState;
  puzzleNumber: number;
  stats: GameStats | null;
}

export function ResultModal({ visible, onClose, onReset, gameState, puzzleNumber, stats }: Props) {
  const { isWon, guesses, optimalPath, startCode, endCode } = gameState;

  const correctGuesses = guesses.filter(g => g.isOnPath).length;
  const totalGuesses = guesses.length;
  const optimal = optimalPath.length - 2;
  const emoji = getScoreEmoji(gameState);

  async function handleShare() {
    const text = buildShareText(gameState, puzzleNumber);
    try {
      await Share.share({ message: text });
    } catch {}
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.emoji}>{isWon ? emoji : '❌'}</Text>
          <Text style={styles.title}>{isWon ? 'Nice route!' : 'Better luck tomorrow'}</Text>

          <View style={styles.routeRow}>
            <Text style={styles.routeFlag}>
              {COUNTRIES[startCode]?.name ?? startCode}
            </Text>
            <Text style={styles.routeArrow}> → </Text>
            <Text style={styles.routeFlag}>
              {COUNTRIES[endCode]?.name ?? endCode}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <StatBox label="Guesses" value={`${totalGuesses}`} />
            <StatBox label="Correct" value={`${correctGuesses}`} accent={theme.colors.correct} />
            <StatBox label="Optimal" value={`${optimal}`} accent={theme.colors.primary} />
          </View>

          {stats && (
            <View style={styles.globalStats}>
              <Text style={styles.globalTitle}>Your Stats</Text>
              <View style={styles.statsRow}>
                <StatBox label="Played" value={`${stats.played}`} />
                <StatBox label="Win %" value={stats.played > 0 ? `${Math.round((stats.won / stats.played) * 100)}` : '0'} />
                <StatBox label="Streak" value={`${stats.currentStreak}`} />
                <StatBox label="Best" value={`${stats.maxStreak}`} />
              </View>
            </View>
          )}

          <View style={styles.tileRow}>
            {guesses.map((g, i) => (
              <View
                key={i}
                style={[styles.resultTile, g.isOnPath ? styles.tileGreen : styles.tileRed]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>Share Result</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newPuzzleBtn}
            onPress={() => {
              onReset();
              onClose();
            }}
          >
            <Text style={styles.newPuzzleBtnText}>↺ New Random Puzzle</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, accent ? { color: accent } : {}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  sheet: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.xl,
    fontWeight: '700',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeFlag: {
    color: theme.colors.primary,
    fontSize: theme.font.md,
    fontWeight: '600',
  },
  routeArrow: {
    color: theme.colors.textMuted,
    fontSize: theme.font.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statBox: {
    alignItems: 'center',
    minWidth: 60,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: theme.font.xl,
    fontWeight: '700',
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  globalStats: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  globalTitle: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tileRow: {
    flexDirection: 'row',
    gap: 3,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  resultTile: {
    width: 20,
    height: 20,
    borderRadius: 3,
  },
  tileGreen: {
    backgroundColor: theme.colors.correct,
  },
  tileRed: {
    backgroundColor: theme.colors.wrong,
  },
  shareBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  shareBtnText: {
    color: '#000',
    fontSize: theme.font.md,
    fontWeight: '700',
  },
  newPuzzleBtn: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing.sm + 2,
    width: '100%',
    alignItems: 'center',
  },
  newPuzzleBtnText: {
    color: theme.colors.primary,
    fontSize: theme.font.md,
    fontWeight: '600',
  },
  closeBtn: {
    paddingVertical: theme.spacing.xs,
  },
  closeBtnText: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
  },
});
