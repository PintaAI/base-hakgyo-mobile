/**
 * Auto-generates global.css color variables from theme.ts
 * Run: bun run generate-theme
 * 
 * This ensures NativeWind CSS variables stay in sync with TypeScript theme constants.
 */

const fs = require('fs');
const path = require('path');

// Get __dirname
const themePath = path.join(__dirname, '../src/constants/theme.ts');
const themeContent = fs.readFileSync(themePath, 'utf-8');

/**
 * Parse the Colors object from theme.ts content
 */
function parseColorsFromTheme(content) {
  const lightMatch = content.match(/light:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s);
  const darkMatch = content.match(/dark:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s);

  if (!lightMatch || !darkMatch) {
    throw new Error('Could not parse Colors from theme.ts');
  }

  const parseColors = (match) => {
    const colors = {};
    // Remove comments and extract key-value pairs
    const cleanMatch = match.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const pairs = cleanMatch.match(/(\w+):\s*['"]([^'"]+)['"]/g);
    
    if (pairs) {
      pairs.forEach(pair => {
        const [key, value] = pair.split(':').map(s => s.trim().replace(/['"]/g, ''));
        if (key && value) {
          colors[key] = value;
        }
      });
    }
    
    return colors;
  };

  return {
    light: parseColors(lightMatch[1]),
    dark: parseColors(darkMatch[1]),
  };
}

/**
 * Convert camelCase to kebab-case
 */
function camelToKebab(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Generate the CSS content
 */
function generateThemeCSS(colors) {
  const lines = [
    `@import "tailwindcss/theme.css" layer(theme);`,
    `@import "tailwindcss/preflight.css" layer(base);`,
    `@import "tailwindcss/utilities.css";`,
    ``,
    `@import "nativewind/theme";`,
    ``,
    `/* ============================================ */`,
    `/* AUTO-GENERATED COLORS - DO NOT EDIT MANUALLY */`,
    `/* ============================================ */`,
    ``,
    `@theme {`,
  ];

  // Light mode colors
  for (const [key, value] of Object.entries(colors.light)) {
    const cssVar = `--color-${camelToKebab(key)}`;
    lines.push(`  ${cssVar}: ${value};`);
  }

  lines.push(``);
  lines.push(`  /* Fonts */`);
  lines.push(`  --font-display:`);
  lines.push(`    Spline Sans, Inter, ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji,`);
  lines.push(`    Segoe UI Symbol, Noto Color Emoji;`);
  lines.push(`  --font-mono:`);
  lines.push(`    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;`);
  lines.push(`  --font-rounded: 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif;`);
  lines.push(`  --font-serif: Georgia, 'Times New Roman', serif;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`/* Dark mode colors */`);
  lines.push(`@media (prefers-color-scheme: dark) {`);
  lines.push(`  :root {`);

  // Dark mode colors
  for (const [key, value] of Object.entries(colors.dark)) {
    const cssVar = `--color-${camelToKebab(key)}`;
    lines.push(`    ${cssVar}: ${value};`);
  }

  lines.push(`  }`);
  lines.push(`}`);
  lines.push(``);

  return lines.join('\n');
}

// Main execution
try {
  console.log('🎨 Generating theme CSS from theme.ts...');
  
  const colors = parseColorsFromTheme(themeContent);
  
  console.log(`   Found ${Object.keys(colors.light).length} light mode colors`);
  console.log(`   Found ${Object.keys(colors.dark).length} dark mode colors`);
  
  const cssContent = generateThemeCSS(colors);
  
  const outputPath = path.join(__dirname, '../src/global.css');
  fs.writeFileSync(outputPath, cssContent);
  
  console.log(`\n✅ Theme CSS generated successfully!`);
  console.log(`📁 Output: ${outputPath}`);
  console.log(`\n💡 Tip: Run this script whenever you update src/constants/theme.ts`);
} catch (error) {
  console.error('❌ Error generating theme CSS:', error);
  process.exit(1);
}