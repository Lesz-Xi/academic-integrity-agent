import { supabase } from '../lib/supabase';
import { Draft, DraftSnapshot } from '../types';

export class AttestationService {
  
  static async generateCertificate(draft: Draft, snapshots: DraftSnapshot[], score: number) {
    try {
        console.log('[Attestation] Requesting forensic certificate for draft:', draft.id);

        const { data, error } = await supabase.functions.invoke('attest-session', {
            body: { 
                draftId: draft.id,
                // We could pass client-side score for comparison, but server should calc its own
                clientScore: score 
            }
        });

        if (error) {
            console.error('[Attestation] Edge Function Error:', error);
            alert('Failed to generate certificate. Please try again.');
            return;
        }

        if (data?.url) {
            // Open string URL if available (Storage success)
            window.open(data.url, '_blank');
        } else if (data?.pdfBase64) {
            // Fallback: Download from Base64
            const byteCharacters = atob(data.pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Certificate_${draft.title.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            alert('Certificate generated but no download URL returned.');
        }

    } catch (err) {
        console.error('[Attestation] Service Error:', err);
        alert('An unexpected error occurred during attestation.');
    }
  }
}
