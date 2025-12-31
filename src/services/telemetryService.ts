
// Flight time: Time between KeyUp(char N) and KeyDown(char N+1)
// Dwell time: Time between KeyDown(char N) and KeyUp(char N)

export interface KeystrokeEvent {
  key: string;
  type: 'keydown' | 'keyup';
  timestamp: number;
}

export interface TelemetrySession {
  startTime: number;
  endTime?: number;
  events: KeystrokeEvent[];
  pasteEvents: PasteEvent[];
  focusEvents: FocusEvent[];
}

export interface PasteEvent {
  timestamp: number;
  charCount: number;
  contentSnippet: string; // First 20 chars for identification
}

export interface FocusEvent {
  timestamp: number;
  type: 'focus' | 'blur';
}

export class TelemetryService {
  private activeSession: TelemetrySession | null = null;
  private maxEvents = 10000; // Cap to prevent memory bloat

  startSession() {
    this.activeSession = {
      startTime: Date.now(),
      events: [],
      pasteEvents: [],
      focusEvents: []
    };
    console.log('[TelemetryService] Session started (Sovereignty Mode)');
  }

  recordKey(event: KeyboardEvent) {
    if (!this.activeSession) return;
    
    // Ignore navigation keys if usually irrelevant, but for forensics we might want them?
    // For now, let's keep everything to be safe, but maybe filter on upload.
    
    // Safety cap
    if (this.activeSession.events.length >= this.maxEvents) {
      // Circular buffer or stop? Let's just drop for now to avoid crashes.
      return; 
    }

    this.activeSession.events.push({
      key: event.key,
      type: event.type as 'keydown' | 'keyup',
      timestamp: Date.now()
    });
  }

  recordPaste(content: string) {
    if (!this.activeSession) return;
    
    this.activeSession.pasteEvents.push({
      timestamp: Date.now(),
      charCount: content.length,
      contentSnippet: content.substring(0, 20)
    });
    
    console.warn('[TelemetryService] Paste event detected! Audit log updated.');
  }

  recordFocus(type: 'focus' | 'blur') {
    if (!this.activeSession) return;
    
    this.activeSession.focusEvents.push({
      timestamp: Date.now(),
      type: type
    });
  }

  /**
   * Returns a lightweight summary for the snapshot.
   * We don't want to upload 10MB of JSON every 30 seconds.
   * We upload the full log only on "Commit" or "Attestation".
   * For periodic snapshots, we might just store metrics.
   */
  getSessionMetrics() {
    if (!this.activeSession) return null;
    
    const duration = (Date.now() - this.activeSession.startTime) / 1000;
    const keyCount = this.activeSession.events.filter(e => e.type === 'keydown').length;
    const pasteCount = this.activeSession.pasteEvents.length;
    const cpm = (keyCount / duration) * 60;

    return {
      duration,
      keyCount,
      pasteCount,
      cpm,
      // We return the raw data reference? Or a serialized version?
      // Ideally we return the object to be JSON.stringified by the caller
      raw: this.activeSession
    };
  }
  
  /**
   * Calculates a simple client-side "Integrity Score" (mock implementation).
   * Real logic happens on backend to prevent tampering.
   */
  calculateIntegritySignal(): number {
     if (!this.activeSession) return 0;
     // If pastes > 50% of characters -> Low Score
     // If variance in flight time is 0 (bot) -> Low Score
     return 100; // Placeholder
  }

  clearSession() {
    this.activeSession = null;
  }
}

export const telemetryService = new TelemetryService();
