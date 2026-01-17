import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { supabase } from '../lib/supabase';
import { Draft } from '../types';

export class AttestationService {
  
  static async generateCertificate(draft: Draft, score: number, client: SupabaseClient<Database> = supabase, retryCount: number = 0): Promise<void> {
    try {
        console.log('[Attestation] Requesting forensic certificate for draft:', draft.id);
        console.log('[Attestation] Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('[Attestation] Attempt:', retryCount + 1);

        // Extended timeout for Supabase cold start (90 seconds)
        const TIMEOUT_MS = 90000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.error(`[Attestation] Request timed out after ${TIMEOUT_MS / 1000}s`);
            controller.abort();
        }, TIMEOUT_MS);

        console.log('[Attestation] Invoking Edge Function (timeout: 90s)...');
        const timerLabel = `[Attestation] Edge Function call ${Date.now()}`;
        console.time(timerLabel);
        
        const { data, error } = await client.functions.invoke('attest-session', {
            body: { 
                draftId: draft.id,
                // We could pass client-side score for comparison, but server should calc its own
                clientScore: score 
            }
        });
        
        clearTimeout(timeoutId);
        console.timeEnd(timerLabel);
        console.log('[Attestation] Edge Function response received');
        console.log('[Attestation] Data:', data);
        console.log('[Attestation] Error:', error);

        if (error) {
            console.error('[Attestation] Edge Function Error:', error);
            
            // Retry once if this is the first attempt
            if (retryCount === 0) {
                console.log('[Attestation] Retrying after 2 seconds...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.generateCertificate(draft, score, client, retryCount + 1);
            }
            
            alert(`Failed to generate certificate: ${error.message || 'Unknown error'}. Please try again.`);
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
        
        // Retry once on any error
        if (retryCount === 0) {
            console.log('[Attestation] Retrying after 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            return this.generateCertificate(draft, score, client, retryCount + 1);
        }
        
        alert('An unexpected error occurred during attestation. Please try again.');
    }
  }

  static async getCertificates(userId: string, _client: SupabaseClient<Database> = supabase, accessToken?: string) {
    console.log('[Attestation] getCertificates called for user:', userId);
    console.log('[Attestation] Query start time:', new Date().toISOString());
    
    try {
      // BYPASS Supabase client - use direct REST API to avoid client deadlock
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // Use passed accessToken, fallback to anon key
      const authToken = accessToken || supabaseAnonKey;
      
      console.log('[Attestation] Using direct REST API fetch with token?', !!accessToken);
      
      // AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/attestation_certificates?select=*&user_id=eq.${userId}&order=created_at.desc`,
        {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);
      
      console.log('[Attestation] Query end time:', new Date().toISOString());
      console.log('[Attestation] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Attestation] REST API Error:', errorText);
        throw new Error(`Database error: ${response.status}`);
      }
      
      const certs = await response.json();
      console.log('[Attestation] Database response:', { count: certs?.length });

      if (!certs || certs.length === 0) {
          return [];
      }

    // Map DB rows to strict Certificate interface
    return (certs || []).map((cert: any) => {
       // Attempt to extract hash from metadata if available, otherwise fallback to ID fragment
       const metadata = cert.metadata as { hash?: string } | null;
       // Format date cleanly
       const dateStr = cert.created_at ? new Date(cert.created_at).toLocaleDateString('en-US', {
           month: 'short', day: 'numeric', year: 'numeric'
       }) : 'Unknown Date';

       return {
           id: cert.id,
           draft_id: cert.draft_id,
           title: 'Untitled Draft', // TODO: Re-add draft title lookup later
           score: cert.integrity_score || 0,
           hash: metadata?.hash || `0x${cert.id.slice(0, 8)}...`, // Fallback hash
           date: dateStr,
           pdf_url: cert.verification_url // or verify logic using pdf_path
       };
    });
    } catch (err: any) {
      console.error('[Attestation] getCertificates error:', err);
      if (err.name === 'AbortError') {
        throw new Error('Request timed out - please try again');
      }
      throw err;
    }
  }

  static async deleteCertificate(certificateId: string, accessToken?: string) {
    console.log('[Attestation] Deleting certificate:', certificateId);
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const authToken = accessToken || supabaseAnonKey;
    
    // Use direct REST API to avoid Supabase client deadlock
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/attestation_certificates?id=eq.${certificateId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Attestation] Delete API Error:', errorText);
        throw new Error(`Delete failed: ${response.status}`);
      }
      
      console.log('[Attestation] Certificate deleted successfully');
    } catch (err: any) {
      console.error('[Attestation] deleteCertificate error:', err);
      if (err.name === 'AbortError') {
        throw new Error('Delete timed out - please try again');
      }
      throw err;
    }
  }
}
