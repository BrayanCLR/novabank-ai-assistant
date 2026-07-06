const SESSION_STORAGE_KEY = 'novabank_session_id';

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}
