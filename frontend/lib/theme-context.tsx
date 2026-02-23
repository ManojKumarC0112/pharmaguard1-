'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    toggleTheme: () => { },
})

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark')

    // On first mount, read from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('pharma-theme') as Theme
        if (saved === 'light' || saved === 'dark') {
            setTheme(saved)
            document.documentElement.setAttribute('data-theme', saved)
        }
    }, [])

    // Apply theme to <html> whenever it changes
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('pharma-theme', theme)
    }, [theme])

    const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
