'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

const DRUGS = ['CODEINE', 'WARFARIN', 'CLOPIDOGREL', 'SIMVASTATIN', 'AZATHIOPRINE', 'FLUOROURACIL']

const RISK_CFG: Record<string, { color: string; bg: string; icon: string; short: string }> = {
    'Safe': { color: '#34d399', bg: 'rgba(52,211,153,0.10)', icon: '✓', short: 'SAFE' },
    'Adjust Dosage': { color: '#fbbf24', bg: 'rgba(251,191,36,0.10)', icon: '⚠', short: 'ADJUST' },
    'Toxic': { color: '#f87171', bg: 'rgba(248,113,113,0.10)', icon: '✕', short: 'TOXIC' },
    'Ineffective': { color: '#8aafd4', bg: 'rgba(138,175,212,0.10)', icon: '—', short: 'INEFFEC.' },
    'Unknown': { color: '#c084fc', bg: 'rgba(192,132,252,0.10)', icon: '?', short: '?' },
}

const DRUG_META: Record<string, { gene: string; class: string; emoji: string }> = {
    CODEINE: { gene: 'CYP2D6', class: 'Opioid', emoji: '💊' },
    WARFARIN: { gene: 'CYP2C9', class: 'Anticoagulant', emoji: '🩸' },
    CLOPIDOGREL: { gene: 'CYP2C19', class: 'Antiplatelet', emoji: '❤️' },
    SIMVASTATIN: { gene: 'SLCO1B1', class: 'Statin', emoji: '🫀' },
    AZATHIOPRINE: { gene: 'TPMT', class: 'Immunosuppressant', emoji: '🛡' },
    FLUOROURACIL: { gene: 'DPYD', class: 'Chemotherapy', emoji: '🧪' },
}

interface DrugResult {
    drug: string
    risk_label: string
    phenotype: string
    diplotype: string
    confidence_score: number
    dose_adjustment: string
    severity: string
}

type PanelResult = DrugResult[]

const API_URL = 'http://localhost:8001'

