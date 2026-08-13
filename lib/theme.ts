/**
 * Single source of truth for colour.
 *
 * The site is built almost entirely with inline styles, so a CSS-variable-only
 * palette would not reach most of it. These constants mirror the custom
 * properties in globals.css one-for-one — change a value here and in the
 * `:root` block together.
 *
 * Palette: warm graph paper, heavy black type, single orange accent.
 */
export const T = {
  /* Surfaces */
  paper: '#f4f3ef',      // page background
  paperAlt: '#eceae4',   // recessed bands
  card: '#ffffff',       // raised cards, browser chrome
  grid: '#e0ded6',       // graph-paper rule
  gridStrong: '#d2cfc4', // major rule every 5th line

  /* Ink */
  ink: '#16150f',        // headlines, heavy type
  body: '#4b4941',       // paragraphs
  muted: '#8d8a7e',      // captions, meta
  faint: '#b6b3a7',      // hairline labels, ghost numerals

  /* Accent */
  accent: '#e2701f',     // orange — links, active state, one-per-view
  accentSoft: '#fbe9d8', // accent tint fill
  accentInk: '#a44e10',  // accent text on tint

  /* Support — kept for per-project identity chips */
  blue: '#2f6fd0',
  violet: '#7a5bd6',
  green: '#2f8f5b',
  pink: '#c9356b',

  /* Lines */
  line: 'rgba(22,21,15,0.12)',
  lineSoft: 'rgba(22,21,15,0.07)',
  shadow: 'rgba(22,21,15,0.14)',
} as const

/** `rgba()` from any of the ink tones, for one-off translucency. */
export const inkA = (a: number) => `rgba(22,21,15,${a})`
export const paperA = (a: number) => `rgba(244,243,239,${a})`
