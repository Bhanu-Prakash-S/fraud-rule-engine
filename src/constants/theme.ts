export const COLORS = {
  primary:    '#1E3A5F',
  background: '#F4F6F9',
  surface:    '#FFFFFF',
  accent:     '#2563EB',
  success:    '#16A34A',
  warning:    '#D97706',
  danger:     '#DC2626',
  text:       '#111827',
  muted:      '#6B7280',
  border:     '#E5E7EB',
} as const;

export const SEVERITY_COLORS = {
  Critical: { bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' },
  High:     { bg: '#FFEDD5', text: '#9A3412', dot: '#EA580C' },
  Medium:   { bg: '#FEF3C7', text: '#92400E', dot: '#D97706' },
  Low:      { bg: '#DBEAFE', text: '#1E40AF', dot: '#2563EB' },
} as const;

export const FONTS = {
  ui:   "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'Fira Mono', monospace",
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const CHANNEL_COLORS: Record<string, { bg: string; text: string }> = {
  'UPI':              { bg: '#EFF6FF', text: '#1E40AF' },
  'IMPS':             { bg: '#F0FDF4', text: '#14532D' },
  'NEFT':             { bg: '#F5F3FF', text: '#3730A3' },
  'Cards':            { bg: '#FFF7ED', text: '#7C2D12' },
  'Internet Banking': { bg: '#FDF2F8', text: '#701A75' },
  'Mobile Banking':   { bg: '#ECFDF5', text: '#064E3B' },
};

export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Crypto Exchange': { bg: '#FEF3C7', text: '#78350F' },
  'Gaming':          { bg: '#FEE2E2', text: '#7F1D1D' },
  'E-Commerce':      { bg: '#F0F9FF', text: '#0C4A6E' },
  'Utility':         { bg: '#F0FDF4', text: '#14532D' },
  'P2P':             { bg: '#F3F4F6', text: '#374151' },
};

export const THEME = {
  colors:         COLORS,
  severity:       SEVERITY_COLORS,
  fonts:          FONTS,
  spacing:        SPACING,
  channelColors:  CHANNEL_COLORS,
  categoryColors: CATEGORY_COLORS,
} as const;
