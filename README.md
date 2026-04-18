# FactCircles

> AI-powered conflict resolution · 55-minute sessions · 97% success rate

Built with React Native + Expo SDK 54. Powered by Grok AI (xAI).

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Running the App](#running-the-app)
5. [Architecture Overview](#architecture-overview)
6. [Session Flow](#session-flow)
7. [Grok AI Integration](#grok-ai-integration)
8. [Payment Integration](#payment-integration)
9. [Building for Production](#building-for-production)
10. [Apple App Store Submission](#apple-app-store-submission)
11. [Security Notes](#security-notes)

---

## Project Structure

```
factcircles/
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx               # Root layout
│   ├── (tabs)/
│   │   ├── index.tsx             # Home screen
│   │   ├── saved.tsx             # Saved sessions
│   │   └── badges.tsx            # Milestone badges
│   └── session/
│       ├── setup.tsx             # Initiator setup + contacts permission
│       ├── invite.tsx            # Invite participants
│       ├── payment.tsx           # Payment/split configuration
│       ├── lobby.tsx             # Waiting room
│       ├── intro.tsx             # Participant introductions
│       ├── questions.tsx         # FactCircles Q&A (main session)
│       ├── solutions.tsx         # Grok summary + solution
│       └── complete.tsx          # Session complete + badges
├── src/
│   ├── components/
│   │   ├── ui.tsx                # Shared UI components
│   │   └── FactCirclesIcon.tsx   # Rotating SVG icon
│   ├── services/
│   │   ├── grokService.ts        # Grok AI API calls
│   │   ├── contactsService.ts    # Expo Contacts integration
│   │   └── paymentService.ts     # Stripe payment processing
│   ├── store/
│   │   └── sessionStore.ts       # Zustand global state
│   └── utils/
│       ├── theme.ts              # Design tokens
│       └── types.ts              # TypeScript interfaces
├── store-metadata/ios/           # Apple App Store submission assets
├── .env                          # ⚠️ Not committed — contains secrets
├── .gitignore
├── app.json                      # Expo + Apple/Android config
├── eas.json                      # EAS Build + Submit config
└── package.json
```

---

## Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **EAS CLI**: `npm install -g eas-cli`
- **Xcode** 15+ (for iOS builds — Mac required)
- **Apple Developer Account** ($99/year) for App Store submission

---

## Environment Setup

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your values in `.env`:
   ```
   EXPO_PUBLIC_GROK_API_KEY=xai-your-key-here
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
   EXPO_PUBLIC_APPLE_PAY_MERCHANT_ID=merchant.com.factcircles.app
   ```

3. ⚠️ **NEVER commit `.env` to version control.** It is listed in `.gitignore`.

4. **Rotate your Grok API key** if it has been shared or exposed.

---

## Running the App

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS Simulator (Mac required)
npm run ios

# Run on Android Emulator
npm run android
```

---

## Architecture Overview

### State Management — Zustand
All session state lives in `src/store/sessionStore.ts`. This includes:
- Current session (participants, phase, responses, payment)
- Session timer
- Saved sessions (persisted via AsyncStorage)
- Badges and session count

### Routing — Expo Router (file-based)
Navigation uses Expo Router v4 with file-based routing. The session flow is linear:
```
Home → Setup → Invite → Payment → Lobby → Intro → Questions → Solutions → Complete
```

### Grok AI — xAI API
All Grok interactions are in `src/services/grokService.ts`. Key functions:
- `generateOpeningStatement()` — session welcome
- `assessChallengingPersonality()` — silent assessment (hidden from UI)
- `assessDistress()` — crisis detection
- `generateQuestionPrompt()` — per-participant prompts
- `detectStoryBalloon()` — accusation detection
- `generateSolutionSummary()` — final summary + solution

---

## Session Flow

```
1. SETUP          Initiator enters name, chooses joining status, grants contacts permission
2. INVITE         Add participants by contact or manually; send invitations
3. PAYMENT        Configure payment split; process via Stripe / Apple Pay
4. LOBBY          Waiting room; participants join; Grok opening statement
5. INTRO          Roll call; participants introduced one by one with rotating icon
6. QUESTIONS      3 questions × N participants; rotating icon tracks whose turn it is
                  Grok assesses challenging personality (hidden) and starts with them
                  Story Balloon detection warns receiving participants
                  Distress monitoring triggers immediate intervention if needed
7. SOLUTIONS      Grok empathetic summary + recommended solution for all
8. COMPLETE       Thank-you message; badge unlock; option to save session record
```

---

## Grok AI Integration

Endpoint: `https://api.x.ai/v1/chat/completions`
Model: `grok-3`

The system prompt establishes Grok as an empathetic FactCircles facilitator grounded in restorative justice principles from "Live Connected" by John Richards.

**PersonaPlex Voice**: Grok's tone is warm, calm, non-judgmental, and solution-focused. It never labels participants as "criminals," "abusers," or any CHASM behavior term — instead treating these as distress signals of Disconnect.

---

## Payment Integration

Payments use **Stripe** via `@stripe/stripe-react-native`.

**To configure production payments:**
1. Create a Stripe account at stripe.com
2. Add your publishable key to `.env`
3. Create a backend endpoint to generate `PaymentIntent`s (the secret key must NEVER be on the client)
4. Update `src/services/paymentService.ts` to call your backend
5. For Apple Pay: register your merchant ID in your Apple Developer account and add it to `app.json`

**Session pricing:**
- $30 per participant per session
- Initiator can cover all, or split equally
- Extension: additional $30 per participant per 55 minutes
- Save fee: $30 per participant to save session record

---

## Building for Production

### iOS Build (requires Mac + Xcode)

```bash
# Log in to EAS
eas login

# Configure project (first time)
eas build:configure

# Production build
eas build --platform ios --profile production

# This generates a .ipa file in the EAS dashboard
# Download from: https://expo.dev/accounts/[username]/projects/factcircles/builds
```

### Local .ipa build (Xcode)

```bash
# Generate native iOS project
npx expo prebuild --platform ios

# Open in Xcode
open ios/factcircles.xcworkspace

# In Xcode:
# Product → Archive → Distribute App → App Store Connect
```

---

## Apple App Store Submission

### Requirements Checklist

- [x] Bundle ID: `com.factcircles.app` (registered in Apple Developer portal)
- [x] App icons: 1024×1024 PNG in `assets/icon.png`
- [x] Privacy usage descriptions in `app.json` (Contacts, Camera, Microphone)
- [x] Encryption declaration: `ITSAppUsesNonExemptEncryption: false`
- [x] Apple Pay merchant ID configured
- [x] Privacy policy URL: https://factcircles.com/privacy
- [x] Support URL: https://factcircles.com/support
- [ ] Screenshots (6.9", 6.5", 5.5", iPad 12.9") — generate with simulator
- [ ] App Preview video (optional but recommended)

### Submit via EAS

```bash
eas submit --platform ios --profile production
```

### Submit manually via Transporter
1. Download the `.ipa` from EAS dashboard
2. Open Transporter (free from Mac App Store)
3. Drag and drop `.ipa` → Submit

### App Store Connect
- Create new app at https://appstoreconnect.apple.com
- Fill metadata from `store-metadata/ios/metadata.md`
- Upload screenshots
- Submit for review (typically 1–3 business days)

---

## Security Notes

⚠️ **Critical security items before going to production:**

1. **Rotate your Grok API key** — the key in this project was shared in a conversation and should be considered compromised. Generate a new key at https://console.x.ai

2. **Never expose Stripe secret key** on the client — create a backend server to handle `PaymentIntent` creation

3. **Move Grok API calls to your backend** — calling Grok directly from the client exposes your API key in the app bundle. Use a proxy server.

4. **Enable Expo Updates** for OTA patches without App Store review cycles

5. **Add certificate pinning** for production API calls

---

## License

Copyright © 2024 FactCircles Inc. All rights reserved.
Based on "Live Connected" by John Richards.
