import Link from 'next/link'

const STACK = [
    { cat: 'Backend', icon: '⚙', color: '#00e5c0', items: ['Python 3.11', 'FastAPI', 'Pydantic v2', 'Uvicorn', 'python-multipart'] },
    { cat: 'Frontend', icon: '🎨', color: '#2196f3', items: ['Next.js 16', 'React 19', 'TypeScript', 'Space Grotesk UI', 'JetBrains Mono'] },
    { cat: 'Standards', icon: '📋', color: '#c084fc', items: ['CPIC Guidelines v2024', 'VCF v4.2', 'CYP2D6, CYP2C9, CYP2C19', 'SLCO1B1, TPMT, DPYD'] },
    { cat: 'AI Layer', icon: '🤖', color: '#fbbf24', items: ['Google Gemini AI', 'Variant citation engine', 'Phenotype classifier', 'Confidence scoring'] },
]

const PRINCIPLES = [
    { icon: '🔬', title: 'Evidence-Based', desc: 'Every drug-gene rule follows CPIC Tier A/B clinical guidelines — not assumptions.' },
    { icon: '⚡', title: 'Production-Grade', desc: 'FastAPI + strict Pydantic schemas ensure 100% type-safe, documented JSON responses.' },
    { icon: '🧬', title: 'Genomically Precise', desc: 'Star-allele tables and diplotype detection for all 6 pharmacogenes.' },
    { icon: '🤖', title: 'Explainable AI', desc: 'Gemini AI generates clinical summaries citing actual variant RSIDs and metabolic mechanisms.' },
]

export default function AboutPage() {
    return (
        <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 66px)', padding: '64px 40px 80px' }}>
            <div style={{ maxWidth: 940, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 60 }}>
                    <div className="section-label" style={{ justifyContent: 'center' }}>About PharmaGuard</div>
                    <h1 style={{ fontSize: 42, fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 18 }}>
                        Built for <span className="gradient-text">Precision Medicine</span>
                    </h1>
                    <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.8, maxWidth: 600, margin: '0 auto' }}>
                        PharmaGuard is a production-ready pharmacogenomics platform that combines
                        rigorous bioinformatics with modern AI to make genomic medicine
                        accessible and explainable to clinicians.
                    </p>
                </div>

                {/* Mission */}
                <div style={{
                    padding: 44, borderRadius: 22, marginBottom: 32,
                    background: 'linear-gradient(135deg, rgba(0,229,192,0.07), rgba(33,150,243,0.05))',
                    border: '1px solid var(--border-accent)',
                    position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: -60, right: -60, width: 200, height: 200,
                        borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,192,0.06) 0%, transparent 70%)',
                        pointerEvents: 'none'
                    }} />
                    <div className="section-label">Mission</div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em', marginBottom: 16 }}>
                        Safer Prescribing Through Genomics
                    </h2>
                    <p style={{ color: 'var(--text-2)', lineHeight: 1.85, fontSize: 15, maxWidth: 640 }}>
                        Adverse drug reactions from pharmacogenomic mismatches affect over <strong style={{ color: 'var(--text-1)' }}>2 million patients per year</strong> in the US alone. PharmaGuard cuts through the complexity of star-allele tables, phenotype classifications, and CPIC guideline matrices to give clinicians a single, structured answer: <em style={{ color: 'var(--accent)' }}>Is this drug safe for this patient's genome?</em>
                    </p>
                    <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <Link href="/upload">
                            <button className="btn btn-primary" style={{ padding: '12px 26px', fontSize: 14, borderRadius: 12 }}>Analyze Now →</button>
                        </Link>
                        <Link href="/api-docs">
                            <button className="btn btn-ghost" style={{ padding: '12px 22px', fontSize: 14, borderRadius: 12 }}>API Docs</button>
                        </Link>
                    </div>
                </div>

                {/* 4 principles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                    {PRINCIPLES.map((p, i) => (
                        <div key={i} className="glass glass-hover" style={{ padding: '24px 22px' }}>
                            <div style={{ fontSize: 28, marginBottom: 12 }}>{p.icon}</div>
                            <div style={{ fontWeight: 800, color: 'var(--text-1)', fontSize: 15, letterSpacing: '-0.01em', marginBottom: 8 }}>{p.title}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>{p.desc}</div>
                        </div>
                    ))}
                </div>

                {/* Tech Stack */}
                <div className="glass" style={{ padding: 36, marginBottom: 28 }}>
                    <div className="section-label">Technology Stack</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 24, marginTop: 20 }}>
                        {STACK.map((s, i) => (
                            <div key={i} style={{ padding: '18px 20px', borderRadius: 14, background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <span style={{ fontSize: 18 }}>{s.icon}</span>
                                    <span style={{ fontSize: 12, color: s.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.cat}</span>
                                </div>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                                    {s.items.map((item, j) => (
                                        <li key={j} style={{ fontSize: 13, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0, opacity: 0.7 }} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Drug-Gene Table */}
                <div className="glass" style={{ padding: 36, marginBottom: 28 }}>
                    <div className="section-label">Supported Drug–Gene Pairs</div>
                    <div style={{ marginTop: 18, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-card-alt)' }}>
                                    {['Drug', 'Target Gene', 'Category', 'Risk Classes'].map(h => (
                                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-2)', fontWeight: 700, borderBottom: '1px solid var(--border)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['CODEINE', 'CYP2D6', 'Opioid', 'Safe · Toxic · Ineffective'],
                                    ['WARFARIN', 'CYP2C9', 'Anticoagulant', 'Safe · Adjust Dosage'],
                                    ['CLOPIDOGREL', 'CYP2C19', 'Antiplatelet', 'Safe · Ineffective'],
                                    ['SIMVASTATIN', 'SLCO1B1', 'Statin', 'Safe · Adjust Dosage · Toxic'],
                                    ['AZATHIOPRINE', 'TPMT', 'Immunosuppressant', 'Safe · Adjust Dosage · Toxic'],
                                    ['FLUOROURACIL', 'DPYD', 'Chemotherapy', 'Safe · Adjust Dosage · Toxic'],
                                ].map(([drug, gene, cat, risk], i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px 16px' }}><code className="mono" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 12 }}>{drug}</code></td>
                                        <td style={{ padding: '12px 16px' }}><code className="mono" style={{ color: 'var(--accent-2)', fontSize: 12 }}>{gene}</code></td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 13 }}>{cat}</td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 11 }}>{risk}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Medical Disclaimer */}
                <div style={{ padding: '18px 22px', borderRadius: 14, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.25)', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
                    <span style={{ color: 'var(--accent-amber)', fontWeight: 800 }}>⚠ Medical Disclaimer: </span>
                    PharmaGuard is an educational and research tool only. It is NOT a substitute for professional
                    medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before
                    making any clinical decisions based on pharmacogenomics data.
                </div>
            </div>
        </div>
    )
}
