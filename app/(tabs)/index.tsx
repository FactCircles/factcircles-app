// app/(tabs)/index.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FactCirclesIcon from '../../src/components/FactCirclesIcon';
import { Button } from '../../src/components/ui';
import { Colors, Fonts, Spacing, Radius } from '../../src/utils/theme';
import { useSessionStore } from '../../src/store/sessionStore';

export default function HomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const totalSessions = useSessionStore((s) => s.totalSessionsCompleted);
  const badges = useSessionStore((s) => s.badges);
  const unlockedBadges = badges.filter((b) => b.unlocked);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#162D55', '#0A1628']} style={styles.header}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
            <FactCirclesIcon size={80} rotating={false} />
            <Text style={styles.heroTitle}>FactCircles</Text>
            <Text style={styles.heroSubtitle}>Live Connected</Text>
          </Animated.View>
        </LinearGradient>

        {/* Opening statement card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sparkles" size={20} color={Colors.accent} />
            <Text style={styles.cardHeaderText}>About FactCircles</Text>
          </View>
          <Text style={styles.openingText}>
            You are looking to resolve an issue with a strong solution. With a{' '}
            <Text style={styles.highlight}>97% success rate</Text>, you can resolve this on your
            own time for less money than alternative processes.
          </Text>
          <Text style={styles.openingSubtext}>
            Participants are completely anonymous outside of the session. Powered by Grok AI.
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{unlockedBadges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>97%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          {STEPS.map((step, i) => (
            <View key={i} style={styles.step}>
              <LinearGradient colors={['#4A90D9', '#2E6BB0']} style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </LinearGradient>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Button
            label="Start a FactCircle"
            onPress={() => router.push('/session/setup')}
            style={styles.ctaButton}
          />
          <Text style={styles.ctaNote}>$30 per participant · 55-minute session</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const STEPS = [
  { title: 'Create a Session', desc: 'Invite participants by name, phone, or social. Completely private.' },
  { title: 'Set Up Payment', desc: 'Choose who pays — $30 per participant, split however you like.' },
  { title: 'Answer 3 Questions', desc: '"What happened?" · "Who is affected?" · "How can this be resolved?"' },
  { title: 'Receive a Solution', desc: 'Grok AI empathetically summarizes and recommends a path forward.' },
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 32, paddingHorizontal: Spacing.lg },
  heroTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.xxxl, fontWeight: '900', marginTop: Spacing.md, letterSpacing: -1 },
  heroSubtitle: { color: Colors.textSecondary, fontSize: Fonts.sizes.lg, marginTop: 4 },
  card: {
    margin: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  cardHeaderText: { color: Colors.accent, fontSize: Fonts.sizes.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  openingText: { color: Colors.textPrimary, fontSize: Fonts.sizes.md, lineHeight: 24 },
  highlight: { color: Colors.accent, fontWeight: '800' },
  openingSubtext: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, marginTop: Spacing.sm, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: { color: Colors.primary, fontSize: Fonts.sizes.xxl, fontWeight: '900' },
  statLabel: { color: Colors.textSecondary, fontSize: Fonts.sizes.xs, marginTop: 2 },
  section: { marginHorizontal: Spacing.md, marginTop: Spacing.md },
  sectionTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.xl, fontWeight: '800', marginBottom: Spacing.md },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md, gap: Spacing.md },
  stepNum: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumText: { color: '#fff', fontSize: Fonts.sizes.sm, fontWeight: '800' },
  stepContent: { flex: 1 },
  stepTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.md, fontWeight: '700' },
  stepDesc: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, marginTop: 2, lineHeight: 20 },
  ctaSection: { margin: Spacing.lg, alignItems: 'center' },
  ctaButton: { width: '100%', marginBottom: Spacing.sm },
  ctaNote: { color: Colors.textMuted, fontSize: Fonts.sizes.sm },
});
