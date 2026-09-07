import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTheme as useNextTheme } from 'next-themes'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, setTheme, systemTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine if dark mode is active
  const isDark =
    mounted && (theme === 'dark' || (theme === 'system' && systemTheme === 'dark'))

  // Apply theme class to document element
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark, mounted])

  if (!mounted) {
    // Return a placeholder during SSR
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider
      value={{
        theme: (theme as Theme) || 'system',
        setTheme,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
