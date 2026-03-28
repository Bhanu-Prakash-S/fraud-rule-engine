import React, { useState, useEffect } from 'react';
import { TransactionsPage } from './pages/TransactionsPage';
import { RuleBuilderPage }  from './pages/RuleBuilderPage';
import { AlertsPage }       from './pages/AlertsPage';
import { DashboardPage }    from './pages/DashboardPage';
import { FlagResult }       from './types/alert';
import { COLORS, FONTS }    from './constants/theme';

type Tab = 'transactions' | 'rules' | 'alerts' | 'dashboard';

const ONBOARDING_KEY = 'fcpg_onboarding_seen_v1';

// ── Shield SVG icon ───────────────────────────────────────────────────────────
const ShieldIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2L4 5.5V11C4 15.55 7.41 19.74 12 21C16.59 19.74 20 15.55 20 11V5.5L12 2Z"
      fill="rgba(255,255,255,0.15)"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M9 12l2 2 4-4"
      stroke="rgba(255,255,255,0.9)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Onboarding modal ──────────────────────────────────────────────────────────
interface OnboardingModalProps {
  onEnter: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onEnter }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 100,
    background: 'rgba(10,20,40,0.82)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{
      background: COLORS.surface,
      borderRadius: 8,
      width: 540,
      overflow: 'hidden',
      boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
    }}>
      {/* Header stripe */}
      <div style={{
        background: COLORS.primary, padding: '20px 24px',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldIcon />
          <span style={{
            fontSize: 10, fontWeight: 800, background: '#DC2626', color: '#fff',
            padding: '2px 8px', borderRadius: 3, letterSpacing: '0.1em',
          }}>EFRM</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>
            RESTRICTED — INTERNAL TOOL
          </span>
        </div>
        <h2 style={{
          margin: 0, fontSize: 20, fontWeight: 700, color: '#fff',
          letterSpacing: '-0.01em', lineHeight: 1.25,
        }}>
          FCPG EFRM Rule Engine Simulator
        </h2>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          Financial Crime Prevention Group · Transaction Monitoring
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ margin: 0, fontSize: 13.5, color: COLORS.text, lineHeight: 1.7 }}>
          This tool is a visual simulation of transaction monitoring rule logic as used in
          <strong> Falcon-based fraud prevention systems</strong>. It demonstrates SRL rule authoring,
          false positive analysis, and MIS reporting as practised in
          <strong> Financial Crime Prevention teams</strong>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { icon: '📋', label: 'Transactions', desc: '54 realistic INR transactions with ground-truth fraud labels' },
            { icon: '⚙️', label: 'Rule Builder',  desc: 'Author SRL-syntax rules with live condition preview' },
            { icon: '🚨', label: 'Alerts Queue',  desc: 'Execute rules, review flags, mark false positives' },
            { icon: '📊', label: 'MIS Dashboard', desc: 'Hit rate, precision, SVG charts, CSV export' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '8px 10px', borderRadius: 5,
              background: '#F8FAFC', border: `1px solid ${COLORS.border}`,
            }}>
              <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.text }}>{item.label}</div>
                <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 1 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: '#FFFBEB', border: `1px solid #FDE68A`,
          borderRadius: 5, padding: '9px 12px', fontSize: 11.5, color: '#78350F',
        }}>
          ⚠ Simulation only — no real transactions or customer data. All values are synthetic.
        </div>

        <button
          onClick={onEnter}
          style={{
            padding: '11px 0', fontSize: 14, fontWeight: 700,
            borderRadius: 5, border: 'none',
            background: COLORS.accent, color: '#fff',
            cursor: 'pointer', fontFamily: FONTS.ui,
            letterSpacing: '0.02em',
          }}
        >
          Enter Simulator →
        </button>
      </div>
    </div>
  </div>
);

// ── App ───────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [tab,          setTab]          = useState<Tab>('transactions');
  const [flagResults,  setFlagResults]  = useState<FlagResult[]>([]);
  const [showModal,    setShowModal]    = useState<boolean>(false);

  // Show onboarding modal once (localStorage-gated)
  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen) setShowModal(true);
  }, []);

  const handleEnter = (): void => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setShowModal(false);
  };

  const alertCount = flagResults.filter(f => !f.markedFPByAnalyst).length;

  const navBtn = (id: Tab, icon: string, label: string, badge?: number): React.ReactElement => {
    const active = tab === id;
    return (
      <button
        key={id}
        onClick={() => setTab(id)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 18px', height: '100%',
          fontSize: 13, fontWeight: active ? 700 : 400,
          background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
          color: active ? '#fff' : 'rgba(255,255,255,0.62)',
          border: 'none',
          borderBottom: active ? '2px solid #60A5FA' : '2px solid transparent',
          cursor: 'pointer', fontFamily: FONTS.ui,
          transition: 'color 0.12s, background 0.12s',
          borderRadius: 0, whiteSpace: 'nowrap',
        }}
      >
        <span>{icon}</span>
        <span>{label}</span>
        {badge !== undefined && badge > 0 && (
          <span style={{
            background: COLORS.danger, color: '#fff',
            fontSize: 9.5, fontWeight: 800,
            padding: '1px 5px', borderRadius: 8,
            minWidth: 18, textAlign: 'center', lineHeight: '14px',
          }}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div style={{ fontFamily: FONTS.ui, background: COLORS.background, minHeight: '100vh' }}>

      {/* ── Onboarding modal ── */}
      {showModal && <OnboardingModal onEnter={handleEnter} />}

      {/* ── Global Nav Bar ── */}
      <div style={{
        background: COLORS.primary,
        display: 'flex', alignItems: 'stretch',
        height: 46,
        padding: '0 8px', gap: 0,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky', top: 0, zIndex: 30,
        boxShadow: '0 1px 8px rgba(0,0,0,0.18)',
      }}>

        {/* Brand */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 16px 0 8px', marginRight: 8,
          borderRight: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
        }}>
          <ShieldIcon />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', letterSpacing: '0.01em', lineHeight: 1.2 }}>
              FCPG Transaction Monitoring
            </span>
            <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em', lineHeight: 1.2 }}>
              EFRM Simulator
            </span>
          </div>
        </div>

        {/* Nav tabs */}
        {navBtn('transactions', '📋', 'Transactions')}
        {navBtn('rules',        '⚙️',  'Rule Builder')}
        {navBtn('alerts',       '🚨', 'Alerts Queue', alertCount)}
        {navBtn('dashboard',    '📊', 'MIS Dashboard')}

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, paddingRight: 12 }}>
          {flagResults.length > 0 && (
            <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', fontFamily: FONTS.mono }}>
              {flagResults.length} alerts
            </span>
          )}
          {/* Amber simulation mode pill */}
          <span style={{
            fontSize: 10, fontWeight: 800,
            background: '#D97706', color: '#fff',
            padding: '3px 9px', borderRadius: 10,
            letterSpacing: '0.08em',
          }}>
            SIMULATION MODE
          </span>
        </div>
      </div>

      {/* ── Page content ── */}
      {tab === 'transactions' && <TransactionsPage flagResults={flagResults} />}
      {tab === 'rules'        && <RuleBuilderPage  flagResults={flagResults} />}
      {tab === 'alerts'       && <AlertsPage       flagResults={flagResults} onRunRules={setFlagResults} />}
      {tab === 'dashboard'    && <DashboardPage    flagResults={flagResults} />}
    </div>
  );
};

