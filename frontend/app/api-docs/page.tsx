'use client'
import { useState } from 'react'

const ENDPOINTS = [
    {
        method: 'POST', path: '/analyze', color: '#00e5c0', bg: 'rgba(0,229,192,0.1)',
        desc: 'Upload a VCF file and select a drug to receive a full pharmacogenomic risk report with AI explanation.',
        params: [
            { name: 'file', type: 'File', req: true, desc: 'VCF v4.2 file (max 5 MB)' },
            { name: 'drug', type: 'string', req: true, desc: 'CODEINE | WARFARIN | CLOPIDOGREL | SIMVASTATIN | AZATHIOPRINE | FLUOROURACIL' },
            { name: 'patient_id', type: 'string', req: false, desc: 'Patient identifier (default: PATIENT_001)' },
        ],
        curl: `curl -X POST http://localhost:8001/analyze \\
  -F "file=@sample_patient.vcf" \\
  -F "drug=CODEINE" \\
  -F "patient_id=PATIENT_001"`,
        response: `{
  "patient_id": "PATIENT_001",
  "drug": "CODEINE",
  "timestamp": "2026-02-19T15:00:00",
  "risk_assessment": {
    "risk_label": "Toxic",    // Safe|Adjust Dosage|Toxic|Ineffective|Unknown
    "confidence_score": 0.95,
    "severity": "high"        // low|medium|high|none
  },
  "pharmacogenomic_profile": {
    "primary_gene": "CYP2D6",
    "diplotype": "*1/*2",
    "phenotype": "URM",       // PM|IM|NM|RM|URM|Unknown
    "detected_variants": [
      { "rsid": "rs16947", "chromosome": "22",
        "position": "42126640", "reference": "C", "alternate": "T" }
    ]
  },
  "clinical_recommendation": {
    "cpic_guideline_reference": "CPIC Guideline for Codeine",
    "dose_adjustment": "Use alternative opioid. Avoid codeine.",
    "monitoring_advice": "Monitor for toxic-related symptoms."
  },
  "llm_generated_explanation": {
    "summary": "...",
    "biological_mechanism": "...",
    "variant_citations": ["rs16947"],
    "confidence_reasoning": "..."
  },
  "quality_metrics": {
    "vcf_parsing_success": true,
    "missing_annotations": false,
    "confidence_level": "High"
  }
}`
    },
    {
        method: 'GET', path: '/', color: '#2196f3', bg: 'rgba(33,150,243,0.1)',
        desc: 'Health check endpoint. Returns backend status and API version.',
        params: [],
        curl: 'curl http://localhost:8001/',
        response: `{
  "status": "PharmaGuard Backend Operational",
  "version": "1.0"
}`
    },
]

