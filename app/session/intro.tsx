// app/session/intro.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSessionStore } from '../../src/store/sessionStore';
import { generateJoinAnnouncement } from '../../src/services/grokService';
import { Button, GrokBubble, PhaseIndicator } from '../../src/components/ui';
import FactCirclesIcon from '../../src/components/FactCirclesIcon';
import { Colors, Fonts, Spacing, Radius } from '../../src/utils/theme';

export default function IntroScreen() {
  const session = useSessionStore((s) => s.session);
  const setPhase = useSessionStore((s) => s.setPhase);
  const addGrokMessage = useSessionStore((s) => s.addGrokMessage);

  const [announcement, setAnnouncement] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentIntroIdx, setCurrentIntroIdx] = useState(-1);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAnnouncement();
  }, []);

  const loadAnnouncement = async () => {
    if (!session) return;
    setLoading(true);
    const names = session.participants.map((p) => p.name);
    const ann = await generateJoinAnnouncement(names);
    setAnnouncement(ann);
    addGrokMessage(ann);
    setLoading(false);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    // Begin introducing participants one by one
    introduceNext(0);
  };

  const introduceNext = (idx: number) => {
    if (!session || idx >= session.participants.length) return;
    setTimeout(() => {
      setCurrentIntroIdx(idx);
      introduceNext(idx + 1);
    }, idx === 0 ? 1500 : 2000);
  };

  const handleBeginQuestions = () => {
    setPhase('questions');
    router.push('/session/questions');
  };

  if (!session) return null;

  const allIntroduced = currentIntroIdx >= session.participants.length - 1;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#162D55', '#0F2040']} style={styles.topBar}>
          <PhaseIndicator currentPhase="intro" />
        </LinearGradient>

        <View style={styles.header}>
          <FactCirclesIcon size={56} rotating />
          <Text style={styles.title}>Introductions</Text>
          <Text style={styles.subtitle}>
            Welcome to your FactCircles session. When you see the rotating icon on your screen, it's your turn.
          </Text>
        </View>

        <GrokBubble message={announcement} loading={loading} />

        {/* Participant roll call */}
        {!loading && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.rollCallTitle}>Participants</Text>
            {session.participants.map((p, i) => {
              const hasBeenIntroduced = i <= currentIntroIdx;
              return (
                <View key={p.id} style={[styles.participantCard, hasBeenIntroduced && styles.participantCardActive]}>
                  <LinearGradient
                    colors={hasBeenIntroduced ? ['#162D55', '#0F2040'] : ['#0A1628', '#0A1628']}
                    style={styles.participantInner}
                  >
                    <View style={styles.participantLeft}>
                      {hasBeenIntroduced && i === currentIntroIdx ? (
                        <FactCirclesIcon size={36} rotating />
                      ) : (
                        <View style={[styles.avatar, hasBeenIntroduced && styles.avatarActive]}>
                          <Text style={styles.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
                        </View>
                      )}
                      <View>
                        <Text style={[styles.participantName, hasBeenIntroduced && styles.participantNameActive]}>
                          {p.name}
                        </Text>
                        <Text style={styles.participantStatus}>
                          {hasBeenIntroduced
                            ? (i === currentIntroIdx ? '● Speaking' : '✓ Introduced')
                            : '○ Waiting'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.orderNum}>#{i + 1}</Text>
                  </LinearGradient>
                </View>
              );
            })}
          </Animated.View>
        )}

        {/* Guidelines reminder */}
        {allIntroduced && (
          <View style={styles.guidelinesCard}>
            <Text style={styles.guidelinesTitle}>Ready to Begin</Text>
            <Text style={styles.guidelinesText}>
              Grok will now guide you through three questions. The rotating FactCircles icon will appear on the screen of whoever's turn it is to respond. Please listen actively while others share.
            </Text>
            <Button label="Begin Questions →" onPress={handleBeginQuestions} style={styles.beginBtn} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 40 },
  topBar: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  header: { alignItems: 'center', padding: Spacing.lg, gap: Spacing.sm },
  title: { color: Colors.textPrimary, fontSize: Fonts.sizes.xxl, fontWeight: '900' },
  subtitle: { color: Colors.textSecondary, fontSize: Fonts.sizes.md, textAlign: 'center', lineHeight: 22 },
  rollCallTitle: { color: Colors.textSecondary, fontSize: Fonts.sizes.xs, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  participantCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, borderRadius: Radius.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  participantCardActive: { borderColor: Colors.primary + '50' },
  participantInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  participantLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  avatarActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  avatarText: { color: '#fff', fontSize: Fonts.sizes.md, fontWeight: '700' },
  participantName: { color: Colors.textMuted, fontSize: Fonts.sizes.md, fontWeight: '600' },
  participantNameActive: { color: Colors.textPrimary },
  participantStatus: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginTop: 2 },
  orderNum: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, fontWeight: '700' },
  guidelinesCard: {
    margin: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  guidelinesTitle: { color: Colors.primary, fontSize: Fonts.sizes.lg, fontWeight: '800' },
  guidelinesText: { color: Colors.textSecondary, fontSize: Fonts.sizes.md, lineHeight: 22 },
  beginBtn: { marginTop: Spacing.sm },
});
