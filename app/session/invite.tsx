// app/session/invite.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, FlatList, Modal, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSessionStore } from '../../src/store/sessionStore';
import { getContacts, ContactOption, sendInvitation } from '../../src/services/contactsService';
import { Button, Input, GrokBubble } from '../../src/components/ui';
import FactCirclesIcon from '../../src/components/FactCirclesIcon';
import { Colors, Fonts, Spacing, Radius } from '../../src/utils/theme';

type ContactType = 'app' | 'social' | 'phone';

interface PendingParticipant {
  name: string;
  contactType: ContactType;
  contactValue: string;
}

export default function InviteScreen() {
  const session = useSessionStore((s) => s.session);
  const addParticipant = useSessionStore((s) => s.addParticipant);
  const removeParticipant = useSessionStore((s) => s.removeParticipant);

  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [contactSearch, setContactSearch] = useState('');

  // Manual form state
  const [manualName, setManualName] = useState('');
  const [manualType, setManualType] = useState<ContactType>('phone');
  const [manualValue, setManualValue] = useState('');
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    getContacts().then(setContacts);
  }, []);

  if (!session) return null;

  const nonInitiatorParticipants = session.participants.filter((p) => !p.isInitiator);
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const handleAddManual = () => {
    if (!manualName.trim() || !manualValue.trim()) {
      Alert.alert('Required Fields', 'Please enter both a name and contact info.');
      return;
    }
    addParticipant({
      name: manualName.trim(),
      contactType: manualType,
      contactValue: manualValue.trim(),
      isInitiator: false,
      isPresent: false,
    });
    setManualName('');
    setManualValue('');
    setShowManualAdd(false);
  };

  const handleAddFromContacts = (contact: ContactOption) => {
    const contactValue = contact.phone || contact.email || '';
    const contactType: ContactType = contact.phone ? 'phone' : 'app';
    addParticipant({
      name: contact.name,
      contactType,
      contactValue,
      isInitiator: false,
      isPresent: false,
    });
    setShowContactPicker(false);
  };

  const handleSendInvite = async (participantId: string, name: string, contactValue: string, contactType: ContactType) => {
    setSending(participantId);
    await sendInvitation(name, contactValue, contactType, session.id);
    setSending(null);
    Alert.alert('Invite Sent!', `${name} has been invited to join this FactCircles session.`);
  };

  const handleContinue = () => {
    if (nonInitiatorParticipants.length === 0) {
      Alert.alert('No Participants', 'Please add at least one participant before continuing.');
      return;
    }
    router.push('/session/payment');
  };

  const TYPE_ICONS: Record<ContactType, string> = { app: 'phone-portrait', social: 'logo-instagram', phone: 'call' };
  const TYPE_LABELS: Record<ContactType, string> = { app: 'FactCircles App', social: 'Social Media', phone: 'Phone Number' };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <FactCirclesIcon size={44} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Invite Participants</Text>
            <Text style={styles.subtitle}>Each person will receive an invitation to join</Text>
          </View>
        </View>

        <GrokBubble message="To begin, please invite the people who are part of this situation. Enter their names and contact information — they'll receive an invitation to download FactCircles and join this session." />

        {/* Participant list */}
        {session.participants.map((p) => (
          <View key={p.id} style={styles.participantCard}>
            <LinearGradient colors={['#162D55', '#0F2040']} style={styles.participantInner}>
              <View style={styles.participantLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.participantName}>{p.name}</Text>
                  <Text style={styles.participantRole}>{p.isInitiator ? '⭐ Initiator' : TYPE_LABELS[p.contactType]}</Text>
                  {!p.isInitiator && <Text style={styles.participantContact}>{p.contactValue}</Text>}
                </View>
              </View>
              <View style={styles.participantActions}>
                {!p.isInitiator && (
                  <>
                    <TouchableOpacity
                      onPress={() => handleSendInvite(p.id, p.name, p.contactValue, p.contactType)}
                      style={styles.inviteBtn}
                      disabled={sending === p.id}
                    >
                      <Ionicons name={sending === p.id ? 'hourglass' : 'paper-plane'} size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeParticipant(p.id)} style={styles.removeBtn}>
                      <Ionicons name="close" size={16} color={Colors.error} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </LinearGradient>
          </View>
        ))}

        {/* Add buttons */}
        <View style={styles.addButtons}>
          {contacts.length > 0 && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowContactPicker(true)}>
              <Ionicons name="people" size={20} color={Colors.primary} />
              <Text style={styles.addBtnText}>From Contacts</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowManualAdd(true)}>
            <Ionicons name="person-add" size={20} color={Colors.accent} />
            <Text style={[styles.addBtnText, { color: Colors.accent }]}>Add Manually</Text>
          </TouchableOpacity>
        </View>

        <Button
          label={`Continue with ${session.participants.length} participant${session.participants.length !== 1 ? 's' : ''}`}
          onPress={handleContinue}
          disabled={nonInitiatorParticipants.length === 0}
          style={styles.cta}
        />
      </ScrollView>

      {/* Manual Add Modal */}
      <Modal visible={showManualAdd} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Participant</Text>
            <TouchableOpacity onPress={() => setShowManualAdd(false)}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Input label="Full Name" value={manualName} onChangeText={setManualName} placeholder="Participant's name" />

          <Text style={styles.typeLabel}>Contact Method</Text>
          <View style={styles.typeButtons}>
            {(['app', 'social', 'phone'] as ContactType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, manualType === t && styles.typeBtnActive]}
                onPress={() => setManualType(t)}
              >
                <Ionicons name={TYPE_ICONS[t] as any} size={16} color={manualType === t ? '#fff' : Colors.textSecondary} />
                <Text style={[styles.typeBtnText, manualType === t && styles.typeBtnTextActive]}>
                  {TYPE_LABELS[t]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label={manualType === 'phone' ? 'Phone Number' : manualType === 'social' ? 'Social Handle / Username' : 'FactCircles Username'}
            value={manualValue}
            onChangeText={setManualValue}
            placeholder={manualType === 'phone' ? '+1 (555) 000-0000' : '@username'}
            keyboardType={manualType === 'phone' ? 'phone-pad' : 'default'}
          />

          <Button label="Add Participant" onPress={handleAddManual} />
        </View>
      </Modal>

      {/* Contacts Picker Modal */}
      <Modal visible={showContactPicker} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Contact</Text>
            <TouchableOpacity onPress={() => setShowContactPicker(false)}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.search}
            value={contactSearch}
            onChangeText={setContactSearch}
            placeholder="Search contacts..."
            placeholderTextColor={Colors.textMuted}
          />

          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.contactRow} onPress={() => handleAddFromContacts(item)}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactDetail}>{item.phone || item.email || 'No contact info'}</Text>
                </View>
              </TouchableOpacity>
            )}
            style={styles.contactList}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  backText: { color: Colors.primary, fontSize: Fonts.sizes.md, marginLeft: 4 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  headerText: { flex: 1 },
  title: { color: Colors.textPrimary, fontSize: Fonts.sizes.xl, fontWeight: '900' },
  subtitle: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, marginTop: 2 },
  participantCard: { borderRadius: Radius.md, overflow: 'hidden', marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  participantInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  participantLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: Fonts.sizes.lg, fontWeight: '700' },
  participantName: { color: Colors.textPrimary, fontSize: Fonts.sizes.md, fontWeight: '600' },
  participantRole: { color: Colors.textSecondary, fontSize: Fonts.sizes.xs, marginTop: 1 },
  participantContact: { color: Colors.textMuted, fontSize: Fonts.sizes.xs },
  participantActions: { flexDirection: 'row', gap: Spacing.sm },
  inviteBtn: { padding: Spacing.xs, backgroundColor: Colors.primary + '20', borderRadius: Radius.sm },
  removeBtn: { padding: Spacing.xs, backgroundColor: Colors.error + '20', borderRadius: Radius.sm },
  addButtons: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm, marginBottom: Spacing.lg },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addBtnText: { color: Colors.primary, fontSize: Fonts.sizes.sm, fontWeight: '600' },
  cta: {},
  modal: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg, paddingTop: Spacing.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  modalTitle: { color: Colors.textPrimary, fontSize: Fonts.sizes.xl, fontWeight: '800' },
  typeLabel: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, fontWeight: '600', marginBottom: Spacing.sm },
  typeButtons: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeBtnText: { color: Colors.textSecondary, fontSize: Fonts.sizes.xs, fontWeight: '600' },
  typeBtnTextActive: { color: '#fff' },
  search: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Fonts.sizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  contactList: { flex: 1 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  contactName: { color: Colors.textPrimary, fontSize: Fonts.sizes.md, fontWeight: '600' },
  contactDetail: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm },
});
