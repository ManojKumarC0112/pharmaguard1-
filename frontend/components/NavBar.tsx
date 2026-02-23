'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/lib/theme-context'
import { useEffect, useState } from 'react'

const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Upload', href: '/upload' },
    { label: 'Panel', href: '/panel' },
    { label: 'Genes', href: '/genes' },
    { label: 'Calculator', href: '/calculator' },
    { label: 'History', href: '/history' },
    { label: 'About', href: '/about' },
]

export default function NavBar() {
    const pathname = usePathname()
    const { theme, toggleTheme } = useTheme()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: scrolled ? '0 0 16px var(--accent-glow)' : '0 0 8px var(--accent-dim)',
                    transition: 'box-shadow 0.3s ease'
                }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                </div>
                <div>
                    <span style={{ fontWeight: 900, fontSize: 17, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>
                        Pharma<span style={{ color: 'var(--accent)' }}>Guard</span>
                    </span>
                </div>
            </Link>

            {/* Links */}
            <div style={{ display: 'flex', gap: 2 }}>
                {NAV_LINKS.map(({ label, href }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`nav-link ${pathname === href ? 'active' : ''}`}
                    >
                        {label}
                    </Link>
                ))}
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: 0
                    }}
                >
                    <span suppressHydrationWarning style={{ fontSize: 15 }}>
                        {theme === 'dark' ? '🌙' : '☀️'}
                    </span>
                    <div className="theme-toggle-track">
                        <div className="theme-toggle-thumb" />
                    </div>
                </button>

                {/* CTA */}
                <Link href="/upload">
                    <button className="btn btn-primary" style={{ padding: '9px 20px', fontSize: 13, borderRadius: 11 }}>
                        Analyze →
                    </button>
                </Link>

            </div>
        </nav>
    )
}
