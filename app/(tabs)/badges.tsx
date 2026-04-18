// app/(tabs)/badges.tsx
import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSessionStore } from '../../src/store/sessionStore';
import { Colors, Fonts, Spacing, Radius } from '../../src/utils/theme';
import { Badge } from '../../src/utils/types';

export default function BadgesScreen() {
  const badges = useSessionStore((s) => s.badges);
  const totalSessions = useSessionStore((s) => s.totalSessionsCompleted);
  const unlocked = badges.filter((b) => b.unlocked);
  const locked = badges.filter((b) => !b.unlocked);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Milestone Badges</Text>
          <Text style={styles.subtitle}>{unlocked.length} of {badges.length} unlocked</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressLabel}>Your Journey</Text>
            <Text style={styles.progressCount}>{totalSessions} sessions completed</Text>
          </View>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#4A90D9', '#F5A623']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${Math.min((unlocked.length / badges.length) * 100, 100)}%` }]}
            />
          </View>
        </View>

        {/* Unlocked row */}
        {unlocked.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>🏆 Unlocked Rewards</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeRow} contentContainerStyle={styles.badgeRowContent}>
              {unlocked.map((b) => <BadgeCard key={b.id} badge={b} unlocked />)}
            </ScrollView>
          </>
        )}

        {/* All badges grid */}
        <Text style={styles.sectionLabel}>All Badges</Text>
        <View style={styles.grid}>
          {badges.map((b) => <BadgeCard key={b.id} badge={b} unlocked={b.unlocked} large />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BadgeCard({ badge, unlocked, large }: { badge: Badge; unlocked: boolean; large?: boolean }) {
  const scaleAnim = useRef(new Animated.Value(unlocked ? 1 : 0.9)).current;

  useEffect(() => {
    if (unlocked) {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    }
  }, [unlocked]);

  if (large) {
    return (
      <Animated.View style={[styles.largeBadge, !unlocked && styles.largeBadgeLocked, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={unlocked ? ['#162D55', '#0F2040'] : ['#0F1A2E', '#0A1628']}
          style={styles.largeBadgeInner}
        >
          <Text style={[styles.largeBadgeEmoji, !unlocked && styles.locked]}>{badge.emoji}</Text>
          <Text style={[styles.largeBadgeLabel, !unlocked && styles.lockedText]}>{badge.label}</Text>
          <Text style={[styles.largeBadgeReq, !unlocked && styles.lockedText]}>
            {unlocked ? '✓ Unlocked' : `${badge.requirement} sessions needed`}
          </Text>
          {!unlocked && <View style={styles.lockOverlay}><Text style={styles.lockIcon}>🔒</Text></View>}
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.smallBadge, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={unlocked ? ['#4A90D9', '#2E6BB0'] : ['#162D55', '#0F2040']}
        style={styles.smallBadgeInner}
      >
        <Text style={styles.smallBadgeEmoji}>{badge.emoji}</Text>
      </LinearGradient>
      <Text style={styles.smallBadgeLabel} numberOfLines={2}>{badge.label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 40 },
  header: { padding: Spacing.lg, paddingBottom: Spacing.sm },
  title: { color: Colors.textPrimary, fontSize: Fonts.sizes.xxl, fontWeight: '900' },
  subtitle: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, marginTop: 2 },
  progressCard: {
    margin: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  progressLabel: { color: Colors.textPrimary, fontSize: Fonts.sizes.sm, fontWeight: '700' },
  progressCount: { color: Colors.primary, fontSize: Fonts.sizes.sm, fontWeight: '700' },
  progressBar: { height: 8, backgroundColor: Colors.surfaceElevated, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, minWidth: 8 },
  sectionLabel: { color: Colors.textSecondary, fontSize: Fonts.sizes.xs, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginHorizontal: Spacing.lg, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  badgeRow: { marginBottom: Spacing.sm },
  badgeRowContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  smallBadge: { alignItems: 'center', width: 80 },
  smallBadgeInner: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  smallBadgeEmoji: { fontSize: 28 },
  smallBadgeLabel: { color: Colors.textSecondary, fontSize: 10, textAlign: 'center', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: Spacing.sm },
  largeBadge: { width: '47%', borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  largeBadgeLocked: { opacity: 0.6 },
  largeBadgeInner: { padding: Spacing.md, alignItems: 'center', minHeight: 130 },
  largeBadgeEmoji: { fontSize: 40, marginBottom: Spacing.xs },
  largeBadgeLabel: { color: Colors.textPrimary, fontSize: Fonts.sizes.sm, fontWeight: '700', textAlign: 'center' },
  largeBadgeReq: { color: Colors.success, fontSize: Fonts.sizes.xs, marginTop: 4, textAlign: 'center' },
  locked: { opacity: 0.3 },
  lockedText: { color: Colors.textMuted },
  lockOverlay: { position: 'absolute', top: Spacing.xs, right: Spacing.xs },
  lockIcon: { fontSize: 14 },
});
