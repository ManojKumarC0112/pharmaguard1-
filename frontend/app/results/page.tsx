'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { AnalysisResult } from '@/lib/api'

const RISK_CFG: Record<string, {
    color: string; bg: string; border: string; cardClass: string; gaugeColor: string; icon: string; label: string
}> = {
    'Safe': { color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.35)', cardClass: 'risk-card-safe', gaugeColor: '#34d399', icon: '✓', label: 'Safe' },
    'Adjust Dosage': { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.35)', cardClass: 'risk-card-adjust', gaugeColor: '#fbbf24', icon: '⚠', label: 'Adjust Dosage' },
    'Toxic': { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.35)', cardClass: 'risk-card-toxic', gaugeColor: '#f87171', icon: '✕', label: 'Toxic' },
    'Ineffective': { color: '#8aafd4', bg: 'rgba(138,175,212,0.08)', border: 'rgba(138,175,212,0.35)', cardClass: '', gaugeColor: '#8aafd4', icon: '—', label: 'Ineffective' },
    'Unknown': { color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.35)', cardClass: 'risk-card-unknown', gaugeColor: '#c084fc', icon: '?', label: 'Unknown' },
}

const PHENOTYPE_FULL: Record<string, { label: string; desc: string; color: string }> = {
    PM: { label: 'Poor Metabolizer', desc: 'Drug accumulates to toxic levels', color: '#f87171' },
    IM: { label: 'Intermediate Metabolizer', desc: 'Reduced enzyme activity', color: '#fbbf24' },
    NM: { label: 'Normal Metabolizer', desc: 'Standard drug response expected', color: '#34d399' },
    RM: { label: 'Rapid Metabolizer', desc: 'Drug cleared too quickly', color: '#2196f3' },
    URM: { label: 'Ultra-Rapid Metabolizer', desc: 'Drug may be ineffective', color: '#c084fc' },
    Unknown: { label: 'Unknown', desc: 'Insufficient data for classification', color: '#8aafd4' },
}

// Semi-circular gauge SVG
function RiskGauge({ score, color }: { score: number; color: string }) {
    const pct = Math.round(score * 100)
    const r = 70
    const cx = 90
    const cy = 90
    const circumference = Math.PI * r // semicircle
    const strokeDash = (pct / 100) * circumference
    const [animPct, setAnimPct] = useState(0)

    useEffect(() => {
        const timeout = setTimeout(() => setAnimPct(pct), 300)
        return () => clearTimeout(timeout)
    }, [pct])

    const animDash = (animPct / 100) * circumference

    return (
        <div style={{ position: 'relative', width: 180, height: 100, margin: '0 auto' }}>
            <svg width="180" height="100" viewBox="0 0 180 100">
                {/* Background arc */}
                <path
                    d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
                    fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"
                    strokeLinecap="round"
                />
                {/* Colored arc */}
                <path
                    d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
                    fill="none" stroke={color} strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${animDash} ${circumference}`}
                    style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${color}80)` }}
                />
                {/* Glow */}
                <circle cx={cx - r + (animDash / circumference) * 2 * r} cy={cy} r="6" fill={color} style={{ filter: `drop-shadow(0 0 8px ${color})`, opacity: 0.9, transition: 'cx 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
            </svg>
            {/* Center text */}
            <div style={{
                position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                textAlign: 'center'
            }}>
                <div className="mono" style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{pct}%</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>Confidence</div>
            </div>
        </div>
    )
}

// Typewriter effect
function Typewriter({ text, speed = 18 }: { text: string; speed?: number }) {
    const [displayed, setDisplayed] = useState('')
    const [done, setDone] = useState(false)
    const idx = useRef(0)

    useEffect(() => {
        idx.current = 0
        setDisplayed('')
        setDone(false)
        const interval = setInterval(() => {
            if (idx.current < text.length) {
                setDisplayed(text.slice(0, idx.current + 1))
                idx.current++
            } else {
                setDone(true)
                clearInterval(interval)
            }
        }, speed)
        return () => clearInterval(interval)
    }, [text, speed])

    return (
        <span>
            {displayed}
            {!done && <span style={{ borderRight: '2px solid var(--accent)', marginLeft: 2, animation: 'typewriterBlink 0.8s step-end infinite', display: 'inline-block', height: '1em', verticalAlign: 'text-bottom' }} />}
        </span>
    )
}

