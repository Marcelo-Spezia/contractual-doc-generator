# Making Sense Design System — Claude Context

You are working on a project that uses the **Making Sense design system**. Read and apply all rules below before generating any UI, copy, or code.

---

## Brand identity

Making Sense is an AI-driven technology consultancy. Voice: strategic, pragmatic, outcome-first. Plain U.S. English. We/our for the company, you/your for the client.

---

## Colors

| Name | Hex | Use |
|---|---|---|
| Making-green | `#0ECC7E` | Primary — gradient start, eyebrows, success |
| Sense-blue | `#00C6D1` | Primary — gradient end, info, focus rings |
| Dark-blue | `#102532` | Primary — all body text, dark sections |
| Purple | `#9273F4` | Secondary — use sparingly |
| Red | `#FF5551` | Secondary — use sparingly |
| Orange | `#FFA143` | Secondary — use sparingly |

**Signature gradient:** `linear-gradient(90deg, #0ECC7E 0%, #00C6D1 100%)`
- Used on: logo mark, icon strokes, CTA buttons, stat numerals, accent rules.
- Never use as a full-bleed background wallpaper.

Grey scale: white `#FFFFFF` → grey-50 `#F9F9F9` → … → grey-900 `#212121` → black `#000000`.

---

## Typography

- **Font:** Red Hat Display — the only font family. Weights 300–900.
- **Heading case:** Sentence case always (*"Let's build something great"*, never Title Case).
- **Eyebrows:** Making-green `#0ECC7E`, uppercase, `letter-spacing: 0.12em`, weight 700.
- **Display/H1:** weight 900/800, letter-spacing `-0.02em`.

---

## Buttons

- Border-radius: **always `999px` (pill)**. No exceptions.
- **Gradient button:** background = `--ms-gradient`, text color = `#102532` (dark-blue), font-weight = **800**.
- **Primary dark button:** background = `#102532`, text color = white, font-weight = 700.
- **Ghost button:** transparent, 1.5px border `#E0E0E0`, text `#102532`.
- **Text only** — never add icons, arrows (→), or symbols inside a button.

---

## SVG assets

Logos: `assets/logo/`
- `MakingSense-Logotype.svg` — original, for light backgrounds
- `MakingSense-Logotype-White.svg` — for dark backgrounds
- `MakingSense-Logotype-Grey.svg` — for mid-tone backgrounds

Icons: `assets/icons/svg/` — 107 SVG icons with gradient strokes.

**Scaling rule:** SVGs can be scaled to any size — always proportionally. Never distort. Use `width` + `height: auto` in CSS, or `object-fit: contain` in HTML.

---

## Shadows

Neutral grey only. Never tinted or colored.
- `--shadow-sm: 0 2px 6px rgba(0,0,0,0.08)` — default card
- `--shadow-md: 0 8px 20px rgba(0,0,0,0.10)` — hover / popover
- `--shadow-lg: 0 20px 40px rgba(0,0,0,0.14)` — modal

---

## Spacing & radii

4px base grid. Common values: 8, 12, 16, 24, 32, 48, 64, 80, 96px.
Radii: `4px` inputs · `10px` cards · `16–24px` large cards · `999px` buttons/pills.

---

## Content rules

- No emoji. Use brand SVG icons.
- No arrows or symbols in buttons.
- Sentence case on all headings and UI labels.
- Active voice, short sentences, outcome-first.
- Contractions are fine (we're, you'll).
- Oxford comma. Em-dashes for asides.

---

## CSS tokens

Import `tokens.css` once at the root. Use semantic tokens (`--fg-1`, `--bg-dark`, `--ms-gradient`) over raw palette values (`--ms-green`). Full token reference in `tokens.json`.
