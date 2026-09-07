// This file is auto-generated from tokens.json
// Do not edit manually

export const TOKENS = {
  colors: {
    'background': 'var(--color-background)',
    'foreground': 'var(--color-foreground)',
    'primary': 'var(--color-primary)',
    'primary-foreground': 'var(--color-primary-foreground)',
    'secondary': 'var(--color-secondary)',
    'secondary-foreground': 'var(--color-secondary-foreground)',
    'accent': 'var(--color-accent)',
    'muted-foreground': 'var(--color-muted-foreground)',
    'destructive': 'var(--color-destructive)',
    'destructive-foreground': 'var(--color-destructive-foreground)',
    'border': 'var(--color-border)',
    'input': 'var(--color-input)',
    'ghost': 'var(--color-ghost)',
    'ghost-hover': 'var(--color-ghost-hover)',
    'outline': 'var(--color-outline)',
    'outline-hover': 'var(--color-outline-hover)',
    'ring': 'var(--color-ring)',
    'sidebar': 'var(--color-sidebar)',
    'sidebar-foreground': 'var(--color-sidebar-foreground)',
    'sidebar-accent': 'var(--color-sidebar-accent)',
    'sidebar-border': 'var(--color-sidebar-border)',
    'sidebar-ring': 'var(--color-sidebar-ring)',
    'ring-error': 'var(--color-ring-error)',
  },
  radius: {
    'base': 'var(--radius-base)',
    'sm': 'var(--radius-sm)',
    'md': 'var(--radius-md)',
    'lg': 'var(--radius-lg)',
    'full': 'var(--radius-full)',
  },
  spacing: {
    '3xs': 'var(--spacing-3xs)',
    '2xs': 'var(--spacing-2xs)',
    'xs': 'var(--spacing-xs)',
    'sm': 'var(--spacing-sm)',
    'md': 'var(--spacing-md)',
    'lg': 'var(--spacing-lg)',
    'xl': 'var(--spacing-xl)',
  },
  shadows: {
    '2xs': 'var(--shadow-2xs)',
    'xs': 'var(--shadow-xs)',
    'sm': 'var(--shadow-sm)',
    'md': 'var(--shadow-md)',
    'lg': 'var(--shadow-lg)',
    'xl': 'var(--shadow-xl)',
    '2xl': 'var(--shadow-2xl)',
  },
} as const;

export type ColorToken = keyof typeof TOKENS.colors;
export type RadiusToken = keyof typeof TOKENS.radius;
export type SpacingToken = keyof typeof TOKENS.spacing;
export type ShadowToken = keyof typeof TOKENS.shadows;
