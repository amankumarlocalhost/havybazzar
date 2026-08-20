// Hand-drawn line-art of a tower crane + excavator for the homepage hero.
// No external image asset — matches the stroke-based style of components/ui/Icons.js,
// just at hero scale instead of icon scale.
export default function HeroMachineryArt({ className = '' }) {
  return (
    <svg
      viewBox="0 0 900 600"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      {/* Distant skyline, very faint */}
      <g fill="#ffffff" opacity="0.05">
        <rect x="560" y="260" width="34" height="260" />
        <rect x="605" y="200" width="26" height="320" />
        <rect x="860" y="230" width="30" height="290" />
        <rect x="820" y="300" width="24" height="220" />
      </g>

      {/* Ground line */}
      <line x1="0" y1="520" x2="900" y2="520" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="2" strokeDasharray="2 10" strokeLinecap="round" />

      {/* ---- Tower crane ---- */}
      <g stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Mast lattice */}
        <g opacity="0.28">
          <line x1="748" y1="500" x2="748" y2="90" strokeWidth="3" />
          <line x1="774" y1="500" x2="774" y2="90" strokeWidth="3" />
          {Array.from({ length: 10 }).map((_, i) => {
            const y = 500 - i * 42;
            return (
              <g key={i}>
                <line x1="748" y1={y} x2="774" y2={y} strokeWidth="1.5" opacity="0.7" />
                <line x1="748" y1={y} x2="774" y2={y - 42} strokeWidth="1.5" opacity="0.5" />
              </g>
            );
          })}
        </g>

        {/* Base */}
        <rect x="722" y="500" width="80" height="18" rx="3" strokeWidth="2.5" opacity="0.3" />

        {/* Operator cab */}
        <rect x="738" y="66" width="46" height="24" rx="3" strokeWidth="2.5" opacity="0.35" />

        {/* Jib + counter-jib */}
        <line x1="748" y1="60" x2="360" y2="60" strokeWidth="4" opacity="0.32" />
        <line x1="774" y1="60" x2="860" y2="60" strokeWidth="4" opacity="0.32" />
        <rect x="845" y="50" width="26" height="24" rx="2" strokeWidth="2" opacity="0.3" fill="#ffffff" fillOpacity="0.06" />

        {/* Apex + support cables */}
        <line x1="761" y1="18" x2="761" y2="60" strokeWidth="2.5" opacity="0.3" />
        <line x1="761" y1="18" x2="360" y2="60" strokeWidth="1.5" opacity="0.22" />
        <line x1="761" y1="18" x2="860" y2="60" strokeWidth="1.5" opacity="0.22" />

        {/* Trolley + hook + suspended load */}
        <line x1="470" y1="60" x2="470" y2="150" strokeWidth="1.5" opacity="0.3" />
        <rect x="448" y="150" width="44" height="32" rx="2" strokeWidth="2.5" opacity="0.32" fill="#ffffff" fillOpacity="0.05" />
      </g>

      {/* ---- Excavator ---- */}
      <g stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Tracks */}
        <rect x="150" y="494" width="200" height="28" rx="14" strokeWidth="2.5" opacity="0.3" fill="#ffffff" fillOpacity="0.05" />
        <circle cx="180" cy="508" r="8" strokeWidth="1.5" opacity="0.25" />
        <circle cx="220" cy="508" r="8" strokeWidth="1.5" opacity="0.25" />
        <circle cx="260" cy="508" r="8" strokeWidth="1.5" opacity="0.25" />
        <circle cx="300" cy="508" r="8" strokeWidth="1.5" opacity="0.25" />

        {/* House / body */}
        <rect x="180" y="414" width="140" height="88" rx="10" strokeWidth="2.5" opacity="0.32" fill="#ffffff" fillOpacity="0.05" />
        {/* Cab window */}
        <rect x="196" y="430" width="58" height="46" rx="6" strokeWidth="2" opacity="0.3" />

        {/* Boom */}
        <line x1="292" y1="428" x2="420" y2="330" strokeWidth="11" opacity="0.3" />
        {/* Stick */}
        <line x1="420" y1="330" x2="500" y2="412" strokeWidth="9" opacity="0.3" />
        {/* Hydraulic cylinders (thin, offset) */}
        <line x1="300" y1="452" x2="392" y2="368" strokeWidth="2" opacity="0.2" />
        <line x1="430" y1="358" x2="472" y2="404" strokeWidth="2" opacity="0.2" />
        {/* Bucket */}
        <path d="M490,404 L524,398 L530,428 L498,440 Z" strokeWidth="2.5" opacity="0.32" fill="#ffffff" fillOpacity="0.06" />
        <line x1="500" y1="440" x2="496" y2="452" strokeWidth="2" opacity="0.3" />
        <line x1="511" y1="437" x2="508" y2="450" strokeWidth="2" opacity="0.3" />
        <line x1="522" y1="433" x2="520" y2="447" strokeWidth="2" opacity="0.3" />
      </g>

      {/* Site cone, small accent detail */}
      <g stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.22">
        <path d="M600,520 L612,472 L624,520 Z" strokeWidth="2" />
        <line x1="602" y1="504" x2="622" y2="504" strokeWidth="2" />
        <line x1="596" y1="520" x2="628" y2="520" strokeWidth="2.5" />
      </g>
    </svg>
  );
}