export default function ResultsPage() {
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [toast, setToast] = useState<string | null>(null)

    useEffect(() => {
        const raw = sessionStorage.getItem('pharma_result')
        if (raw) setResult(JSON.parse(raw))
    }, [])

    const showToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(null), 3000)
    }

    const handlePrint = () => window.print()

    const handleCopyJSON = () => {
        if (!result) return
        navigator.clipboard.writeText(JSON.stringify(result, null, 2))
        showToast('Result JSON copied to clipboard!')
    }

    if (!result) {
        return (
            <div style={{ minHeight: 'calc(100vh - 66px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 64, lineHeight: 1 }}>🧬</div>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>No Analysis Found</h2>
                <p style={{ color: 'var(--text-2)', fontSize: 15, maxWidth: 360 }}>
                    Run an analysis first to see your pharmacogenomic risk report here.
                </p>
                <Link href="/upload">
                    <button className="btn btn-primary" style={{ padding: '13px 32px', fontSize: 15, borderRadius: 14 }}>
                        Go to Upload →
                    </button>
                </Link>
            </div>
        )
    }

    const cfg = RISK_CFG[result.risk_assessment.risk_label] || RISK_CFG['Unknown']
    const phenoData = PHENOTYPE_FULL[result.pharmacogenomic_profile.phenotype] || PHENOTYPE_FULL['Unknown']

    return (
        <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 66px)', padding: '56px 40px 80px', position: 'relative' }}>

            {/* Toast */}
            {toast && (
                <div className="toast" style={{
                    position: 'fixed', top: 86, right: 24, zIndex: 999,
                    background: 'var(--bg-card)', border: '1px solid var(--border-accent)',
                    padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                    color: 'var(--accent)', boxShadow: 'var(--shadow-glow), var(--shadow)'
                }}>
                    ✓ {toast}
                </div>
            )}

            <div style={{ maxWidth: 1040, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 44 }}>
                    <div className="section-label" style={{ justifyContent: 'center' }}>Analysis Complete</div>
                    <h1 style={{ fontSize: 38, fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.025em', marginBottom: 10 }}>
                        Risk Report
                    </h1>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: 'var(--text-2)' }}>
                            <span>Patient</span>
                            <span className="mono" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 12, padding: '2px 10px', background: 'var(--accent-dim)', borderRadius: 6, border: '1px solid var(--border-accent)' }}>
                                {result.patient_id}
                            </span>
                        </div>
                        <span style={{ color: 'var(--text-3)' }}>·</span>
                        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{new Date(result.timestamp).toLocaleString()}</span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }} className="no-print">
                        <button onClick={handlePrint} className="btn btn-ghost" style={{ padding: '9px 20px', fontSize: 13, borderRadius: 10 }}>
                            🖨 Print Report
                        </button>
                        <button onClick={handleCopyJSON} className="btn btn-ghost" style={{ padding: '9px 20px', fontSize: 13, borderRadius: 10 }}>
                            📋 Copy JSON
                        </button>
                    </div>
                </div>

                {/* Top row: Risk + Gauge on left | Recommendation on right */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

                    {/* Risk card */}
                    <div className={`glass ${cfg.cardClass}`} style={{ padding: 32 }}>
                        <div className="section-label">Risk Assessment</div>
                        <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
                            <div style={{
                                fontSize: 52, fontWeight: 900, color: cfg.color,
                                letterSpacing: '-0.04em', lineHeight: 1,
                                textShadow: `0 0 30px ${cfg.color}40`
                            }}>
                                {result.risk_assessment.risk_label}
                            </div>
                            <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <span style={{ padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                    {result.risk_assessment.severity} Severity
                                </span>
                                <span style={{ padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: 'var(--accent-2-dim)', color: 'var(--accent-2)', border: '1px solid rgba(33,150,243,0.3)' }}>
                                    {result.drug}
                                </span>
                            </div>
                        </div>
                        <div style={{ marginTop: 20 }}>
                            <RiskGauge score={result.risk_assessment.confidence_score} color={cfg.gaugeColor} />
                        </div>
                    </div>

                    {/* Recommendation card */}
                    <div className="glass" style={{ padding: 32 }}>
                        <div className="section-label">Clinical Recommendation</div>
                        <div style={{ marginTop: 12, marginBottom: 18 }}>
                            <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>CPIC Guideline</div>
                            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{result.clinical_recommendation.cpic_guideline_reference}</div>
                        </div>
                        <div style={{ padding: '16px 18px', borderRadius: 14, background: 'linear-gradient(135deg, rgba(0,229,192,0.06), rgba(33,150,243,0.04))', border: '1px solid var(--border-accent)', marginBottom: 16 }}>
                            <div style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontWeight: 700 }}>Dose Adjustment</div>
                            <div style={{ fontSize: 15, color: 'var(--text-1)', fontWeight: 600, lineHeight: 1.6 }}>
                                {result.clinical_recommendation.dose_adjustment}
                            </div>
                        </div>
                        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', fontSize: 13, color: 'var(--text-2)' }}>
                            <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>⚠ Monitor: </span>
                            {result.clinical_recommendation.monitoring_advice}
                        </div>
                    </div>
                </div>

                {/* Phenotype Banner */}
                <div style={{
                    padding: '20px 28px', borderRadius: 16, marginBottom: 20,
                    background: `linear-gradient(135deg, ${phenoData.color}10, transparent)`,
                    border: `1px solid ${phenoData.color}25`,
                    display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap'
                }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${phenoData.color}16`, border: `1px solid ${phenoData.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                        🧬
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Metabolizer Phenotype</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: phenoData.color, letterSpacing: '-0.01em' }}>{phenoData.label}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{phenoData.desc}</div>
                    </div>
                    <div>
                        <div className="gene-tag" style={{ fontSize: 14, padding: '8px 16px' }}>
                            {result.pharmacogenomic_profile.primary_gene}
                        </div>
                    </div>
                </div>

                {/* Genomic Profile */}
                <div className="glass" style={{ padding: 32, marginBottom: 20 }}>
                    <div className="section-label">Pharmacogenomic Profile</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 16 }}>
                        {[
                            { label: 'Primary Gene', value: result.pharmacogenomic_profile.primary_gene, color: 'var(--accent)', size: 30, mono: true },
                            { label: 'Diplotype', value: result.pharmacogenomic_profile.diplotype, color: 'var(--accent-2)', size: 24, mono: true },
                            { label: 'Phenotype Code', value: result.pharmacogenomic_profile.phenotype, color: phenoData.color, size: 26, mono: false },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: '18px 20px', borderRadius: 14, background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{item.label}</div>
                                <div className={item.mono ? 'mono' : ''} style={{ fontSize: item.size, fontWeight: 900, color: item.color, lineHeight: 1 }}>{item.value}</div>
                            </div>
                        ))}
                    </div>

                    {result.pharmacogenomic_profile.detected_variants.length > 0 ? (
                        <div style={{ marginTop: 28 }}>
                            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                Detected Variants
                                <span style={{ background: 'var(--accent-dim)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                                    {result.pharmacogenomic_profile.detected_variants.length}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {result.pharmacogenomic_profile.detected_variants.map((v, i) => (
                                    <div key={i} className="variant-card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <div className="dna-dot" style={{ width: 6, height: 6, flexShrink: 0, background: 'var(--accent)', borderRadius: '50%' }} />
                                            <div className="mono" style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700 }}>{v.rsid}</div>
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}>
                                            chr{v.chromosome}:{v.position}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
                                            {v.reference}<span style={{ color: 'var(--accent-red)', margin: '0 4px' }}>→</span>{v.alternate}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 12, background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.22)', color: 'var(--accent-green)', fontSize: 13, fontWeight: 600 }}>
                            ✓ No pathogenic variants detected — Wild-type genotype (*1/*1)
                        </div>
                    )}
                </div>

                {/* AI Explanation */}
                <div style={{ padding: 32, borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--accent-purple-dim)', boxShadow: 'var(--shadow-glow-purple), var(--shadow)', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                            🤖
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-1)', fontSize: 16, letterSpacing: '-0.01em' }}>Gemini AI Clinical Analysis</div>
                            <div style={{ fontSize: 12, color: 'var(--accent-purple)', marginTop: 2 }}>CPIC-Aligned · Research Only · Not Medical Advice</div>
                        </div>
                        <div style={{ flex: 1 }} />
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[1, 2, 3].map(i => <div key={i} className="dna-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: i === 1 ? '#a855f7' : i === 2 ? '#ec4899' : '#8b5cf6', animation: `dnaBounce 1.2s ease-in-out ${(i - 1) * 0.15}s infinite` }} />)}
                        </div>
                    </div>

                    {/* Summary panel */}
                    <div style={{ padding: '18px 22px', borderRadius: 14, background: 'var(--accent-purple-dim)', border: '1px solid rgba(192,132,252,0.15)', marginBottom: 20 }}>
                        <div style={{ fontSize: 10, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10, fontWeight: 700 }}>Clinical Summary</div>
                        <p style={{ fontSize: 15, color: 'var(--text-1)', lineHeight: 1.8, fontWeight: 400 }}>
                            <Typewriter text={result.llm_generated_explanation.summary} speed={12} />
                        </p>
                    </div>

                    {/* Biological mechanism */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10, fontWeight: 700 }}>Biological Mechanism</div>
                        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.85 }}>
                            {result.llm_generated_explanation.biological_mechanism}
                        </p>
                    </div>

                    {/* Variant citations */}
                    {result.llm_generated_explanation.variant_citations?.length > 0 && (
                        <div>
                            <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10, fontWeight: 700 }}>Cited Variants</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {result.llm_generated_explanation.variant_citations.map((v: string, i: number) => (
                                    <span key={i} className="mono" style={{ padding: '5px 14px', borderRadius: 8, background: 'var(--accent-purple-dim)', border: '1px solid rgba(192,132,252,0.25)', color: 'var(--accent-purple)', fontSize: 12, fontWeight: 600 }}>
                                        {v}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Quality Metrics */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
                    {[
                        { label: 'VCF Parsed', ok: result.quality_metrics.vcf_parsing_success, icon: '✓' },
                        { label: 'Variants Detected', ok: !result.quality_metrics.missing_annotations, icon: '🧬' },
                        { label: `Confidence: ${result.quality_metrics.confidence_level}`, ok: true, icon: '⚡' },
                    ].map((m, i) => (
                        <div key={i} style={{
                            padding: '10px 18px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8,
                            background: m.ok ? 'rgba(52,211,153,0.07)' : 'rgba(248,113,113,0.07)',
                            border: `1px solid ${m.ok ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
                            color: m.ok ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: 13, fontWeight: 700
                        }}>
                            <span>{m.icon}</span> {m.label}
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }} className="no-print">
                    <Link href="/upload">
                        <button className="btn btn-ghost" style={{ padding: '12px 24px', fontSize: 14, borderRadius: 12 }}>
                            ← New Analysis
                        </button>
                    </Link>
                    <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14, borderRadius: 12 }}>
                        🖨 Print Report
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(result, null, 2))
                            alert('Copied to clipboard!')
                        }}
                        className="btn btn-ghost" style={{ padding: '12px 24px', fontSize: 14, borderRadius: 12 }}
                    >
                        📋 Copy JSON
                    </button>
                    <button
                        onClick={() => {
                            const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `pharmaguard_report_${result.patient_id}_${result.drug}.json`
                            a.click()
                            URL.revokeObjectURL(url)
                        }}
                        className="btn btn-ghost" style={{ padding: '12px 24px', fontSize: 14, borderRadius: 12 }}
                    >
                        📥 Download JSON
                    </button>
                    <button
                        onClick={() => {
                            const headers = ['RSID', 'Gene', 'Position', 'Genotype']
                            const rows = result.pharmacogenomic_profile.detected_variants.map(v =>
                                [`${v.rsid}`, `${result.pharmacogenomic_profile.primary_gene}`, `${v.position}`, `${v.reference}/${v.alternate}`].join(',')
                            )
                            const csv = [headers.join(','), ...rows].join('\n')
                            const blob = new Blob([csv], { type: 'text/csv' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `variants_${result.patient_id}_${result.drug}.csv`
                            a.click()
                            URL.revokeObjectURL(url)
                        }}
                        className="btn btn-ghost" style={{ padding: '12px 24px', fontSize: 14, borderRadius: 12 }}
                    >
                        📊 Download CSV
                    </button>
                </div>
            </div>
        </div>
    )
}
