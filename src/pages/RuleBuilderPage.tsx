import React, { useState, useCallback } from 'react';
import { Rule } from '../types/rule';
import { RuleBuilder } from '../components/RuleBuilder';
import { RuleLibrary } from '../components/RuleLibrary';
import { loadRules, saveRules } from '../data/seedRules';
import { addAuditEntry } from '../engine/ruleEngine';
import { COLORS, FONTS } from '../constants/theme';

export const RuleBuilderPage: React.FC = () => {
  const [rules, setRules]             = useState<Rule[]>(() => loadRules());
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const handleSave = useCallback((rule: Rule) => {
    setRules(prev => {
      const exists = prev.some(r => r.id === rule.id);
      const next   = exists
        ? prev.map(r => r.id === rule.id ? rule : r)
        : [...prev, rule];
      saveRules(next);
      addAuditEntry({
        action:   exists ? 'UPDATE' : 'CREATE',
        ruleId:   rule.id,
        ruleName: rule.name,
        detail:   exists
          ? `Rule updated — severity: ${rule.severity}, conditions: ${rule.conditions.length}`
          : `New rule created — scenario: "${rule.scenario}", severity: ${rule.severity}`,
      });
      return next;
    });
    setEditingRule(null);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setRules(prev => {
      const target = prev.find(r => r.id === id);
      const next   = prev.filter(r => r.id !== id);
      saveRules(next);
      if (target) {
        addAuditEntry({
          action:   'DELETE',
          ruleId:   target.id,
          ruleName: target.name,
          detail:   `Rule permanently deleted from library`,
        });
      }
      return next;
    });
    setEditingRule(prev => prev?.id === id ? null : prev);
  }, []);

  const handleToggle = useCallback((id: string) => {
    setRules(prev => {
      const target = prev.find(r => r.id === id);
      const next   = prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r);
      saveRules(next);
      if (target) {
        const nowActive = !target.isActive;
        addAuditEntry({
          action:   nowActive ? 'TOGGLE_ACTIVE' : 'TOGGLE_INACTIVE',
          ruleId:   target.id,
          ruleName: target.name,
          detail:   nowActive ? 'Rule set to Active — will be evaluated on next run' : 'Rule set to Inactive — excluded from evaluation',
        });
      }
      return next;
    });
  }, []);

  const handleEdit = useCallback((rule: Rule) => {
    setEditingRule(rule);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const activeCount   = rules.filter(r => r.isActive).length;
  const inactiveCount = rules.length - activeCount;

  return (
    <div style={{ fontFamily: FONTS.ui, background: COLORS.background, minHeight: '100vh' }}>
      <div style={{
        background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`,
        padding: '12px 20px',
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: COLORS.text }}>
            Rule Management — EFRM Simulator
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: COLORS.muted }}>
            Define fraud detection scenarios as rule logic. Changes are audit-logged.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: COLORS.muted }}>
          <span>Library: <strong style={{ color: COLORS.text }}>{rules.length}</strong> rules</span>
          <span>Active: <strong style={{ color: COLORS.success }}>{activeCount}</strong></span>
          {inactiveCount > 0 && (
            <span>Inactive: <strong style={{ color: COLORS.warning }}>{inactiveCount}</strong></span>
          )}
        </div>
      </div>

      <div style={{
        maxWidth: 1400, margin: '0 auto', padding: '16px 20px',
        display: 'grid', gridTemplateColumns: '60% 1fr', gap: 20, alignItems: 'start',
      }}>
        <div>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '16px 18px' }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: COLORS.muted,
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14,
              paddingBottom: 10, borderBottom: `1px solid ${COLORS.border}`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                background: editingRule ? '#EFF6FF' : '#F0FDF4',
                color: editingRule ? COLORS.accent : COLORS.success,
                padding: '1px 7px', borderRadius: 3, fontSize: 10,
              }}>
                {editingRule ? 'EDITING' : 'NEW RULE'}
              </span>
              Rule Builder
            </div>
            <RuleBuilder editingRule={editingRule} onSave={handleSave} onClearEdit={() => setEditingRule(null)} />
          </div>
        </div>

        <div>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '16px 18px' }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: COLORS.muted,
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14,
              paddingBottom: 10, borderBottom: `1px solid ${COLORS.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>Rule Library</span>
              <span style={{ fontSize: 10, fontWeight: 700, background: '#F1F5F9', color: COLORS.muted, padding: '1px 7px', borderRadius: 3 }}>
                {rules.length} saved
              </span>
            </div>
            <RuleLibrary rules={rules} onEdit={handleEdit} onDelete={handleDelete} onToggle={handleToggle} />
          </div>
        </div>
      </div>
    </div>
  );
};
















// import React, { useState, useCallback } from 'react';
// import { Rule } from '../types/rule';
// import { RuleBuilder } from '../components/RuleBuilder';
// import { RuleLibrary } from '../components/RuleLibrary';
// import { loadRules, saveRules } from '../data/seedRules';
// import { COLORS, FONTS } from '../constants/theme';

// export const RuleBuilderPage: React.FC = () => {
//   const [rules, setRules]           = useState<Rule[]>(() => loadRules());
//   const [editingRule, setEditingRule] = useState<Rule | null>(null);

//   const handleSave = useCallback((rule: Rule) => {
//     setRules(prev => {
//       const exists = prev.some(r => r.id === rule.id);
//       const next   = exists ? prev.map(r => r.id === rule.id ? rule : r) : [...prev, rule];
//       saveRules(next);
//       return next;
//     });
//     setEditingRule(null);
//   }, []);

//   const handleDelete = useCallback((id: string) => {
//     setRules(prev => {
//       const next = prev.filter(r => r.id !== id);
//       saveRules(next);
//       return next;
//     });
//     setEditingRule(prev => prev?.id === id ? null : prev);
//   }, []);

//   const handleToggle = useCallback((id: string) => {
//     setRules(prev => {
//       const next = prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r);
//       saveRules(next);
//       return next;
//     });
//   }, []);

//   const handleEdit = useCallback((rule: Rule) => {
//     setEditingRule(rule);
//     // Scroll builder into view on narrow screens
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   }, []);

//   const activeCount   = rules.filter(r => r.isActive).length;
//   const inactiveCount = rules.length - activeCount;

//   return (
//     <div style={{ fontFamily: FONTS.ui, background: COLORS.background, minHeight: '100vh' }}>

//       {/* ── Sub-header ── */}
//       <div style={{
//         background: COLORS.surface,
//         borderBottom: `1px solid ${COLORS.border}`,
//         padding: '12px 20px',
//         display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
//       }}>
//         <div>
//           <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: COLORS.text }}>
//             Rule Management — EFRM Simulator
//           </h1>
//           <p style={{ margin: '2px 0 0', fontSize: 12, color: COLORS.muted }}>
//             Define fraud detection scenarios as rule logic. Changes are audit-logged.
//           </p>
//         </div>
//         <div style={{ display: 'flex', gap: 12, fontSize: 11, color: COLORS.muted }}>
//           <span>Library: <strong style={{ color: COLORS.text }}>{rules.length}</strong> rules</span>
//           <span>Active: <strong style={{ color: COLORS.success }}>{activeCount}</strong></span>
//           {inactiveCount > 0 && (
//             <span>Inactive: <strong style={{ color: COLORS.warning }}>{inactiveCount}</strong></span>
//           )}
//         </div>
//       </div>

//       {/* ── Two-column layout ── */}
//       <div style={{
//         maxWidth: 1400, margin: '0 auto', padding: '16px 20px',
//         display: 'grid', gridTemplateColumns: '60% 1fr', gap: 20,
//         alignItems: 'start',
//       }}>

//         {/* Left — Rule Builder */}
//         <div>
//           <div style={{
//             background: COLORS.surface, border: `1px solid ${COLORS.border}`,
//             borderRadius: 6, padding: '16px 18px',
//           }}>
//             <div style={{
//               fontSize: 11, fontWeight: 700, color: COLORS.muted,
//               textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14,
//               paddingBottom: 10, borderBottom: `1px solid ${COLORS.border}`,
//               display: 'flex', alignItems: 'center', gap: 8,
//             }}>
//               <span style={{
//                 background: editingRule ? '#EFF6FF' : '#F0FDF4',
//                 color: editingRule ? COLORS.accent : COLORS.success,
//                 padding: '1px 7px', borderRadius: 3, fontSize: 10,
//               }}>
//                 {editingRule ? 'EDITING' : 'NEW RULE'}
//               </span>
//               Rule Builder
//             </div>
//             <RuleBuilder
//               editingRule={editingRule}
//               onSave={handleSave}
//               onClearEdit={() => setEditingRule(null)}
//             />
//           </div>
//         </div>

//         {/* Right — Rule Library */}
//         <div>
//           <div style={{
//             background: COLORS.surface, border: `1px solid ${COLORS.border}`,
//             borderRadius: 6, padding: '16px 18px',
//           }}>
//             <div style={{
//               fontSize: 11, fontWeight: 700, color: COLORS.muted,
//               textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14,
//               paddingBottom: 10, borderBottom: `1px solid ${COLORS.border}`,
//               display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//             }}>
//               <span>Rule Library</span>
//               <span style={{
//                 fontSize: 10, fontWeight: 700,
//                 background: '#F1F5F9', color: COLORS.muted,
//                 padding: '1px 7px', borderRadius: 3,
//               }}>
//                 {rules.length} saved
//               </span>
//             </div>
//             <RuleLibrary
//               rules={rules}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               onToggle={handleToggle}
//             />
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };
