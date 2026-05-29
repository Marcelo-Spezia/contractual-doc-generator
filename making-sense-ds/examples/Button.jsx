// Button.jsx — Making Sense DS
// Usage: import tokens.css once at app root, then use this component.

// Variants: 'gradient' | 'primary' | 'ghost' | 'link'
// Size:     'sm' | 'md' (default) | 'lg'
// Rules:
//   - Always pill radius (999px)
//   - Gradient variant: dark-blue text (#102532), weight 800
//   - No icons or arrows inside the button — text only

const buttonStyles = {
  base: {
    fontFamily: '"Red Hat Display", ui-sans-serif, sans-serif',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    borderRadius: 999,
    border: '1.5px solid transparent',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'box-shadow 200ms, transform 200ms',
    whiteSpace: 'nowrap',
  },
  sizes: {
    sm: { fontSize: 11, fontWeight: 700, padding: '10px 18px' },
    md: { fontSize: 12, fontWeight: 800, padding: '14px 26px' },
    lg: { fontSize: 13, fontWeight: 800, padding: '17px 32px' },
  },
  variants: {
    gradient: {
      background: 'linear-gradient(90deg, #0ECC7E 0%, #00C6D1 100%)',
      color: '#102532', // always dark-blue, never white
    },
    primary: {
      background: '#102532',
      color: '#ffffff',
      fontWeight: 700,
    },
    ghost: {
      background: 'transparent',
      borderColor: '#E0E0E0',
      color: '#102532',
      fontWeight: 700,
    },
    link: {
      background: 'transparent',
      border: 'none',
      color: '#00A8B2',
      fontWeight: 600,
      borderRadius: 0,
      padding: '10px 0',
      textDecoration: 'none',
    },
  },
};

function MSButton({ variant = 'gradient', size = 'md', children, onClick, style = {} }) {
  const [hover, setHover] = React.useState(false);
  const combined = {
    ...buttonStyles.base,
    ...buttonStyles.sizes[size],
    ...buttonStyles.variants[variant],
    ...(hover && variant !== 'link' ? {
      boxShadow: '0 8px 20px rgba(0,0,0,0.10)',
      transform: 'translateY(-1px)',
    } : {}),
    ...style,
  };
  return (
    <button
      style={combined}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  );
}

// Export for use in other files
if (typeof window !== 'undefined') window.MSButton = MSButton;
export default MSButton;
