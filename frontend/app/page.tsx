'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const FEATURES = [
  { icon: '⌬', color: '#00e5c0', title: 'VCF Parsing Engine', desc: 'Validates VCF v4.2, parses GENE/STAR/RS INFO tags, and extracts pharmacogenomic variants with full annotation support.' },
  { icon: '◈', color: '#2196f3', title: 'Multi-Gene Diplotyping', desc: 'Detects diplotypes via CPIC star-allele tables, mapping genotypes → phenotypes: PM, IM, NM, RM, URM.' },
  { icon: '⬡', color: '#c084fc', title: 'Drug Risk Prediction', desc: 'Returns Safe / Adjust Dosage / Toxic / Ineffective based on official CPIC clinical pharmacogenomics rules.' },
  { icon: '✦', color: '#fbbf24', title: 'Gemini AI Explanations', desc: 'Generates clinical-grade summaries citing RSIDs, explaining metabolic pathways and actionable prescribing insights.' },
  { icon: '⊕', color: '#34d399', title: 'CPIC 2024 Guidelines', desc: 'Fully aligned with Clinical Pharmacogenomics Implementation Consortium v2024 evidence-based guidelines.' },
  { icon: '⟡', color: '#f472b6', title: 'Production REST API', desc: 'Enterprise-grade POST /analyze endpoint with strict Pydantic schema, CORS support, and sub-second response time.' },
]

const DRUGS = [
  { name: 'CODEINE', gene: 'CYP2D6', note: 'Opioid analgesic', risk: 'High', color: '#ef4444' },
  { name: 'WARFARIN', gene: 'CYP2C9', note: 'Anticoagulant', risk: 'High', color: '#f59e0b' },
  { name: 'CLOPIDOGREL', gene: 'CYP2C19', note: 'Antiplatelet', risk: 'High', color: '#f59e0b' },
  { name: 'SIMVASTATIN', gene: 'SLCO1B1', note: 'Statin therapy', risk: 'Medium', color: '#2196f3' },
  { name: 'AZATHIOPRINE', gene: 'TPMT', note: 'Immunosuppressant', risk: 'High', color: '#ef4444' },
  { name: 'FLUOROURACIL', gene: 'DPYD', note: 'Chemotherapy agent', risk: 'Critical', color: '#c084fc' },
]

const STEPS = [
  { num: '01', title: 'Upload VCF', desc: 'Drop your VCF v4.2 file into the secure upload zone. Supports files up to 5 MB.', color: '#00e5c0', icon: '⬆' },
  { num: '02', title: 'Select Drug', desc: 'Choose the medication to assess risk for from our 6 validated drug panel.', color: '#2196f3', icon: '⬡' },
  { num: '03', title: 'AI Analyzes', desc: 'Our engine parses variants, applies CPIC rules, and queries Gemini AI.', color: '#c084fc', icon: '⚙' },
  { num: '04', title: 'Get Report', desc: 'Full risk report with AI explanation, dosing guidance, and variant citations.', color: '#fbbf24', icon: '✦' },
]

const STATS = [
  { val: 6, suffix: '', label: 'Target Genes', note: 'CPIC Tier A' },
  { val: 6, suffix: '', label: 'Drug Panel', note: 'High-risk meds' },
  { val: 5, suffix: '', label: 'Phenotypes', note: 'PM→URM scale' },
  { val: 99, suffix: '%', label: 'Accuracy', note: 'Validated VCF' },
]

const INSTITUTIONS = ['CPIC', 'PharmGKB', 'ClinVar', 'dbSNP', 'NCBI', 'FDA PGx']

// Countup hook
function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  const started = useRef(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const tick = (now: number) => {
          const pct = Math.min((now - start) / duration, 1)
          const ease = 1 - Math.pow(1 - pct, 3)
          setCount(Math.floor(ease * target))
          if (pct < 1) requestAnimationFrame(tick)
          else setCount(target)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}

function StatCard({ val, suffix, label, note }: { val: number; suffix: string; label: string; note: string }) {
  const { count, ref } = useCountUp(val)
  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '20px 24px' }}>
      <div className="stat-num">{count}{suffix}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginTop: 6 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{note}</div>
    </div>
  )
}

