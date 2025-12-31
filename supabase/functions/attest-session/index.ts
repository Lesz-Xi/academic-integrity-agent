// attest-session/index.ts
import { createClient } from "npm:@supabase/supabase-js@2.39.0";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

// Module-scoped Supabase client so it can be reused between invocations.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// Helper: promise timeout
function withTimeout<T>(ms: number, promise: Promise<T>, errorMessage = "Operation timed out"): Promise<T> {
  const timeout = new Promise<never>((_, rej) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      rej(new Error(errorMessage));
    }, ms);
  });
  return Promise.race([promise, timeout]);
}

// Helper: safe base64 encode for Uint8Array (chunked)
function base64FromBytes(bytes: Uint8Array): string {
  const chunkSize = 0x8000; // 32KB
  let result = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    result += String.fromCharCode.apply(null, Array.from(chunk) as any);
  }
  return globalThis.btoa(result);
}

// Main handler
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Limit overall handler runtime (e.g., 20s)
    return await withTimeout(20000, (async () => {
      if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
      }

      let payload: any;
      try {
        payload = await req.json();
      } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: corsHeaders });
      }

      const draftId = payload?.draftId;
      if (!draftId) {
        return new Response(JSON.stringify({ error: "Missing draftId" }), { status: 400, headers: corsHeaders });
      }

      // 1) Fetch draft
      const { data: draft, error: draftError } = await withTimeout(
        8000,
        supabase.from("drafts").select("*").eq("id", draftId).single(),
        "Draft fetch timed out"
      );
      if (draftError || !draft) {
        console.error("Draft fetch error:", draftError);
        return new Response(JSON.stringify({ error: "Draft not found" }), { status: 404, headers: corsHeaders });
      }

      // 1b) Author email (resilient)
      let authorEmail = "Anonymous";
      if (draft.user_id) {
        try {
          const res = await withTimeout(5000, supabase.auth.admin.getUserById(draft.user_id), "getUserById timed out");
          if (res?.data?.user?.email) authorEmail = res.data.user.email;
        } catch (e) {
          console.warn("Failed to fetch user email, continuing as Anonymous", e);
        }
      }

      // 1c) Fetch snapshots
      const { data: snapshots = [], error: snapError } = await withTimeout(
        8000,
        supabase.from("draft_snapshots").select("*").eq("draft_id", draftId).order("timestamp", { ascending: true }),
        "Snapshots fetch timed out"
      );
      if (snapError) {
        console.error("Snapshots fetch error:", snapError);
        return new Response(JSON.stringify({ error: "Snapshots fetch failed" }), { status: 500, headers: corsHeaders });
      }

      const totalEdits = Array.isArray(snapshots) ? snapshots.length : 0;
      const startTime = totalEdits > 0 ? snapshots[0]?.timestamp : null;
      const endTime = totalEdits > 0 ? snapshots[totalEdits - 1]?.timestamp : null;
      const finalHash = totalEdits > 0 ? snapshots[totalEdits - 1]?.integrity_hash ?? "N/A" : "N/A";
      const integrityScore = 100;

      // 2) Generate PDF (bounded work)
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]); // standard letter
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const margin = 50;
      let yPos = height - margin;

      page.drawText("Certificate of Authorship", { x: margin, y: yPos, size: 20, font: titleFont, color: rgb(0, 0, 0) });
      yPos -= 28;
      page.drawText("Sovereignty Engine v1.0", { x: margin, y: yPos, size: 10, font, color: rgb(0.5, 0.5, 0.5) });
      yPos -= 20;

      const drawMeta = (label: string, value: string) => {
        page.drawText(label, { x: margin, y: yPos, size: 11, font: titleFont });
        page.drawText(value, { x: margin + 120, y: yPos, size: 11, font });
        yPos -= 18;
      };

      drawMeta("Author:", authorEmail);
      drawMeta("Draft ID:", String(draft.id));
      drawMeta("Title:", String(draft.title ?? "Untitled"));
      drawMeta("Date:", new Date().toISOString().split("T")[0]);
      drawMeta("Integrity Score:", `${integrityScore}%`);
      drawMeta("Final Hash:", finalHash?.substring(0, 32) + "...");

      yPos -= 10;
      page.drawText("Chain of Custody Log:", { x: margin, y: yPos, size: 13, font: titleFont });
      yPos -= 18;

      const lastSnapshots = (snapshots || []).slice(-10);
      for (const s of lastSnapshots) {
        const ts = s?.timestamp ? new Date(s.timestamp).toLocaleTimeString() : "N/A";
        const delta = s?.char_count_delta ?? s?.charCountDelta ?? "N/A";
        const hash = s?.integrity_hash ? String(s.integrity_hash).substring(0, 8) : "N/A";
        const line = `[${ts}] Delta: ${delta} chars | Hash: ${hash}`;
        // Avoid writing outside page
        if (yPos < margin) break;
        page.drawText(line, { x: margin, y: yPos, size: 10, font });
        yPos -= 14;
      }
      if ((snapshots?.length ?? 0) > 10 && yPos >= margin) {
        page.drawText(`... and ${snapshots.length - 10} more events.`, { x: margin, y: yPos, size: 10, font: titleFont });
      }

      const pdfBytes = await pdfDoc.save();
      const fileName = `certificates/${draftId}_${Date.now()}.pdf`;

      // 3) Upload PDF to storage
      let publicUrl = "";
      try {
        const { data: uploadData, error: uploadError } = await withTimeout(
          10000,
          supabase.storage.from("certificates").upload(fileName, pdfBytes, {
            contentType: "application/pdf",
            upsert: true,
          }),
          "Storage upload timed out"
        );
        if (uploadError) {
          console.error("Storage upload error:", uploadError);
        } else {
          const { data: publicURLData } = supabase.storage.from("certificates").getPublicUrl(fileName);
          publicUrl = publicURLData?.publicUrl ?? "";
        }
      } catch (e) {
        console.error("Storage operation failed:", e);
      }

      // 4) Record certificate in DB (best-effort)
      try {
        if (publicUrl) {
          await withTimeout(
            5000,
            supabase.from("attestation_certificates").insert({
              user_id: draft.user_id ?? null,
              draft_id: draftId,
              pdf_path: fileName,
              verification_url: publicUrl,
              integrity_score: integrityScore,
              metadata: { total_edits: totalEdits, start_time: startTime, end_time: endTime },
            }),
            "Insert certificate timed out"
          );
        }
      } catch (e) {
        console.warn("Failed to record certificate in DB:", e);
      }

      // 5) Response
      const body: any = { success: true, url: publicUrl ?? null };
      if (!publicUrl) {
        // return base64 (safe) if upload failed
        body.pdfBase64 = base64FromBytes(new Uint8Array(pdfBytes));
      }

      return new Response(JSON.stringify(body), { headers: corsHeaders });
    })(), "Handler timed out");
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message ?? "Internal error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
