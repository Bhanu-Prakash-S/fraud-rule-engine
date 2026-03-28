import React, { useState, useEffect, useCallback } from 'react';
import { Rule, RuleCondition, TransactionField, Operator, Severity, LogicalJoin } from '../types/rule';
import { COLORS, FONTS, SEVERITY_COLORS } from '../constants/theme';
import { buildSRLPreview } from '../engine/srlPreview';
import { ValueEditor } from './ValueEditor';
import { ALL_FIELDS, defaultValueForField, FIELD_META, opsForKind } from '../types/field';



function makeCondition(id: string): RuleCondition {
  return { id, field: 'amount', operator: '>', value: 0, logicalJoin: 'AND' };
}

function nanoid(): string {
  return 'c' + Math.random().toString(36).slice(2, 8);
}

// ── Shared input style ────────────────────────────────────────
const inputBase: React.CSSProperties = {
  height: 32, fontSize: 12, padding: '0 8px',
  border: `1px solid ${COLORS.border}`, borderRadius: 4,
  background: COLORS.surface, color: COLORS.text,
  fontFamily: FONTS.ui, outline: 'none',
};


// ── Props ─────────────────────────────────────────────────────
interface RuleBuilderProps {
  editingRule: Rule | null;
  allRules:    Rule[];
  onSave:      (rule: Rule) => void;
  onClearEdit: () => void;
}

const SEVERITIES: Severity[] = ['Low', 'Medium', 'High', 'Critical'];

