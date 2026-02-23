'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// All CPIC data embedded — works 100% offline, no backend call needed
const KNOWLEDGE: Record<string, Record<string, Record<string, { risk: string; action: string; severity: string }>>> = {
    CODEINE: {
        CYP2D6: {
            PM: { risk: 'Ineffective / Toxic', action: 'Codeine is CONTRAINDICATED. Codeine cannot be converted to morphine (PM). Risk of toxicity if genetic misclassification. Use non-opioid alternatives (NSAIDs, acetaminophen). CPIC: Avoid.', severity: 'critical' },
            IM: { risk: 'Reduced Efficacy', action: 'Reduce codeine dose by 25-50%. Expect reduced analgesia. Monitor for inadequate pain control. Consider tramadol or non-opioid alternatives.', severity: 'high' },
            NM: { risk: 'Safe', action: 'Standard codeine dosing. No pharmacogenomic restrictions. Use lowest effective dose per standard guidelines.', severity: 'low' },
            RM: { risk: 'Monitor', action: 'May have slightly enhanced efficacy. Use lowest effective dose. Monitor for adverse effects at standard doses.', severity: 'low' },
            URM: { risk: 'Toxic', action: 'Codeine is CONTRAINDICATED. CRITICALLY dangerous — ultra-rapid conversion to morphine causes respiratory depression and death. Multiple pediatric fatalities reported. Use non-opioid analgesics immediately.', severity: 'critical' },
        }
    },
    WARFARIN: {
        CYP2C9: {
            PM: { risk: 'Bleeding Risk', action: 'Predicted warfarin dose requirement reduced 65-75% vs. average. Start with 1-2 mg/day. Increase INR monitoring frequency (every 3-5 days). Target INR 2.0-3.0. Consider genetic dosing algorithm (IWPC or CPIC).', severity: 'critical' },
            IM: { risk: 'Bleeding Risk', action: 'Warfarin dose requirement reduced 20-40%. Use pharmacogenomically-adjusted initial dose. Begin INR monitoring every 5-7 days during stabilization phase.', severity: 'high' },
            NM: { risk: 'Safe', action: 'Standard warfarin dosing algorithm. Target INR 2.0-3.0 per indication. Routine INR monitoring per standard protocol.', severity: 'low' },
        }
    },
    CLOPIDOGREL: {
        CYP2C19: {
            PM: { risk: 'Ineffective', action: 'Clopidogrel CONTRAINDICATED: insufficient bioactivation due to absent CYP2C19 enzyme activity. Prescribe prasugrel (if ACS/PCI) or ticagrelor. Avoid clopidogrel unless no alternatives exist.', severity: 'critical' },
            IM: { risk: 'Reduced Efficacy', action: 'Consider prasugrel or ticagrelor for ACS/PCI patients (high atherothrombotic risk). Clopidogrel may be acceptable for low-risk indications with careful monitoring.', severity: 'high' },
            NM: { risk: 'Safe', action: 'Standard clopidogrel dosing (75mg/day maintenance). No pharmacogenomic modifications required.', severity: 'low' },
            RM: { risk: 'Safe / Enhanced', action: 'Likely good clopidogrel response. Standard dosing applies. Monitor for potential increased bleeding with high-dose regimens.', severity: 'low' },
            URM: { risk: 'Increased Bleeding', action: 'Enhanced clopidogrel bioactivation may increase bleeding risk. Use with caution. Consider platelet function testing. Standard 75mg dose; monitor for bleeding.', severity: 'moderate' },
        }
    },
    SIMVASTATIN: {
        SLCO1B1: {
            PM: { risk: 'Myopathy Risk', action: 'Simvastatin 80mg CONTRAINDICATED; avoid simvastatin 40mg. Switch to pravastatin or rosuvastatin (SLCO1B1-independent). If statin therapy essential, use lowest effective dose with monthly CK monitoring.', severity: 'critical' },
            IM: { risk: 'Increased Risk', action: 'Avoid simvastatin doses above 20mg. Consider rosuvastatin or pravastatin as alternatives. If simvastatin used, monitor CK levels every 3 months.', severity: 'high' },
            NM: { risk: 'Safe', action: 'Standard simvastatin dosing (up to 40mg/day per indication). Routine clinical monitoring.', severity: 'low' },
        }
    },
    AZATHIOPRINE: {
        TPMT: {
            PM: { risk: 'Severe Toxicity', action: 'Azathioprine/6-MP CONTRAINDICATED at standard doses. Reduce dose by 90% (10-15% of standard) OR switch to non-thiopurine agent. CBC monitoring weekly for first 4 weeks, then every 2 weeks. CPIC Level A recommendation.', severity: 'critical' },
            IM: { risk: 'Toxicity Risk', action: 'Reduce azathioprine dose by 30-70% of standard dose. Monitor CBC biweekly for first 2 months, then monthly. Hold therapy for WBC < 3.0 × 10⁹/L.', severity: 'high' },
            NM: { risk: 'Safe', action: 'Standard azathioprine dosing (1-3 mg/kg/day). CBC monitoring every 3 months per standard protocol.', severity: 'low' },
        }
    },
    FLUOROURACIL: {
        DPYD: {
            PM: { risk: 'Fatal Toxicity', action: '5-FU/Capecitabine CONTRAINDICATED. Complete DPD deficiency → life-threatening or fatal toxicity at standard doses. Only consider with ≥50% dose reduction AND informed consent. Prefer non-fluoropyrimidine regimens. Formal toxicity monitoring protocol required.', severity: 'critical' },
            IM: { risk: 'Severe Toxicity Risk', action: 'Mandatory 50% 5-FU/capecitabine dose reduction before ANY treatment. Therapeutic drug monitoring strongly recommended. Obtain oncology pharmacogenomics consultation. Resume escalation only with documented tolerance.', severity: 'critical' },
            NM: { risk: 'Safe', action: 'Standard 5-FU/capecitabine dosing per tumor protocol. Monitor for standard fluoropyrimidine toxicity (mucositis, myelosuppression, hand-foot syndrome).', severity: 'low' },
        }
    }
}

