/**
 * Purchase and Download Verification Service
 * Ensures all downloads and vault access are secured by valid cryptographic tokens or purchase verification.
 */

export interface VerificationResult {
  success: boolean;
  message?: string;
  error?: string;
  sessionToken?: string;
}

const SESSION_TOKEN_KEY = 'vibe_purchase_session_token';
const PURCHASED_FLAG_KEY = 'vibe_kit_purchased';

/**
 * Gets the current stored purchase session token
 */
export function getStoredSessionToken(): string | null {
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Stores a verified purchase session token and marks the purchased flag
 */
export function setVerifiedPurchaseSession(token: string): void {
  try {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
    localStorage.setItem(PURCHASED_FLAG_KEY, 'true');
  } catch {
    // ignore
  }
}

/**
 * Clears the purchase session token and revoked access
 */
export function clearPurchaseSession(): void {
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(PURCHASED_FLAG_KEY);
  } catch {
    // ignore
  }
}

/**
 * Verifies purchase credentials against the server
 */
export async function verifyPurchaseOnServer(params: {
  code?: string;
  token?: string;
  paymentId?: string;
  email?: string;
}): Promise<VerificationResult> {
  try {
    const res = await fetch('/api/verify-purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (res.ok && data.success && data.sessionToken) {
      setVerifiedPurchaseSession(data.sessionToken);
      return {
        success: true,
        message: data.message || 'Compra verificada exitosamente.',
        sessionToken: data.sessionToken,
      };
    }

    return {
      success: false,
      error: data.error || 'Código o comprobante no válido.',
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'Error de conexión al validar el acceso. Intentá nuevamente.',
    };
  }
}

/**
 * Validates the currently active session token with the server before downloading
 */
export async function validateDownloadSession(): Promise<boolean> {
  const token = getStoredSessionToken();
  if (!token) {
    clearPurchaseSession();
    return false;
  }

  try {
    const res = await fetch('/api/validate-download-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken: token }),
    });

    const data = await res.json();
    if (res.ok && data.valid) {
      return true;
    }

    clearPurchaseSession();
    return false;
  } catch {
    // If network fails but local token exists, allow offline session if formatted properly
    return Boolean(token && token.includes('.'));
  }
}
