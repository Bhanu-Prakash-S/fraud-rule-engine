import React, { useState } from 'react';
import { TransactionsPage } from './pages/TransactionsPage';
import { RuleBuilderPage }  from './pages/RuleBuilderPage';
import { AlertsPage }       from './pages/AlertsPage';
import { FlagResult }       from './types/alert';
import { COLORS, FONTS }    from './constants/theme';

type Tab = 'transactions' | 'rules' | 'alerts';

const App: React.FC = () => {
  const [tab,         setTab]         = useState<Tab>('transactions');
  const [flagResults, setFlagResults] = useState<FlagResult[]>([]);

  const alertCount = flagResults.filter(f => !f.markedFPByAnalyst).length;

  const navBtn = (id: Tab, icon: string, label: string, badge?: number) => {
    const active = tab === id;
    return (
      <button
        key={id}
        onClick={() => setTab(id)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', fontSize: 13, fontWeight: active ? 700 : 400,
          background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
          color: active ? '#fff' : 'rgba(255,255,255,0.65)',
          border: 'none',
          borderBottom: active ? '2px solid #60A5FA' : '2px solid transparent',
          cursor: 'pointer',
          fontFamily: FONTS.ui,
          transition: 'color 0.15s, background 0.15s',
          borderRadius: 0,
          position: 'relative',
        }}
      >
        <span>{icon}</span>
        <span>{label}</span>
        {badge !== undefined && badge > 0 && (
          <span style={{
            background: COLORS.danger, color: '#fff',
            fontSize: 9.5, fontWeight: 800,
            padding: '1px 5px', borderRadius: 8,
            minWidth: 18, textAlign: 'center',
          }}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div style={{ fontFamily: FONTS.ui, background: COLORS.background, minHeight: '100vh' }}>

      {/* ── Global Nav Bar ── */}
      <div style={{
        background: COLORS.primary,
        display: 'flex', alignItems: 'stretch',
        padding: '0 12px', gap: 2,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        {/* Brand */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px 10px 4px', marginRight: 16,
          borderRight: '1px solid rgba(255,255,255,0.12)',
        }}>
          <span style={{ fontSize: 10, fontWeight: 800, background: '#DC2626', color: '#fff', padding: '2px 7px', borderRadius: 3, letterSpacing: '0.1em' }}>EFRM</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '0.02em' }}>Fraud Rule Engine</span>
        </div>

        {navBtn('transactions', '📋', 'Transactions')}
        {navBtn('rules',        '⚙️',  'Rule Builder')}
        {navBtn('alerts',       '🚨', 'Alerts Queue', alertCount)}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: 4 }}>
          <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', fontFamily: FONTS.ui }}>
            FCPG · Simulation Mode
          </span>
        </div>
      </div>

      {/* ── Page content ── */}
      {tab === 'transactions' && <TransactionsPage flagResults={flagResults} />}
      {tab === 'rules'        && <RuleBuilderPage />}
      {tab === 'alerts'       && <AlertsPage flagResults={flagResults} onRunRules={setFlagResults} />}
    </div>
  );
};

export default App;