export default function ApiDocsPage() {
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

    const copyCmd = (text: string, idx: number) => {
        navigator.clipboard.writeText(text)
        setCopiedIdx(idx)
        setTimeout(() => setCopiedIdx(null), 2000)
    }

    return (
        <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 66px)', padding: '64px 40px 80px' }}>
            <div style={{ maxWidth: 960, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 52 }}>
                    <div className="section-label" style={{ justifyContent: 'center' }}>Developer</div>
                    <h1 style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.025em', marginBottom: 12 }}>
                        API Documentation
                    </h1>
                    <p style={{ color: 'var(--text-2)', fontSize: 16 }}>Production-ready REST API · Strict JSON schema · Sub-second response</p>
                </div>

                {/* Base URL card */}
                <div className="glass" style={{ padding: '20px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ padding: '5px 12px', borderRadius: 8, fontSize: 10, fontWeight: 800, background: 'var(--accent-dim)', border: '1px solid var(--border-accent)', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                            BASE URL
                        </span>
                        <code className="mono" style={{ color: 'var(--text-1)', fontSize: 15, fontWeight: 600 }}>
                            http://localhost:8001
                        </code>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 8px var(--accent-green)', animation: 'glowPulse 2s infinite' }} />
                        <span style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>Backend Online</span>
                    </div>
                </div>

                {/* Endpoints */}
                {ENDPOINTS.map((ep, idx) => (
                    <div key={idx} className="glass" style={{ padding: 36, marginBottom: 20 }}>
                        {/* Method + Path */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
                            <span style={{ padding: '7px 16px', borderRadius: 10, background: ep.bg, border: `1px solid ${ep.color}30`, color: ep.color, fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>
                                {ep.method}
                            </span>
                            <code className="mono" style={{ color: 'var(--text-1)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>{ep.path}</code>
                        </div>

                        <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>{ep.desc}</p>

                        {/* Params table */}
                        {ep.params.length > 0 && (
                            <div style={{ marginBottom: 24 }}>
                                <div className="section-label" style={{ marginBottom: 12 }}>Request Body (multipart/form-data)</div>
                                <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                        <thead>
                                            <tr style={{ background: 'var(--bg-card-alt)' }}>
                                                {['Parameter', 'Type', 'Required', 'Description'].map(h => (
                                                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-2)', fontWeight: 700, borderBottom: '1px solid var(--border)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ep.params.map((row, i) => (
                                                <tr key={i} style={{ borderBottom: i < ep.params.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                                    <td style={{ padding: '12px 16px' }}><code className="mono" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 12 }}>{row.name}</code></td>
                                                    <td style={{ padding: '12px 16px' }}><code className="mono" style={{ color: 'var(--accent-2)', fontSize: 12 }}>{row.type}</code></td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <span style={{ fontSize: 11, fontWeight: 800, color: row.req ? 'var(--accent-red)' : 'var(--text-3)' }}>{row.req ? 'Required' : 'Optional'}</span>
                                                    </td>
                                                    <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 12 }}>{row.desc}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* cURL example */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                <div className="section-label" style={{ marginBottom: 0 }}>cURL Example</div>
                                <button onClick={() => copyCmd(ep.curl, idx)} style={{
                                    background: 'var(--bg-input)', border: '1px solid var(--border)',
                                    color: copiedIdx === idx ? 'var(--accent)' : 'var(--text-3)',
                                    borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 700,
                                    cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
                                    transition: 'all 0.2s'
                                }}>
                                    {copiedIdx === idx ? '✓ Copied!' : '📋 Copy'}
                                </button>
                            </div>
                            <div style={{ padding: '18px 20px', borderRadius: 14, background: 'var(--bg-card-alt)', border: '1px solid var(--border)', overflowX: 'auto' }}>
                                <pre className="mono" style={{ fontSize: 12, color: 'var(--text-1)', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{ep.curl}</pre>
                            </div>
                        </div>

                        {/* Response schema */}
                        <div>
                            <div className="section-label" style={{ marginBottom: 10 }}>Response Schema (HTTP 200)</div>
                            <div style={{ borderRadius: 14, background: 'var(--bg-card-alt)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                                <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', background: 'rgba(0,229,192,0.04)', display: 'flex', gap: 6 }}>
                                    {['application/json', '200 OK'].map((t, i) => (
                                        <span key={i} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: i === 0 ? 'var(--accent-dim)' : 'rgba(52,211,153,0.1)', color: i === 0 ? 'var(--accent)' : 'var(--accent-green)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{t}</span>
                                    ))}
                                </div>
                                <div style={{ padding: '16px 20px', overflowX: 'auto' }}>
                                    <pre className="mono" style={{ fontSize: 12, color: 'var(--text-1)', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{ep.response}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Error codes */}
                <div className="glass" style={{ padding: 32 }}>
                    <div className="section-label">Error Codes</div>
                    <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                        {[
                            { code: '400', label: 'Bad Request', desc: 'Invalid file format, unsupported drug, or file too large' },
                            { code: '422', label: 'Validation Error', desc: 'Missing required form fields (Pydantic schema validation)' },
                            { code: '500', label: 'Internal Error', desc: 'VCF parsing error or AI service unavailable' },
                        ].map((e, i) => (
                            <div key={i} style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.18)' }}>
                                <code className="mono" style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent-red)' }}>{e.code}</code>
                                <div style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: 13, marginTop: 4, marginBottom: 6 }}>{e.label}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>{e.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
