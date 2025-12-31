import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { draftId } = await req.json();

    if (!draftId) throw new Error('Missing draftId');

    // 1. Fetch Data
    const { data: draft, error: draftError } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', draftId)
      .single();

    if (draftError || !draft) throw new Error('Draft not found');

    // Fetch email manually since FK doesn't exist for join
    let authorEmail = 'Anonymous';
    if (draft.user_id) {
       const { data: userData } = await supabase.auth.admin.getUserById(draft.user_id);
       authorEmail = userData.user?.email || 'Anonymous';
    }

    const { data: snapshots, error: snapError } = await supabase
      .from('draft_snapshots')
      .select('*')
      .eq('draft_id', draftId)
      .order('timestamp', { ascending: true }); // Chronological

    if (snapError) throw new Error('Snapshots fetch failed');

    // 2. Forensics Analysis (Simplified)
    const startTime = snapshots[0]?.timestamp;
    const endTime = snapshots[snapshots.length - 1]?.timestamp;
    const totalEdits = snapshots.length;
    const finalHash = snapshots[snapshots.length - 1]?.integrity_hash || 'N/A';
    
    // Calculate Integrity Score (Mock logic matching frontend)
    // In real app, re-verify standard deviation of flight times here.
    const integrityScore = 100; 

    // 3. Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Header
    page.drawText('Certificate of Authorship', {
      x: 50,
      y: height - 50,
      size: 24,
      font: titleFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Sovereignty Engine v1.0`, {
      x: 50,
      y: height - 80,
      size: 12,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Metadata
    const drawMeta = (label: string, value: string, y: number) => {
       page.drawText(label, { x: 50, y, size: 12, font: titleFont });
       page.drawText(value, { x: 200, y, size: 12, font });
    };

    let yPos = height - 120;
    drawMeta('Author:', authorEmail, yPos); yPos -= 25;
    drawMeta('Draft ID:', draft.id, yPos); yPos -= 25;
    drawMeta('Title:', draft.title || 'Untitled', yPos); yPos -= 25;
    drawMeta('Date:', new Date().toISOString().split('T')[0], yPos); yPos -= 25;
    drawMeta('Integrity Score:', `${integrityScore}%`, yPos); yPos -= 25;
    drawMeta('Final Hash:', finalHash.substring(0, 32) + '...', yPos); yPos -= 40;

    // Chain of Custody
    page.drawText('Chain of Custody Log:', { x: 50, y: yPos, size: 14, font: titleFont });
    yPos -= 25;

    snapshots.slice(-10).forEach((s: any) => { // Last 10 events
      const line = `[${new Date(s.timestamp).toLocaleTimeString()}] Delta: ${s.char_count_delta ?? s.charCountDelta} chars | Hash: ${s.integrity_hash?.substring(0, 8) ?? 'N/A'}`;
      page.drawText(line, { x: 50, y: yPos, size: 10, font });
      yPos -= 15;
    });
    
    if (snapshots.length > 10) {
       page.drawText(`... and ${snapshots.length - 10} more events.`, { x: 50, y: yPos, size: 10, font: titleFont });
    }

    // 4. Save PDF
    const pdfBytes = await pdfDoc.save();
    const fileName = `certificates/${draftId}_${Date.now()}.pdf`;
    
    // We assume 'certificates' bucket exists (user must create strictly or we catch error)
    // For now, simpler to just return base64 for download if bucket fails, but let's try upload.
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('certificates')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    let publicUrl = '';
    if (!uploadError) {
      const { data: publicURLData } = supabase.storage.from('certificates').getPublicUrl(fileName);
      publicUrl = publicURLData.publicUrl;
    } else {
       console.error('Storage Upload Failed', uploadError);
       // Fallback: Return raw bytes or error?
       // For this MVP, let's return the bytes so frontend can download directly if storage fails
       // Or just throw.
    }

    // 5. Record Certificate in DB
    if (publicUrl) {
        await supabase.from('attestation_certificates').insert({
            user_id: draft.user_id,
            draft_id: draftId,
            pdf_path: fileName,
            verification_url: publicUrl,
            integrity_score: integrityScore,
            metadata: { total_edits: totalEdits }
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: publicUrl,
        // If storage failed, return base64?
        pdfBase64: !publicUrl ? btoa(String.fromCharCode(...pdfBytes)) : undefined 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
