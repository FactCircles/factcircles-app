// src/store/sessionStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import {
  Badge,
  Participant,
  PaymentSplit,
  QuestionKey,
  SavedSession,
  Session,
  SessionPhase,
} from '../utils/types';

interface SessionStore {
  // Current session
  session: Session | null;
  grokMessages: string[];
  sessionTimer: number; // seconds remaining
  isTimerRunning: boolean;

  // Saved data
  savedSessions: SavedSession[];
  badges: Badge[];
  totalSessionsCompleted: number;

  // Actions
  createSession: (initiatorName: string, initiatorJoining: boolean) => void;
  addParticipant: (participant: Omit<Participant, 'id' | 'joinedAt' | 'responses' | 'hasPaid'>) => void;
  removeParticipant: (id: string) => void;
  setPaymentSplit: (split: PaymentSplit) => void;
  setPhase: (phase: SessionPhase) => void;
  setCurrentSpeaker: (id: string) => void;
  setCurrentQuestion: (q: QuestionKey) => void;
  recordResponse: (participantId: string, question: QuestionKey, response: string) => void;
  markParticipantPaid: (id: string) => void;
  setGrokSummary: (summary: string) => void;
  setGrokSolution: (solution: string) => void;
  addGrokMessage: (message: string) => void;
  setChallengingPersonality: (id: string) => void;
  setDistress: (id: string) => void;
  startTimer: () => void;
  tickTimer: () => void;
  resetTimer: () => void;
  extendSession: () => void;
  saveCurrentSession: () => void;
  loadSavedSessions: () => Promise<void>;
  clearSession: () => void;
  checkAndUnlockBadges: () => void;
}

const INITIAL_BADGES: Badge[] = [
  {
    id: 'first',
    label: '1st FactCircle',
    emoji: '🏆',
    sfSymbol: 'trophy.fill',
    description: 'Completed your first FactCircles session',
    requirement: 1,
    unlocked: false,
  },
  {
    id: 'second',
    label: '2nd FactCircle',
    emoji: '🥇',
    sfSymbol: 'medal.fill',
    description: 'Completed two FactCircles sessions',
    requirement: 2,
    unlocked: false,
  },
  {
    id: 'third',
    label: '3rd FactCircle',
    emoji: '🥈',
    sfSymbol: 'star.circle.fill',
    description: 'Completed three FactCircles sessions',
    requirement: 3,
    unlocked: false,
  },
  {
    id: 'fifth',
    label: 'Circle Champion',
    emoji: '🥉',
    sfSymbol: 'rosette',
    description: 'Completed five FactCircles sessions',
    requirement: 5,
    unlocked: false,
  },
  {
    id: 'tenth',
    label: 'Peacemaker',
    emoji: '🕊️',
    sfSymbol: 'heart.fill',
    description: 'Completed ten FactCircles sessions',
    requirement: 10,
    unlocked: false,
  },
];

