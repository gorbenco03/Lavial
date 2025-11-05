const API_URL = process.env.EXPO_SERVER_URL;

export async function fetchPaymentSheetParams(bookingId: string, totalAmount?: number) {
  if (!bookingId) {
    throw new Error('Booking ID is required');
  }

  try {
    const requestBody: any = { bookingId };
    if (totalAmount !== undefined) {
      requestBody.totalAmount = totalAmount;
    }

    const response = await fetch(`${API_URL}/payments/payment-sheet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to fetch payment sheet params';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch (e) {
        // Error text is not JSON
      }
      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    const responseData = await response.json();

    const { paymentIntent, ephemeralKey, customer } = responseData;

    if (!paymentIntent || !ephemeralKey || !customer) {
      throw new Error('Missing payment sheet params');
    }

    return { paymentIntent, ephemeralKey, customer };
  } catch (error: any) {
    throw error;
  }
}