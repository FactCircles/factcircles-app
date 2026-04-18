// src/components/ui.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, Radius, Shadows } from '../utils/theme';

// ─── Button ──────────────────────────────────────────────────────────────────
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, style, icon }: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';

  if (isPrimary) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={[styles.buttonWrapper, style]}>
        <LinearGradient
          colors={['#4A90D9', '#2E6BB0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, disabled && styles.buttonDisabled]}
        >
          {icon && <View style={styles.buttonIcon}>{icon}</View>}
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonTextPrimary}>{label}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isSecondary && styles.buttonSecondary,
        isDanger && styles.buttonDanger,
        variant === 'ghost' && styles.buttonGhost,
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      {icon && <View style={styles.buttonIcon}>{icon}</View>}
      {loading ? (
        <ActivityIndicator color={isDanger ? '#fff' : Colors.primary} size="small" />
      ) : (
        <Text
          style={[
            styles.buttonTextSecondary,
            isDanger && { color: '#fff' },
            variant === 'ghost' && { color: Colors.textSecondary },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

export function Card({ children, style, elevated }: CardProps) {
  return (
    <View style={[styles.card, elevated && styles.cardElevated, style]}>{children}</View>
  );
}

// ─── GrokBubble ───────────────────────────────────────────────────────────────
interface GrokBubbleProps {
  message: string;
  loading?: boolean;
}

export function GrokBubble({ message, loading }: GrokBubbleProps) {
  return (
    <View style={styles.grokBubble}>
      <LinearGradient
        colors={['#162D55', '#0F2040']}
        style={styles.grokBubbleInner}
      >
        <View style={styles.grokHeader}>
          <View style={styles.grokDot} />
          <Text style={styles.grokLabel}>Grok AI</Text>
        </View>
        {loading ? (
          <View style={styles.grokLoading}>
            <ActivityIndicator color={Colors.primary} size="small" />
            <Text style={styles.grokLoadingText}>Thinking...</Text>
          </View>
        ) : (
          <Text style={styles.grokText}>{message}</Text>
        )}
      </LinearGradient>
    </View>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  style?: ViewStyle;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  style,
  keyboardType = 'default',
  secureTextEntry,
}: InputProps) {
  return (
    <View style={[styles.inputWrapper, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        multiline={multiline}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        style={[styles.input, multiline && styles.inputMultiline]}
      />
    </View>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ─── TimerDisplay ─────────────────────────────────────────────────────────────
export function TimerDisplay({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds < 5 * 60;

  return (
    <View style={[styles.timer, isLow && styles.timerLow]}>
      <Text style={[styles.timerText, isLow && styles.timerTextLow]}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </Text>
    </View>
  );
}

// ─── PhaseIndicator ───────────────────────────────────────────────────────────
const PHASES = [
  { key: 'intro', label: 'Intro' },
  { key: 'questions', label: 'Questions' },
  { key: 'responses', label: 'Responses' },
  { key: 'solutions', label: 'Solutions' },
];

export function PhaseIndicator({ currentPhase }: { currentPhase: string }) {
  const currentIdx = PHASES.findIndex((p) => p.key === currentPhase);
  return (
    <View style={styles.phaseRow}>
      {PHASES.map((p, i) => (
        <React.Fragment key={p.key}>
          <View style={styles.phaseStep}>
            <View
              style={[
                styles.phaseDot,
                i <= currentIdx && styles.phaseDotActive,
                i === currentIdx && styles.phaseDotCurrent,
              ]}
            />
            <Text style={[styles.phaseLabel, i === currentIdx && styles.phaseLabelActive]}>
              {p.label}
            </Text>
          </View>
          {i < PHASES.length - 1 && (
            <View style={[styles.phaseLine, i < currentIdx && styles.phaseLineActive]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Button
  buttonWrapper: { borderRadius: Radius.md, overflow: 'hidden' },
  button: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 52,
  },
  buttonSecondary: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonDanger: { backgroundColor: Colors.error },
  buttonGhost: { backgroundColor: 'transparent' },
  buttonDisabled: { opacity: 0.5 },
  buttonIcon: { marginRight: Spacing.sm },
  buttonTextPrimary: { color: '#fff', fontSize: Fonts.sizes.md, fontWeight: '700' },
  buttonTextSecondary: { color: Colors.primary, fontSize: Fonts.sizes.md, fontWeight: '600' },

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  cardElevated: {
    backgroundColor: Colors.surfaceElevated,
    ...Shadows.md,
  },

  // Grok bubble
  grokBubble: { marginVertical: Spacing.sm, borderRadius: Radius.lg, overflow: 'hidden', ...Shadows.lg },
  grokBubbleInner: { padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.primary + '40' },
  grokHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  grokDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginRight: Spacing.xs },
  grokLabel: { color: Colors.primary, fontSize: Fonts.sizes.xs, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  grokText: { color: Colors.textPrimary, fontSize: Fonts.sizes.md, lineHeight: 24 },
  grokLoading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  grokLoadingText: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm },

  // Input
  inputWrapper: { marginBottom: Spacing.md },
  inputLabel: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, marginBottom: Spacing.xs, fontWeight: '600' },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Fonts.sizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 52,
  },
  inputMultiline: { minHeight: 100, textAlignVertical: 'top' },

  // Section
  sectionHeader: { marginBottom: Spacing.lg },
  sectionTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.xxl, fontWeight: '800' },
  sectionSubtitle: { color: Colors.textSecondary, fontSize: Fonts.sizes.md, marginTop: Spacing.xs },

  // Timer
  timer: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timerLow: { borderColor: Colors.error, backgroundColor: Colors.error + '20' },
  timerText: { color: Colors.textSecondary, fontSize: Fonts.sizes.md, fontWeight: '700', fontVariant: ['tabular-nums'] },
  timerTextLow: { color: Colors.error },

  // Phase
  phaseRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md },
  phaseStep: { alignItems: 'center', gap: 4 },
  phaseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
  phaseDotActive: { backgroundColor: Colors.primary + '60' },
  phaseDotCurrent: { backgroundColor: Colors.primary, width: 12, height: 12, borderRadius: 6 },
  phaseLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '600' },
  phaseLabelActive: { color: Colors.primary },
  phaseLine: { flex: 1, height: 1, backgroundColor: Colors.border, marginBottom: 14 },
  phaseLineActive: { backgroundColor: Colors.primary + '60' },
});