const GENES_FOR_DRUG: Record<string, string> = {
    CODEINE: 'CYP2D6', WARFARIN: 'CYP2C9', CLOPIDOGREL: 'CYP2C19', SIMVASTATIN: 'SLCO1B1', AZATHIOPRINE: 'TPMT', FLUOROURACIL: 'DPYD'
}

const PHENOTYPES_FOR_GENE: Record<string, { code: string; name: string; diplotype: string; score: string }[]> = {
    CYP2D6: [
        { code: 'PM', name: 'Poor Metabolizer', diplotype: '*4/*4', score: '0.0' },
        { code: 'IM', name: 'Intermediate Metabolizer', diplotype: '*1/*4', score: '1.0' },
        { code: 'NM', name: 'Normal Metabolizer', diplotype: '*1/*1', score: '2.0' },
        { code: 'RM', name: 'Rapid Metabolizer', diplotype: '*1/*2', score: '2.0' },
        { code: 'URM', name: 'Ultra-Rapid Metabolizer', diplotype: '*1xN/*2xN', score: '≥3.0' },
    ],
    CYP2C9: [
        { code: 'PM', name: 'Poor Metabolizer', diplotype: '*3/*3', score: '0.5' },
        { code: 'IM', name: 'Intermediate Metabolizer', diplotype: '*1/*3', score: '1.25' },
        { code: 'NM', name: 'Normal Metabolizer', diplotype: '*1/*1', score: '2.0' },
    ],
    CYP2C19: [
        { code: 'PM', name: 'Poor Metabolizer', diplotype: '*2/*2', score: '0' },
        { code: 'IM', name: 'Intermediate Metabolizer', diplotype: '*1/*2', score: '1.0' },
        { code: 'NM', name: 'Normal Metabolizer', diplotype: '*1/*1', score: '2.0' },
        { code: 'RM', name: 'Rapid Metabolizer', diplotype: '*1/*17', score: '2.5' },
        { code: 'URM', name: 'Ultra-Rapid Metabolizer', diplotype: '*17/*17', score: '3.0' },
    ],
    SLCO1B1: [
        { code: 'PM', name: 'Poor Function', diplotype: '*5/*5', score: '0' },
        { code: 'IM', name: 'Intermediate Function', diplotype: '*1/*5', score: '1.0' },
        { code: 'NM', name: 'Normal Function', diplotype: '*1/*1', score: '2.0' },
    ],
    TPMT: [
        { code: 'PM', name: 'Poor Metabolizer', diplotype: '*3A/*3A', score: '0' },
        { code: 'IM', name: 'Intermediate Metabolizer', diplotype: '*1/*3C', score: '1.0' },
        { code: 'NM', name: 'Normal Metabolizer', diplotype: '*1/*1', score: '2.0' },
    ],
    DPYD: [
        { code: 'PM', name: 'Poor Metabolizer', diplotype: '*2A/*2A', score: '0' },
        { code: 'IM', name: 'Intermediate Metabolizer', diplotype: '*1/*2A', score: '1.0' },
        { code: 'NM', name: 'Normal Metabolizer', diplotype: 'wt/wt', score: '2.0' },
    ],
}

