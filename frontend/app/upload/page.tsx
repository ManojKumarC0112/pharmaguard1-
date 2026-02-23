'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { analyzeVCF, AnalysisResult } from '@/lib/api'

const DRUGS = [
    { name: 'CODEINE', gene: 'CYP2D6', note: 'Opioid analgesic', color: '#ef4444', risk: 'High' },
    { name: 'WARFARIN', gene: 'CYP2C9', note: 'Anticoagulant', color: '#f59e0b', risk: 'High' },
    { name: 'CLOPIDOGREL', gene: 'CYP2C19', note: 'Antiplatelet', color: '#f59e0b', risk: 'High' },
    { name: 'SIMVASTATIN', gene: 'SLCO1B1', note: 'Statin therapy', color: '#2196f3', risk: 'Medium' },
    { name: 'AZATHIOPRINE', gene: 'TPMT', note: 'Immunosuppressant', color: '#ef4444', risk: 'High' },
    { name: 'FLUOROURACIL', gene: 'DPYD', note: 'Chemotherapy', color: '#c084fc', risk: 'Critical' },
]

const LOADING_STAGES = [
    { label: 'Parsing VCF file…', pct: 15 },
    { label: 'Extracting variants…', pct: 35 },
    { label: 'Applying CPIC rules…', pct: 60 },
    { label: 'Querying Gemini AI…', pct: 82 },
    { label: 'Generating report…', pct: 95 },
]

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null)
    const [drug, setDrug] = useState('')
    const [patientId, setPatientId] = useState('PATIENT_001')
    const [drag, setDrag] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingStage, setLoadingStage] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [preview, setPreview] = useState<string[] | null>(null)
    const [showPreview, setShowPreview] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleFile = (f: File) => {
        if (!f.name.endsWith('.vcf')) { setError('Please upload a .vcf file.'); return }
        if (f.size > 5 * 1024 * 1024) { setError('File too large (max 5 MB).'); return }
        setFile(f); setError(null)
        // Read first lines for preview
        const reader = new FileReader()
        reader.onload = (e) => {
            const lines = (e.target?.result as string).split('\n').slice(0, 8).filter(Boolean)
            setPreview(lines)
        }
        reader.readAsText(f)
    }

    const handleAnalyze = async () => {
        if (!file || !drug) return
        setLoading(true); setError(null); setLoadingStage(0)

        // Animate stages
        const stageInterval = setInterval(() => {
            setLoadingStage(prev => {
                const next = prev + 1
                if (next >= LOADING_STAGES.length) { clearInterval(stageInterval); return prev }
                return next
            })
        }, 900)

        try {
            const result: AnalysisResult = await analyzeVCF(file, drug, patientId)
            clearInterval(stageInterval)
            sessionStorage.setItem('pharma_result', JSON.stringify(result))
            // Save to history
            try {
                const existing = JSON.parse(localStorage.getItem('pharma_history') || '[]')
                existing.push(result)
                // Keep last 20 analyses
                if (existing.length > 20) existing.shift()
                localStorage.setItem('pharma_history', JSON.stringify(existing))
            } catch { /* ignore storage errors */ }
            router.push('/results')

        } catch (e: unknown) {
            clearInterval(stageInterval)
            setError((e as Error).message || 'Analysis failed. Make sure the backend is running on port 8001.')
        } finally { setLoading(false) }
    }

    const step = file && drug ? 3 : file ? 2 : 1
    const currentStage = LOADING_STAGES[Math.min(loadingStage, LOADING_STAGES.length - 1)]

    return (
        <div style={{ minHeight: 'calc(100vh - 66px)', background: 'var(--bg)', padding: '64px 40px 80px' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 44 }}>
                    <div className="section-label" style={{ justifyContent: 'center' }}>Analysis Wizard</div>
                    <h1 style={{ fontSize: 38, fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                        Genomic Risk Assessment
                    </h1>
                    <p style={{ color: 'var(--text-2)', marginTop: 12, fontSize: 15 }}>
                        Three steps to pharmacogenomic precision insights
                    </p>
                </div>

                {/* Progress Steps */}
                <div style={{ marginBottom: 36 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, gap: 8 }}>
                        {['Upload VCF', 'Select Drug', 'Analyze'].map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                                <div style={{
                                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                                    background: step > i ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : 'var(--bg-input)',
                                    border: `2px solid ${step > i ? 'var(--accent)' : 'var(--border)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 12, fontWeight: 800,
                                    color: step > i ? '#fff' : 'var(--text-3)',
                                    transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                                    boxShadow: step > i ? '0 0 12px var(--accent-glow)' : 'none'
                                }}>{step > i ? '✓' : i + 1}</div>
                                <span style={{ fontSize: 13, fontWeight: 600, color: step > i ? 'var(--accent)' : step === i + 1 ? 'var(--text-1)' : 'var(--text-3)', transition: 'color 0.3s' }}>{s}</span>
                            </div>
                        ))}
                    </div>
                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${Math.min(((step - 1) / 2) * 100, 100)}%` }} />
                    </div>
                </div>

                {/* Main Card */}
                <div className="glass" style={{ padding: 40 }}>

                    {/* ── STEP 1: Upload ── */}
                    <div style={{ marginBottom: 36 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: file ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : 'var(--bg-input)',
                                border: `2px solid ${file ? 'var(--accent)' : 'var(--border)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 800, color: file ? '#fff' : 'var(--text-3)',
                                flexShrink: 0, transition: 'all 0.3s'
                            }}>{file ? '✓' : '1'}</div>
                            <div style={{ fontWeight: 800, color: 'var(--text-1)', fontSize: 15 }}>Upload VCF File</div>
                            <div style={{ flex: 1, height: 1, background: 'var(--border)', marginLeft: 4 }} />
                        </div>

                        {!file ? (
                            <div
                                className={`upload-zone ${drag ? 'drag-over' : ''}`}
                                style={{ padding: '52px 24px', textAlign: 'center' }}
                                onClick={() => fileRef.current?.click()}
                                onDragEnter={e => { e.preventDefault(); setDrag(true) }}
                                onDragLeave={e => { e.preventDefault(); setDrag(false) }}
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                            >
                                <div style={{
                                    width: 60, height: 60, borderRadius: 16, margin: '0 auto 16px',
                                    background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.3s'
                                }}>
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>
                                    {drag ? 'Release to Upload' : 'Click or Drag & Drop'}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>VCF v4.2 format · Max 5 MB</div>
                                <div className="gene-tag" style={{ margin: '0 auto', width: 'fit-content' }}>
                                    .vcf
                                </div>
                                <input ref={fileRef} type="file" accept=".vcf" style={{ display: 'none' }}
                                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                                />
                            </div>
                        ) : (
                            <div>
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '16px 20px', borderRadius: 14,
                                    background: 'linear-gradient(135deg, rgba(0,229,192,0.06), rgba(33,150,243,0.04))',
                                    border: '1px solid var(--border-accent)', marginBottom: preview && showPreview ? 12 : 0
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{file.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                                                {(file.size / 1024).toFixed(1)} KB · VCF v4.2 ✓
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {preview && (
                                            <button onClick={() => setShowPreview(!showPreview)} style={{
                                                background: 'var(--bg-input)', border: '1px solid var(--border)',
                                                color: 'var(--text-2)', borderRadius: 8, padding: '6px 12px',
                                                cursor: 'pointer', fontSize: 12, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600
                                            }}>
                                                {showPreview ? 'Hide' : 'Preview'}
                                            </button>
                                        )}
                                        <button onClick={() => { setFile(null); setPreview(null); setShowPreview(false) }} className="btn-danger">
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                {/* VCF Preview */}
                                {preview && showPreview && (
                                    <div style={{ borderRadius: 12, background: 'var(--bg-card-alt)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                                        <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                            VCF Preview (first 8 lines)
                                        </div>
                                        <div style={{ padding: '12px 14px', overflow: 'auto', maxHeight: 160 }}>
                                            {preview.map((line, i) => (
                                                <div key={i} className="mono" style={{ fontSize: 11, color: line.startsWith('#') ? 'var(--text-3)' : 'var(--accent)', lineHeight: 1.8, whiteSpace: 'nowrap' }}>
                                                    {line}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── STEP 2: Drug ── */}
                    <div style={{ marginBottom: 36 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: drug ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : 'var(--bg-input)',
                                border: `2px solid ${drug ? 'var(--accent)' : 'var(--border)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 800, color: drug ? '#fff' : 'var(--text-3)',
                                flexShrink: 0, transition: 'all 0.3s'
                            }}>{drug ? '✓' : '2'}</div>
                            <div style={{ fontWeight: 800, color: 'var(--text-1)', fontSize: 15 }}>Select Medication</div>
                            <div style={{ flex: 1, height: 1, background: 'var(--border)', marginLeft: 4 }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                            {DRUGS.map(d => (
                                <button key={d.name} className={`drug-pill ${drug === d.name ? 'selected' : ''}`} onClick={() => setDrug(d.name)}>
                                    <div style={{ fontSize: 12, marginBottom: 4 }}>{d.name}</div>
                                    <div style={{ fontSize: 10, fontWeight: 500, color: drug === d.name ? 'var(--accent)' : 'var(--text-3)', textTransform: 'none', letterSpacing: 0 }}>{d.note}</div>
                                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{
                                            height: 2, flex: 1, borderRadius: 1,
                                            background: `linear-gradient(90deg, ${d.color}, transparent)`,
                                            opacity: drug === d.name ? 1 : 0.3
                                        }} />
                                        <span style={{ fontSize: 9, color: drug === d.name ? d.color : 'var(--text-3)', fontWeight: 700 }}>
                                            {d.risk}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {drug && (
                            <div className="info-box" style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{drug}</span>
                                <span>targets gene</span>
                                <span className="gene-tag">{DRUGS.find(d => d.name === drug)?.gene}</span>
                                <span style={{ flex: 1 }} />
                                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>CPIC Tier A</span>
                            </div>
                        )}
                    </div>

                    {/* ── Patient ID ── */}
                    <div style={{ marginBottom: 28 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8, letterSpacing: '-0.01em' }}>
                            Patient ID <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span>
                        </div>
                        <input
                            type="text"
                            value={patientId}
                            onChange={e => setPatientId(e.target.value)}
                            placeholder="PATIENT_001"
                            style={{
                                width: '100%', padding: '11px 16px',
                                background: 'var(--bg-input)', border: '1px solid var(--border)',
                                borderRadius: 12, color: 'var(--text-1)', fontSize: 14,
                                fontFamily: 'JetBrains Mono, monospace', outline: 'none',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={e => { e.target.style.borderColor = 'var(--border-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)' }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="error-box" style={{ marginBottom: 20 }}>
                            <span>⚠</span>
                            <div>
                                <div style={{ fontWeight: 700, marginBottom: 2 }}>Analysis Failed</div>
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Analyze Button */}
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', fontSize: 16, padding: '17px', borderRadius: 16 }}
                        disabled={!file || !drug || loading}
                        onClick={handleAnalyze}
                    >
                        {loading ? (
                            <>
                                <div className="dna-loader">
                                    {[...Array(5)].map((_, i) => <div key={i} className={`dna-dot`} style={{ animationDelay: `${i * 0.15}s` }} />)}
                                </div>
                                <span style={{ marginLeft: 8 }}>{currentStage.label}</span>
                            </>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" />
                                </svg>
                                Analyze Risk Profile
                            </>
                        )}
                    </button>

                    {/* Loading progress */}
                    {loading && (
                        <div style={{ marginTop: 16 }}>
                            <div className="progress-track" style={{ height: 4 }}>
                                <div className="progress-fill" style={{ width: `${currentStage.pct}%`, transition: 'width 0.8s ease' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Processing…</span>
                                <span className="mono" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>{currentStage.pct}%</span>
                            </div>
                        </div>
                    )}

                    {!file || !drug ? (
                        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--text-3)' }}>
                            {!file ? '↑ Upload a VCF file to continue' : '↑ Select a medication to continue'}
                        </div>
                    ) : null}
                </div>

                {/* Hint */}
                <div className="info-box" style={{ marginTop: 20 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>💡 Testing?</span>{' '}
                    Use <span className="mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>sample_patient.vcf</span> from the project root — it contains real pharmacogenomic variants for CYP2D6, CYP2C9, and more.
                </div>
            </div>
        </div>
    )
}
