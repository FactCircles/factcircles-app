// app/(tabs)/saved.tsx
import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSessionStore } from '../../src/store/sessionStore';
import { Colors, Fonts, Spacing, Radius } from '../../src/utils/theme';
import { SavedSession } from '../../src/utils/types';

const QUESTION_LABELS: Record<string, string> = {
  what_happened: 'What happened?',
  who_affected: 'Who is affected?',
  how_resolved: 'How can this be resolved?',
};

export default function SavedScreen() {
  const savedSessions = useSessionStore((s) => s.savedSessions);

  const handleShare = async (session: SavedSession) => {
    await Share.share({
      message: `FactCircles Session — ${new Date(session.savedAt).toLocaleDateString()}\n\nSummary:\n${session.grokSummary}\n\nSolution:\n${session.grokSolution}`,
      title: 'My FactCircles Session',
    });
  };

  if (savedSessions.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Ionicons name="bookmark-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Saved Sessions</Text>
          <Text style={styles.emptyText}>
            Complete a FactCircles session and save it to access your summaries and solutions here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderSession = ({ item }: { item: SavedSession }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.date}>{new Date(item.savedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
          <Text style={styles.participants}>{item.participants.join(' · ')}</Text>
        </View>
        <TouchableOpacity onPress={() => handleShare(item)} style={styles.shareBtn}>
          <Ionicons name="share-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Grok Summary */}
      <LinearGradient colors={['#162D55', '#0F2040']} style={styles.grokBox}>
        <View style={styles.grokHeader}>
          <View style={styles.grokDot} />
          <Text style={styles.grokLabel}>Grok Summary</Text>
        </View>
        <Text style={styles.grokText}>{item.grokSummary}</Text>
      </LinearGradient>

      {/* Grok Solution */}
      <LinearGradient colors={['#1A3A1A', '#0F2010']} style={[styles.grokBox, { borderColor: Colors.success + '40', marginTop: Spacing.sm }]}>
        <View style={styles.grokHeader}>
          <View style={[styles.grokDot, { backgroundColor: Colors.success }]} />
          <Text style={[styles.grokLabel, { color: Colors.success }]}>Grok Solution</Text>
        </View>
        <Text style={styles.grokText}>{item.grokSolution}</Text>
      </LinearGradient>

      {/* Responses */}
      <Text style={styles.responsesTitle}>Session Responses</Text>
      {item.responses.map((r, i) => (
        <View key={i} style={styles.responseRow}>
          <Text style={styles.responseQ}>{QUESTION_LABELS[r.question]}</Text>
          <Text style={styles.responseName}>{r.participantName}</Text>
          <Text style={styles.responseText}>{r.response}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Sessions</Text>
        <Text style={styles.subtitle}>{savedSessions.length} session{savedSessions.length !== 1 ? 's' : ''} saved</Text>
      </View>
      <FlatList
        data={[...savedSessions].reverse()}
        keyExtractor={(item) => item.sessionId}
        renderItem={renderSession}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.lg, paddingBottom: Spacing.sm },
  title: { color: Colors.textPrimary, fontSize: Fonts.sizes.xxl, fontWeight: '900' },
  subtitle: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, marginTop: 2 },
  list: { padding: Spacing.md, paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  emptyTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.xl, fontWeight: '700', marginTop: Spacing.md },
  emptyText: { color: Colors.textSecondary, fontSize: Fonts.sizes.md, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  date: { color: Colors.textPrimary, fontSize: Fonts.sizes.md, fontWeight: '700' },
  participants: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, marginTop: 2 },
  shareBtn: { padding: Spacing.xs },
  grokBox: { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.primary + '40' },
  grokHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  grokDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary, marginRight: 6 },
  grokLabel: { color: Colors.primary, fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  grokText: { color: Colors.textPrimary, fontSize: Fonts.sizes.sm, lineHeight: 20 },
  responsesTitle: { color: Colors.textSecondary, fontSize: Fonts.sizes.xs, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: Spacing.md, marginBottom: Spacing.sm },
  responseRow: { marginBottom: Spacing.sm, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  responseQ: { color: Colors.primary, fontSize: Fonts.sizes.xs, fontWeight: '700', marginBottom: 2 },
  responseName: { color: Colors.accent, fontSize: Fonts.sizes.xs, marginBottom: 4 },
  responseText: { color: Colors.textPrimary, fontSize: Fonts.sizes.sm, lineHeight: 20 },
});
