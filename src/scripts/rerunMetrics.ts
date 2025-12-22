/**
 * Re-run metrics with refined TCR on Pilot 2.1 output
 */

import { computeAllMetrics } from '../services/metricService';
import { readFileSync } from 'fs';

const PILOT21_FILE = './pilot_outputs/condition21_2025-12-20T05-59-49-645Z.md';
const PILOT1_FILE = './pilot_outputs/condition2_2025-12-20T05-53-47-319Z.md';

async function rerunMetrics() {
  console.log('='.repeat(80));
  console.log('RE-RUNNING METRICS with REFINED TCR');
  console.log('='.repeat(80));
  
  // Load Pilot 1 output
  console.log('\n--- PILOT 1 (Original Memory Decay) ---\n');
  const pilot1Text = readFileSync(PILOT1_FILE, 'utf-8');
  const pilot1Metrics = await computeAllMetrics(pilot1Text);
  console.log('TCR (refined):', pilot1Metrics.TCR.toFixed(3));
  console.log('LCV:', pilot1Metrics.SCV.variance.toFixed(4));
  console.log('LCD:', pilot1Metrics.LCD.toFixed(3));
  console.log('HDV:', pilot1Metrics.HDV.toFixed(3));
  
  // Load Pilot 2.1 output
  console.log('\n--- PILOT 2.1 (Stronger Memory Decay + Terminology Poisoning) ---\n');
  const pilot21Text = readFileSync(PILOT21_FILE, 'utf-8');
  const pilot21Metrics = await computeAllMetrics(pilot21Text);
  console.log('TCR (refined):', pilot21Metrics.TCR.toFixed(3));
  console.log('LCV:', pilot21Metrics.SCV.variance.toFixed(4));
  console.log('LCD:', pilot21Metrics.LCD.toFixed(3));
  console.log('HDV:', pilot21Metrics.HDV.toFixed(3));
  
  // Comparison
  console.log('\n' + '='.repeat(80));
  console.log('COMPARISON: Pilot 1 vs Pilot 2.1 (Refined TCR)');
  console.log('='.repeat(80));
  
  console.log('\nTCR:');
  console.log('  Pilot 1:', pilot1Metrics.TCR.toFixed(3));
  console.log('  Pilot 2.1:', pilot21Metrics.TCR.toFixed(3));
  const tcrDelta = pilot21Metrics.TCR - pilot1Metrics.TCR;
  console.log('  Delta:', tcrDelta.toFixed(3), tcrDelta < 0 ? '✅ DRIFT DETECTED' : '');
  
  console.log('\nLCV:');
  console.log('  Pilot 1:', pilot1Metrics.SCV.variance.toFixed(4));
  console.log('  Pilot 2.1:', pilot21Metrics.SCV.variance.toFixed(4));
  const lcvDelta = pilot21Metrics.SCV.variance - pilot1Metrics.SCV.variance;
  console.log('  Delta:', lcvDelta.toFixed(4), lcvDelta > 0.001 ? '✅ VARIANCE INCREASED' : '');
  
  console.log('\nLCD:');
  console.log('  Pilot 1:', pilot1Metrics.LCD.toFixed(3));
  console.log('  Pilot 2.1:', pilot21Metrics.LCD.toFixed(3));
  
  console.log('\nHDV:');
  console.log('  Pilot 1:', pilot1Metrics.HDV.toFixed(3));
  console.log('  Pilot 2.1:', pilot21Metrics.HDV.toFixed(3));
  const hdvDelta = pilot21Metrics.HDV - pilot1Metrics.HDV;
  console.log('  Delta:', hdvDelta.toFixed(3), hdvDelta > 0.02 ? '✅ ASYMMETRY INCREASED' : '');
  
  console.log('\n' + '='.repeat(80) + '\n');
}

rerunMetrics().catch(console.error);
