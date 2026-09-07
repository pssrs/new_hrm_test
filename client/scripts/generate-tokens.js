#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tokens = JSON.parse(fs.readFileSync(path.join(__dirname, '../tokens.json'), 'utf-8'));

// Helper function to convert oklch to oklch CSS
function colorToOklch(color) {
  if (color.$value.colorSpace === 'oklch') {
    const { components, alpha } = color.$value;
    const [l, c, h] = components;
    if (alpha !== undefined) {
      return `oklch(${l} ${c} ${h} / ${alpha})`;
    }
    return `oklch(${l} ${c} ${h})`;
  }
  return '#000000';
}

// Generate CSS variables
let cssContent = ':root {\n';

// Colors - Light mode
Object.entries(tokens.color).forEach(([key, value]) => {
  if (!key.includes('-dark')) {
    cssContent += `  --color-${key}: ${colorToOklch(value)};\n`;
  }
});

// Radius
Object.entries(tokens.radius).forEach(([key, value]) => {
  cssContent += `  --radius-${key}: ${value.$value};\n`;
});

// Font Family
Object.entries(tokens.fontFamily).forEach(([key, value]) => {
  cssContent += `  --font-${key}: ${value.$value.join(', ')};\n`;
});

// Spacing
Object.entries(tokens.spacing).forEach(([key, value]) => {
  cssContent += `  --spacing-${key}: ${value.$value};\n`;
});

// Shadow
Object.entries(tokens.shadow).forEach(([key, value]) => {
  cssContent += `  --shadow-${key}: ${value.$value};\n`;
});

cssContent += '}\n\n.dark {\n';

// Colors - Dark mode
Object.entries(tokens.color).forEach(([key, value]) => {
  if (key.includes('-dark')) {
    const lightKey = key.replace('-dark', '');
    cssContent += `  --color-${lightKey}: ${colorToOklch(value)};\n`;
  }
});

cssContent += '}\n';

// Write CSS file
const cssPath = path.join(__dirname, '../src/styles/tokens.css');
const cssDir = path.dirname(cssPath);

if (!fs.existsSync(cssDir)) {
  fs.mkdirSync(cssDir, { recursive: true });
}

fs.writeFileSync(cssPath, cssContent);
console.log('✅ Generated tokens.css');

// Generate Tailwind config
const tailwindConfig = `export default {
  theme: {
    extend: {
      colors: {
${Object.entries(tokens.color)
  .filter(([key]) => !key.includes('-dark'))
  .map(([key, value]) => `        '${key}': 'var(--color-${key})',`)
  .join('\n')}
      },
      borderRadius: {
${Object.entries(tokens.radius)
  .map(([key, value]) => `        '${key}': 'var(--radius-${key})',`)
  .join('\n')}
      },
      spacing: {
${Object.entries(tokens.spacing)
  .map(([key, value]) => `        '${key}': 'var(--spacing-${key})',`)
  .join('\n')}
      },
      boxShadow: {
${Object.entries(tokens.shadow)
  .map(([key, value]) => `        '${key}': 'var(--shadow-${key})',`)
  .join('\n')}
      },
      fontFamily: {
        sans: 'var(--font-sans)',
      },
    },
  },
};
`;

const tailwindPath = path.join(__dirname, '../tailwind.config.ts');
fs.writeFileSync(tailwindPath, tailwindConfig);
console.log('✅ Generated tailwind.config.ts');

// Generate TypeScript types
const tsTypes = `export type ColorToken =
${Object.keys(tokens.color)
  .filter(key => !key.includes('-dark'))
  .map(key => `  | '${key}'`)
  .join('\n')};

export type RadiusToken =
${Object.keys(tokens.radius)
  .map(key => `  | '${key}'`)
  .join('\n')};

export type SpacingToken =
${Object.keys(tokens.spacing)
  .map(key => `  | '${key}'`)
  .join('\n')};

export type ShadowToken =
${Object.keys(tokens.shadow)
  .map(key => `  | '${key}'`)
  .join('\n')};

export const TOKENS = {
  colors: {
${Object.keys(tokens.color)
  .filter(key => !key.includes('-dark'))
  .map(key => `    ${key}: 'var(--color-${key})',`)
  .join('\n')}
  },
  radius: {
${Object.keys(tokens.radius)
  .map(key => `    ${key}: 'var(--radius-${key})',`)
  .join('\n')}
  },
  spacing: {
${Object.keys(tokens.spacing)
  .map(key => `    ${key}: 'var(--spacing-${key})',`)
  .join('\n')}
  },
  shadows: {
${Object.keys(tokens.shadow)
  .map(key => `    ${key}: 'var(--shadow-${key})',`)
  .join('\n')}
  },
} as const;
`;

const tsPath = path.join(__dirname, '../src/lib/tokens.ts');
const tsDir = path.dirname(tsPath);

if (!fs.existsSync(tsDir)) {
  fs.mkdirSync(tsDir, { recursive: true });
}

fs.writeFileSync(tsPath, tsTypes);
console.log('✅ Generated tokens.ts');