// ── Component ─────────────────────────────────────────────────
export const RuleBuilder: React.FC<RuleBuilderProps> = ({ editingRule, allRules, onSave, onClearEdit }) => {
  const [name,          setName]          = useState('');
  const [description,   setDescription]   = useState('');
  const [scenario,      setScenario]      = useState('');
  const [severity,      setSeverity]      = useState<Severity>('Medium');
  const [conditions,    setConditions]    = useState<RuleCondition[]>([makeCondition(nanoid())]);
  const [saveFlash,     setSaveFlash]     = useState(false);
  const [conflictToast, setConflictToast] = useState<string | null>(null);

  // Populate form when editing an existing rule
  useEffect(() => {
    if (editingRule) {
      setName(editingRule.name);
      setDescription(editingRule.description);
      setScenario(editingRule.scenario);
      setSeverity(editingRule.severity);
      setConditions(editingRule.conditions.length > 0 ? editingRule.conditions : [makeCondition(nanoid())]);
    }
  }, [editingRule]);

  const resetForm = useCallback(() => {
    setName(''); setDescription(''); setScenario('');
    setSeverity('Medium');
    setConditions([makeCondition(nanoid())]);
    onClearEdit();
  }, [onClearEdit]);

  // ── Condition helpers ────────────────────────────────────────
  const updateCond = (id: string, patch: Partial<RuleCondition>): void => {
    setConditions(prev => prev.map(c => {
      if (c.id !== id) return c;
      const updated = { ...c, ...patch };
      if (patch.field && patch.field !== c.field) {
        const ops = opsForKind(FIELD_META[patch.field].kind);
        updated.operator = ops[0];
        updated.value    = defaultValueForField(patch.field, ops[0]);
      }
      if (patch.operator && patch.operator !== c.operator) {
        updated.value = defaultValueForField(updated.field, patch.operator);
      }
      return updated;
    }));
  };

  const addCond = (): void => setConditions(prev => [...prev, makeCondition(nanoid())]);

  const removeCond = (id: string): void =>
    setConditions(prev => prev.length > 1 ? prev.filter(c => c.id !== id) : prev);

  // ── Conflict detection ───────────────────────────────────────
  function serializeCondition(c: RuleCondition): string {
    const v = Array.isArray(c.value) ? [...(c.value as string[])].sort().join(',') : String(c.value);
    return `${c.field}|${c.operator}|${v}`;
  }

  function checkConflicts(thisId: string): string | null {
    const thisKeys = new Set(conditions.map(serializeCondition));
    for (const other of allRules) {
      if (other.id === thisId || !other.isActive) continue;
      const matches = other.conditions.filter(c => thisKeys.has(serializeCondition(c)));
      if (matches.length >= 2) return other.name;
    }
    return null;
  }

  // ── Save ─────────────────────────────────────────────────────
  const handleSave = (): void => {
    if (!name.trim()) return;
    const ruleId = editingRule?.id ?? `RULE-${Date.now()}`;
    const rule: Rule = {
      id:          ruleId,
      name:        name.trim(),
      description: description.trim(),
      scenario:    scenario.trim(),
      severity,
      conditions,
      createdAt:   editingRule?.createdAt ?? new Date().toISOString(),
      isActive:    editingRule?.isActive  ?? true,
    };

    // Check conflicts before saving
    const conflict = checkConflicts(ruleId);
    if (conflict) {
      setConflictToast(conflict);
      setTimeout(() => setConflictToast(null), 5000);
    }

    onSave(rule);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1600);
    if (!editingRule) resetForm();
  };

  // ── Live SRL preview ──────────────────────────────────────────
  const srlText = buildSRLPreview({ name, description, scenario, severity, conditions });

  const sevColor = SEVERITY_COLORS[severity];

  const sectionLabel: React.CSSProperties = {
    fontSize: 10.5, fontWeight: 700, color: COLORS.muted,
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Edit banner ── */}
      {editingRule && (
        <div style={{
          background: '#EFF6FF', border: `1px solid #BFDBFE`, borderRadius: 5,
          padding: '8px 12px', fontSize: 12, color: '#1E40AF',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>✎ Editing <strong>{editingRule.name}</strong> — changes will overwrite the saved rule.</span>
          <button onClick={resetForm} style={{ fontSize: 11, color: '#1E40AF', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Cancel edit
          </button>
        </div>
      )}

      {/* ── Meta fields ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div style={sectionLabel}>Rule Name *</div>
          <input style={{ ...inputBase, width: '100%', height: 34 }}
            placeholder="e.g. Late Night High Value Transfer"
            value={name} onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <div style={sectionLabel}>Scenario</div>
          <input style={{ ...inputBase, width: '100%', height: 34 }}
            placeholder="e.g. Account Takeover"
            value={scenario} onChange={e => setScenario(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start' }}>
        <div>
          <div style={sectionLabel}>Description</div>
          <input style={{ ...inputBase, width: '100%', height: 34 }}
            placeholder="Brief analyst note on this rule's intent…"
            value={description} onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div>
          <div style={sectionLabel}>Severity</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {SEVERITIES.map(s => {
              const sc = SEVERITY_COLORS[s];
              const active = severity === s;
              return (
                <button key={s} onClick={() => setSeverity(s)} style={{
                  fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 4,
                  border: `1px solid ${active ? sc.dot : COLORS.border}`,
                  background: active ? sc.bg : COLORS.surface,
                  color: active ? sc.text : COLORS.muted,
                  cursor: 'pointer', fontFamily: FONTS.ui,
                }}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Conditions ── */}
      <div>
        <div style={sectionLabel}>Conditions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {conditions.map((cond, idx) => {
            const { kind } = FIELD_META[cond.field];
            const ops = opsForKind(kind);
            const isMulti = cond.operator === 'in' || cond.operator === 'not in';
            return (
              <div key={cond.id}>
                <div style={{
                  display: 'flex', alignItems: isMulti ? 'flex-start' : 'center',
                  gap: 6, padding: '7px 10px',
                  background: idx % 2 === 0 ? COLORS.surface : '#FAFBFC',
                  border: `1px solid ${COLORS.border}`,
                  borderTop: idx === 0 ? `1px solid ${COLORS.border}` : 'none',
                  borderRadius: idx === 0 ? '5px 5px 0 0' : (idx === conditions.length - 1 ? '0 0 5px 5px' : '0'),
                }}>
                  {/* Index pill */}
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: COLORS.muted,
                    minWidth: 20, textAlign: 'right', paddingTop: isMulti ? 6 : 0, flexShrink: 0,
                  }}>
                    {idx + 1}
                  </span>

                  {/* Field */}
                  <select
                    style={{ ...inputBase, minWidth: 148, cursor: 'pointer', flexShrink: 0, marginTop: isMulti ? 0 : 0 }}
                    value={cond.field}
                    onChange={e => updateCond(cond.id, { field: e.target.value as TransactionField })}
                  >
                    {ALL_FIELDS.map(f => (
                      <option key={f} value={f}>{FIELD_META[f].label}</option>
                    ))}
                  </select>

                  {/* Operator */}
                  <select
                    style={{ ...inputBase, minWidth: 80, cursor: 'pointer', flexShrink: 0, fontFamily: FONTS.mono, fontSize: 11 }}
                    value={cond.operator}
                    onChange={e => updateCond(cond.id, { operator: e.target.value as Operator })}
                  >
                    {ops.map(op => <option key={op} value={op}>{op}</option>)}
                  </select>

                  {/* Value */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <ValueEditor
                      field={cond.field} operator={cond.operator}
                      value={cond.value}
                      onChange={v => updateCond(cond.id, { value: v })}
                    />
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => removeCond(cond.id)}
                    disabled={conditions.length === 1}
                    title="Remove condition"
                    style={{
                      width: 24, height: 24, borderRadius: 4,
                      border: `1px solid ${COLORS.border}`,
                      background: COLORS.surface, cursor: conditions.length === 1 ? 'default' : 'pointer',
                      color: conditions.length === 1 ? COLORS.border : COLORS.danger,
                      fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0, marginTop: isMulti ? 4 : 0,
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* AND / OR join pill between conditions */}
                {idx < conditions.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', background: '#F8FAFC', borderLeft: `1px solid ${COLORS.border}`, borderRight: `1px solid ${COLORS.border}` }}>
                    <div style={{ width: 1, height: 10, background: COLORS.border, marginLeft: 19 }} />
                    <div style={{ display: 'flex', gap: 1, marginLeft: 4 }}>
                      {(['AND', 'OR'] as LogicalJoin[]).map(join => (
                        <button key={join} onClick={() => updateCond(cond.id, { logicalJoin: join })} style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3,
                          border: `1px solid ${cond.logicalJoin === join ? COLORS.accent : COLORS.border}`,
                          background: cond.logicalJoin === join ? COLORS.accent : COLORS.surface,
                          color: cond.logicalJoin === join ? '#fff' : COLORS.muted,
                          cursor: 'pointer', fontFamily: FONTS.mono,
                        }}>
                          {join}
                        </button>
                      ))}
                    </div>
                    <div style={{ width: 1, height: 10, background: COLORS.border, marginLeft: 4 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={addCond} style={{
          marginTop: 8, fontSize: 12, fontWeight: 600,
          padding: '6px 14px', borderRadius: 4,
          border: `1px dashed ${COLORS.accent}`, background: '#EFF6FF',
          color: COLORS.accent, cursor: 'pointer', fontFamily: FONTS.ui,
        }}>
          ＋ Add Condition
        </button>
      </div>

      {/* ── SRL Preview ── */}
      <div>
        <div style={{ ...sectionLabel, marginBottom: 4 }}>
          SRL Preview —{' '}
          <span style={{ color: COLORS.muted, fontWeight: 400, fontSize: 10, textTransform: 'none', letterSpacing: 0 }}>
            Scenario Rule Language (as used in Falcon/EFRM)
          </span>
        </div>
        <div style={{
          background: '#0F172A', borderRadius: 5,
          border: `1px solid #1E293B`, overflow: 'hidden',
        }}>
          <div style={{
            background: '#1E293B', padding: '5px 12px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', display: 'inline-block' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D97706', display: 'inline-block' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
            <span style={{ fontSize: 10, color: '#64748B', marginLeft: 4, fontFamily: FONTS.mono }}>srl_preview.efrm</span>
          </div>
          <textarea
            readOnly
            value={srlText}
            rows={Math.max(8, srlText.split('\n').length + 1)}
            style={{
              display: 'block', width: '100%', resize: 'none',
              background: 'transparent', border: 'none', outline: 'none',
              fontFamily: FONTS.mono, fontSize: 12.5, lineHeight: 1.7,
              color: '#E2E8F0', padding: '12px 16px',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* ── Conflict toast ── */}
      {conflictToast && (
        <div style={{
          background: '#FFF7ED', border: `1px solid #FED7AA`,
          borderLeft: `3px solid ${COLORS.warning}`,
          borderRadius: 5, padding: '10px 14px',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#92400E', marginBottom: 2 }}>
              Potential rule overlap detected with "{conflictToast}"
            </div>
            <div style={{ fontSize: 11.5, color: '#78350F' }}>
              This rule shares 2 or more identical conditions with an existing active rule.
              Consider reviewing for redundancy before activating.
            </div>
          </div>
          <button onClick={() => setConflictToast(null)} style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            cursor: 'pointer', color: COLORS.muted, fontSize: 14, flexShrink: 0,
          }}>✕</button>
        </div>
      )}

      {/* ── Save button ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          style={{
            padding: '8px 22px', fontSize: 13, fontWeight: 700,
            borderRadius: 5, border: 'none', fontFamily: FONTS.ui,
            background: !name.trim() ? COLORS.border : saveFlash ? COLORS.success : COLORS.accent,
            color: !name.trim() ? COLORS.muted : '#fff',
            cursor: !name.trim() ? 'default' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {saveFlash ? '✓ Saved' : editingRule ? 'Update Rule' : 'Save Rule'}
        </button>
        {!name.trim() && (
          <span style={{ fontSize: 11, color: COLORS.muted }}>Rule name is required</span>
        )}
        <div style={{ flex: 1 }} />
        <span style={{
          fontSize: 10.5, fontFamily: FONTS.mono,
          background: sevColor.bg, color: sevColor.text,
          padding: '2px 8px', borderRadius: 3, fontWeight: 700,
        }}>
          {severity.toUpperCase()} · {conditions.length} condition{conditions.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