export default App;











// import React, { useState } from 'react';
// import { TransactionsPage } from './pages/TransactionsPage';
// import { RuleBuilderPage }  from './pages/RuleBuilderPage';
// import { AlertsPage }       from './pages/AlertsPage';
// import { DashboardPage }    from './pages/DashboardPage';
// import { FlagResult }       from './types/alert';
// import { COLORS, FONTS }    from './constants/theme';

// type Tab = 'transactions' | 'rules' | 'alerts' | 'dashboard';

// const App: React.FC = () => {
//   const [tab,         setTab]         = useState<Tab>('transactions');
//   const [flagResults, setFlagResults] = useState<FlagResult[]>([]);

//   const alertCount = flagResults.filter(f => !f.markedFPByAnalyst).length;

//   const navBtn = (id: Tab, icon: string, label: string, badge?: number) => {
//     const active = tab === id;
//     return (
//       <button
//         key={id}
//         onClick={() => setTab(id)}
//         style={{
//           display: 'flex', alignItems: 'center', gap: 6,
//           padding: '8px 16px', fontSize: 13, fontWeight: active ? 700 : 400,
//           background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
//           color: active ? '#fff' : 'rgba(255,255,255,0.65)',
//           border: 'none',
//           borderBottom: active ? '2px solid #60A5FA' : '2px solid transparent',
//           cursor: 'pointer',
//           fontFamily: FONTS.ui,
//           transition: 'color 0.15s, background 0.15s',
//           borderRadius: 0,
//         }}
//       >
//         <span>{icon}</span>
//         <span>{label}</span>
//         {badge !== undefined && badge > 0 && (
//           <span style={{
//             background: COLORS.danger, color: '#fff',
//             fontSize: 9.5, fontWeight: 800,
//             padding: '1px 5px', borderRadius: 8,
//             minWidth: 18, textAlign: 'center',
//           }}>
//             {badge}
//           </span>
//         )}
//       </button>
//     );
//   };

//   return (
//     <div style={{ fontFamily: FONTS.ui, background: COLORS.background, minHeight: '100vh' }}>

//       {/* ── Global Nav Bar ── */}
//       <div style={{
//         background: COLORS.primary,
//         display: 'flex', alignItems: 'stretch',
//         padding: '0 12px', gap: 2,
//         borderBottom: '1px solid rgba(255,255,255,0.08)',
//         position: 'sticky', top: 0, zIndex: 30,
//       }}>
//         {/* Brand */}
//         <div style={{
//           display: 'flex', alignItems: 'center', gap: 10,
//           padding: '10px 12px 10px 4px', marginRight: 16,
//           borderRight: '1px solid rgba(255,255,255,0.12)',
//         }}>
//           <span style={{ fontSize: 10, fontWeight: 800, background: '#DC2626', color: '#fff', padding: '2px 7px', borderRadius: 3, letterSpacing: '0.1em' }}>EFRM</span>
//           <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '0.02em' }}>Fraud Rule Engine</span>
//         </div>

//         {navBtn('transactions', '📋', 'Transactions')}
//         {navBtn('rules',        '⚙️',  'Rule Builder')}
//         {navBtn('alerts',       '🚨', 'Alerts Queue', alertCount)}
//         {navBtn('dashboard',    '📊', 'MIS Dashboard')}

//         <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: 4 }}>
//           <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)' }}>
//             FCPG · Simulation Mode
//           </span>
//         </div>
//       </div>

//       {/* ── Page content ── */}
//       {tab === 'transactions' && <TransactionsPage flagResults={flagResults} />}
//       {tab === 'rules'        && <RuleBuilderPage />}
//       {tab === 'alerts'       && <AlertsPage flagResults={flagResults} onRunRules={setFlagResults} />}
//       {tab === 'dashboard'    && <DashboardPage flagResults={flagResults} />}
//     </div>
//   );
// };

// export default App;