export default function PanelPage() {
    const [file, setFile] = useState<File | null>(null)
    const [patientId, setPatientId] = useState('')
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentDrug, setCurrentDrug] = useState('')
    const [results, setResults] = useState<PanelResult | null>(null)
    const [error, setError] = useState('')
    const [drag, setDrag] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleFile = (f: File) => {
        if (!f.name.endsWith('.vcf')) { setError('Only .vcf files are accepted'); return }
        setFile(f); setError('')
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDrag(false)
        const f = e.dataTransfer.files[0]
        if (f) handleFile(f)
    }

    const runPanel = async () => {
        if (!file) return
        setLoading(true); setResults(null); setError(''); setProgress(0)

        const allResults: DrugResult[] = []
        const pid = patientId.trim() || 'PANEL_' + Math.random().toString(36).substr(2, 6).toUpperCase()

        for (let i = 0; i < DRUGS.length; i++) {
            const drug = DRUGS[i]
            setCurrentDrug(drug)
            setProgress(Math.round((i / DRUGS.length) * 100))

            const fd = new FormData()
            fd.append('file', file)
            fd.append('drug', drug)
            fd.append('patient_id', pid)

            try {
                const res = await fetch(`${API_URL}/analyze`, { method: 'POST', body: fd })
                if (res.ok) {
                    const data = await res.json()
                    allResults.push({
                        drug,
                        risk_label: data.risk_assessment.risk_label,
                        phenotype: data.pharmacogenomic_profile.phenotype,
                        diplotype: data.pharmacogenomic_profile.diplotype,
                        confidence_score: data.risk_assessment.confidence_score,
                        dose_adjustment: data.clinical_recommendation.dose_adjustment,
                        severity: data.risk_assessment.severity,
                    })
                } else {
                    allResults.push({ drug, risk_label: 'Unknown', phenotype: '?', diplotype: '?/?', confidence_score: 0, dose_adjustment: 'Analysis failed', severity: 'none' })
                }
            } catch {
                allResults.push({ drug, risk_label: 'Unknown', phenotype: '?', diplotype: '?/?', confidence_score: 0, dose_adjustment: 'Backend unreachable', severity: 'none' })
            }

            // Small delay between requests
            await new Promise(r => setTimeout(r, 300))
        }

        setProgress(100)
        setCurrentDrug('Complete')
        setResults(allResults)
        setLoading(false)

        // Save to localStorage
        try {
            localStorage.setItem('pharma_panel_' + pid, JSON.stringify({ results: allResults, patientId: pid, timestamp: new Date().toISOString() }))
        } catch { /* ignore */ }
    }

    const riskCounts = results ? {
        safe: results.filter(r => r.risk_label === 'Safe').length,
        caution: results.filter(r => r.risk_label === 'Adjust Dosage').length,
        danger: results.filter(r => ['Toxic', 'Ineffective'].includes(r.risk_label)).length,
    } : null

    return (
        <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 66px)', padding: '56px 40px 80px' }}>
            <div style={{ maxWidth: 1040, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div className="section-label" style={{ justifyContent: 'center' }}>Comprehensive Screening</div>
                    <h1 style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.025em', marginBottom: 14 }}>
                        Multi-Drug <span className="gradient-text">Panel Analysis</span>
                    </h1>
                    <p style={{ color: 'var(--text-2)', fontSize: 15, maxWidth: 520, margin: '0 auto' }}>
                        Upload one VCF file and instantly screen all 6 CPIC Tier-A drug-gene pairs. Get a complete pharmacogenomic profile in seconds.
                    </p>
                </div>

                {!results ? (
                    <div className="glass" style={{ padding: 44, maxWidth: 640, margin: '0 auto' }}>
                        <div className="section-label">Setup</div>

                        {/* Patient ID */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontWeight: 700 }}>Patient ID (optional)</label>
                            <input
                                type="text" value={patientId}
                                onChange={e => setPatientId(e.target.value)}
                                placeholder="e.g. PT-2024-001"
                                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 12, padding: '11px 16px', color: 'var(--text-1)', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', outline: 'none' }}
                            />
                        </div>

                        {/* Upload Zone */}
                        <div
                            onClick={() => fileRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={e => { e.preventDefault(); setDrag(true) }}
                            onDragLeave={() => setDrag(false)}
                            className={`upload-zone ${drag ? 'drag-over' : ''}`}
                            style={{ cursor: 'pointer', padding: '36px 24px', textAlign: 'center', marginBottom: 24, borderRadius: 16 }}
                        >
                            <input ref={fileRef} type="file" accept=".vcf" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
                            {file ? (
                                <div>
                                    <div style={{ fontSize: 32, marginBottom: 10 }}>🧬</div>
                                    <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 15 }}>{file.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB — Click to change</div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
                                    <div style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: 15, marginBottom: 6 }}>Drop VCF file here</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-3)' }}>VCF v4.2 · Max 5MB</div>
                                </div>
                            )}
                        </div>

                        {/* Drugs preview */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
                            {DRUGS.map(d => (
                                <div key={d} style={{ padding: '4px 12px', borderRadius: 8, background: 'var(--accent-dim)', border: '1px solid var(--border-accent)', fontSize: 11, color: 'var(--accent)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                                    {d}
                                </div>
                            ))}
                        </div>

                        {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontSize: 13, marginBottom: 16 }}>{error}</div>}

                        {/* Loading progress */}
                        {loading && (
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Analyzing {currentDrug}...</span>
                                    <span className="mono" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>{progress}%</span>
                                </div>
                                <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', borderRadius: 3, transition: 'width 0.4s ease', boxShadow: '0 0 10px var(--accent-glow)' }} />
                                </div>
                                <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                                    {DRUGS.map((d, i) => {
                                        const isComplete = currentDrug === 'Complete'
                                        const currentIndex = DRUGS.indexOf(currentDrug)
                                        const done = isComplete || (currentIndex > -1 && currentIndex > i)
                                        const active = d === currentDrug
                                        return (
                                            <div key={d} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: done ? 'rgba(52,211,153,0.12)' : active ? 'var(--accent-dim)' : 'var(--bg-input)', color: done ? '#34d399' : active ? 'var(--accent)' : 'var(--text-3)', border: `1px solid ${done ? 'rgba(52,211,153,0.2)' : active ? 'var(--border-accent)' : 'var(--border)'}`, transition: 'all 0.3s' }}>
                                                {done ? '✓ ' : active ? '⟳ ' : ''}{d}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={runPanel}
                            disabled={!file || loading}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 14, opacity: (!file || loading) ? 0.5 : 1 }}
                        >
                            {loading ? 'Analyzing All Drugs...' : '🔬 Run Panel Analysis'}
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* Summary strip */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
                            {[
                                { label: 'Safe to Use', val: riskCounts!.safe, color: '#34d399', bg: 'rgba(52,211,153,0.08)', icon: '✓' },
                                { label: 'Needs Adjustment', val: riskCounts!.caution, color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', icon: '⚠' },
                                { label: 'High Risk', val: riskCounts!.danger, color: '#f87171', bg: 'rgba(248,113,113,0.08)', icon: '✕' },
                            ].map((s, i) => (
                                <div key={i} style={{ padding: '20px 24px', borderRadius: 16, background: s.bg, border: `1px solid ${s.color}22`, textAlign: 'center' }}>
                                    <div style={{ fontSize: 36, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 6, fontWeight: 600 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Results grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 28 }}>
                            {results.map((r, i) => {
                                const cfg = RISK_CFG[r.risk_label] || RISK_CFG['Unknown']
                                const meta = DRUG_META[r.drug] || { gene: '?', class: '?', emoji: '💊' }
                                return (
                                    <div key={i} className="glass" style={{ padding: 24, border: `1px solid ${cfg.color}28` }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={{ fontSize: 28 }}>{meta.emoji}</span>
                                                <div>
                                                    <div className="mono" style={{ fontWeight: 900, color: 'var(--text-1)', fontSize: 15 }}>{r.drug}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{meta.gene} · {meta.class}</div>
                                                </div>
                                            </div>
                                            <div style={{ padding: '4px 12px', borderRadius: 8, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 900, border: `1px solid ${cfg.color}30` }}>
                                                {cfg.short}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                                            <span className="mono" style={{ fontSize: 12, color: 'var(--accent-2)', padding: '2px 8px', background: 'var(--accent-2-dim)', borderRadius: 6 }}>{r.diplotype}</span>
                                            <span style={{ fontSize: 11, color: 'var(--text-2)', padding: '2px 8px', background: 'var(--bg-input)', borderRadius: 6 }}>{r.phenotype}</span>
                                            <span style={{ fontSize: 11, color: 'var(--accent)', padding: '2px 8px', background: 'var(--accent-dim)', borderRadius: 6 }}>{Math.round(r.confidence_score * 100)}% confidence</span>
                                        </div>

                                        <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                                            {r.dose_adjustment.length > 120 ? r.dose_adjustment.slice(0, 120) + '…' : r.dose_adjustment}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <button onClick={() => { setResults(null); setFile(null); setProgress(0) }} className="btn btn-ghost" style={{ padding: '12px 24px', fontSize: 14, borderRadius: 12 }}>
                                ← New Panel
                            </button>
                            <button
                                onClick={() => {
                                    const text = results.map(r => `${r.drug}\t${r.risk_label}\t${r.diplotype}\t${r.phenotype}\t${Math.round(r.confidence_score * 100)}%`).join('\n')
                                    navigator.clipboard.writeText('Drug\tRisk\tDiplotype\tPhenotype\tConfidence\n' + text)
                                }}
                                className="btn btn-ghost" style={{ padding: '12px 24px', fontSize: 14, borderRadius: 12 }}
                            >
                                📋 Copy as Table
                            </button>
                            <button onClick={() => window.print()} className="btn btn-ghost" style={{ padding: '12px 24px', fontSize: 14, borderRadius: 12 }}>
                                🖨 Print Panel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
