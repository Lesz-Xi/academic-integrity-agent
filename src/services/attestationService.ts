import { supabase } from '../lib/supabase';
import { Draft } from '../types';

export class AttestationService {
  
  static async generateCertificate(draft: Draft, score: number) {
    try {
        console.log('[Attestation] Requesting forensic certificate for draft:', draft.id);
        console.log('[Attestation] Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

        // Add timeout to prevent hanging indefinitely
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.error('[Attestation] Request timed out after 30s');
            controller.abort();
        }, 30000);

        console.log('[Attestation] Invoking Edge Function...');
        
        const { data, error } = await supabase.functions.invoke('attest-session', {
            body: { 
                draftId: draft.id,
                // We could pass client-side score for comparison, but server should calc its own
                clientScore: score 
            }
        });
        
        clearTimeout(timeoutId);
        console.log('[Attestation] Edge Function response received');
        console.log('[Attestation] Data:', data);
        console.log('[Attestation] Error:', error);

        if (error) {
            console.error('[Attestation] Edge Function Error:', error);
            alert(`Failed to generate certificate: ${error.message || 'Unknown error'}`);
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
