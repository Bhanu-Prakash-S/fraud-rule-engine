// ── Audit Log ─────────────────────────────────────────────────────────────────

import { COLORS, FONTS } from "../constants/theme";
import { AuditEntry } from "../engine/ruleEngine";

const ACTION_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  CREATE:           { bg: '#F0FDF4', text: '#14532D', label: 'CREATE'  },
  UPDATE:           { bg: '#EFF6FF', text: '#1E3A8A', label: 'UPDATE'  },
  DELETE:           { bg: '#FEE2E2', text: '#7F1D1D', label: 'DELETE'  },
  TOGGLE_ACTIVE:    { bg: '#F0FDF4', text: '#14532D', label: 'ACTIVATE' },
  TOGGLE_INACTIVE:  { bg: '#FEF9C3', text: '#713F12', label: 'SUSPEND'  },
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} IST`;
}


export const AuditLog: React.FC<{ entries: AuditEntry[] }> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: COLORS.muted, fontSize: 12, fontStyle: 'italic' }}>
        No rule changes recorded this session. Create, edit, delete or toggle a rule to generate audit entries.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {entries.map((e, i) => {
        const ac = ACTION_COLORS[e.action] ?? { bg: '#F3F4F6', text: '#374151', label: e.action };
        return (
          <div key={e.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, padding: '9px 14px',
            background: i % 2 === 0 ? COLORS.surface : '#FAFAFA',
            borderBottom: `1px solid ${COLORS.border}`,
          }}>
            {/* Timestamp */}
            <span style={{ fontFamily: FONTS.mono, fontSize: 10.5, color: COLORS.muted, whiteSpace: 'nowrap', minWidth: 160, paddingTop: 1 }}>
              {fmtDate(e.timestamp)}
            </span>
            {/* Action badge */}
            <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 3, background: ac.bg, color: ac.text, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {ac.label}
            </span>
            {/* Rule reference */}
            <span style={{ fontFamily: FONTS.mono, fontSize: 10.5, color: COLORS.accent, whiteSpace: 'nowrap' }}>{e.ruleId}</span>
            {/* Rule name */}
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, flexShrink: 0 }}>{e.ruleName}</span>
            {/* Detail */}
            <span style={{ fontSize: 11.5, color: COLORS.muted, flex: 1 }}>{e.detail}</span>
            {/* Analyst */}
            <span style={{ fontSize: 10.5, color: COLORS.muted, whiteSpace: 'nowrap' }}>{e.analyst}</span>
            {/* Audit ID */}
            <span style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.border, whiteSpace: 'nowrap' }}>{e.id}</span>
          </div>
        );
      })}
    </div>
  );
};
