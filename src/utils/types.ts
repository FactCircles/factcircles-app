// src/utils/types.ts

export type SessionPhase =
  | 'lobby'
  | 'payment'
  | 'intro'
  | 'questions'
  | 'responses'
  | 'solutions'
  | 'complete'
  | 'extension';

export type QuestionKey = 'what_happened' | 'who_affected' | 'how_resolved';

export interface Participant {
  id: string;
  name: string;
  contactType: 'app' | 'social' | 'phone';
  contactValue: string;
  joinedAt: number; // timestamp
  isInitiator: boolean;
  isPresent: boolean;
  hasPaid: boolean;
  responses: Record<QuestionKey, string>;
  isChallengingPersonality?: boolean; // assessed by Grok, hidden from UI
  isInDistress?: boolean;
}

export interface Session {
  id: string;
  createdAt: number;
  phase: SessionPhase;
  durationMinutes: number;
  startedAt?: number;
  endsAt?: number;
  initiatorId: string;
  initiatorJoining: boolean;
  participants: Participant[];
  paymentSplit: PaymentSplit;
  grokSummary?: string;
  grokSolution?: string;
  saved: boolean;
  extensionCount: number;
  currentSpeakerId?: string;
  currentQuestion?: QuestionKey;
  questionIndex: number;
}

export interface PaymentSplit {
  type: 'initiator_pays_all' | 'split_equally' | 'custom';
  payerIds: string[]; // who pays
  amountCentsPerPayer: number;
}

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokResponse {
  id: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export interface Badge {
  id: string;
  label: string;
  emoji: string;
  sfSymbol: string;
  description: string;
  requirement: number; // number of sessions
  unlocked: boolean;
}

export interface SavedSession {
  sessionId: string;
  savedAt: number;
  participants: string[]; // anonymized names
  grokSummary: string;
  grokSolution: string;
  responses: Array<{
    question: QuestionKey;
    participantName: string;
    response: string;
  }>;
}
