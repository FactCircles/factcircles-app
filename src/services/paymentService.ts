// src/services/paymentService.ts

const SESSION_PRICE_CENTS = 3000; // $30.00

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
}

// In production: call your backend to create a PaymentIntent via Stripe server SDK
// Your backend should never expose the secret key to the client
export async function createPaymentIntent(
  participantCount: number,
  splitType: 'all' | 'equal' | 'custom',
  customAmounts?: Record<string, number>
): Promise<PaymentIntent[]> {
  const totalCents = participantCount * SESSION_PRICE_CENTS;

  // Simulate backend call — replace with real API
  console.log(`[Payment] Creating intent for ${participantCount} participants, total: $${totalCents / 100}`);

  // Mock response — replace with: fetch('https://your-backend.com/create-payment-intent', ...)
  return [
    {
      clientSecret: 'pi_mock_secret_' + Date.now(),
      amount: SESSION_PRICE_CENTS,
      currency: 'usd',
    },
  ];
}

export async function confirmPayment(
  clientSecret: string,
  useApplePay: boolean = false
): Promise<{ success: boolean; error?: string }> {
  // In production, use @stripe/stripe-react-native:
  // const { error } = await confirmPaymentSheetPayment();
  // This is a mock implementation
  console.log(`[Payment] Confirming payment: ${clientSecret}, Apple Pay: ${useApplePay}`);

  // Simulate success
  await new Promise((r) => setTimeout(r, 1500));
  return { success: true };
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function calculateSplit(
  totalParticipants: number,
  type: 'initiator_pays_all' | 'split_equally' | 'custom'
): number {
  switch (type) {
    case 'initiator_pays_all':
      return SESSION_PRICE_CENTS * totalParticipants;
    case 'split_equally':
      return SESSION_PRICE_CENTS;
    default:
      return SESSION_PRICE_CENTS;
  }
}
