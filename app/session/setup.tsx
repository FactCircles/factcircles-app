// app/session/setup.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FactCirclesIcon from '../../src/components/FactCirclesIcon';
import { Button, GrokBubble, Input } from '../../src/components/ui';
import { requestContactsPermission } from '../../src/services/contactsService';
import { useSessionStore } from '../../src/store/sessionStore';
import { Colors, Fonts, Radius, Spacing } from '../../src/utils/theme';

export default function SetupScreen() {
  const createSession = useSessionStore((s) => s.createSession);
  const [name, setName] = useState('');
  const [initiatorJoining, setInitiatorJoining] = useState(true);
  const [contactsGranted, setContactsGranted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContactsPermission = async (allow: boolean) => {
    if (allow) {
      const granted = await requestContactsPermission();
      setContactsGranted(granted);
      if (!granted) {
        Alert.alert(
          'Contacts Access Denied',
          'You can still invite participants by entering their information manually.',
          [{ text: 'Continue', style: 'default' }]
        );
      }
    } else {
      setContactsGranted(false);
    }
  };

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name to start a session.');
      return;
    }
    setLoading(true);
    createSession(name.trim(), initiatorJoining);
    setLoading(false);
    router.push('/session/invite');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          <Text style={styles.backText}>Home</Text>
        </TouchableOpacity>

        {/* Icon + title */}
        <View style={styles.hero}>
          <FactCirclesIcon size={64} />
          <Text style={styles.title}>Start a FactCircle</Text>
          <Text style={styles.subtitle}>You're about to create a safe space for resolution.</Text>
        </View>

        {/* Grok intro */}
        <GrokBubble message="Welcome. I'm Grok, your FactCircles facilitator. Would it be a terrible idea to give resolution a try — and resolve this issue in less than an hour? With a 97% success rate, you're in good hands. Let's begin by getting to know you." />

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Your Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />

          {/* Initiator joining toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleLabel}>Will you join the session?</Text>
              <Text style={styles.toggleSub}>
                {initiatorJoining
                  ? 'You will participate as a member of the circle.'
                  : 'You will be removed after introductions.'}
              </Text>
            </View>
            <Switch
              value={initiatorJoining}
              onValueChange={setInitiatorJoining}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {/* Contacts permission */}
          {contactsGranted === null && (
            <View style={styles.contactsCard}>
              <Ionicons name="people-outline" size={24} color={Colors.accent} />
              <Text style={styles.contactsTitle}>Access Contacts?</Text>
              <Text style={styles.contactsText}>
                FactCircles can access your contacts to make inviting participants easier. This is optional.
              </Text>
              <View style={styles.contactsButtons}>
                <Button
                  label="Allow"
                  onPress={() => handleContactsPermission(true)}
                  style={styles.contactsBtn}
                />
                <Button
                  label="Not Now"
                  onPress={() => handleContactsPermission(false)}
                  variant="secondary"
                  style={styles.contactsBtn}
                />
              </View>
            </View>
          )}

          {contactsGranted !== null && (
            <View style={styles.contactsStatus}>
              <Ionicons
                name={contactsGranted ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={contactsGranted ? Colors.success : Colors.textMuted}
              />
              <Text style={[styles.contactsStatusText, { color: contactsGranted ? Colors.success : Colors.textMuted }]}>
                {contactsGranted ? 'Contacts access granted' : 'Contacts access skipped — manual entry available'}
              </Text>
            </View>
          )}
        </View>

        {/* Pricing notice */}
        <LinearGradient colors={['#162D55', '#0F2040']} style={styles.priceCard}>
          <Ionicons name="card-outline" size={20} color={Colors.accent} />
          <View style={styles.priceText}>
            <Text style={styles.priceTitle}>Session Fee</Text>
            <Text style={styles.priceDesc}>
              $30 per participant · You choose who pays and how to split.
              Anonymized session records can be saved after payment.
            </Text>
          </View>
        </LinearGradient>

        <Button
          label="Continue to Invite Participants"
          onPress={handleContinue}
          loading={loading}
          disabled={!name.trim() || contactsGranted === null}
          style={styles.cta}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  backText: { color: Colors.primary, fontSize: Fonts.sizes.md, marginLeft: 4 },
  hero: { alignItems: 'center', marginBottom: Spacing.lg },
  title: { color: Colors.textPrimary, fontSize: Fonts.sizes.xxl, fontWeight: '900', marginTop: Spacing.sm },
  subtitle: { color: Colors.textSecondary, fontSize: Fonts.sizes.md, marginTop: 4, textAlign: 'center' },
  form: { marginTop: Spacing.md },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  toggleText: { flex: 1, marginRight: Spacing.md },
  toggleLabel: { color: Colors.textPrimary, fontSize: Fonts.sizes.md, fontWeight: '600' },
  toggleSub: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, marginTop: 2 },
  contactsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  contactsTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.lg, fontWeight: '700' },
  contactsText: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, textAlign: 'center', lineHeight: 20 },
  contactsButtons: { flexDirection: 'row', gap: Spacing.sm, width: '100%' },
  contactsBtn: { flex: 1 },
  contactsStatus: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md },
  contactsStatusText: { fontSize: Fonts.sizes.sm },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  priceText: { flex: 1 },
  priceTitle: { color: Colors.accent, fontSize: Fonts.sizes.sm, fontWeight: '700' },
  priceDesc: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, lineHeight: 20, marginTop: 2 },
  cta: { marginTop: Spacing.sm },
});