const SEVERITY_CFG: Record<string, { color: string; bg: string; label: string }> = {
    critical: { color: '#f87171', bg: 'rgba(248,113,113,0.10)', label: '⛔ Critical' },
    high: { color: '#fbbf24', bg: 'rgba(251,191,36,0.10)', label: '⚠ High Risk' },
    moderate: { color: '#c084fc', bg: 'rgba(192,132,252,0.10)', label: '◈ Moderate' },
    low: { color: '#34d399', bg: 'rgba(52,211,153,0.10)', label: '✓ Safe' },
}

const DRUGS = ['CODEINE', 'WARFARIN', 'CLOPIDOGREL', 'SIMVASTATIN', 'AZATHIOPRINE', 'FLUOROURACIL']
const DRUG_EMOJI: Record<string, string> = { CODEINE: '💊', WARFARIN: '🩸', CLOPIDOGREL: '❤️', SIMVASTATIN: '🫀', AZATHIOPRINE: '🛡', FLUOROURACIL: '🧪' }

export default function CalculatorPage() {
    const [drug, setDrug] = useState('CODEINE')
    const [phenotype, setPhenotype] = useState('NM')
    const [result, setResult] = useState<{ risk: string; action: string; severity: string } | null>(null)
    const [history, setHistory] = useState<{ drug: string; phenotype: string; diplotype: string; severity: string; risk: string }[]>([])

    const gene = GENES_FOR_DRUG[drug]
    const phenotypes = PHENOTYPES_FOR_GENE[gene] || []
    const selectedPheno = phenotypes.find(p => p.code === phenotype) || phenotypes[0]

    useEffect(() => {
        // Auto-reset phenotype to NM when drug changes if not applicable
        const available = (PHENOTYPES_FOR_GENE[GENES_FOR_DRUG[drug]] || []).map(p => p.code)
        if (!available.includes(phenotype)) setPhenotype('NM')
    }, [drug])

    const calculate = () => {
        const geneRules = KNOWLEDGE[drug]?.[gene]
        const r = geneRules?.[phenotype]
        if (r) {
            setResult(r)
            setHistory(h => [{ drug, phenotype, diplotype: selectedPheno?.diplotype || '?', severity: r.severity, risk: r.risk }, ...h.slice(0, 9)])
        }
    }

    const cfg = result ? (SEVERITY_CFG[result.severity] || SEVERITY_CFG.low) : null

    return (
        <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 66px)', padding: '56px 40px 80px' }}>
            <div style={{ maxWidth: 980, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div className="section-label" style={{ justifyContent: 'center' }}>Offline Clinical Tool</div>
                    <h1 style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.025em', marginBottom: 12 }}>
                        Risk <span className="gradient-text">Calculator</span>
                    </h1>
                    <p style={{ color: 'var(--text-2)', fontSize: 15, maxWidth: 520, margin: '0 auto' }}>
                        Instantly look up CPIC clinical guidance for any drug-gene phenotype combination. No VCF required — works offline.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)', gap: 20, alignItems: 'start' }}>

                    {/* Control panel */}
                    <div>
                        {/* Drug picker */}
                        <div className="glass" style={{ padding: 28, marginBottom: 16 }}>
                            <div className="section-label">Step 1 — Select Drug</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                                {DRUGS.map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDrug(d)}
                                        style={{
                                            padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                                            background: drug === d ? 'var(--accent-dim)' : 'var(--bg-input)',
                                            border: drug === d ? '1px solid var(--border-accent)' : '1px solid var(--border)',
                                            color: drug === d ? 'var(--accent)' : 'var(--text-2)',
                                            fontWeight: 700, fontSize: 12, textAlign: 'left', transition: 'all 0.2s',
                                            fontFamily: 'Space Grotesk, sans-serif',
                                        }}
                                    >
                                        <div>{DRUG_EMOJI[d]} {d}</div>
                                        <div style={{ fontWeight: 500, color: 'var(--text-3)', fontSize: 10, marginTop: 2 }}>{GENES_FOR_DRUG[d]}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Phenotype picker */}
                        <div className="glass" style={{ padding: 28, marginBottom: 16 }}>
                            <div className="section-label">Step 2 — Select Phenotype</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                                {phenotypes.map(p => (
                                    <button
                                        key={p.code}
                                        onClick={() => setPhenotype(p.code)}
                                        style={{
                                            padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                                            background: phenotype === p.code ? 'var(--accent-dim)' : 'var(--bg-input)',
                                            border: phenotype === p.code ? '1px solid var(--border-accent)' : '1px solid var(--border)',
                                            color: phenotype === p.code ? 'var(--accent)' : 'var(--text-2)',
                                            fontWeight: 600, fontSize: 13, textAlign: 'left', transition: 'all 0.2s',
                                            fontFamily: 'Space Grotesk, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        }}
                                    >
                                        <div>
                                            <span className="mono" style={{ fontWeight: 800, color: phenotype === p.code ? 'var(--accent)' : 'var(--text-1)' }}>{p.code}</span>
                                            <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-3)' }}>{p.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <code className="mono" style={{ fontSize: 10, color: 'var(--accent-2)', background: 'var(--accent-2-dim)', padding: '2px 7px', borderRadius: 5 }}>{p.diplotype}</code>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={calculate}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 14 }}
                        >
                            ⚡ Get Clinical Guidance
                        </button>
                    </div>

                    {/* Result + history */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {result && cfg ? (
                            <div style={{ padding: 28, borderRadius: 20, background: cfg.bg, border: `1px solid ${cfg.color}35` }}>
                                {/* Risk label */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                                    <div>
                                        <div style={{ fontWeight: 900, color: cfg.color, fontSize: 22, letterSpacing: '-0.02em' }}>{result.risk}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>{drug} · {gene} · {selectedPheno?.diplotype}</div>
                                    </div>
                                    <div style={{ padding: '6px 14px', borderRadius: 10, background: `${cfg.color}20`, color: cfg.color, fontSize: 12, fontWeight: 800, border: `1px solid ${cfg.color}30` }}>
                                        {cfg.label}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div style={{ height: 1, background: `${cfg.color}25`, marginBottom: 16 }} />

                                {/* Clinical action text */}
                                <div style={{ fontSize: 14, color: 'var(--text-1)', lineHeight: 1.75 }}>
                                    {result.action}
                                </div>

                                {/* CPIC badge */}
                                <div style={{ marginTop: 18, padding: '8px 14px', borderRadius: 10, background: 'var(--bg-input)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>CPIC Tier A</span>
                                    <span>·</span>
                                    <span>{drug} + {gene} Guideline</span>
                                    <span>·</span>
                                    <span>cpicpgx.org</span>
                                </div>

                                {/* Link to upload if they have a VCF */}
                                <div style={{ marginTop: 14 }}>
                                    <Link href="/upload">
                                        <button className="btn btn-ghost" style={{ fontSize: 12, padding: '8px 16px', borderRadius: 10 }}>
                                            Have a VCF? Run full analysis →
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="glass" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
                                <div style={{ fontWeight: 700, color: 'var(--text-2)', fontSize: 15, marginBottom: 6 }}>Select a drug and phenotype</div>
                                <div style={{ fontSize: 13 }}>Instant CPIC clinical guidance will appear here. No API calls, no VCF needed.</div>
                            </div>
                        )}

                        {/* Session history */}
                        {history.length > 0 && (
                            <div className="glass" style={{ padding: 20 }}>
                                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Session History</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {history.map((h, i) => {
                                        const hcfg = SEVERITY_CFG[h.severity] || SEVERITY_CFG.low
                                        return (
                                            <div
                                                key={i}
                                                onClick={() => { setDrug(h.drug); setPhenotype(h.phenotype) }}
                                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'var(--bg-input)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s' }}
                                            >
                                                <span style={{ fontSize: 14 }}>{DRUG_EMOJI[h.drug]}</span>
                                                <span className="mono" style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 700 }}>{h.drug}</span>
                                                <span style={{ fontSize: 11, color: 'var(--accent-2)', background: 'var(--accent-2-dim)', padding: '1px 7px', borderRadius: 5 }}>{h.phenotype}</span>
                                                <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{h.diplotype}</span>
                                                <span style={{ marginLeft: 'auto', fontSize: 11, color: hcfg.color, fontWeight: 700 }}>{h.risk}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
