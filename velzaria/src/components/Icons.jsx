const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const IconSearch = (p) => (
  <svg {...base} {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 21 21" />
  </svg>
);
export const IconHeart = ({ filled, ...p }) => (
  <svg {...base} {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />
  </svg>
);
export const IconBag = (p) => (
  <svg {...base} {...p}>
    <path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8Z" />
    <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
  </svg>
);
export const IconUser = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.5 20.5c1.3-3.6 4.2-5.5 7.5-5.5s6.2 1.9 7.5 5.5" />
  </svg>
);
export const IconClose = (p) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const IconMenu = (p) => (
  <svg {...base} {...p}>
    <path d="M3.5 8h17M3.5 16h11" />
  </svg>
);
export const IconArrow = (p) => (
  <svg {...base} width="22" height="12" viewBox="0 0 22 12" {...p}>
    <path d="M0 6h20M15 1l5 5-5 5" />
  </svg>
);
export const IconPlus = (p) => (
  <svg {...base} width="14" height="14" {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconMinus = (p) => (
  <svg {...base} width="14" height="14" {...p}>
    <path d="M5 12h14" />
  </svg>
);
export const IconCheck = (p) => (
  <svg {...base} {...p}>
    <path d="m5 12.5 4.2 4.2L19 7" />
  </svg>
);
export const IconInstagram = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" />
  </svg>
);
export const IconTiktok = (p) => (
  <svg {...base} {...p}>
    <path d="M14 3.5v11.2a3.8 3.8 0 1 1-3.8-3.8" />
    <path d="M14 3.5c.5 2.7 2.4 4.4 5 4.6" />
  </svg>
);
export const IconPinterest = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M10.8 8.5c2.8-.8 5 .8 4.6 3.3-.3 2-2 3.2-3.6 2.6M11.5 10.5 9.5 20" />
  </svg>
);
export const IconFacebook = (p) => (
  <svg {...base} {...p}>
    <path d="M14.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H9v3h2.5V21" />
  </svg>
);
export const IconGift = (p) => (
  <svg {...base} {...p}>
    <rect x="4" y="9" width="16" height="11" />
    <path d="M3 9h18M12 9v11M12 9c-1.5-3.5-5.5-4-5.5-1.5S12 9 12 9Zm0 0c1.5-3.5 5.5-4 5.5-1.5S12 9 12 9Z" />
  </svg>
);
export const IconRefill = (p) => (
  <svg {...base} {...p}>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4" />
  </svg>
);
export const IconPen = (p) => (
  <svg {...base} {...p}>
    <path d="M4 20l4-1 11-11-3-3L5 16Z" />
  </svg>
);
export const IconTruck = (p) => (
  <svg {...base} {...p}>
    <path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3v3.5h-7" />
    <circle cx="6.5" cy="17.5" r="1.7" />
    <circle cx="17" cy="17.5" r="1.7" />
  </svg>
);
