// src/services/grokService.ts
import { Participant, QuestionKey, Session } from '../utils/types';

const GROK_API_URL = process.env.EXPO_PUBLIC_GROK_API_URL || 'https://api.x.ai/v1';
const GROK_API_KEY = process.env.EXPO_PUBLIC_GROK_API_KEY || '';
const GROK_MODEL = process.env.EXPO_PUBLIC_GROK_MODEL || 'grok-4.20-reasoning';

const FACTCIRCLES_SYSTEM_PROMPT = `You are Grok, the empathetic AI facilitator for FactCircles — a restorative justice platform based on the principles of "Live Connected" by John Richards.

Your role:
- Guide participants through a structured 55-minute session to resolve conflict empathetically
- Never judge, shame, or label any participant
- Focus on CONNECTION, not blame
- Ask three core questions: "What happened?", "Who is affected?", "How can this be resolved?"
- Identify Story Balloons (narratives based on incomplete information) and gently challenge them
- Recognize CHASM symptoms (Criminal, Hatred, Abusive, Selfish-narcissistic, Mental anxiety behaviors) as signals of Disconnect, not character flaws
- Always respond with warmth, empathy, and solution-focus
- Keep responses concise and conversational for mobile display
- Use the DAPS method: Demonstrate, Anticipate, Praise, Single-Out

Tone: Warm, calm, professional, hopeful. Never clinical or cold.
Format: Short paragraphs. No bullet walls. Speak to humans as humans.`;

// Core API call — uses the new /v1/responses endpoint with grok-4.20-reasoning
async function callGrok(userPrompt: string, maxOutputTokens = 500): Promise<string> {
  try {
    const response = await fetch(`${GROK_API_URL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        instructions: FACTCIRCLES_SYSTEM_PROMPT,
        input: userPrompt,
        max_output_tokens: maxOutputTokens,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Grok API error ${response.status}: ${errText}`);
    }

    const data = await response.json();

    // The /responses endpoint returns output as an array of content blocks
    // Extract the text from the first output message
    const outputText =
      data?.output?.[0]?.content?.[0]?.text ||   // structured content blocks
      data?.output_text ||                         // flat text shortcut
      data?.output ||                              // raw string fallback
      '';

    return typeof outputText === 'string' ? outputText.trim() : '';
  } catch (error) {
    console.error('Grok API error:', error);
    return "I'm here with you. Let's take a moment and try again.";
  }
}

// Opening statement for the session
export async function generateOpeningStatement(): Promise<string> {
  return callGrok(
    'Generate the FactCircles opening statement. It must convey: "You are looking to resolve an issue with a strong solution. With a 97% success rate, you can resolve this on your own time for less money than alternative processes. Would it be a terrible idea to give it a try and resolve this issue assisted by Grok AI in less than an hour? Participants are completely anonymous outside of the session that can only be saved after a $30 credit card charge per participant that will appear at the end." Make it warm, inviting, and hopeful.',
    220
  );
}

// Summarize why participants are joining
export async function summarizeParticipantReasons(
  participants: Participant[],
  reasons: Record<string, string>
): Promise<string> {
  const summaryData = participants.map((p) => ({
    name: p.name,
    reason: reasons[p.id] || 'Not provided',
  }));

  return callGrok(
    `Here are the participants and their stated reasons for joining this FactCircles session:\n\n${JSON.stringify(summaryData, null, 2)}\n\nPlease provide a brief, empathetic summary (2-3 sentences) of why this group has gathered, without naming individuals. Focus on the shared goal of resolution.`,
    300
  );
}

// Assess which participant has the most challenging disposition (hidden from UI)
export async function assessChallengingPersonality(
  participants: Participant[],
  introResponses: Record<string, string>
): Promise<string> {
  return callGrok(
    `INTERNAL ASSESSMENT — NOT SHOWN TO PARTICIPANTS.\n\nBased on these introduction responses, which participant ID shows the most signs of defensiveness, accusatory language, or Disconnect (CHASM symptoms)?\n\nResponses:\n${JSON.stringify(introResponses, null, 2)}\n\nRespond with ONLY the participant ID string. Nothing else.`,
    50
  );
}

