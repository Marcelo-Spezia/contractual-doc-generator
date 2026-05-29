# Making Sense Design System — Developer Handoff

## Instalación

Copiá la carpeta `making-sense-ds/` a la raíz de tu proyecto o repo:

```
making-sense-ds/
  CLAUDE.md              ← contexto para agentes IA
  README.md              ← este archivo
  tokens.css             ← variables CSS (fuente de verdad)
  tokens.json            ← tokens en JSON para JS/TS/Tailwind
  assets/
    logo/
      MakingSense-Logotype.svg          ← original (fondo blanco)
      MakingSense-Logotype-White.svg    ← para fondos oscuros
      MakingSense-Logotype-Grey.svg     ← para fondos mid-tone
    icons/svg/                          ← 107 íconos SVG con gradiente
  fonts/                               ← Red Hat Display, todos los pesos
  examples/
    Button.html          ← ejemplos HTML listos para copiar
    Card.html
    Form.html
    Button.jsx           ← ejemplos React
    Card.jsx
```

---

## Uso rápido

### CSS (vanilla)

```html
<!-- 1. Importar tokens -->
<link rel="stylesheet" href="making-sense-ds/tokens.css">

<!-- 2. Los tokens ya están disponibles como variables CSS -->
<button style="
  background: var(--ms-gradient);
  color: var(--ms-dark);
  border-radius: 999px;
  font-family: var(--font-sans);
  font-weight: 800;
">Get started</button>
```

### React / Next.js

```jsx
// _app.tsx o layout.tsx
import 'making-sense-ds/tokens.css';

// En cualquier componente
const Button = ({ children }) => (
  <button style={{
    background: 'var(--ms-gradient)',
    color: 'var(--ms-dark)',
    borderRadius: 999,
    fontFamily: 'var(--font-sans)',
    fontWeight: 800,
    padding: '14px 28px',
    border: 'none',
    cursor: 'pointer',
  }}>
    {children}
  </button>
);
```

### Tailwind (extend config)

```js
// tailwind.config.js
const tokens = require('./making-sense-ds/tokens.json');

module.exports = {
  theme: {
    extend: {
      colors: {
        'ms-green':  tokens.color.msGreen,
        'ms-blue':   tokens.color.msBlue,
        'ms-dark':   tokens.color.msDark,
        'ms-purple': tokens.color.msSecondaryPurple,
        'ms-red':    tokens.color.msSecondaryRed,
        'ms-orange': tokens.color.msSecondaryOrange,
      },
      fontFamily: {
        sans: ['Red Hat Display', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        pill: '999px',
      },
    },
  },
};
```

---

## Reglas que todo agente y desarrollador debe respetar

### Colores
| Token | Valor | Uso |
|---|---|---|
| `--ms-green` | `#0ECC7E` | Making-green — primario |
| `--ms-blue` | `#00C6D1` | Sense-blue — primario |
| `--ms-dark` | `#102532` | Dark-blue — texto principal |
| `--ms-gradient` | green → blue | Logo, íconos, botones CTA, números destacados |
| `--ms-purple` | `#9273F4` | Secundario — uso moderado |
| `--ms-red` | `#FF5551` | Secundario — uso moderado |
| `--ms-orange` | `#FFA143` | Secundario — uso moderado |

### Botones
- Radio **siempre `999px`** (pill). Sin excepción.
- Botón con gradiente → texto `--ms-dark` (`#102532`), peso **800 (ExtraBold)**.
- Botón primario oscuro → texto blanco, peso **700**.
- **Sin íconos ni flechas** dentro del botón. Solo texto.

### Tipografía
- Familia única: **Red Hat Display** (pesos 300–900).
- Títulos en **sentence case** (*"Let's build something great"*, no *"Let's Build Something Great"*).
- Eyebrows (labels sobre secciones): `--ms-green`, uppercase, `letter-spacing: 0.12em`.

### SVGs (logos e íconos)
- Escalables a cualquier tamaño — **siempre proporcionales**.
- Nunca distorsionar: usar `width` + `height: auto`, o `object-fit: contain`.
- No recolorear. El gradiente es parte de la marca.

### Sombras
- Solo grises neutras (`rgba(0,0,0,…)`). **Nunca sombras de color.**

### Voz
- Inglés americano, sentence case, primera persona plural (we/our).
- Sin emoji. Sin flechas en botones.

---

## Contexto para Claude

Para usar este design system con cualquier agente Claude, pegá el contenido de `CLAUDE.md` al inicio de tu conversación, o linkeá este repo en el proyecto de Claude Design.
