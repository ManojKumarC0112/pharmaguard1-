'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnalysisResult } from '@/lib/api'

const RISK_COLORS: Record<string, { color: string; bg: string }> = {
    'Safe': { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    'Adjust Dosage': { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
    'Toxic': { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
    'Ineffective': { color: '#8aafd4', bg: 'rgba(138,175,212,0.12)' },
    'Unknown': { color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
}

function timeAgo(iso: string): string {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

export default function HistoryPage() {
    const [history, setHistory] = useState<AnalysisResult[]>([])
    const [selected, setSelected] = useState<AnalysisResult | null>(null)

    useEffect(() => {
        try {
            const raw = localStorage.getItem('pharma_history')
            if (raw) setHistory(JSON.parse(raw))
        } catch {
            setHistory([])
        }
    }, [])

    const clearHistory = () => {
        localStorage.removeItem('pharma_history')
        setHistory([])
        setSelected(null)
    }

    const deleteItem = (e: React.MouseEvent, index: number) => {
        e.stopPropagation()
        if (!confirm('Delete this analysis?')) return
        const newHistory = [...history]
        newHistory.splice(index, 1)
        setHistory(newHistory)
        localStorage.setItem('pharma_history', JSON.stringify(newHistory))
        if (selected === history[index]) setSelected(null)
    }

    const loadResult = (result: AnalysisResult) => {
        sessionStorage.setItem('pharma_result', JSON.stringify(result))
        setSelected(result)
    }

    if (history.length === 0) {
        return (
            <div style={{ minHeight: 'calc(100vh - 66px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 60, marginBottom: 20 }}>📋</div>
                <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.02em', marginBottom: 12 }}>No History Yet</h2>
                <p style={{ color: 'var(--text-2)', fontSize: 15, maxWidth: 360, marginBottom: 28 }}>
                    Your past analyses will appear here. Run your first analysis to get started.
                </p>
                <Link href="/upload">
                    <button className="btn btn-primary" style={{ padding: '13px 32px', fontSize: 15, borderRadius: 14 }}>
                        Analyze VCF →
                    </button>
                </Link>
            </div>
        )
    }

    return (
        <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 66px)', padding: '56px 40px 80px' }}>
            <div style={{ maxWidth: 1040, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>
                        Analysis History
                    </h1>
                    {history.length > 0 && (
                        <button onClick={clearHistory} className="btn btn-ghost" style={{ fontSize: 13, padding: '8px 16px', borderRadius: 10, color: 'var(--text-3)' }}>
                            Clear All
                        </button>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: 24, paddingBottom: 40 }}>
                    {/* List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {history.map((r, i) => {
                            const active = selected === r
                            const cfg = RISK_COLORS[r.risk_assessment.risk_label] || RISK_COLORS['Unknown']
                            return (
                                <div
                                    key={i}
                                    onClick={() => setSelected(r)}
                                    className="glass glass-hover"
                                    style={{
                                        padding: '18px 24px', cursor: 'pointer',
                                        border: active ? `1px solid ${cfg.color}` : undefined,
                                        background: active ? cfg.bg : undefined
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-1)' }}>{r.drug}</span>
                                                <span style={{ padding: '3px 8px', borderRadius: 6, background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 800, border: `1px solid ${cfg.color}30`, textTransform: 'uppercase' }}>
                                                    {r.risk_assessment.risk_label}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                                                {timeAgo(r.timestamp)} · <span className="mono">{r.timestamp.split('T')[0]}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Link href="/results" onClick={() => loadResult(r)}>
                                                <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8 }}>
                                                    View →
                                                </button>
                                            </Link>
                                            <button
                                                onClick={(e) => deleteItem(e, i)}
                                                style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'var(--bg-input)', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}
                                                title="Delete"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        <span style={{ padding: '3px 10px', borderRadius: 6, background: 'var(--bg-input)', color: 'var(--text-2)', fontSize: 11 }}>{r.pharmacogenomic_profile.primary_gene}</span>
                                        <span className="mono" style={{ padding: '3px 10px', borderRadius: 6, background: 'var(--bg-input)', color: 'var(--accent-2)', fontSize: 11 }}>{r.pharmacogenomic_profile.diplotype}</span>
                                        <span style={{ padding: '3px 10px', borderRadius: 6, background: 'var(--bg-input)', color: 'var(--text-1)', fontSize: 11 }}>{r.pharmacogenomic_profile.phenotype}</span>
                                        <span style={{ padding: '3px 10px', borderRadius: 6, background: 'var(--bg-input)', color: 'var(--text-3)', fontSize: 11 }}>{r.patient_id}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Detail panel */}
                    {selected && (
                        <div className="glass" style={{ padding: 28, position: 'sticky', top: 80 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <div className="section-label" style={{ marginBottom: 0 }}>Analysis Detail</div>
                                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
                            </div>

                            {(() => {
                                const cfg = RISK_COLORS[selected.risk_assessment.risk_label] || RISK_COLORS['Unknown']
                                return (
                                    <>
                                        {/* Risk badge */}
                                        <div style={{ textAlign: 'center', padding: '20px 0 16px', marginBottom: 16, borderRadius: 14, background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
                                            <div style={{ fontSize: 38, fontWeight: 900, color: cfg.color, letterSpacing: '-0.03em' }}>{selected.risk_assessment.risk_label}</div>
                                            <div className="mono" style={{ color: 'var(--accent)', fontSize: 18, marginTop: 6 }}>{selected.pharmacogenomic_profile.diplotype}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{selected.pharmacogenomic_profile.phenotype} · {selected.drug} · {selected.pharmacogenomic_profile.primary_gene}</div>
                                        </div>

                                        {/* Recommendation */}
                                        <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16, padding: '14px 16px', borderRadius: 12, background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
                                            {selected.clinical_recommendation.dose_adjustment}
                                        </div>

                                        {/* Confidence */}
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 8, background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 700 }}>
                                                Confidence: {Math.round(selected.risk_assessment.confidence_score * 100)}%
                                            </span>
                                            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 8, background: 'var(--bg-input)', color: 'var(--text-2)' }}>
                                                {selected.quality_metrics.confidence_level}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <Link href="/results" style={{ flex: 1 }}>
                                                <button className="btn btn-primary" style={{ width: '100%', padding: '10px 0', fontSize: 13, borderRadius: 11 }}>
                                                    View Full Report →
                                                </button>
                                            </Link>
                                        </div>
                                    </>
                                )
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
