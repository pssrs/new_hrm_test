import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tokensPath = path.join(__dirname, '../tokens-new.json');
const outputDir = path.join(__dirname, '../src/styles');

// Read tokens
const tokensRaw = fs.readFileSync(tokensPath, 'utf-8');
const tokens = JSON.parse(tokensRaw);

// Convert color token to oklch string
function toOklchString(value) {
  if (typeof value === 'string') return value;
  if (value.startsWith && value.startsWith('oklch')) return value;
  return value;
}

// Generate CSS file
function generateCSS() {
  let css = '';

  // Root variables (light mode)
  css += ':root {\n';
  
  // Colors
  Object.entries(tokens.color).forEach(([key, token]) => {
    if (!key.endsWith('-dark')) {
      const value = toOklchString(token.$value);
      css += `  --color-${key}: ${value};\n`;
    }
  });

  // Radius
  Object.entries(tokens.radius).forEach(([key, token]) => {
    css += `  --radius-${key}: ${token.$value};\n`;
  });

  // Spacing
  Object.entries(tokens.spacing).forEach(([key, token]) => {
    css += `  --spacing-${key}: ${token.$value};\n`;
  });

  // Shadows
  Object.entries(tokens.shadow).forEach(([key, token]) => {
    css += `  --shadow-${key}: ${token.$value};\n`;
  });

  css += '}\n\n';

  // Dark mode variables
  css += '.dark {\n';
  
  // Colors dark
  Object.entries(tokens.color).forEach(([key, token]) => {
    if (key.endsWith('-dark')) {
      const lightKey = key.replace('-dark', '');
      const value = toOklchString(token.$value);
      css += `  --color-${lightKey}: ${value};\n`;
    }
  });

  css += '}\n';

  return css;
}

// Generate Tailwind theme config
function generateTailwindConfig() {
  let config = `export default {
  theme: {
    extend: {
      colors: {
`;

  // Colors
  Object.entries(tokens.color).forEach(([key, token]) => {
    if (!key.endsWith('-dark')) {
      config += `        '${key}': 'var(--color-${key})',\n`;
    }
  });

  config += `      },
      borderRadius: {
`;

  // Radius
  Object.entries(tokens.radius).forEach(([key, token]) => {
    config += `        '${key}': 'var(--radius-${key})',\n`;
  });

  config += `      },
      spacing: {
`;

  // Spacing
  Object.entries(tokens.spacing).forEach(([key, token]) => {
    config += `        '${key}': 'var(--spacing-${key})',\n`;
  });

  config += `      },
      boxShadow: {
`;

  // Shadows
  Object.entries(tokens.shadow).forEach(([key, token]) => {
    config += `        '${key}': 'var(--shadow-${key})',\n`;
  });

  config += `      },
      fontFamily: {
        sans: ['Geist', 'sans-serif'],
      },
    },
  },
};\n`;

  return config;
}

// Generate TypeScript types
function generateTypeScript() {
  let ts = `// This file is auto-generated from tokens.json
// Do not edit manually

`;

  ts += `export const TOKENS = {\n`;
  ts += `  colors: {\n`;

  Object.entries(tokens.color).forEach(([key, token]) => {
    if (!key.endsWith('-dark')) {
      ts += `    '${key}': 'var(--color-${key})',\n`;
    }
  });

  ts += `  },\n`;
  ts += `  radius: {\n`;

  Object.entries(tokens.radius).forEach(([key, token]) => {
    ts += `    '${key}': 'var(--radius-${key})',\n`;
  });

  ts += `  },\n`;
  ts += `  spacing: {\n`;

  Object.entries(tokens.spacing).forEach(([key, token]) => {
    ts += `    '${key}': 'var(--spacing-${key})',\n`;
  });

  ts += `  },\n`;
  ts += `  shadows: {\n`;

  Object.entries(tokens.shadow).forEach(([key, token]) => {
    ts += `    '${key}': 'var(--shadow-${key})',\n`;
  });

  ts += `  },\n`;
  ts += `} as const;\n`;

  ts += `\nexport type ColorToken = keyof typeof TOKENS.colors;\n`;
  ts += `export type RadiusToken = keyof typeof TOKENS.radius;\n`;
  ts += `export type SpacingToken = keyof typeof TOKENS.spacing;\n`;
  ts += `export type ShadowToken = keyof typeof TOKENS.shadows;\n`;

  return ts;
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write files
const css = generateCSS();
fs.writeFileSync(path.join(outputDir, 'tokens-v4.css'), css);
console.log(`✓ Generated tokens-v4.css (${css.length} bytes)`);

const twConfig = generateTailwindConfig();
fs.writeFileSync(path.join(__dirname, '../tailwind.config.ts'), twConfig);
console.log(`✓ Generated tailwind.config.ts (${twConfig.length} bytes)`);

const tsTypes = generateTypeScript();
fs.writeFileSync(path.join(__dirname, '../src/lib/tokens.ts'), tsTypes);
console.log(`✓ Generated src/lib/tokens.ts (${tsTypes.length} bytes)`);

console.log('\n✓ All tokens generated successfully!');