// Assess if any participant is in distress
export async function assessDistress(
  participants: Participant[],
  responses: Record<string, string>
): Promise<{ inDistress: boolean; participantId?: string; announcement?: string }> {
  const raw = await callGrok(
    `Assess if any participant appears to be in immediate emotional distress or crisis based on these responses:\n\n${JSON.stringify(responses, null, 2)}\n\nRespond in JSON only (no markdown, no explanation): {"inDistress": boolean, "participantId": "id_or_null", "reason": "brief reason or null"}`,
    200
  );

  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    if (parsed.inDistress) {
      const announcement = await generateDistressAnnouncement(parsed.reason);
      return { inDistress: true, participantId: parsed.participantId, announcement };
    }
    return { inDistress: false };
  } catch {
    return { inDistress: false };
  }
}

async function generateDistressAnnouncement(reason: string): Promise<string> {
  return callGrok(
    `A participant appears to be in distress. Reason: ${reason}. Generate a brief, empathetic announcement to all participants that acknowledges this with care, offers support, and gently invites the Depolarization Dojo if needed. Keep it under 3 sentences. Speak directly and warmly.`,
    150
  );
}

// Announce who has joined
export async function generateJoinAnnouncement(participantNames: string[]): Promise<string> {
  return callGrok(
    `Welcome these participants to the FactCircles session: ${participantNames.join(', ')}. Generate a warm, brief welcome (2 sentences). Tell them a rotating FactCircles icon will appear on their screen when it's their turn to speak.`,
    150
  );
}

// Generate empathetic prompt for a question
export async function generateQuestionPrompt(
  question: QuestionKey,
  participantName: string
): Promise<string> {
  const questionText: Record<QuestionKey, string> = {
    what_happened: 'What happened?',
    who_affected: 'Who is affected?',
    how_resolved: 'How can this be resolved?',
  };

  return callGrok(
    `It is ${participantName}'s turn to answer the FactCircles question: "${questionText[question]}". Generate a brief, empathetic prompt (1-2 sentences) that invites them to share openly and honestly. Remind them gently to speak from their own experience, not assumptions.`,
    130
  );
}

// Generate response recommendation when a Story Balloon is detected
export async function detectStoryBalloon(response: string): Promise<string | null> {
  const result = await callGrok(
    `Is the following statement a "Story Balloon" — an accusatory or assumption-based claim that lacks factual grounding?\n\nStatement: "${response}"\n\nIf YES: suggest a gentle, empathetic recommended response prompt for the participant receiving the accusation (under 15 words, phrased as a question). If NO: respond with exactly the word NONE.`,
    100
  );
  return result.trim() === 'NONE' || result.toUpperCase().includes('NONE') ? null : result.trim();
}

// Check if participant seems done responding
export async function generateContinuePrompt(participantName: string): Promise<string> {
  return callGrok(
    `Gently ask ${participantName} if they have anything more to add to their response. One sentence only, warm and non-pressuring.`,
    70
  );
}

// Alias
export async function checkResponseComplete(participantName: string): Promise<string> {
  return generateContinuePrompt(participantName);
}

// Final summary and solution
export async function generateSolutionSummary(
  session: Session
): Promise<{ summary: string; solution: string }> {
  const allResponses: string[] = [];
  session.participants.forEach((p) => {
    Object.entries(p.responses).forEach(([q, r]) => {
      if (r) allResponses.push(`${p.name} on "${q}": ${r}`);
    });
  });

  const context = allResponses.join('\n');

  const [summary, solution] = await Promise.all([
    callGrok(
      `Based on these FactCircles session responses, provide an empathetic, non-judgmental summary (3-4 sentences) of what the participants shared. Do not single out any individual negatively. Speak to the group.\n\n${context}`,
      320
    ),
    callGrok(
      `Based on these FactCircles session responses, recommend a specific, actionable, empathetic solution (3-5 sentences) that addresses everyone's concerns. Frame it as a hopeful path forward, not a judgment of anyone.\n\n${context}`,
      420
    ),
  ]);

  return { summary, solution };
}

// Thank you message
export async function generateThankYou(participantNames: string[]): Promise<string> {
  return callGrok(
    `Generate a warm, heartfelt thank-you message to ${participantNames.join(', ')} for participating in this FactCircles session. 2-3 sentences. Acknowledge their courage in choosing resolution over conflict.`,
    160
  );
}
