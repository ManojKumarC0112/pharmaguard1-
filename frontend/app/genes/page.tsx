'use client'

import { useState } from 'react'
import Link from 'next/link'

const GENES = [
    {
        id: 'CYP2D6',
        name: 'Cytochrome P450 2D6',
        drug: 'Codeine, Tramadol, Tamoxifen',
        chromosome: 'Chr 22q13.2',
        color: '#00e5c0',
        pop_freq: { PM: '5-10%', IM: '10-15%', NM: '65-80%', RM: '1-5%', URM: '1-3%' },
        description: 'Responsible for metabolizing ~25% of all prescription drugs. The most polymorphic pharmacogene with 150+ star alleles.',
        variants: [
            { rsid: 'rs3892097', allele: '*4', impact: 'No function', freq: '12-21%', pop: 'Europeans' },
            { rsid: 'rs35742686', allele: '*3', impact: 'No function', freq: '1-2%', pop: 'Europeans' },
            { rsid: 'rs16947', allele: '*2', impact: 'Normal function', freq: '25-33%', pop: 'All' },
            { rsid: 'rs1065852', allele: '*10', impact: 'Decreased function', freq: '35-50%', pop: 'Asians' },
            { rsid: 'rs28371725', allele: '*41', impact: 'Decreased function', freq: '8-10%', pop: 'Europeans' },
        ],
        phenotypeRules: [
            { phenotype: 'PM', score: '0', diplotype_ex: '*4/*4', implication: 'Codeine ineffective; avoid opioids metabolized by CYP2D6' },
            { phenotype: 'IM', score: '0.25–0.75', diplotype_ex: '*1/*4', implication: 'Reduced metabolism; monitor carefully' },
            { phenotype: 'NM', score: '1.0–2.25', diplotype_ex: '*1/*1', implication: 'Standard dosing applies' },
            { phenotype: 'URM', score: '>2.25', diplotype_ex: '*1xN/*2xN', implication: 'Codeine toxic; morphine accumulates dangerously' },
        ],
    },
    {
        id: 'CYP2C9',
        name: 'Cytochrome P450 2C9',
        drug: 'Warfarin, NSAIDs, Phenytoin',
        chromosome: 'Chr 10q24.1',
        color: '#f87171',
        pop_freq: { PM: '3-5%', IM: '15-20%', NM: '75-82%', RM: 'N/A', URM: 'N/A' },
        description: 'Key enzyme for metabolizing S-warfarin (the active enantiomer). CYP2C9*2 and *3 variants dramatically alter anticoagulation response.',
        variants: [
            { rsid: 'rs1799853', allele: '*2', impact: 'Decreased (~12%)', freq: '10-13%', pop: 'Europeans' },
            { rsid: 'rs1057910', allele: '*3', impact: 'Decreased (~5%)', freq: '6-9%', pop: 'Europeans/Asians' },
            { rsid: 'rs28371686', allele: '*5', impact: 'Decreased', freq: '1-2%', pop: 'Africans' },
        ],
        phenotypeRules: [
            { phenotype: 'PM', score: '0', diplotype_ex: '*3/*3', implication: 'Warfarin dose 30-50% lower needed; high bleeding risk' },
            { phenotype: 'IM', score: '0.25', diplotype_ex: '*1/*3', implication: 'Warfarin dose reduction 20-30%; frequent INR monitoring' },
            { phenotype: 'NM', score: '1.0', diplotype_ex: '*1/*1', implication: 'Standard warfarin dosing' },
        ],
    },
    {
        id: 'CYP2C19',
        name: 'Cytochrome P450 2C19',
        drug: 'Clopidogrel, Omeprazole, SSRIs',
        chromosome: 'Chr 10q24.1',
        color: '#2196f3',
        pop_freq: { PM: '2-5%', IM: '15-25%', NM: '35-50%', RM: '10-15%', URM: '1-5%' },
        description: 'Bioactivates clopidogrel prodrug. *2 (loss-of-function) is highly prevalent in Asians; *17 (gain-of-function) causes ultra-rapid metabolism.',
        variants: [
            { rsid: 'rs4244285', allele: '*2', impact: 'No function', freq: '15-30% (Asians)', pop: 'All' },
            { rsid: 'rs4986893', allele: '*3', impact: 'No function', freq: '2-9% (Asians)', pop: 'Asians' },
            { rsid: 'rs12248560', allele: '*17', impact: 'Increased function', freq: '18-25%', pop: 'Europeans/Africans' },
        ],
        phenotypeRules: [
            { phenotype: 'PM', score: '0', diplotype_ex: '*2/*2', implication: 'Clopidogrel ineffective; use prasugrel/ticagrelor' },
            { phenotype: 'IM', score: '0.5', diplotype_ex: '*1/*2', implication: 'Clopidogrel reduced efficacy; consider alternatives' },
            { phenotype: 'NM', score: '1.0', diplotype_ex: '*1/*1', implication: 'Standard clopidogrel dosing' },
            { phenotype: 'RM', score: '1.5', diplotype_ex: '*1/*17', implication: 'Enhanced bioactivation; monitor for bleeding' },
        ],
    },
    {
        id: 'SLCO1B1',
        name: 'OATP1B1 Transporter',
        drug: 'Simvastatin, Rosuvastatin',
        chromosome: 'Chr 12p12.1',
        color: '#fbbf24',
        pop_freq: { PM: '5-15%', IM: '20-30%', NM: '55-75%', RM: 'N/A', URM: 'N/A' },
        description: 'Organic anion transporter critical for hepatic statin uptake. SLCO1B1*5 (rs4149056) is the primary variant causing myopathy risk.',
        variants: [
            { rsid: 'rs4149056', allele: '*5', impact: 'Reduced transport', freq: '10-15%', pop: 'Europeans/Asians' },
        ],
        phenotypeRules: [
            { phenotype: 'PM', score: '0', diplotype_ex: '*5/*5', implication: 'Avoid simvastatin ≥40mg; myopathy/rhabdomyolysis risk' },
            { phenotype: 'IM', score: '0.5', diplotype_ex: '*1/*5', implication: 'Avoid simvastatin 80mg; monitor CK levels' },
            { phenotype: 'NM', score: '1.0', diplotype_ex: '*1/*1', implication: 'Standard statin dosing' },
        ],
    },
    {
        id: 'TPMT',
        name: 'Thiopurine S-methyltransferase',
        drug: 'Azathioprine, 6-Mercaptopurine',
        chromosome: 'Chr 6p22.3',
        color: '#c084fc',
        pop_freq: { PM: '0.3%', IM: '10%', NM: '89%', RM: 'N/A', URM: 'N/A' },
        description: 'Inactivates thiopurine drugs via methylation. PM phenotype leads to life-threatening bone marrow suppression without dose reduction.',
        variants: [
            { rsid: 'rs1800462', allele: '*2', impact: 'No function', freq: '0.5%', pop: 'Caucasians' },
            { rsid: 'rs1142345', allele: '*3C', impact: 'No function', freq: '5-8%', pop: 'Caucasians/Asians' },
            { rsid: 'rs1800460', allele: '*3B', impact: 'No function', freq: '0.6%', pop: 'Caucasians' },
        ],
        phenotypeRules: [
            { phenotype: 'PM', score: '0', diplotype_ex: '*3A/*3A', implication: 'Azathioprine CONTRAINDICATED at standard dose; 10x reduction' },
            { phenotype: 'IM', score: '0.5', diplotype_ex: '*1/*3C', implication: 'Reduce dose 30-70%; monitor CBC biweekly' },
            { phenotype: 'NM', score: '1.0', diplotype_ex: '*1/*1', implication: 'Standard dosing; routine CBC monitoring' },
        ],
    },
    {
        id: 'DPYD',
        name: 'Dihydropyrimidine Dehydrogenase',
        drug: 'Fluorouracil (5-FU), Capecitabine',
        chromosome: 'Chr 1p22',
        color: '#f472b6',
        pop_freq: { PM: '0.5-3%', IM: '3-8%', NM: '89-97%', RM: 'N/A', URM: 'N/A' },
        description: 'Responsible for >80% of 5-FU catabolism. DPYD*2A (rs3918290) carriers face catastrophic toxicity from standard chemotherapy doses.',
        variants: [
            { rsid: 'rs3918290', allele: '*2A', impact: 'No function', freq: '1-2%', pop: 'Europeans' },
            { rsid: 'rs55886062', allele: '*13', impact: 'No function', freq: '0.1%', pop: 'All' },
            { rsid: 'rs67376798', allele: 'c.2846A>T', impact: 'Decreased function', freq: '2-5%', pop: 'All' },
        ],
        phenotypeRules: [
            { phenotype: 'PM', score: '0', diplotype_ex: '*2A/*2A', implication: '5-FU CONTRAINDICATED; fatal toxicity risk' },
            { phenotype: 'IM', score: '0.5', diplotype_ex: '*1/*2A', implication: '50% dose reduction mandatory; monitor closely' },
            { phenotype: 'NM', score: '1.0', diplotype_ex: 'wt/wt', implication: 'Standard chemotherapy dosing protocol' },
        ],
    },
]

