# AI Interview System: Design System

## DESIGN PHILOSOPHY

This product must feel like a professional software instrument, not an AI-generated website.

The design language is:
- BLACK + WHITE
- TYPOGRAPHY FIRST
- DATA DENSE
- MINIMAL
- TECHNICAL
- PRECISE
- QUIET
- PROFESSIONAL

Use visual hierarchy through:
- typography
- spacing
- alignment
- borders
- surface contrast

NOT through:
- gradients
- neon colors
- excessive shadows
- glowing effects
- giant cards
- illustrations
- excessive rounded corners
- decorative AI imagery

The interface should look intentional even when all decorative elements are removed.

---
## 1. Core Principles
1. **Black and white first.** Color is avoided entirely unless absolutely necessary for critical system states.
2. **Grayscale hierarchy.** Depth and priority are communicated via subtle surface shifts and borders.
3. **Thin 1px borders.** Used to define structure and boundaries without heavy shadows.
4. **Strong typography.** Geist for readability, Geist Mono for technical density and metrics.
5. **Dense but breathable.** High information density typical of developer tools, but with rigid alignment and padding to maintain readability.

## 2. Design Tokens (CSS Variables)

```css
:root {
  /* Colors: Monochromatic Scale */
  --color-black: #000000;
  --color-white: #ffffff;
  --color-gray-50: #fafafa;
  --color-gray-100: #f5f5f5;
  --color-gray-200: #e5e5e5;
  --color-gray-300: #d4d4d4;
  --color-gray-400: #a3a3a3;
  --color-gray-500: #737373;
  --color-gray-600: #525252;
  --color-gray-700: #404040;
  --color-gray-800: #262626;
  --color-gray-900: #171717;

  /* Surfaces & Backgrounds */
  --bg-app: var(--color-gray-50);
  --bg-surface: var(--color-white);
  --bg-surface-hover: var(--color-gray-100);
  --bg-surface-inverted: var(--color-black);
  
  /* Borders */
  --border-subtle: var(--color-gray-200);
  --border-strong: var(--color-gray-300);
  --border-focus: var(--color-black);

  /* Typography Colors */
  --text-primary: var(--color-gray-900);
  --text-secondary: var(--color-gray-500);
  --text-tertiary: var(--color-gray-400);
  --text-inverted: var(--color-white);

  /* Typography Families */
  --font-sans: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, monospace;

  /* Spacing Scale (4px baseline) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-container: 16px; /* For major outer bounds only */

  /* Shadows (Minimal) */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --shadow-dialog: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 3. Components Specifications

### Buttons
- **Primary**: Black background, white text. No border. Hover: opacity 90%.
- **Secondary**: White background, black text, 1px solid `--border-strong`. Hover: `--bg-surface-hover`.
- **Ghost**: Transparent background, black text. Hover: `--bg-surface-hover`.
- **Properties**: `border-radius: var(--radius-md)`, font weight 500, padding: 8px 16px.

### Inputs
- **Base**: White background, 1px solid `--border-subtle`, text primary.
- **Focus**: `border-color: var(--border-focus)`, no outline ring.
- **Properties**: `border-radius: var(--radius-md)`, padding: 8px 12px. Font: `--font-sans`.

### Cards
- **Base**: White background, 1px solid `--border-subtle`, `border-radius: var(--radius-lg)`.
- **Shadow**: None or `--shadow-sm`.
- **Padding**: Variable, generally `--space-4` or `--space-6`.

### Badges
- **Base**: `--bg-surface-hover`, text secondary, `border-radius: var(--radius-sm)`.
- **Font**: `--font-mono`, 11px or 12px.
- **Usage**: Status indicators, technical metadata (e.g., latency, connection state).

### Tables
- **Design**: Dense layout. No vertical borders. Horizontal borders 1px solid `--border-subtle`.
- **Header**: Text secondary, uppercase (optional) or regular case, 12px, font medium.
- **Cells**: Font mono for numbers/metrics, sans for text. Padding: 8px 12px.

### Tabs
- **Base**: Inline list, text secondary.
- **Active state**: Text primary, bottom border 2px solid `--color-black`.
- **Hover**: Text primary (without border change).

### Dialogs & Drawers
- **Overlay**: Black background with 40% opacity (`rgba(0,0,0,0.4)`).
- **Surface**: White background, 1px solid `--border-strong`.
- **Radius**: `--radius-xl` for dialogs. Drawers have 0 radius on the attached side.
- **Shadow**: `--shadow-dialog`.

### Tooltips
- **Base**: Black background, white text. `--radius-sm`.
- **Typography**: 11px/12px sans.
- **Delay**: 200ms before showing.

### Progress Indicators
- **Linear Progress**: 2px or 4px track (`--color-gray-200`), filled with `--color-black`. No gradients.
- **Spinners**: Strict 1px or 2px thick circle, black border, top border transparent. Spinning animation.

### Metric Cards
- **Layout**: Label (text secondary, 12px), large value (text primary, 24px-32px, `--font-mono`), optional delta/status text.
- **Border**: 1px solid `--border-subtle`.

### Chart Styles
- **Lines/Bars**: Strict black and grays. No colors.
- **Grids**: `--border-subtle` for axes, dotted or 1px solid.
- **Tooltips**: Standard tooltip design (inverted).

### States
- **Empty States**: Minimalist. 14px text secondary. No playful illustrations. Simple, dashed border card.
- **Loading States**: Ghost text loading (skeletons using `--color-gray-100` and `--color-gray-200` shimmer) or simple monospace text (e.g., `[LOADING...]`).
- **Error States**: Only use a very dark gray or black background with white text, or standard layout with an error icon. (Avoid standard red unless absolutely strictly required for destructive actions).
