/* ─── OW Finance 2026 — Design Tokens (JavaScript) ───────────────────────
 * Use this file in React Native projects instead of colors_and_type.css.
 * All values map 1-to-1 with the CSS tokens in /colors_and_type.css.
 * 
 * Usage in RN:
 *   import { Colors, Radii, Spacing, Typography } from './tokens';
 *   const styles = StyleSheet.create({ card: { backgroundColor: Colors.surface1 } });
 * ──────────────────────────────────────────────────────────────────────── */

const OWColors = {
  // Brand
  brandPrimary:       '#1E3A8A',
  brandPrimaryHover:  '#16297A',
  brandPrimaryPress:  '#0F1E4D',
  brandPrimarySoft:   '#F1F4FB',
  brandPrimaryDark:   '#4E6FC4',  // for dark surfaces

  // Info accent (never primary CTA in Lite)
  info:               '#0EA5E9',
  infoSoft:           'rgba(14,165,233,0.15)',

  // Semantic
  income:             '#10B981',
  incomeSoft:         '#D1FAE5',
  incomeFg:           '#047857',
  incomeFgDark:       '#6EE7B7',

  expense:            '#EF4444',
  expenseSoft:        '#FEE2E2',
  expenseFg:          '#B91C1C',
  expenseFgDark:      '#FCA5A5',

  warning:            '#F59E0B',
  warningSoft:        '#FEF3C7',
  warningFg:          '#B45309',
  warningFgDark:      '#FCD34D',

  violet:             '#8B5CF6',  // AI / voice features only

  // Light surfaces
  bgCanvasLight:      '#F8FAFC',
  surface1Light:      '#FFFFFF',
  surface2Light:      '#F1F5F9',
  surface3Light:      '#E8EDF3',
  fg1Light:           '#0F172A',
  fg2Light:           '#64748B',
  fg3Light:           '#94A3B8',

  // Dark surfaces
  bgCanvasDark:       '#0F172A',
  surface1Dark:       '#131B2E',
  surface2Dark:       '#1A2238',
  surface3Dark:       '#222A3D',
  fg1Dark:            '#E2E8F0',
  fg2Dark:            '#94A3B8',
  fg3Dark:            '#64748B',

  // Always
  onBrand:            '#FFFFFF',
};

const OWRadii = {
  xs:   8,
  sm:   12,
  md:   16,
  lg:   20,   // default card
  xl:   28,   // hero card
  pill: 999,
};

const OWSpacing = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
  s7: 32,
  s8: 40,
  s9: 48,
  s10: 64,
};

const OWTypography = {
  // RN: fontFamily must match asset loaded in app.json / Info.plist
  familyDisplay: 'Satoshi-Bold',
  familyBody:    'DMSans-Regular',
  familyMoney:   'Satoshi-Bold',

  heroAmount: { fontSize: 52, fontWeight: '700', letterSpacing: -1.04 },
  amountLg:   { fontSize: 28, fontWeight: '600', letterSpacing: -0.28 },
  amountMd:   { fontSize: 18, fontWeight: '600' },
  amountSm:   { fontSize: 15, fontWeight: '500' },
  h1:         { fontSize: 32, fontWeight: '700', letterSpacing: -0.48 },
  h2:         { fontSize: 22, fontWeight: '600', letterSpacing: -0.22 },
  h3:         { fontSize: 17, fontWeight: '600' },
  body:       { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodySm:     { fontSize: 13, fontWeight: '400', lineHeight: 19 },
  label:      { fontSize: 13, fontWeight: '500' },
  eyebrow:    { fontSize: 11, fontWeight: '600', letterSpacing: 0.88, textTransform: 'uppercase' },
  // Tabular nums in RN: fontVariant: ['tabular-nums']
};

const OWShadows = {
  // RN uses elevation (Android) or shadow* props (iOS)
  card: {
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  float: {
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 8,
  },
  popover: {
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18, shadowRadius: 32, elevation: 16,
  },
};

// Expose for web demo (window) — in RN, use ES module exports instead
if (typeof window !== 'undefined') {
  Object.assign(window, { OWColors, OWRadii, OWSpacing, OWTypography, OWShadows });
}
