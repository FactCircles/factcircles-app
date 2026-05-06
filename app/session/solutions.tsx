// app/session/solutions.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert, Animated,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FactCirclesIcon from '../../src/components/FactCirclesIcon';
import { Button, GrokBubble, PhaseIndicator } from '../../src/components/ui';
import { generateSolutionSummary, generateThankYou } from '../../src/services/grokService';
import { confirmPayment } from '../../src/services/paymentService';
import { useSessionStore } from '../../src/store/sessionStore';
import { Colors, Fonts, Radius, Spacing } from '../../src/utils/theme';

export default function SolutionsScreen() {
  const session = useSessionStore((s) => s.session);
  const setGrokSummary = useSessionStore((s) => s.setGrokSummary);
  const setGrokSolution = useSessionStore((s) => s.setGrokSolution);
  const saveCurrentSession = useSessionStore((s) => s.saveCurrentSession);
  const addGrokMessage = useSessionStore((s) => s.addGrokMessage);
  const setPhase = useSessionStore((s) => s.setPhase);
  const extendSession = useSessionStore((s) => s.extendSession);

  const [summary, setSummary] = useState('');
  const [solution, setSolution] = useState('');
  const [thankYou, setThankYou] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showExtend, setShowExtend] = useState(false);
  const [extending, setExtending] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSolutions();
  }, []);

  const loadSolutions = async () => {
    if (!session) return;
    setLoading(true);

    const { summary: s, solution: sol } = await generateSolutionSummary(session);
    const ty = await generateThankYou(session.participants.map((p) => p.name));

    setSummary(s);
    setSolution(sol);
    setThankYou(ty);

    setGrokSummary(s);
    setGrokSolution(sol);

    addGrokMessage(s);
    addGrokMessage(sol);

    setLoading(false);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    // Check if we need to offer extension
    const allAnswered = session.participants.every((p) =>
      p.responses.what_happened && p.responses.who_affected && p.responses.how_resolved
    );
    if (!allAnswered) {
      setShowExtend(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Process save payment
    const result = await confirmPayment('pi_save_' + Date.now(), false);
    if (result.success) {
      await saveCurrentSession();
      setSaved(true);
      Alert.alert('Session Saved!', 'Your session summary and solution have been saved to the Saved tab.');
    } else {
      Alert.alert('Payment Failed', 'Unable to process payment. Please try again.');
    }
    setSaving(false);
  };

  const handleExtend = async () => {
    setExtending(true);
    const result = await confirmPayment('pi_extend_' + Date.now(), false);
    if (result.success) {
      extendSession();
      router.replace('/session/questions');
    } else {
      Alert.alert('Payment Failed', 'Unable to process extension payment.');
    }
    setExtending(false);
  };

  const handleFinish = () => {
    setPhase('complete');
    router.replace('/session/complete');
  };

  if (!session) return null;

  const QUESTION_LABELS: Record<string, string> = {
    what_happened: 'What happened?',
    who_affected: 'Who is affected?',
    how_resolved: 'How can this be resolved?',
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <LinearGradient colors={['#162D55', '#0F2040']} style={styles.topBar}>
          <PhaseIndicator currentPhase="solutions" />
        </LinearGradient>

        {/* Header */}
        <LinearGradient colors={['#1A3A1A', '#0A1628']} style={styles.header}>
          <FactCirclesIcon size={60} />
          <Text style={styles.headerTitle}>Session Complete</Text>
          <Text style={styles.headerSubtitle}>Here is Grok's summary and recommended solution</Text>
        </LinearGradient>

        {loading ? (
          <GrokBubble message="Analyzing your responses and preparing an empathetic solution..." loading />
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Grok Summary */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionTitle}>Grok Summary</Text>
              </View>
              <LinearGradient colors={['#162D55', '#0F2040']} style={styles.grokCard}>
                <Text style={styles.grokText}>{summary}</Text>
              </LinearGradient>
            </View>

            {/* Grok Solution */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: Colors.success }]} />
                <Text style={[styles.sectionTitle, { color: Colors.success }]}>Recommended Solution</Text>
              </View>
              <LinearGradient colors={['#1A3A1A', '#0F2010']} style={[styles.grokCard, { borderColor: Colors.success + '40' }]}>
                <Text style={styles.grokText}>{solution}</Text>
              </LinearGradient>
            </View>

            {/* Thank you */}
            <GrokBubble message={thankYou} />

            {/* Response recap */}
            <View style={styles.section}>
              <Text style={styles.recapTitle}>Session Responses</Text>
              {(['what_happened', 'who_affected', 'how_resolved'] as const).map((qKey) => (
                <View key={qKey} style={styles.questionGroup}>
                  <Text style={styles.questionGroupLabel}>{QUESTION_LABELS[qKey]}</Text>
                  {session.participants.map((p) => (
                    p.responses[qKey] ? (
                      <View key={p.id} style={styles.responseRow}>
                        <View style={styles.responseAvatar}>
                          <Text style={styles.responseAvatarText}>{p.name.charAt(0)}</Text>
                        </View>
                        <View style={styles.responseContent}>
                          <Text style={styles.responseName}>{p.name}</Text>
                          <Text style={styles.responseText}>{p.responses[qKey]}</Text>
                        </View>
                      </View>
                    ) : null
                  ))}
                </View>
              ))}
            </View>

            {/* Extension offer */}
            {showExtend && !saved && (
              <View style={styles.extendCard}>
                <Ionicons name="time" size={24} color={Colors.accent} />
                <Text style={styles.extendTitle}>Need More Time?</Text>
                <Text style={styles.extendText}>
                  Not all responses were completed. Extend the session for another 55 minutes ($30/participant).
                </Text>
                <Button
                  label="Extend Session (+55 min)"
                  onPress={handleExtend}
                  loading={extending}
                  style={styles.extendBtn}
                />
              </View>
            )}

            {/* Save button */}
            {!saved ? (
              <View style={styles.saveSection}>
                <Text style={styles.saveCopy}>
                  Save this session record — summary, solution, and all responses — to your Saved tab.
                </Text>
                <Text style={styles.savePrice}>$30 per participant will be charged to save</Text>
                <Button
                  label={saving ? 'Processing...' : 'Save Session Record'}
                  onPress={handleSave}
                  loading={saving}
                  style={styles.saveBtn}
                />
                <Button
                  label="Skip & Finish"
                  onPress={handleFinish}
                  variant="ghost"
                />
              </View>
            ) : (
              <View style={styles.savedBadge}>
                <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
                <Text style={styles.savedText}>Session Saved!</Text>
                <Button label="Finish" onPress={handleFinish} style={styles.finishBtn} />
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 60 },
  topBar: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  header: { alignItems: 'center', padding: Spacing.xl, paddingTop: Spacing.xxl },
  headerTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.xxl, fontWeight: '900', marginTop: Spacing.sm },
  headerSubtitle: { color: Colors.textSecondary, fontSize: Fonts.sizes.md, marginTop: 4, textAlign: 'center' },
  section: { padding: Spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  sectionTitle: { color: Colors.primary, fontSize: Fonts.sizes.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  grokCard: { borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.primary + '40' },
  grokText: { color: Colors.textPrimary, fontSize: Fonts.sizes.md, lineHeight: 26 },
  recapTitle: { color: Colors.textSecondary, fontSize: Fonts.sizes.xs, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.md },
  questionGroup: { marginBottom: Spacing.lg },
  questionGroupLabel: { color: Colors.primary, fontSize: Fonts.sizes.sm, fontWeight: '700', marginBottom: Spacing.sm },
  responseRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  responseAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  responseAvatarText: { color: '#fff', fontSize: Fonts.sizes.sm, fontWeight: '700' },
  responseContent: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.sm, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  responseName: { color: Colors.accent, fontSize: Fonts.sizes.xs, fontWeight: '700', marginBottom: 2 },
  responseText: { color: Colors.textPrimary, fontSize: Fonts.sizes.sm, lineHeight: 20 },
  extendCard: {
    margin: Spacing.md,
    backgroundColor: Colors.accent + '15',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  extendTitle: { color: Colors.accent, fontSize: Fonts.sizes.lg, fontWeight: '800' },
  extendText: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, textAlign: 'center', lineHeight: 20 },
  extendBtn: { width: '100%' },
  saveSection: { margin: Spacing.md, alignItems: 'center' },
  saveCopy: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, textAlign: 'center', lineHeight: 20, marginBottom: 4 },
  savePrice: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginBottom: Spacing.md },
  saveBtn: { width: '100%', marginBottom: Spacing.sm },
  savedBadge: { alignItems: 'center', padding: Spacing.xl, gap: Spacing.sm },
  savedText: { color: Colors.success, fontSize: Fonts.sizes.xl, fontWeight: '800' },
  finishBtn: { width: 200 },
});