export default function GenesPage() {
    const [selected, setSelected] = useState(GENES[0])
    const [activeTab, setActiveTab] = useState<'variants' | 'phenotypes'>('variants')

    return (
        <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 66px)', padding: '56px 40px 80px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div className="section-label" style={{ justifyContent: 'center' }}>Pharmacogene Database</div>
                    <h1 style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.025em', marginBottom: 12 }}>
                        Gene <span className="gradient-text">Explorer</span>
                    </h1>
                    <p style={{ color: 'var(--text-2)', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
                        Browse star-allele tables, population frequencies, and CPIC evidence for all 6 pharmacogenes.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: 20 }}>

                    {/* Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {GENES.map(g => (
                            <button
                                key={g.id}
                                onClick={() => { setSelected(g); setActiveTab('variants') }}
                                style={{
                                    padding: '14px 18px', borderRadius: 14, cursor: 'pointer',
                                    background: selected.id === g.id ? `${g.color}14` : 'var(--bg-card)',
                                    border: selected.id === g.id ? `1px solid ${g.color}40` : '1px solid var(--border)',
                                    textAlign: 'left', transition: 'all 0.2s',
                                    fontFamily: 'Space Grotesk, sans-serif',
                                }}
                            >
                                <div style={{ fontWeight: 800, color: selected.id === g.id ? g.color : 'var(--text-1)', fontSize: 15, marginBottom: 2, fontFamily: 'JetBrains Mono, monospace' }}>{g.id}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4 }}>{g.drug.split(',')[0]}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{g.chromosome}</div>
                            </button>
                        ))}
                    </div>

                    {/* Main content */}
                    <div>
                        {/* Gene header */}
                        <div style={{ padding: '28px 32px', borderRadius: 20, marginBottom: 16, background: `linear-gradient(135deg, ${selected.color}10, transparent)`, border: `1px solid ${selected.color}25` }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontSize: 32, fontWeight: 900, color: selected.color, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em' }}>{selected.id}</div>
                                    <div style={{ fontSize: 16, color: 'var(--text-1)', fontWeight: 700, marginTop: 4 }}>{selected.name}</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>{selected.chromosome}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>CPIC Drugs</div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                        {selected.drug.split(', ').map(d => (
                                            <span key={d} style={{ padding: '3px 10px', borderRadius: 8, background: `${selected.color}14`, border: `1px solid ${selected.color}25`, color: selected.color, fontSize: 11, fontWeight: 700 }}>{d}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginTop: 16 }}>{selected.description}</p>

                            {/* Population freq strip */}
                            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                                {Object.entries(selected.pop_freq).filter(([, v]) => v !== 'N/A').map(([pheno, freq]) => (
                                    <div key={pheno} style={{ padding: '6px 14px', borderRadius: 10, background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pop. {pheno}</div>
                                        <div className="mono" style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)', marginTop: 2 }}>{freq}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                            {(['variants', 'phenotypes'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '9px 20px', borderRadius: 10,
                                        background: activeTab === tab ? `${selected.color}16` : 'var(--bg-input)',
                                        border: activeTab === tab ? `1px solid ${selected.color}35` : '1px solid var(--border)',
                                        color: activeTab === tab ? selected.color : 'var(--text-2)',
                                        fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                        fontFamily: 'Space Grotesk, sans-serif',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {tab === 'variants' ? '🧬 Star Alleles' : '⚡ Phenotype Rules'}
                                </button>
                            ))}
                        </div>

                        {/* Variants table */}
                        {activeTab === 'variants' && (
                            <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-card-alt)' }}>
                                            {['RSID', 'Star Allele', 'Functional Impact', 'Allele Freq.', 'Population'].map(h => (
                                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-2)', fontWeight: 700, borderBottom: '1px solid var(--border)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selected.variants.map((v, i) => (
                                            <tr key={i} style={{ borderBottom: i < selected.variants.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                                <td style={{ padding: '13px 16px' }}><code className="mono" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 12 }}>{v.rsid}</code></td>
                                                <td style={{ padding: '13px 16px' }}><code className="mono" style={{ color: selected.color, fontWeight: 800, fontSize: 13 }}>{v.allele}</code></td>
                                                <td style={{ padding: '13px 16px' }}>
                                                    <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: v.impact.includes('No') ? 'rgba(248,113,113,0.1)' : v.impact.includes('Decreased') ? 'rgba(251,191,36,0.1)' : 'rgba(52,211,153,0.1)', color: v.impact.includes('No') ? '#f87171' : v.impact.includes('Decreased') ? '#fbbf24' : '#34d399' }}>
                                                        {v.impact}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '13px 16px', color: 'var(--text-2)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{v.freq}</td>
                                                <td style={{ padding: '13px 16px', color: 'var(--text-3)', fontSize: 12 }}>{v.pop}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Phenotype rules */}
                        {activeTab === 'phenotypes' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {selected.phenotypeRules.map((r, i) => {
                                    const phenoColors: Record<string, string> = { PM: '#f87171', IM: '#fbbf24', NM: '#34d399', RM: '#2196f3', URM: '#c084fc' }
                                    const pc = phenoColors[r.phenotype] || '#8aafd4'
                                    const phenoNames: Record<string, string> = { PM: 'Poor Metabolizer', IM: 'Intermediate Metabolizer', NM: 'Normal Metabolizer', RM: 'Rapid Metabolizer', URM: 'Ultra-Rapid Metabolizer' }
                                    return (
                                        <div key={i} className="glass" style={{ padding: '20px 24px', borderLeft: `3px solid ${pc}` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: 22, fontWeight: 900, color: pc, fontFamily: 'JetBrains Mono, monospace' }}>{r.phenotype}</span>
                                                <span style={{ fontSize: 14, color: 'var(--text-1)', fontWeight: 700 }}>{phenoNames[r.phenotype]}</span>
                                                <span className="mono" style={{ fontSize: 12, color: 'var(--accent-2)', padding: '2px 10px', background: 'var(--accent-2-dim)', borderRadius: 6 }}>{r.diplotype_ex}</span>
                                                <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 'auto' }}>Activity score: {r.score}</span>
                                            </div>
                                            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65 }}>{r.implication}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Footer CTA */}
                        <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
                            <Link href="/panel">
                                <button className="btn btn-primary" style={{ padding: '10px 22px', fontSize: 13, borderRadius: 11 }}>
                                    Run Panel Analysis →
                                </button>
                            </Link>
                            <Link href="/upload">
                                <button className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 13, borderRadius: 11 }}>
                                    Single Drug Analysis
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
