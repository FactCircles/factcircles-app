// src/services/contactsService.ts
import * as Contacts from 'expo-contacts';

export interface ContactOption {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export async function requestContactsPermission(): Promise<boolean> {
  const { status } = await Contacts.requestPermissionsAsync();
  return status === 'granted';
}

export async function getContacts(): Promise<ContactOption[]> {
  try {
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
      sort: Contacts.SortTypes.FirstName,
    });

    return data
      .filter((c) => c.name)
      .map((c) => ({
        id: c.id || Math.random().toString(),
        name: c.name || 'Unknown',
        phone: c.phoneNumbers?.[0]?.number,
        email: c.emails?.[0]?.email,
      }));
  } catch {
    return [];
  }
}

export async function sendInvitation(
  participantName: string,
  contactValue: string,
  contactType: 'app' | 'social' | 'phone',
  sessionId: string
): Promise<void> {
  const inviteMessage = `Hi ${participantName}! You've been invited to a FactCircles session — a confidential, AI-assisted conflict resolution session. Join here: factcircles://session/${sessionId}\n\nDon't have the app? Download it: https://factcircles.com/download`;

  // In production, this would call your backend to send SMS/push/social
  // For now, log the invitation
  console.log(`[Invitation] To: ${contactValue} (${contactType})\n${inviteMessage}`);

  // Could integrate with expo-sms or Twilio for real SMS
}
