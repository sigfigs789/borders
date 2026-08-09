import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function HelpModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>How to Play</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            <Section
              icon="🌍"
              title="The Goal"
              text="Find a path between two countries by guessing countries that share a land border."
            />
            <Section
              icon="🟩"
              title="Green = On the path"
              text="Your guess shares a land border with the last correct country and moves you closer to the destination."
            />
            <Section
              icon="🟥"
              title="Red = Dead end"
              text="Your guess doesn't border the last correctly placed country, or doesn't help you progress."
            />
            <Section
              icon="📏"
              title="Guesses"
              text="You get the optimal path length + 5 bonus guesses. The fewer guesses you use, the better your score."
            />
            <Section
              icon="⭐"
              title="Scoring"
              text="✨ Perfect (optimal) · ⭐ One extra · ✅ Completed · ❌ Failed"
            />
            <Section
              icon="🔁"
              title="Daily Puzzle"
              text="A new puzzle is available every day. Everyone gets the same start and end country."
            />

            <View style={styles.exampleBox}>
              <Text style={styles.exampleTitle}>Example</Text>
              <Text style={styles.exampleText}>
                Start: <Text style={{ color: theme.colors.start }}>Portugal</Text>
                {'  '}→{'  '}
                End: <Text style={{ color: theme.colors.end }}>Russia</Text>
              </Text>
              <Text style={styles.examplePath}>
                Portugal → Spain → France → Germany → Poland → Belarus → Russia
              </Text>
              <Text style={styles.exampleNote}>5 correct guesses (5 intermediate countries)</Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function Section({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <View style={styles.sectionBody}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surfaceAlt,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    maxHeight: '85%',
    gap: theme.spacing.md,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  scroll: {
    flexGrow: 0,
  },
  section: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
  },
  sectionIcon: {
    fontSize: 22,
    lineHeight: 28,
  },
  sectionBody: {
    flex: 1,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.font.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  sectionText: {
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
    lineHeight: 18,
  },
  exampleBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: 6,
  },
  exampleTitle: {
    color: theme.colors.primary,
    fontSize: theme.font.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  exampleText: {
    color: theme.colors.text,
    fontSize: theme.font.sm,
  },
  examplePath: {
    color: theme.colors.text,
    fontSize: theme.font.sm,
    fontStyle: 'italic',
  },
  exampleNote: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  closeBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing.sm + 2,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#000',
    fontSize: theme.font.md,
    fontWeight: '700',
  },
});
