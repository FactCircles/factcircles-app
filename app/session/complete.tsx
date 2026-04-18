// app/session/complete.tsx
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSessionStore } from '../../src/store/sessionStore';
import { Button } from '../../src/components/ui';
import FactCirclesIcon from '../../src/components/FactCirclesIcon';
import { Colors, Fonts, Spacing, Radius } from '../../src/utils/theme';

export default function CompleteScreen() {
  const session = useSessionStore((s) => s.session);
  const clearSession = useSessionStore((s) => s.clearSession);
  const badges = useSessionStore((s) => s.badges);
  const totalSessions = useSessionStore((s) => s.totalSessionsCompleted);

  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Newly unlocked badges
  const newlyUnlocked = badges.filter((b) => b.unlocked && b.requirement === totalSessions);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleFinish = () => {
    clearSession();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#0A2010', '#0A1628']} style={styles.hero}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <FactCirclesIcon size={80} />
          </Animated.View>
          <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
            <Text style={styles.heroTitle}>Thank you for participating.</Text>
            <Text style={styles.heroSubtitle}>
              You chose connection over conflict. That takes courage.
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            <Text style={styles.statValue}>Complete</Text>
            <Text style={styles.statLabel}>Session Status</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{session?.participants.length || 0}</Text>
            <Text style={styles.statLabel}>Participants</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color={Colors.accent} />
            <Text style={styles.statValue}>{totalSessions}</Text>
            <Text style={styles.statLabel}>Total Sessions</Text>
          </View>
        </View>

        {/* Newly unlocked badges */}
        {newlyUnlocked.length > 0 && (
          <View style={styles.badgeSection}>
            <Text style={styles.badgeTitle}>🎉 New Badge Unlocked!</Text>
            {newlyUnlocked.map((b) => (
              <LinearGradient key={b.id} colors={['#4A90D9', '#2E6BB0']} style={styles.badgeCard}>
                <Text style={styles.badgeEmoji}>{b.emoji}</Text>
                <View>
                  <Text style={styles.badgeLabel}>{b.label}</Text>
                  <Text style={styles.badgeDesc}>{b.description}</Text>
                </View>
              </LinearGradient>
            ))}
          </View>
        )}

        {/* Next steps */}
        <View style={styles.nextSteps}>
          <Text style={styles.nextTitle}>What's Next</Text>
          {NEXT_STEPS.map((step, i) => (
            <View key={i} style={styles.nextRow}>
              <Ionicons name={step.icon as any} size={18} color={Colors.primary} />
              <Text style={styles.nextText}>{step.text}</Text>
            </View>
          ))}
        </View>

        {/* Quote */}
        <LinearGradient colors={['#162D55', '#0F2040']} style={styles.quote}>
          <Text style={styles.quoteText}>
            "Connection is the force that maintains empathetic relationships and cultures."
          </Text>
          <Text style={styles.quoteAttr}>— Live Connected, John Richards</Text>
        </LinearGradient>

        <Button label="Return Home" onPress={handleFinish} style={styles.homeBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const NEXT_STEPS = [
  { icon: 'bookmark', text: 'View your saved session summary in the Saved tab' },
  { icon: 'trophy', text: 'Check your earned badges in the Badges tab' },
  { icon: 'share-social', text: 'Share FactCircles with someone who could benefit' },
  { icon: 'heart', text: 'Continue practicing connection in everyday conflicts' },
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 60 },
  hero: { alignItems: 'center', padding: Spacing.xxl, gap: Spacing.lg },
  heroTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.xxl, fontWeight: '900', textAlign: 'center' },
  heroSubtitle: { color: Colors.textSecondary, fontSize: Fonts.sizes.md, textAlign: 'center', lineHeight: 22 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, margin: Spacing.md },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.border },
  statValue: { color: Colors.textPrimary, fontSize: Fonts.sizes.lg, fontWeight: '900' },
  statLabel: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, textAlign: 'center' },
  badgeSection: { margin: Spacing.md, gap: Spacing.sm },
  badgeTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.lg, fontWeight: '800' },
  badgeCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: Radius.md, padding: Spacing.md },
  badgeEmoji: { fontSize: 36 },
  badgeLabel: { color: '#fff', fontSize: Fonts.sizes.md, fontWeight: '700' },
  badgeDesc: { color: 'rgba(255,255,255,0.8)', fontSize: Fonts.sizes.sm, marginTop: 2 },
  nextSteps: { margin: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  nextTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.md, fontWeight: '700', marginBottom: 4 },
  nextRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  nextText: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, flex: 1, lineHeight: 20 },
  quote: { margin: Spacing.md, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.primary + '40' },
  quoteText: { color: Colors.textPrimary, fontSize: Fonts.sizes.md, lineHeight: 26, fontStyle: 'italic' },
  quoteAttr: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginTop: Spacing.sm },
  homeBtn: { marginHorizontal: Spacing.md },
});
