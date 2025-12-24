import { jsPDF } from 'jspdf';
import { Draft, DraftSnapshot } from '../types';

export class AttestationService {
  
  // Brand Colors
  static CREME_GOLD = [193, 168, 125] as const; // #C1A87D
  static VERIFICATION_GREEN = [16, 185, 129] as const; // #10B981
  static ALERT_RED = [220, 38, 38] as const; // #DC2626
  
  static async generateCertificate(draft: Draft, snapshots: DraftSnapshot[], score: number) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 25;

    // Helper: Centered Text
    const centerText = (text: string, size: number = 12, isBold: boolean = false, color?: readonly [number, number, number]) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      if (color) doc.setTextColor(color[0], color[1], color[2]);
      else doc.setTextColor(0, 0, 0);
      const textWidth = doc.getTextWidth(text);
      doc.text(text, (pageWidth - textWidth) / 2, y);
      y += size / 2 + 4;
    };

    // Helper: Left Text
    const leftText = (text: string, size: number = 10, isBold: boolean = false) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(text, margin, y);
        y += size / 2 + 3;
    };
    
    // --- HEADER with Gold Accent Line ---
    doc.setDrawColor(...AttestationService.CREME_GOLD);
    doc.setLineWidth(3);
    doc.line(margin, margin, pageWidth - margin, margin);
    
    y = 38;
    centerText("CERTIFICATE OF SOVEREIGNTY", 24, true);
    centerText("ThesisLens | Academic Integrity Defense Platform", 10, false, [100, 100, 100]);
    
    y += 8;
    doc.setDrawColor(...AttestationService.CREME_GOLD);
    doc.setLineWidth(0.5);
    doc.line(margin + 40, y, pageWidth - margin - 40, y);
    y += 12;

    // --- VERDICT BOX ---
    const verdictColor = score >= 80 ? AttestationService.VERIFICATION_GREEN : score >= 50 ? AttestationService.CREME_GOLD : AttestationService.ALERT_RED;
    const verdictText = score >= 80 ? "VERIFIED HUMAN" : score >= 50 ? "MIXED ORIGIN" : "UNVERIFIED";
    
    // Draw Verdict Box
    doc.setFillColor(verdictColor[0], verdictColor[1], verdictColor[2]);
    doc.roundedRect(margin, y, pageWidth - 2*margin, 35, 4, 4, 'F');
    
    // Verdict Text
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${score}%`, margin + 15, y + 24);
    
    doc.setFontSize(14);
    doc.text(verdictText, margin + 60, y + 22);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text("Sovereignty Score", margin + 60, y + 30);
    
    y += 45;
    
    // --- METADATA ---
    doc.setTextColor(0, 0, 0);
    leftText(`Document: ${draft.title}`, 11, true);
    leftText(`Author ID: ${draft.userId}`, 9);
    leftText(`Generated: ${new Date().toLocaleString()}`, 9);
    leftText(`Word Count: ${draft.currentContent.split(/\s+/).filter(w => w.length > 0).length}`, 9);
    leftText(`Total Snapshots: ${snapshots.length}`, 9);
    
    y += 8;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;
    
    // --- CHAIN OF CUSTODY (TIMELINE) ---
    centerText("CHAIN OF CUSTODY LOG", 12, true, [...AttestationService.CREME_GOLD]);
    y += 4;

    const timeline = [...snapshots].reverse(); // Oldest first
    const maxEvents = 20;
    
    // Header Row
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text("Time", margin, y);
    doc.text("Event Type", margin + 35, y);
    doc.text("Impact", margin + 95, y);
    y += 7;
    doc.setLineWidth(0.2);
    doc.line(margin, y-3, pageWidth - margin, y-3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    timeline.slice(0, maxEvents).forEach(snap => {
        const time = new Date(snap.timestamp).toLocaleTimeString();
        let type = "Auto-Save";
        let impact = `${snap.charCountDelta > 0 ? '+' : ''}${snap.charCountDelta} chars`;
        
        if (snap.pasteEventDetected) {
            doc.setTextColor(...AttestationService.ALERT_RED);
            type = "⚠ HIGH-VOLUME PASTE";
        } else if (Math.abs(snap.charCountDelta) > 500) {
            doc.setTextColor(180, 100, 0);
            type = "Large Edit";
        } else {
            doc.setTextColor(60, 60, 60);
        }

        doc.text(time, margin, y);
        doc.text(type, margin + 35, y);
        doc.text(impact, margin + 95, y);
        y += 5;
    });

    if (timeline.length > maxEvents) {
        doc.setTextColor(120, 120, 120);
        doc.setFontSize(8);
        doc.text(`...and ${timeline.length - maxEvents} more events recorded.`, margin, y);
    }
    
    // --- FOOTER ---
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("This certificate was generated by ThesisLens Sovereignty Engine.", margin, pageHeight - 15);
    doc.text(`Verification ID: ${draft.id}`, margin, pageHeight - 10);
    
    // Footer Accent
    doc.setDrawColor(...AttestationService.CREME_GOLD);
    doc.setLineWidth(2);
    doc.line(margin, pageHeight - 5, pageWidth - margin, pageHeight - 5);

    // Save
    doc.save(`Sovereignty_Certificate_${draft.title.replace(/\s+/g, '_')}.pdf`);
  }
}