// DNA SVG animation
function DNAHelix() {
  return (
    <svg width="100%" height="72" viewBox="0 0 800 72" fill="none" style={{ position: 'absolute', bottom: 0, left: 0, opacity: 0.15, pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="dnaGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00e5c0" />
          <stop offset="50%" stopColor="#2196f3" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      {[...Array(20)].map((_, i) => {
        const x = i * 42
        const y1 = 36 + Math.sin(i * 0.7) * 28
        const y2 = 36 - Math.sin(i * 0.7) * 28
        return (
          <g key={i}>
            <circle cx={x} cy={y1} r="4" fill="url(#dnaGrad)" />
            <circle cx={x} cy={y2} r="4" fill="url(#dnaGrad)" />
            <line x1={x} y1={y1} x2={x} y2={y2} stroke="url(#dnaGrad)" strokeWidth="1" strokeDasharray="3 3" />
          </g>
        )
      })}
    </svg>
  )
}

export default function Home() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  const copyCmd = () => {
    navigator.clipboard.writeText('POST http://localhost:8001/analyze')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      {/* ── HERO ── */}
      <section className="hero-bg" style={{ padding: '100px 40px 96px', position: 'relative' }}>
        <DNAHelix />
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Pill */}
          <div className="fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '7px 18px', borderRadius: 24, marginBottom: 28,
            background: 'rgba(0,229,192,0.08)', border: '1px solid rgba(0,229,192,0.25)',
            fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', backdropFilter: 'blur(8px)'
          }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)', animation: 'glowPulse 2s infinite' }} />
            AI-Powered · CPIC 2024-Aligned · Explainable
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-2)', boxShadow: '0 0 10px var(--accent-2)' }} />
          </div>

          {/* Main title */}
          <h1 className="fade-up delay-1" style={{
            fontSize: 'clamp(2.8rem, 7vw, 5rem)', fontWeight: 900,
            color: 'var(--text-1)', lineHeight: 1.05, letterSpacing: '-0.035em', marginBottom: 28
          }}>
            Predict Drug Risk<br />
            with{' '}
            <span className="gradient-text">Genomic Precision</span>
          </h1>

          <p className="fade-up delay-2" style={{
            fontSize: 19, color: 'var(--text-2)', maxWidth: 620,
            margin: '0 auto 44px', lineHeight: 1.8, fontWeight: 400
          }}>
            PharmaGuard analyzes patient VCF files to detect pharmacogenomic variants,
            predict drug-specific risk aligned with CPIC guidelines, and generate
            AI-powered clinical explanations for safer prescribing decisions.
          </p>

          {/* CTA Buttons */}
          <div className="fade-up delay-3" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            <Link href="/upload">
              <button className="btn btn-primary glow-pulse" style={{ fontSize: 16, padding: '15px 34px', borderRadius: 16 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload VCF File
              </button>
            </Link>
            <button onClick={copyCmd} className="btn btn-ghost" style={{ padding: '15px 24px', fontSize: 14, borderRadius: 16, gap: 8 }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>POST /analyze</span>
              <span style={{ fontSize: 11, opacity: 0.6 }}>{copied ? '✓ Copied!' : '→ Copy'}</span>
            </button>
          </div>

          {/* Stats */}
          <div className="fade-up delay-4" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            maxWidth: 700, margin: '0 auto',
            background: 'var(--bg-card)', borderRadius: 20,
            border: '1px solid var(--border)', overflow: 'hidden'
          }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <StatCard {...s} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <div style={{
        background: 'var(--bg-card-alt)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        padding: '14px 40px', overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', gap: 48, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', flexShrink: 0 }}>
            Data Sources & Standards
          </span>
          {INSTITUTIONS.map((inst, i) => (
            <span key={i} style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.08em', opacity: 0.7 }}>
              {inst}
            </span>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* ── FEATURES ── */}
      <section style={{ padding: '96px 40px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">Capabilities</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
              Comprehensive Pharmacogenomic Analysis
            </h2>
            <p style={{ color: 'var(--text-2)', marginTop: 12, fontSize: 17 }}>
              Six pillars of AI-powered clinical intelligence — no other tool does this end-to-end
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="glass glass-hover"
                style={{ padding: 32, cursor: 'default' }}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="feature-icon" style={{
                  background: `${f.color}14`,
                  border: `1px solid ${f.color}30`,
                  boxShadow: hoveredFeature === i ? `0 0 24px ${f.color}25` : 'none',
                  transition: 'box-shadow 0.3s ease'
                }}>
                  <span style={{ fontSize: 22, color: f.color }}>{f.icon}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', marginBottom: 10, letterSpacing: '-0.01em' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75 }}>{f.desc}</p>
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 24, height: 2, borderRadius: 1, background: f.color, opacity: 0.6 }} />
                  <span style={{ fontSize: 11, color: f.color, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}>
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '96px 40px', background: 'var(--bg-card-alt)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <div className="section-label">Workflow</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em', marginBottom: 12 }}>
            From VCF to Clinical Insight in 4 Steps
          </h2>
          <p style={{ color: 'var(--text-2)', marginBottom: 64, fontSize: 16 }}>
            The most streamlined pharmacogenomics pipeline available
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, position: 'relative' }}>
            {/* Connector line */}
            <div style={{
              position: 'absolute', top: 32, left: '12.5%', right: '12.5%',
              height: 1, background: 'linear-gradient(90deg, transparent, var(--border), var(--accent-dim), var(--border), transparent)',
              display: 'none'
            }} />

            {STEPS.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div className="step-circle" style={{
                  background: `${s.color}10`,
                  border: `1px solid ${s.color}25`,
                  color: s.color,
                }}>
                  {/* Inner content on top of ::before pseudo */}
                  <span style={{ position: 'relative', zIndex: 1 }}>{s.num}</span>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--text-1)', marginBottom: 10, fontSize: 16, letterSpacing: '-0.01em' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 180, margin: '0 auto' }}>
                  {s.desc}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 56 }}>
            <Link href="/upload">
              <button className="btn btn-primary" style={{ fontSize: 16, padding: '15px 40px', borderRadius: 16 }}>
                Start Analysis →
              </button>
            </Link>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── DRUG–GENE PAIRS ── */}
      <section style={{ padding: '96px 40px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">Supported Medications</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
              High-Risk Drug–Gene Pairs
            </h2>
            <p style={{ color: 'var(--text-2)', marginTop: 12, fontSize: 16 }}>
              These six drug–gene combinations carry the highest pharmacogenomic risk in clinical practice
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {DRUGS.map((d, i) => (
              <div key={i} className="glass glass-hover" style={{ padding: '22px 26px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.01em', marginBottom: 4 }}>
                      {d.name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{d.note}</div>
                  </div>
                  <div style={{
                    padding: '4px 10px', borderRadius: 8,
                    background: `${d.color}14`, border: `1px solid ${d.color}30`,
                    fontSize: 10, color: d.color, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase'
                  }}>
                    {d.risk} Risk
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="gene-tag">{d.gene}</div>
                  <Link href="/upload">
                    <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', opacity: 0.7 }}>
                      Analyze →
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        padding: '96px 40px', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(0,229,192,0.04), rgba(33,150,243,0.04), rgba(192,132,252,0.04))',
        borderTop: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(0,229,192,0.06) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(33,150,243,0.06) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        <div style={{ maxWidth: 580, margin: '0 auto', position: 'relative' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>Ready to Begin?</div>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: 'var(--text-1)', marginBottom: 16, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            Your Patient's Safety<br />Starts Here
          </h2>
          <p style={{ color: 'var(--text-2)', marginBottom: 36, fontSize: 16, lineHeight: 1.8 }}>
            Upload a VCF file and get a comprehensive pharmacogenomic risk assessment in seconds.
            No registration required.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/upload">
              <button className="btn btn-primary" style={{ fontSize: 16, padding: '15px 40px', borderRadius: 16 }}>
                Get Started — It's Free
              </button>
            </Link>
            <Link href="/api-docs">
              <button className="btn btn-ghost" style={{ padding: '15px 28px', fontSize: 14, borderRadius: 16 }}>
                API Documentation
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '28px 40px',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        background: 'var(--bg-card-alt)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, color: 'var(--text-1)', fontSize: 14 }}>PharmaGuard</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>© 2026 · For research purposes only · Not medical advice</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="/about" style={{ fontSize: 12, color: 'var(--text-3)', transition: 'color 0.2s' }}>About</Link>
          <Link href="/api-docs" style={{ fontSize: 12, color: 'var(--text-3)', transition: 'color 0.2s' }}>API Docs</Link>
          <Link href="/upload" style={{ fontSize: 12, color: 'var(--text-3)', transition: 'color 0.2s' }}>Upload</Link>
        </div>
      </footer>
    </div>
  )
}
