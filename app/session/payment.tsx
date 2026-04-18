// app/session/payment.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSessionStore } from '../../src/store/sessionStore';
import { confirmPayment, formatPrice, calculateSplit } from '../../src/services/paymentService';
import { Button, GrokBubble } from '../../src/components/ui';
import { Colors, Fonts, Spacing, Radius } from '../../src/utils/theme';
import { PaymentSplit } from '../../src/utils/types';

type SplitType = 'initiator_pays_all' | 'split_equally' | 'custom';

export default function PaymentScreen() {
  const session = useSessionStore((s) => s.session);
  const setPaymentSplit = useSessionStore((s) => s.setPaymentSplit);
  const markParticipantPaid = useSessionStore((s) => s.markParticipantPaid);
  const setPhase = useSessionStore((s) => s.setPhase);

  const [splitType, setSplitType] = useState<SplitType>('initiator_pays_all');
  const [processing, setProcessing] = useState(false);
  const [useApplePay, setUseApplePay] = useState(false);

  if (!session) return null;

  const participantCount = session.participants.length;
  const totalCents = participantCount * 3000;
  const perPersonCents = 3000;

  const SPLIT_OPTIONS = [
    {
      type: 'initiator_pays_all' as SplitType,
      label: 'I\'ll Pay for Everyone',
      desc: `You cover all ${participantCount} participants`,
      amount: formatPrice(totalCents),
      icon: 'heart',
    },
    {
      type: 'split_equally' as SplitType,
      label: 'Split Equally',
      desc: `Each participant pays ${formatPrice(perPersonCents)}`,
      amount: `${formatPrice(perPersonCents)}/ea`,
      icon: 'people',
    },
  ];

  const handlePayment = async () => {
    setProcessing(true);

    const split: PaymentSplit = {
      type: splitType,
      payerIds: splitType === 'initiator_pays_all'
        ? [session.initiatorId]
        : session.participants.map((p) => p.id),
      amountCentsPerPayer: splitType === 'initiator_pays_all' ? totalCents : perPersonCents,
    };

    setPaymentSplit(split);

    // Process payment
    const result = await confirmPayment('pi_mock_' + Date.now(), useApplePay);

    if (result.success) {
      // Mark payers as paid
      split.payerIds.forEach((id) => markParticipantPaid(id));
      setPhase('lobby');
      router.push('/session/lobby');
    } else {
      Alert.alert('Payment Failed', result.error || 'Please try again.');
    }

    setProcessing(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Session Payment</Text>
        <Text style={styles.subtitle}>Choose how the session fee will be covered</Text>

        <GrokBubble message="Before we begin, the session fee of $30 per participant will be charged. You can choose to cover the cost for everyone, or split it equally. Participants are completely anonymous outside of this session — your information is protected." />

        {/* Session summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Session Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Participants</Text>
            <Text style={styles.summaryValue}>{participantCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rate</Text>
            <Text style={styles.summaryValue}>$30 per person</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>{formatPrice(totalCents)}</Text>
          </View>
          <Text style={styles.summaryNote}>
            A $30 charge per participant will appear at the end for saving the session record.
          </Text>
        </View>

        {/* Split options */}
        <Text style={styles.sectionLabel}>Who Pays?</Text>
        {SPLIT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.type}
            style={[styles.splitOption, splitType === opt.type && styles.splitOptionActive]}
            onPress={() => setSplitType(opt.type)}
          >
            <View style={[styles.splitRadio, splitType === opt.type && styles.splitRadioActive]}>
              {splitType === opt.type && <View style={styles.splitRadioDot} />}
            </View>
            <View style={styles.splitContent}>
              <View style={styles.splitTop}>
                <Text style={styles.splitLabel}>{opt.label}</Text>
                <Text style={styles.splitAmount}>{opt.amount}</Text>
              </View>
              <Text style={styles.splitDesc}>{opt.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Participant breakdown */}
        <Text style={styles.sectionLabel}>Participants</Text>
        {session.participants.map((p) => (
          <View key={p.id} style={styles.participantRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.participantName}>{p.name}</Text>
            <Text style={styles.participantFee}>
              {splitType === 'initiator_pays_all'
                ? (p.isInitiator ? formatPrice(totalCents) : 'Covered')
                : formatPrice(perPersonCents)}
            </Text>
          </View>
        ))}

        {/* Payment method */}
        <Text style={styles.sectionLabel}>Payment Method</Text>
        <View style={styles.paymentMethods}>
          <TouchableOpacity
            style={[styles.payMethod, !useApplePay && styles.payMethodActive]}
            onPress={() => setUseApplePay(false)}
          >
            <Ionicons name="card" size={20} color={!useApplePay ? '#fff' : Colors.textSecondary} />
            <Text style={[styles.payMethodText, !useApplePay && { color: '#fff' }]}>Credit Card</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.payMethod, useApplePay && styles.payMethodActive]}
            onPress={() => setUseApplePay(true)}
          >
            <Ionicons name="logo-apple" size={20} color={useApplePay ? '#fff' : Colors.textSecondary} />
            <Text style={[styles.payMethodText, useApplePay && { color: '#fff' }]}>Apple Pay</Text>
          </TouchableOpacity>
        </View>

        <Button
          label={processing ? 'Processing...' : `Pay ${splitType === 'initiator_pays_all' ? formatPrice(totalCents) : formatPrice(perPersonCents) + ' (your share)'}`}
          onPress={handlePayment}
          loading={processing}
          style={styles.payBtn}
        />

        <Text style={styles.disclaimer}>
          Your payment is processed securely. Sessions are anonymous outside of your group.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  backText: { color: Colors.primary, fontSize: Fonts.sizes.md, marginLeft: 4 },
  title: { color: Colors.textPrimary, fontSize: Fonts.sizes.xxl, fontWeight: '900', marginBottom: 4 },
  subtitle: { color: Colors.textSecondary, fontSize: Fonts.sizes.md, marginBottom: Spacing.md },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  summaryTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.md, fontWeight: '700', marginBottom: Spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm },
  summaryValue: { color: Colors.textPrimary, fontSize: Fonts.sizes.sm, fontWeight: '600' },
  summaryTotal: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 4, paddingTop: Spacing.sm },
  summaryTotalLabel: { color: Colors.textPrimary, fontSize: Fonts.sizes.md, fontWeight: '700' },
  summaryTotalValue: { color: Colors.accent, fontSize: Fonts.sizes.lg, fontWeight: '900' },
  summaryNote: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginTop: Spacing.sm, lineHeight: 18 },
  sectionLabel: { color: Colors.textSecondary, fontSize: Fonts.sizes.xs, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.sm, marginTop: Spacing.md },
  splitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  splitOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
  splitRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  splitRadioActive: { borderColor: Colors.primary },
  splitRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  splitContent: { flex: 1 },
  splitTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  splitLabel: { color: Colors.textPrimary, fontSize: Fonts.sizes.md, fontWeight: '700' },
  splitAmount: { color: Colors.accent, fontSize: Fonts.sizes.md, fontWeight: '800' },
  splitDesc: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, marginTop: 2 },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: Fonts.sizes.sm, fontWeight: '700' },
  participantName: { flex: 1, color: Colors.textPrimary, fontSize: Fonts.sizes.sm, fontWeight: '600' },
  participantFee: { color: Colors.accent, fontSize: Fonts.sizes.sm, fontWeight: '700' },
  paymentMethods: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  payMethod: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  payMethodActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  payMethodText: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, fontWeight: '600' },
  payBtn: { marginBottom: Spacing.sm },
  disclaimer: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, textAlign: 'center', lineHeight: 18 },
});
