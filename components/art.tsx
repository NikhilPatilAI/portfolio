/** White watermark illustrations that sit in the corner of project and tool cards. Decorative only. */
const art: Record<string, React.ReactNode> = {
  'legal-bot': (
    <g fill="#FFFFFF">
      <rect x="44" y="26" width="104" height="132" rx="14" />
      <rect x="30" y="44" width="104" height="132" rx="14" opacity="0.7" />
      <circle cx="150" cy="150" r="34" />
    </g>
  ),
  'agentic-rag': (
    <>
      <g fill="#FFFFFF">
        <circle cx="100" cy="100" r="26" />
        <circle cx="40" cy="52" r="14" />
        <circle cx="158" cy="44" r="16" />
        <circle cx="168" cy="132" r="13" />
        <circle cx="52" cy="152" r="16" />
      </g>
      <g stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round">
        <path d="M100 100L40 52" />
        <path d="M100 100L158 44" />
        <path d="M100 100L168 132" />
        <path d="M100 100L52 152" />
      </g>
    </>
  ),
  'gemma-shorts': (
    <g fill="none" stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round">
      <path d="M14 58c30-26 62 26 92 0s62 26 92 0" />
      <path d="M14 104c30-26 62 26 92 0s62 26 92 0" opacity="0.7" />
      <path d="M14 150c30-26 62 26 92 0s62 26 92 0" />
    </g>
  ),
  'grphte-ai': (
    <g fill="#FFFFFF">
      <rect x="28" y="28" width="66" height="66" rx="16" />
      <rect x="106" y="28" width="66" height="66" rx="16" opacity="0.6" />
      <rect x="28" y="106" width="66" height="66" rx="16" opacity="0.6" />
      <rect x="106" y="106" width="66" height="66" rx="16" />
    </g>
  ),
  llm: (
    <g fill="#FFFFFF">
      <path d="M34 30h104a22 22 0 0 1 22 22v44a22 22 0 0 1-22 22H86l-34 28v-28H34a22 22 0 0 1-22-22V52a22 22 0 0 1 22-22z" />
      <path d="M120 120h46a22 22 0 0 1 22 22v24a22 22 0 0 1-22 22h-2v20l-26-20h-18a22 22 0 0 1-22-22v-24a22 22 0 0 1 22-22z" opacity="0.7" />
    </g>
  ),
  cv: (
    <>
      <g fill="none" stroke="#FFFFFF" strokeWidth="14" strokeLinecap="round">
        <path d="M24 64V24h40" />
        <path d="M136 24h40v40" />
        <path d="M176 136v40h-40" />
        <path d="M64 176H24v-40" />
      </g>
      <circle cx="100" cy="100" r="34" fill="#FFFFFF" />
    </>
  ),
  ops: (
    <g fill="#FFFFFF">
      <rect x="20" y="30" width="160" height="40" rx="14" />
      <rect x="20" y="82" width="160" height="40" rx="14" opacity="0.7" />
      <rect x="20" y="134" width="160" height="40" rx="14" opacity="0.45" />
    </g>
  ),
};

export function CardArt({ name, className = 'card-art' }: { name: string; className?: string }) {
  if (!art[name]) return null;
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      {art[name]}
    </svg>
  );
}
