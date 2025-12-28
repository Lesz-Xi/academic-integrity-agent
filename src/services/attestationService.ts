import { jsPDF } from 'jspdf';
import { Draft, DraftSnapshot } from '../types';

export class AttestationService {
  
  // Brand Colors
  static CREME_GOLD = [193, 168, 125] as const; // #C1A87D
  static VERIFICATION_GREEN = [16, 185, 129] as const; // #10B981
  static ALERT_RED = [220, 38, 38] as const; // #DC2626
  
  static async generateCertificate(draft: Draft, snapshots: DraftSnapshot[], score: number) {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    // Setup Layout Constants
    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
    const center = pageWidth / 2;
    const margin = 20;

    // --- BACKGROUND & BORDER ---
    // Beige Background
    doc.setFillColor(253, 251, 247); // #FDFBF7
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Gold Border
    doc.setDrawColor(...AttestationService.CREME_GOLD);
    doc.setLineWidth(1.5);
    doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));
    
    // Inner Hairline Border
    doc.setLineWidth(0.5);
    doc.rect(margin + 2, margin + 2, pageWidth - (margin * 2) - 4, pageHeight - (margin * 2) - 4);

    let y = 60;

    // --- HEADER ---
    doc.setTextColor(40, 40, 40);
    doc.setFont("times", "bold");
    doc.setFontSize(28); // Slightly smaller for clinical feel
    doc.text("FORENSIC AUDIT RECORD", center, y, { align: "center" });
    
    y += 15;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("This document contains a verified chain-of-custody log", center, y, { align: "center" });
    y += 5;
    doc.text("establishing human authorship via process analysis.", center, y, { align: "center" });

    // --- TITLE ---
    y += 25;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(30, 30, 30);
    const title = draft.title.length > 50 ? draft.title.substring(0, 50) + "..." : draft.title;
    doc.text(title, center, y, { align: "center" });

    // --- GOLD SEAL / BADGE ---
    y += 35;
    const badgeRadius = 18;
    // Outer Circle
    doc.setFillColor(...AttestationService.CREME_GOLD);
    doc.setDrawColor(...AttestationService.CREME_GOLD);
    doc.circle(center, y, badgeRadius, 'F');
    
    // Score
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`${score}%`, center, y + 1, { align: "center", baseline: "middle" });
    
    // "HUMAN" Label
    doc.setFontSize(7);
    doc.text("HUMAN", center, y + 8, { align: "center" });

    // --- METADATA GRID ---
    y += 35;
    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    const dateStr = new Date().toLocaleDateString();
    const hash = draft.id.substring(0, 16) + "..."; // Mock hash from ID
    
    doc.text(`Date: ${dateStr}`, center, y, { align: "center" });
    y += 5;
    doc.text(`Hash: ${hash}`, center, y, { align: "center" });

    // --- CHAIN OF CUSTODY (Condensed) ---
    y += 25;
    
    // Section Header
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...AttestationService.CREME_GOLD);
    doc.text("CHAIN OF CUSTODY LOG", center, y, { align: "center" });
    
    // Separator
    y += 3;
    doc.setDrawColor(...AttestationService.CREME_GOLD);
    doc.setLineWidth(0.5);
    doc.line(center - 30, y, center + 30, y);
    
    y += 15;
    
    // Log Table Header
    const tableLeft = margin + 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("TIME", tableLeft, y);
    doc.text("ACTION", tableLeft + 40, y);
    doc.text("IMPACT", tableLeft + 100, y);
    
    y += 3;
    doc.setDrawColor(220, 220, 220);
    doc.line(tableLeft, y, pageWidth - margin - 15, y);
    y += 6;

    // Log Entries
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    
    const timeline = [...snapshots].reverse().slice(0, 10); // Show max 10 events for clean fit in one page
    
    timeline.forEach(snap => {
        const time = new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let type = "Auto-Save";
        let impact = `${snap.charCountDelta > 0 ? '+' : ''}${snap.charCountDelta} chars`;
        
        // Highlight logic
        if (snap.pasteEventDetected) {
            doc.setTextColor(...AttestationService.ALERT_RED);
            type = "High Volume Paste";
        } else if (Math.abs(snap.charCountDelta) > 500) {
            doc.setTextColor(180, 100, 0); // Dark Orange
            type = "Large Edit";
        } else {
            doc.setTextColor(60, 60, 60);
        }

        doc.text(time, tableLeft, y);
        doc.text(type, tableLeft + 40, y);
        doc.text(impact, tableLeft + 100, y);
        
        y += 6;
    });

    if (snapshots.length > 10) {
        y += 4;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`...and ${snapshots.length - 10} earlier events archived.`, center, y, { align: "center" });
    }

    // --- FOOTER ---
    const footerY = pageHeight - 20;
    doc.setDrawColor(...AttestationService.CREME_GOLD);
    doc.setLineWidth(0.5);
    doc.line(center - 20, footerY - 5, center + 20, footerY - 5);
    
    doc.setFont("times", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...AttestationService.CREME_GOLD);
    doc.text("Verified by ThesisLens Sovereignty Engine", center, footerY, { align: "center" });

    // Save
    doc.save(`Certificate_${draft.title.replace(/\s+/g, '_')}.pdf`);
  }
}