export const useSessionStore = create<SessionStore>((set, get) => ({
  session: null,
  grokMessages: [],
  sessionTimer: 55 * 60,
  isTimerRunning: false,
  savedSessions: [],
  badges: INITIAL_BADGES,
  totalSessionsCompleted: 0,

  createSession: (initiatorName, initiatorJoining) => {
    const initiatorId = uuidv4();
    const session: Session = {
      id: uuidv4(),
      createdAt: Date.now(),
      phase: 'lobby',
      durationMinutes: 55,
      initiatorId,
      initiatorJoining,
      participants: initiatorJoining
        ? [
            {
              id: initiatorId,
              name: initiatorName,
              contactType: 'app',
              contactValue: '',
              joinedAt: Date.now(),
              isInitiator: true,
              isPresent: true,
              hasPaid: false,
              responses: { what_happened: '', who_affected: '', how_resolved: '' },
            },
          ]
        : [],
      paymentSplit: {
        type: 'initiator_pays_all',
        payerIds: [initiatorId],
        amountCentsPerPayer: 3000,
      },
      saved: false,
      extensionCount: 0,
      questionIndex: 0,
    };
    set({ session, grokMessages: [], sessionTimer: 55 * 60 });
  },

  addParticipant: (participantData) => {
    const { session } = get();
    if (!session) return;
    const newParticipant: Participant = {
      ...participantData,
      id: uuidv4(),
      joinedAt: Date.now(),
      hasPaid: false,
      responses: { what_happened: '', who_affected: '', how_resolved: '' },
    };
    set({
      session: {
        ...session,
        participants: [...session.participants, newParticipant],
      },
    });
  },

  removeParticipant: (id) => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        participants: session.participants.filter((p) => p.id !== id),
      },
    });
  },

  setPaymentSplit: (split) => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, paymentSplit: split } });
  },

  setPhase: (phase) => {
    const { session } = get();
    if (!session) return;
    const updates: Partial<Session> = { phase };
    if (phase === 'questions') {
      updates.startedAt = Date.now();
      updates.endsAt = Date.now() + 55 * 60 * 1000;
    }
    set({ session: { ...session, ...updates } });
  },

  setCurrentSpeaker: (id) => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, currentSpeakerId: id } });
  },

  setCurrentQuestion: (q) => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, currentQuestion: q } });
  },

  recordResponse: (participantId, question, response) => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        participants: session.participants.map((p) =>
          p.id === participantId
            ? { ...p, responses: { ...p.responses, [question]: response } }
            : p
        ),
      },
    });
  },

  markParticipantPaid: (id) => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        participants: session.participants.map((p) =>
          p.id === id ? { ...p, hasPaid: true } : p
        ),
      },
    });
  },

  setGrokSummary: (summary) => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, grokSummary: summary } });
  },

  setGrokSolution: (solution) => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, grokSolution: solution } });
  },

  addGrokMessage: (message) => {
    set((state) => ({ grokMessages: [...state.grokMessages, message] }));
  },

  setChallengingPersonality: (id) => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        participants: session.participants.map((p) =>
          p.id === id ? { ...p, isChallengingPersonality: true } : p
        ),
      },
    });
  },

  setDistress: (id) => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        participants: session.participants.map((p) =>
          p.id === id ? { ...p, isInDistress: true } : p
        ),
      },
    });
  },

  startTimer: () => set({ isTimerRunning: true }),

  tickTimer: () => {
    const { sessionTimer } = get();
    if (sessionTimer > 0) {
      set({ sessionTimer: sessionTimer - 1 });
    } else {
      set({ isTimerRunning: false });
    }
  },

  resetTimer: () => set({ sessionTimer: 55 * 60, isTimerRunning: false }),

  extendSession: () => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        extensionCount: session.extensionCount + 1,
        endsAt: (session.endsAt || Date.now()) + 55 * 60 * 1000,
        phase: 'questions',
      },
      sessionTimer: 55 * 60,
    });
  },

  saveCurrentSession: async () => {
    const { session, savedSessions } = get();
    if (!session || !session.grokSummary) return;

    const saved: SavedSession = {
      sessionId: session.id,
      savedAt: Date.now(),
      participants: session.participants.map((p) => p.name),
      grokSummary: session.grokSummary || '',
      grokSolution: session.grokSolution || '',
      responses: session.participants.flatMap((p) =>
        Object.entries(p.responses)
          .filter(([, r]) => r)
          .map(([q, r]) => ({
            question: q as QuestionKey,
            participantName: p.name,
            response: r,
          }))
      ),
    };

    const updated = [...savedSessions, saved];
    set({ savedSessions: updated, session: { ...session, saved: true } });
    await AsyncStorage.setItem('savedSessions', JSON.stringify(updated));
    get().checkAndUnlockBadges();
  },

  loadSavedSessions: async () => {
    const raw = await AsyncStorage.getItem('savedSessions');
    const countRaw = await AsyncStorage.getItem('totalSessions');
    const badgesRaw = await AsyncStorage.getItem('badges');
    if (raw) set({ savedSessions: JSON.parse(raw) });
    if (countRaw) set({ totalSessionsCompleted: parseInt(countRaw, 10) });
    if (badgesRaw) set({ badges: JSON.parse(badgesRaw) });
  },

  checkAndUnlockBadges: async () => {
    const { badges, totalSessionsCompleted } = get();
    const newTotal = totalSessionsCompleted + 1;
    const updated = badges.map((b) => ({
      ...b,
      unlocked: b.unlocked || newTotal >= b.requirement,
    }));
    set({ badges: updated, totalSessionsCompleted: newTotal });
    await AsyncStorage.setItem('badges', JSON.stringify(updated));
    await AsyncStorage.setItem('totalSessions', String(newTotal));
  },

  clearSession: () => set({ session: null, grokMessages: [], sessionTimer: 55 * 60, isTimerRunning: false }),
}));
