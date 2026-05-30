---
name: Forest Intelligence
colors:
  surface: '#fbf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#fbf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f0'
  surface-container: '#efeeeb'
  surface-container-high: '#eae8e5'
  surface-container-highest: '#e4e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#404942'
  inverse-surface: '#30312f'
  inverse-on-surface: '#f2f0ed'
  outline: '#707971'
  outline-variant: '#bfc9bf'
  surface-tint: '#286a45'
  primary: '#004526'
  on-primary: '#ffffff'
  primary-container: '#1a5e3a'
  on-primary-container: '#92d5a8'
  inverse-primary: '#92d5a8'
  secondary: '#795900'
  on-secondary: '#ffffff'
  secondary-container: '#fece65'
  on-secondary-container: '#755700'
  tertiary: '#2b3d4f'
  on-tertiary: '#ffffff'
  tertiary-container: '#425467'
  on-tertiary-container: '#b5c8de'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#adf2c3'
  primary-fixed-dim: '#92d5a8'
  on-primary-fixed: '#00210f'
  on-primary-fixed-variant: '#07522f'
  secondary-fixed: '#ffdf9f'
  secondary-fixed-dim: '#eec058'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5b4300'
  tertiary-fixed: '#d1e4fb'
  tertiary-fixed-dim: '#b5c8df'
  on-tertiary-fixed: '#091d2e'
  on-tertiary-fixed-variant: '#36485b'
  background: '#fbf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2df'
  whatsapp-vibrant: '#25D366'
  surface-muted: '#f0ede8'
  success-deep: '#144a2d'
  alert-warning: '#d4a843'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  container-max: 1280px
---

## Brand & Style

The design system is anchored in the concept of "Intelligent Efficiency"—a bridge between high-touch human communication and high-tech AI automation. The visual identity reflects a premium, enterprise-ready platform that prioritizes reliability and trust while remaining approachable for business owners.

The style is **Corporate / Modern** with a sophisticated color palette. It leans heavily on generous whitespace to reduce cognitive load, clean sans-serif typography for maximum legibility, and soft UI elements that evoke a sense of calm and precision. The aesthetic avoids the typical "neon-tech" look of AI, opting instead for a grounded, organic professional feel that suggests stability and growth.

## Colors

The palette is dominated by **Forest Green**, representing growth, security, and the professional nature of business communication. This is used for primary actions, navigation markers, and brand-heavy components. **Gold** serves as a sophisticated accent color, reserved for highlights, premium features, and subtle "attention" states without the urgency of red.

The primary background is a **Warm Off-white**, which reduces eye strain compared to pure white and gives the interface a tactile, paper-like quality. Neutral grays are derived with a slight warmth to ensure they harmonize with the primary and background colors.

## Typography

This design system utilizes **Inter** exclusively to leverage its exceptional readability and neutral, systematic tone. The type scale is built on a modular rhythm to ensure hierarchy is immediate and clear.

- **Headlines:** Use tighter letter spacing and heavier weights to anchor pages. 
- **Body:** Set with standard weighting and generous line heights to ensure long-form message logs and data tables remain legible.
- **Labels:** Used for small UI elements like badges and table headers, often utilizing a medium or semi-bold weight to maintain visual importance at small sizes.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for dashboard content, centered within a fluid viewport. A strict **8px base unit** governs all spacing, ensuring a consistent vertical and horizontal rhythm.

- **Desktop (1440px+):** 12-column grid with 24px gutters and 48px margins.
- **Tablet (768px - 1024px):** 8-column grid with 24px gutters and 32px margins.
- **Mobile (below 768px):** 4-column grid with 16px gutters and 16px margins.

Padding within components (like cards and modals) should scale proportionally, using 16px (2 units) for small components and 24px-32px (3-4 units) for primary containers.

## Elevation & Depth

Hierarchy in this design system is established through **Tonal Layers** and **Ambient Shadows**. Instead of harsh borders, surfaces are separated by subtle shifts in background color and very soft, diffused shadows.

- **Level 0 (Base):** The Warm Off-white background (#faf8f5).
- **Level 1 (Cards/Containers):** Pure white surfaces with a "Soft Ambient" shadow (0px 4px 20px rgba(26, 94, 58, 0.04)).
- **Level 2 (Popovers/Dropdowns):** Pure white surfaces with a "Floating" shadow (0px 8px 30px rgba(0, 0, 0, 0.08)).

Shadows should always be tinted slightly with the Primary Forest Green or a neutral umber to maintain the "warm" feel of the system and avoid the "dead gray" look of default shadows.

## Shapes

The shape language is defined by **Soft Roundedness**, conveying an approachable and modern persona. 

- **Small Components (Buttons, Inputs, Toggles):** 8px (0.5rem) radius.
- **Medium Components (Cards, Modals, Tabs):** 12px (0.75rem) radius.
- **Large Components (Sections, Hero Containers):** 16px (1rem) radius.

Full pill-shapes are reserved specifically for **Badges** and **Avatars** to provide a distinct visual contrast against the more structured rectangular elements of the dashboard.

## Components

### Buttons
Primary buttons use a solid Forest Green fill with white text. Secondary buttons use a Forest Green outline or a tonal background (Success-muted). Accent buttons for "Premium" calls-to-action use the Gold palette.

### Badges & Chips
Badges use a pill-shaped geometry. Status badges use low-saturation background tints (e.g., a very light green background for "Active" with dark green text).

### Toggles
Toggles should feel tactile. The "Off" state is a warm neutral, while the "On" state is Forest Green. The switch handle should have a subtle shadow to imply it sits above the track.

### Tabs
Tabs are presented in a "Segmented" style (contained within a background track) for settings, or "Underlined" (minimalist) for primary navigation transitions.

### Tables
Tables are the workhorse of the AI platform. They feature "Ghost Borders" (1px lines in Surface-muted) and no vertical borders. Headers use the `label-md` style for clear categorization. Row hovering should trigger a subtle shift to a slightly darker off-white to indicate interactivity.

### Avatars
Circular avatars for users/bots, with a 2px border in the Primary color when an AI bot is "Active" or "Typing."