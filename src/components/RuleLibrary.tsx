import React, { useState } from 'react';
import { Rule } from '../types/rule';
import { COLORS, FONTS, SEVERITY_COLORS } from '../constants/theme';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} IST`;
}

interface RuleLibraryProps {
  rules: Rule[];
  onEdit:   (rule: Rule) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export const RuleLibrary: React.FC<RuleLibraryProps> = ({ rules, onEdit, onDelete, onToggle }) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (rules.length === 0) {
    return (
      <div style={{
        border: `1px dashed ${COLORS.border}`, borderRadius: 6, padding: '32px 16px',
        textAlign: 'center', color: COLORS.muted, fontSize: 13,
      }}>
        No rules saved yet. Build and save your first rule.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rules.map(rule => {
        const sc       = SEVERITY_COLORS[rule.severity];
        const isDelConf = confirmDelete === rule.id;

        return (
          <div key={rule.id} style={{
            background: COLORS.surface,
            border: `1px solid ${rule.isActive ? COLORS.border : '#E5E7EB'}`,
            borderLeft: `3px solid ${rule.isActive ? sc.dot : COLORS.border}`,
            borderRadius: 5,
            padding: '11px 14px',
            opacity: rule.isActive ? 1 : 0.62,
            transition: 'opacity 0.15s',
          }}>

            {/* ── Top row ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted, flexShrink: 0,
                  }}>
                    {rule.id}
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.text, lineHeight: 1.3 }}>
                    {rule.name}
                  </span>
                </div>

                {rule.scenario && (
                  <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                    Scenario: <span style={{ fontStyle: 'italic' }}>{rule.scenario}</span>
                  </div>
                )}
              </div>

              {/* Severity badge */}
              <span style={{
                fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 3,
                background: sc.bg, color: sc.text, flexShrink: 0,
              }}>
                {rule.severity.toUpperCase()}
              </span>
            </div>

            {/* ── Description ── */}
            {rule.description && (
              <div style={{ fontSize: 11.5, color: COLORS.muted, marginBottom: 8, lineHeight: 1.5 }}>
                {rule.description}
              </div>
            )}

            {/* ── Condition pills ── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
              {rule.conditions.map((cond, idx) => {
                const valStr = Array.isArray(cond.value)
                  ? `[${(cond.value as string[]).join(', ')}]`
                  : String(cond.value);
                return (
                  <React.Fragment key={cond.id}>
                    <span style={{
                      fontFamily: FONTS.mono, fontSize: 10.5,
                      background: '#F1F5F9', color: '#334155',
                      padding: '2px 8px', borderRadius: 3,
                      border: '1px solid #E2E8F0',
                    }}>
                      {cond.field} {cond.operator} {valStr}
                    </span>
                    {idx < rule.conditions.length - 1 && (
                      <span style={{
                        fontSize: 9.5, fontWeight: 800, color: COLORS.accent,
                        fontFamily: FONTS.mono, alignSelf: 'center', letterSpacing: '0.04em',
                      }}>
                        {cond.logicalJoin}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* ── Footer row ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderTop: `1px solid ${COLORS.border}`, paddingTop: 8 }}>

              {/* Active toggle */}
              <button onClick={() => onToggle(rule.id)} style={{
                fontSize: 10.5, fontWeight: 700,
                padding: '3px 10px', borderRadius: 3,
                border: `1px solid ${rule.isActive ? COLORS.success : COLORS.border}`,
                background: rule.isActive ? '#F0FDF4' : COLORS.surface,
                color: rule.isActive ? COLORS.success : COLORS.muted,
                cursor: 'pointer', fontFamily: FONTS.ui,
              }}>
                {rule.isActive ? '● Active' : '○ Inactive'}
              </button>

              <span style={{ fontSize: 10, color: COLORS.muted, fontFamily: FONTS.mono }}>
                {rule.conditions.length} cond{rule.conditions.length !== 1 ? 's' : ''}
              </span>

              <span style={{ fontSize: 10, color: COLORS.muted }}>
                {formatDate(rule.createdAt)}
              </span>

              <div style={{ flex: 1 }} />

              {/* Edit */}
              <button onClick={() => { onEdit(rule); setConfirmDelete(null); }} style={{
                fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 3,
                border: `1px solid ${COLORS.border}`, background: COLORS.surface,
                color: COLORS.accent, cursor: 'pointer', fontFamily: FONTS.ui,
              }}>
                ✎ Edit
              </button>

              {/* Delete */}
              {isDelConf ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, color: COLORS.danger }}>Delete?</span>
                  <button onClick={() => { onDelete(rule.id); setConfirmDelete(null); }} style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 3,
                    border: `1px solid ${COLORS.danger}`, background: '#FEE2E2',
                    color: COLORS.danger, cursor: 'pointer', fontFamily: FONTS.ui,
                  }}>
                    Yes
                  </button>
                  <button onClick={() => setConfirmDelete(null)} style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 3,
                    border: `1px solid ${COLORS.border}`, background: COLORS.surface,
                    color: COLORS.muted, cursor: 'pointer', fontFamily: FONTS.ui,
                  }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(rule.id)} style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 3,
                  border: `1px solid ${COLORS.border}`, background: COLORS.surface,
                  color: COLORS.danger, cursor: 'pointer', fontFamily: FONTS.ui,
                }}>
                  ✕ Delete
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
