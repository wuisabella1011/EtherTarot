export default function CardBack() {
  return (
    <div
      style={{
        position: 'absolute', inset: 0, borderRadius: 12,
        backfaceVisibility: 'hidden',
        background: `linear-gradient(135deg, #1a1416 0%, #2a1f24 50%, #1a1416 100%)`,
        border: '2px solid rgba(201,168,76,0.3)',
        boxShadow: '0 0 20px rgba(201,168,76,0.25), inset 0 0 60px rgba(201,168,76,0.03)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Diamond grid background */}
      <div style={{
        position: 'absolute', inset: 10,
        border: '1px solid rgba(201,168,76,0.1)', borderRadius: 6,
        background: `
          repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(201,168,76,0.02) 4px, rgba(201,168,76,0.02) 5px),
          repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(201,168,76,0.02) 4px, rgba(201,168,76,0.02) 5px)`,
      }} />
      {/* Inner ring */}
      <div style={{
        position: 'absolute', width: '55%', height: '55%',
        border: '2px solid rgba(201,168,76,0.08)', borderRadius: 4,
      }} />
      {/* SVG mandala */}
      <svg width="50" height="65" viewBox="0 0 50 65" style={{ position: 'relative', zIndex: 1, opacity: 0.25 }}>
        <rect x="6" y="5" width="38" height="55" rx="3" fill="none" stroke="rgba(201,168,76,1)" strokeWidth="0.4" />
        <rect x="12" y="11" width="26" height="43" rx="2" fill="none" stroke="rgba(201,168,76,0.8)" strokeWidth="0.3" />
        <polygon points="25,16 28,23 35,23 30,27 32,34 25,30 18,34 20,27 15,23 22,23"
          fill="none" stroke="rgba(201,168,76,0.9)" strokeWidth="0.5" />
        <circle cx="18" cy="18" r="1.5" fill="none" stroke="rgba(201,168,76,0.7)" strokeWidth="0.3" />
        <circle cx="32" cy="18" r="1.5" fill="none" stroke="rgba(201,168,76,0.7)" strokeWidth="0.3" />
        <circle cx="18" cy="47" r="1.5" fill="none" stroke="rgba(201,168,76,0.7)" strokeWidth="0.3" />
        <circle cx="32" cy="47" r="1.5" fill="none" stroke="rgba(201,168,76,0.7)" strokeWidth="0.3" />
        <path d="M18,14 L25,11 L32,14" fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="0.3" />
        <path d="M18,51 L25,54 L32,51" fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="0.3" />
        <text x="25" y="40" textAnchor="middle" fill="rgba(201,168,76,0.6)"
          fontSize="4" fontFamily="serif" letterSpacing="2">✧</text>
      </svg>
      {/* Bottom filigree */}
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        width: 30, height: 6,
        background: 'radial-gradient(ellipse at 50% 100%, rgba(201,168,76,0.1), transparent)',
        borderRadius: '50%',
      }} />
    </div>
  );
}
