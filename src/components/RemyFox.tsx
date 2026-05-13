export default function RemyFox({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Remy the Fox"
      role="img"
    >
      {/* Fox body */}
      <ellipse cx="60" cy="80" rx="35" ry="28" fill="#FF6B35" />
      {/* Fox head */}
      <circle cx="60" cy="52" r="26" fill="#FF6B35" />
      {/* Ears */}
      <polygon points="38,32 30,10 50,28" fill="#FF6B35" />
      <polygon points="82,32 90,10 70,28" fill="#FF6B35" />
      {/* Inner ears */}
      <polygon points="40,30 34,15 50,27" fill="#FFD23F" />
      <polygon points="80,30 86,15 70,27" fill="#FFD23F" />
      {/* Muzzle */}
      <ellipse cx="60" cy="58" rx="15" ry="12" fill="#FFD23F" />
      {/* Eyes */}
      <circle cx="52" cy="48" r="4" fill="#1C1917" />
      <circle cx="68" cy="48" r="4" fill="#1C1917" />
      {/* Eye shine */}
      <circle cx="53.5" cy="46.5" r="1.5" fill="white" />
      <circle cx="69.5" cy="46.5" r="1.5" fill="white" />
      {/* Nose */}
      <ellipse cx="60" cy="57" rx="3" ry="2" fill="#1C1917" />
    </svg>
  )
}
