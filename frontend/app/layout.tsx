import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-context'
import NavBar from '@/components/NavBar'

export const metadata: Metadata = {
  title: 'PharmaGuard — Pharmacogenomic Risk Prediction',
  description: 'AI-powered pharmacogenomic risk prediction. VCF parsing, CPIC guidelines, and AI clinical explanations.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script: runs BEFORE React hydration to set theme — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('pharma-theme');
                  document.documentElement.setAttribute('data-theme', saved === 'light' ? 'light' : 'dark');
                } catch(e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <NavBar />
          <main style={{ paddingTop: 64 }}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
