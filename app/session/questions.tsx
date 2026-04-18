// app/session/questions.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSessionStore } from '../../src/store/sessionStore';
import {
  generateQuestionPrompt,
  detectStoryBalloon,
  generateContinuePrompt,
  checkResponseComplete,
  assessChallengingPersonality,
  assessDistress,
} from '../../src/services/grokService';
import { GrokBubble, TimerDisplay, PhaseIndicator } from '../../src/components/ui';
import FactCirclesIcon from '../../src/components/FactCirclesIcon';
import { Colors, Fonts, Spacing, Radius } from '../../src/utils/theme';
import { QuestionKey, Participant } from '../../src/utils/types';

const QUESTIONS: { key: QuestionKey; label: string; color: string }[] = [
  { key: 'what_happened', label: 'What happened?', color: Colors.primary },
  { key: 'who_affected', label: 'Who is affected?', color: Colors.accent },
  { key: 'how_resolved', label: 'How can this be resolved?', color: Colors.success },
];

export default function QuestionsScreen() {
  const session = useSessionStore((s) => s.session);
  const recordResponse = useSessionStore((s) => s.recordResponse);
  const setCurrentSpeaker = useSessionStore((s) => s.setCurrentSpeaker);
  const setCurrentQuestion = useSessionStore((s) => s.setCurrentQuestion);
  const addGrokMessage = useSessionStore((s) => s.addGrokMessage);
  const sessionTimer = useSessionStore((s) => s.sessionTimer);
  const tickTimer = useSessionStore((s) => s.tickTimer);
  const startTimer = useSessionStore((s) => s.startTimer);
  const setPhase = useSessionStore((s) => s.setPhase);
  const setChallengingPersonality = useSessionStore((s) => s.setChallengingPersonality);
  const setDistress = useSessionStore((s) => s.setDistress);

  const [questionIdx, setQuestionIdx] = useState(0);
  const [participantIdx, setParticipantIdx] = useState(0);
  const [grokPrompt, setGrokPrompt] = useState('');
  const [grokLoading, setGrokLoading] = useState(true);
  const [currentResponse, setCurrentResponse] = useState('');
  const [storyBalloonWarning, setStoryBalloonWarning] = useState<string | null>(null);
  const [checkingDone, setCheckingDone] = useState(false);
  const [continuePrompt, setContinuePrompt] = useState('');
  const [assessedChallenger, setAssessedChallenger] = useState(false);
  const [distressAnnouncement, setDistressAnnouncement] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const orderedParticipants = session ? [...session.participants].sort((a, b) => a.joinedAt - b.joinedAt) : [];
  const currentQuestion = QUESTIONS[questionIdx];
  const currentParticipant = orderedParticipants[participantIdx];

  useEffect(() => {
    startTimer();
    timerRef.current = setInterval(() => tickTimer(), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Timer warning
  useEffect(() => {
    if (sessionTimer === 5 * 60) {
      Alert.alert('⏰ 5 Minutes Remaining', 'The session will end soon. Would you like to extend?', [
        { text: 'Extend Session', onPress: () => router.push('/session/complete') },
        { text: 'Continue', style: 'cancel' },
      ]);
    }
    if (sessionTimer === 0) {
      handleSessionEnd();
    }
  }, [sessionTimer]);

  useEffect(() => {
    if (currentParticipant && currentQuestion) {
      loadGrokPrompt();
      setCurrentSpeaker(currentParticipant.id);
      setCurrentQuestion(currentQuestion.key);
    }
  }, [questionIdx, participantIdx]);

  // First load: assess challenging personality
  useEffect(() => {
    if (!assessedChallenger && session && orderedParticipants.length > 0) {
      assessChallenger();
    }
  }, []);

  const assessChallenger = async () => {
    if (!session) return;
    const introResponses: Record<string, string> = {};
    orderedParticipants.forEach((p) => { introResponses[p.id] = p.name; });

    const challengerId = await assessChallengingPersonality(orderedParticipants, introResponses);
    const found = orderedParticipants.find((p) => p.id === challengerId.trim());
    if (found) {
      setChallengingPersonality(found.id);
      // Reorder so challenger goes first (silently)
      const challengerIdx = orderedParticipants.findIndex((p) => p.id === found.id);
      if (challengerIdx > 0) setParticipantIdx(challengerIdx);
    }
    setAssessedChallenger(true);

    // Assess distress
    const distressResult = await assessDistress(orderedParticipants, introResponses);
    if (distressResult.inDistress && distressResult.announcement) {
      setDistressAnnouncement(distressResult.announcement);
      if (distressResult.participantId) setDistress(distressResult.participantId);
    }
  };

  const loadGrokPrompt = async () => {
    if (!currentParticipant || !currentQuestion) return;
    setGrokLoading(true);
    setStoryBalloonWarning(null);
    const prompt = await generateQuestionPrompt(currentQuestion.key, currentParticipant.name);
    setGrokPrompt(prompt);
    addGrokMessage(prompt);
    setGrokLoading(false);
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const handleSubmitResponse = async () => {
    if (!currentResponse.trim() || !currentParticipant || !currentQuestion) return;
    setCheckingDone(true);

    // Detect story balloon
    const balloon = await detectStoryBalloon(currentResponse.trim());
    setStoryBalloonWarning(balloon);

    // Check if participant is done
    const continueQ = await checkResponseComplete(currentParticipant.name);
    setContinuePrompt(continueQ);

    setCheckingDone(false);
  };

  const handleConfirmResponse = () => {
    if (!currentParticipant || !currentQuestion) return;
    recordResponse(currentParticipant.id, currentQuestion.key, currentResponse.trim());
    addGrokMessage(`${currentParticipant.name}: ${currentResponse.trim()}`);
    setCurrentResponse('');
    setStoryBalloonWarning(null);
    setContinuePrompt('');
    advanceToNext();
  };

  const handleAddMore = () => {
    setContinuePrompt('');
    setStoryBalloonWarning(null);
  };

  const advanceToNext = () => {
    const nextParticipantIdx = participantIdx + 1;
    if (nextParticipantIdx < orderedParticipants.length) {
      setParticipantIdx(nextParticipantIdx);
    } else {
      // All participants answered this question — move to next question
      const nextQuestionIdx = questionIdx + 1;
      if (nextQuestionIdx < QUESTIONS.length) {
        setQuestionIdx(nextQuestionIdx);
        setParticipantIdx(0);
      } else {
        handleSessionEnd();
      }
    }
  };

  const handleSessionEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('solutions');
    router.push('/session/solutions');
  };

  if (!session || !currentParticipant || !currentQuestion) return null;

  const mins = Math.floor(sessionTimer / 60);
  const secs = sessionTimer % 60;
  const isTimerLow = sessionTimer < 5 * 60;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Top bar */}
        <LinearGradient colors={['#162D55', '#0F2040']} style={styles.topBar}>
          <PhaseIndicator currentPhase="questions" />
          <View style={[styles.timer, isTimerLow && styles.timerLow]}>
            <Ionicons name="time-outline" size={14} color={isTimerLow ? Colors.error : Colors.textSecondary} />
            <Text style={[styles.timerText, isTimerLow && styles.timerTextLow]}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </Text>
          </View>
        </LinearGradient>

        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Distress announcement */}
          {distressAnnouncement && (
            <View style={styles.distressCard}>
              <Ionicons name="heart" size={20} color={Colors.error} />
              <Text style={styles.distressText}>{distressAnnouncement}</Text>
              <TouchableOpacity style={styles.dojoBtn} onPress={() => Alert.alert('Depolarization Dojo', 'The Dojo feature helps participants who feel overwhelmed. Please contact support to access this feature.')}>
                <Text style={styles.dojoBtnText}>Open Dojo →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Question header */}
          <View style={styles.questionHeader}>
            <View style={[styles.questionBadge, { backgroundColor: currentQuestion.color + '20', borderColor: currentQuestion.color + '40' }]}>
              <Text style={[styles.questionNum, { color: currentQuestion.color }]}>
                Question {questionIdx + 1} of {QUESTIONS.length}
              </Text>
            </View>
            <Text style={[styles.questionText, { color: currentQuestion.color }]}>
              {currentQuestion.label}
            </Text>
          </View>

          {/* Participant turn indicator */}
          <View style={styles.turnRow}>
            {orderedParticipants.map((p, i) => {
              const isActive = i === participantIdx;
              const isDone = session.participants.find((sp) => sp.id === p.id)?.responses[currentQuestion.key];
              return (
                <View key={p.id} style={[styles.turnBubble, isActive && styles.turnBubbleActive]}>
                  {isActive ? (
                    <FactCirclesIcon size={28} rotating color="#fff" />
                  ) : (
                    <View style={[styles.turnAvatar, isDone && styles.turnAvatarDone]}>
                      {isDone ? (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      ) : (
                        <Text style={styles.turnAvatarText}>{p.name.charAt(0)}</Text>
                      )}
                    </View>
                  )}
                  <Text style={[styles.turnName, isActive && styles.turnNameActive]} numberOfLines={1}>
                    {isActive ? p.name : p.name.charAt(0) + '.'}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Grok prompt */}
          <GrokBubble message={grokPrompt} loading={grokLoading} />

          {/* Story balloon warning */}
          {storyBalloonWarning && (
            <View style={styles.balloonCard}>
              <Ionicons name="alert-circle" size={18} color={Colors.warning} />
              <View style={styles.balloonContent}>
                <Text style={styles.balloonTitle}>Suggested Response Prompt</Text>
                <Text style={styles.balloonText}>{storyBalloonWarning}</Text>
              </View>
            </View>
          )}

          {/* Continue prompt */}
          {continuePrompt ? (
            <View style={styles.continueCard}>
              <Text style={styles.continueText}>{continuePrompt}</Text>
              <View style={styles.continueButtons}>
                <TouchableOpacity style={styles.continueBtn} onPress={handleAddMore}>
                  <Text style={styles.continueBtnText}>Add More</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.continueBtn, styles.continueBtnPrimary]} onPress={handleConfirmResponse}>
                  <Text style={[styles.continueBtnText, { color: '#fff' }]}>I'm Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Response input
            !grokLoading && (
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <FactCirclesIcon size={20} rotating color={currentQuestion.color} />
                  <Text style={[styles.inputLabel, { color: currentQuestion.color }]}>
                    {currentParticipant.name}'s Response
                  </Text>
                </View>
                <TextInput
                  style={styles.responseInput}
                  value={currentResponse}
                  onChangeText={setCurrentResponse}
                  placeholder="Share your perspective here..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={[styles.submitBtn, !currentResponse.trim() && styles.submitBtnDisabled, { backgroundColor: currentQuestion.color }]}
                  onPress={handleSubmitResponse}
                  disabled={!currentResponse.trim() || checkingDone}
                >
                  <Text style={styles.submitBtnText}>
                    {checkingDone ? 'Reviewing...' : 'Submit Response'}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            )
          )}

          {/* Progress overview */}
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Session Progress</Text>
            {QUESTIONS.map((q, qi) => (
              <View key={q.key} style={styles.progressRow}>
                <View style={[styles.progressDot, qi <= questionIdx && { backgroundColor: q.color }]} />
                <Text style={[styles.progressLabel, qi === questionIdx && { color: q.color, fontWeight: '700' }]}>
                  {q.label}
                </Text>
                {qi < questionIdx && <Ionicons name="checkmark-circle" size={16} color={Colors.success} />}
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceElevated, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  timerLow: { borderColor: Colors.error, backgroundColor: Colors.error + '20' },
  timerText: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, fontWeight: '700', fontVariant: ['tabular-nums'] },
  timerTextLow: { color: Colors.error },
  scroll: { padding: Spacing.md, paddingBottom: 80 },
  distressCard: {
    backgroundColor: Colors.error + '15',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error + '40',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  distressText: { color: Colors.textPrimary, fontSize: Fonts.sizes.sm, lineHeight: 20 },
  dojoBtn: { alignSelf: 'flex-start', backgroundColor: Colors.error + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  dojoBtnText: { color: Colors.error, fontSize: Fonts.sizes.sm, fontWeight: '700' },
  questionHeader: { marginBottom: Spacing.md },
  questionBadge: { alignSelf: 'flex-start', borderRadius: Radius.full, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 4, marginBottom: Spacing.sm },
  questionNum: { fontSize: Fonts.sizes.xs, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  questionText: { fontSize: Fonts.sizes.xxl, fontWeight: '900' },
  turnRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md, flexWrap: 'wrap' },
  turnBubble: { alignItems: 'center', gap: 4, opacity: 0.5 },
  turnBubbleActive: { opacity: 1 },
  turnAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  turnAvatarDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  turnAvatarText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  turnName: { color: Colors.textMuted, fontSize: 10, fontWeight: '600' },
  turnNameActive: { color: Colors.textPrimary },
  balloonCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.warning + '15',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
    marginBottom: Spacing.sm,
  },
  balloonContent: { flex: 1 },
  balloonTitle: { color: Colors.warning, fontSize: Fonts.sizes.xs, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  balloonText: { color: Colors.textPrimary, fontSize: Fonts.sizes.sm, lineHeight: 20, fontStyle: 'italic' },
  continueCard: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  continueText: { color: Colors.textPrimary, fontSize: Fonts.sizes.md, lineHeight: 22, marginBottom: Spacing.md },
  continueButtons: { flexDirection: 'row', gap: Spacing.sm },
  continueBtn: { flex: 1, padding: Spacing.sm, borderRadius: Radius.sm, alignItems: 'center', backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border },
  continueBtnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  continueBtnText: { color: Colors.textPrimary, fontSize: Fonts.sizes.sm, fontWeight: '700' },
  inputSection: { marginTop: Spacing.sm },
  inputHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  inputLabel: { fontSize: Fonts.sizes.sm, fontWeight: '700' },
  responseInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Fonts.sizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 120,
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: Spacing.md, borderRadius: Radius.md, minHeight: 52 },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#fff', fontSize: Fonts.sizes.md, fontWeight: '700' },
  progressSection: { marginTop: Spacing.xl, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  progressTitle: { color: Colors.textSecondary, fontSize: Fonts.sizes.xs, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.sm },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  progressLabel: { flex: 1, color: Colors.textSecondary, fontSize: Fonts.sizes.sm },
});
