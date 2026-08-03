const paths = {
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>, close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>, arrow: <path d="m9 18 6-6-6-6"/>, check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
  phone: <path d="M7 3h3l1.5 4-2 1.5a15 15 0 0 0 6 6l1.5-2 4 1.5v3c0 2-1 3-3 3C10 20 4 14 4 6c0-2 1-3 3-3Z"/>,
  whatsapp: <><path d="M20 11.5a8 8 0 0 1-12 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z"/><path d="M9 8c.5 3 2 4.5 5 5"/></>, send: <><path d="m21 3-7.5 18-3-7-7-3Z"/><path d="m10.5 14 4-4"/></>,
  truck: <><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></>,
  shield: <><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6Z"/><path d="m9 12 2 2 4-4"/></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m3 17 5-4 4 3 3-2 6 4"/></>, award: <><circle cx="12" cy="9" r="5"/><path d="m8.5 13-1 8 4.5-3 4.5 3-1-8"/></>,
  meat: <><path d="M7 19c-4-2-4-7-1-11 3-4 8-6 12-3 4 3 3 8 0 11-3 3-7 5-11 3Z"/><circle cx="13" cy="10" r="3"/></>,
  chicken: <><path d="M8 17c-3-1-4-5-2-8s6-4 9-2 3 6 1 8-5 3-8 2Z"/><path d="m16 15 3 3M18 16l2-1M18 18l-1 2"/></>,
  sausage: <><path d="M6 18 18 6c1-1 3-1 4 0s1 3 0 4L10 22c-1 1-3 1-4 0s-1-3 0-4Z"/><path d="m5 19-2-1M7 22l-1 2M19 5l-1-2M22 7l2-1"/></>,
  skewer: <><path d="m4 20 16-16"/><path d="m7 14-2-2 3-3 2 2M12 9l-2-2 3-3 2 2M13 16l-2-2 3-3 2 2"/></>,
  store: <><path d="M4 10v10h16V10M3 10l2-6h14l2 6"/><path d="M3 10c1 3 4 3 5 0 1 3 4 3 5 0 1 3 4 3 5 0 1 3 3 2 3 0M9 20v-6h6v6"/></>,
  sparkle: <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5Z"/>, scale: <><path d="M12 3v18M5 6h14M8 6 4 14h8ZM20 14l-4-8-4 8Z"/><path d="M3 14c1 3 8 3 9 0M12 14c1 3 8 3 9 0"/></>, heart: <path d="M20 8c0 5-8 11-8 11S4 13 4 8c0-5 6-6 8-2 2-4 8-3 8 2Z"/>,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>, basket: <><path d="m5 10 2 10h10l2-10ZM9 10l3-6 3 6"/></>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5"/></>,
};
export function Icon({ name, className = "size-5" }) { return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.sparkle}</svg>; }
