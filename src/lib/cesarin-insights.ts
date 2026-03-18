import { SimulationReport, SimulationResult } from '@/types/cesarin';

export interface ReportInsights {
  totals: {
    total: number;
    passed: number;
    failed: number;
  };
  memorySurface: {
    present: number;
    absent: number;
    coverage: number;
  };
  coOccurrence: {
    nonPassWithMemory: number;
    nonPassWithoutMemory: number;
  };
  volatility: {
    flips: Array<{
      id: string;
      from: 'PASS' | 'FAIL';
      to: 'PASS' | 'FAIL';
    }>;
  } | null;
}

/**
 * Maps a SimulationResult to a simple PASS/FAIL outcome
 */
function getOutcome(res: SimulationResult): 'PASS' | 'FAIL' {
  if (res.status) {
    return res.status === 'PASS' ? 'PASS' : 'FAIL';
  }
  return res.passed ? 'PASS' : 'FAIL';
}

/**
 * Computes structural insights for a selected report
 */
export function computeReportInsights(
  current: SimulationReport,
  previous?: SimulationReport
): ReportInsights {
  const results = current.results || [];
  
  const totals = {
    total: results.length,
    passed: results.filter(r => getOutcome(r) === 'PASS').length,
    failed: results.filter(r => getOutcome(r) === 'FAIL').length,
  };

  const memorySurface = {
    present: results.filter(r => !!r.memory_trace).length,
    absent: results.filter(r => !r.memory_trace).length,
    coverage: results.length > 0 
      ? (results.filter(r => !!r.memory_trace).length / results.length) * 100 
      : 0
  };

  const coOccurrence = {
    nonPassWithMemory: results.filter(r => getOutcome(r) === 'FAIL' && !!r.memory_trace).length,
    nonPassWithoutMemory: results.filter(r => getOutcome(r) === 'FAIL' && !r.memory_trace).length,
  };

  let volatility: ReportInsights['volatility'] = null;

  if (previous && previous.results) {
    const flips: Array<{
      id: string;
      from: 'PASS' | 'FAIL';
      to: 'PASS' | 'FAIL';
    }> = [];
    
    results.forEach(currRes => {
      const prevRes = previous.results.find(p => p.scenario_id === currRes.scenario_id);
      if (prevRes) {
        const currOutcome = getOutcome(currRes);
        const prevOutcome = getOutcome(prevRes);
        
        if (currOutcome !== prevOutcome) {
          flips.push({
            id: currRes.scenario_id,
            from: prevOutcome,
            to: currOutcome
          });
        }
      }
    });

    volatility = { flips };
  }

  return {
    totals,
    memorySurface,
    coOccurrence,
    volatility
  };
}
