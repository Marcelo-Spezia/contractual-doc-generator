// Card.jsx — Making Sense DS
// Service card with icon, title, body, and optional tool tags.
// Rules:
//   - White background, radius-lg (16px), shadow-sm at rest → shadow-md on hover
//   - Lift 2px on hover
//   - SVG icons: always proportional (width only, height: auto)
//   - No colored left-border accent (anti-pattern)

const cardStyles = {
  card: {
    background: '#ffffff',
    border: '1px solid #E0E0E0',
    borderRadius: 16,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    transition: 'box-shadow 200ms, transform 200ms',
    cursor: 'pointer',
  },
  cardHover: {
    boxShadow: '0 8px 20px rgba(0,0,0,0.10)',
    transform: 'translateY(-2px)',
  },
  icon: {
    width: 48,
    height: 'auto',      // always auto — never set both to force a ratio
    marginBottom: 16,
    objectFit: 'contain',
  },
  title: {
    fontFamily: '"Red Hat Display", ui-sans-serif, sans-serif',
    fontSize: 17,
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
    color: '#102532',
    margin: '0 0 8px',
  },
  body: {
    fontFamily: '"Red Hat Display", ui-sans-serif, sans-serif',
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.55,
    color: '#757575',
    margin: '0 0 16px',
  },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  tag: {
    fontFamily: '"Red Hat Display", ui-sans-serif, sans-serif',
    fontSize: 11,
    fontWeight: 600,
    padding: '5px 10px',
    borderRadius: 999,
    border: '1px solid #E0E0E0',
    color: '#757575',
  },
};

function MSCard({ icon, title, body, tags = [] }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      style={{ ...cardStyles.card, ...(hover ? cardStyles.cardHover : {}) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {icon && <img src={icon} alt="" style={cardStyles.icon} />}
      <h4 style={cardStyles.title}>{title}</h4>
      {body && <p style={cardStyles.body}>{body}</p>}
      {tags.length > 0 && (
        <div style={cardStyles.tagRow}>
          {tags.map(t => <span key={t} style={cardStyles.tag}>{t}</span>)}
        </div>
      )}
    </div>
  );
}

if (typeof window !== 'undefined') window.MSCard = MSCard;
export default MSCard;
