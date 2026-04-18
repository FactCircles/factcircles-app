// app/session/lobby.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSessionStore } from '../../src/store/sessionStore';
import { generateOpeningStatement, generateJoinAnnouncement, summarizeParticipantReasons } from '../../src/services/grokService';
import { Button, GrokBubble } from '../../src/components/ui';
import FactCirclesIcon from '../../src/components/FactCirclesIcon';
import { Colors, Fonts, Spacing, Radius } from '../../src/utils/theme';

export default function LobbyScreen() {
  const session = useSessionStore((s) => s.session);
  const setPhase = useSessionStore((s) => s.setPhase);
  const addGrokMessage = useSessionStore((s) => s.addGrokMessage);

  const [openingStatement, setOpeningStatement] = useState('');
  const [joinAnnouncement, setJoinAnnouncement] = useState('');
  const [reasonsPrompt, setReasonsPrompt] = useState<Record<string, string>>({});
  const [grokSummary, setGrokSummary] = useState('');
  const [loadingOpening, setLoadingOpening] = useState(true);
  const [loadingAnnouncement, setLoadingAnnouncement] = useState(false);
  const [readyToStart, setReadyToStart] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Import useRef
  const useRef = React.useRef;

  useEffect(() => {
    loadOpening();
    startPulse();
  }, []);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  };

  const loadOpening = async () => {
    setLoadingOpening(true);
    const opening = await generateOpeningStatement();
    setOpeningStatement(opening);
    addGrokMessage(opening);
    setLoadingOpening(false);
  };

  const handleParticipantReady = async () => {
    if (!session) return;
    setLoadingAnnouncement(true);

    const names = session.participants.map((p) => p.name);
    const announcement = await generateJoinAnnouncement(names);
    setJoinAnnouncement(announcement);
    addGrokMessage(announcement);

    setLoadingAnnouncement(false);
    setReadyToStart(true);
  };

  const handleStartSession = async () => {
    if (!session) return;
    setPhase('intro');
    router.push('/session/intro');
  };

  if (!session) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#162D55', '#0A1628']} style={styles.header}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <FactCirclesIcon size={72} rotating />
          </Animated.View>
          <Text style={styles.headerTitle}>Session Lobby</Text>
          <Text style={styles.headerSubtitle}>Waiting for participants to join</Text>
        </LinearGradient>

        {/* Opening statement */}
        <GrokBubble message={openingStatement} loading={loadingOpening} />

        {/* Participants who have joined */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants ({session.participants.length})</Text>
          {session.participants.map((p, index) => (
            <View key={p.id} style={styles.participantRow}>
              <LinearGradient
                colors={p.isPresent ? ['#162D55', '#0F2040'] : ['#0F1A2E', '#0A1628']}
                style={styles.participantInner}
              >
                <View style={styles.participantLeft}>
                  <View style={[styles.avatar, p.isPresent && styles.avatarActive]}>
                    <Text style={styles.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={styles.participantName}>{p.name}</Text>
                    <Text style={styles.participantStatus}>
                      {p.isPresent ? '● Online' : '○ Invited'}
                    </Text>
                  </View>
                </View>
                <View style={[styles.joinBadge, p.isPresent && styles.joinBadgeActive]}>
                  <Text style={styles.joinBadgeText}>#{index + 1}</Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Join announcement */}
        {joinAnnouncement ? (
          <GrokBubble message={joinAnnouncement} loading={loadingAnnouncement} />
        ) : (
          !loadingOpening && (
            <Button
              label="All Participants Have Joined"
              onPress={handleParticipantReady}
              loading={loadingAnnouncement}
              style={styles.readyBtn}
            />
          )
        )}

        {/* Session rules */}
        {readyToStart && (
          <View style={styles.rulesCard}>
            <Text style={styles.rulesTitle}>FactCircles Guidelines</Text>
            {RULES.map((rule, i) => (
              <View key={i} style={styles.ruleRow}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>
        )}

        {readyToStart && (
          <Button
            label="Begin Session"
            onPress={handleStartSession}
            style={styles.startBtn}
          />
        )}

        <Text style={styles.anonNote}>
          🔒 Participants are completely anonymous outside of this session
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const RULES = [
  'Speak from your own experience',
  'Listen without interrupting',
  'No blame — only truth-telling',
  'A rotating icon shows whose turn it is',
  'Grok will guide you through 3 questions',
  'You have 55 minutes — use them well',
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 40 },
  header: { alignItems: 'center', padding: Spacing.xl, paddingBottom: Spacing.lg },
  headerTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.xxl, fontWeight: '900', marginTop: Spacing.md },
  headerSubtitle: { color: Colors.textSecondary, fontSize: Fonts.sizes.md, marginTop: 4 },
  section: { padding: Spacing.md },
  sectionTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.lg, fontWeight: '700', marginBottom: Spacing.sm },
  participantRow: { borderRadius: Radius.md, overflow: 'hidden', marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  participantInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  participantLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  avatarActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  avatarText: { color: '#fff', fontSize: Fonts.sizes.md, fontWeight: '700' },
  participantName: { color: Colors.textPrimary, fontSize: Fonts.sizes.md, fontWeight: '600' },
  participantStatus: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginTop: 2 },
  joinBadge: { backgroundColor: Colors.surfaceElevated, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  joinBadgeActive: { backgroundColor: Colors.primary + '30' },
  joinBadgeText: { color: Colors.textSecondary, fontSize: Fonts.sizes.xs, fontWeight: '700' },
  readyBtn: { marginHorizontal: Spacing.md, marginVertical: Spacing.sm },
  rulesCard: {
    margin: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  rulesTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.md, fontWeight: '700', marginBottom: 4 },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  ruleText: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, flex: 1, lineHeight: 20 },
  startBtn: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  anonNote: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, textAlign: 'center', padding: Spacing.md },
});
