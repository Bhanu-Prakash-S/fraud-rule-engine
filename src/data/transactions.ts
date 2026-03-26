import { Transaction } from '../types/transaction';

/**
 * 50 mock transactions seeded with realistic Indian financial data.
 *
 * Ground-truth fraud patterns (isFlaggedGT: true):
 *  - TXN-001–004 : High-value (>₹50k) UPI to NEW payees between 01:00–04:00 IST
 *  - TXN-005–007 : Rapid sub-₹500 IMPS succession to same payee within 9 minutes
 *  - TXN-008,010 : Debits to Crypto Exchange merchants
 *  - TXN-009     : Debit to Gaming merchant (WinZO)
 */
export const TRANSACTIONS: Transaction[] = [
  // ── FRAUD PATTERN 1: High-value late-night UPI to new payees ──
  {
    id: 'TXN-001', timestamp: '2025-01-14T02:34:00', amount: 75000,
    channel: 'UPI', type: 'Debit',
    payeeName: 'Ranjit Handa', payeeId: 'ranjithanda99@okicici',
    isNewPayee: true, merchantCategory: 'P2P', customerAge: 312, city: 'Mumbai', isFlaggedGT: true,
  },
  {
    id: 'TXN-002', timestamp: '2025-01-21T03:15:00', amount: 62000,
    channel: 'UPI', type: 'Debit',
    payeeName: 'Mehul Trivedi', payeeId: 'mehultrivedi21@ybl',
    isNewPayee: true, merchantCategory: 'P2P', customerAge: 540, city: 'Ahmedabad', isFlaggedGT: true,
  },
  {
    id: 'TXN-003', timestamp: '2025-01-07T01:47:00', amount: 89000,
    channel: 'UPI', type: 'Debit',
    payeeName: 'Deepa Nair', payeeId: 'deepanair007@paytm',
    isNewPayee: true, merchantCategory: 'P2P', customerAge: 214, city: 'Bengaluru', isFlaggedGT: true,
  },
  {
    id: 'TXN-004', timestamp: '2025-01-28T02:58:00', amount: 55000,
    channel: 'UPI', type: 'Debit',
    payeeName: 'Arvind Shenoy', payeeId: 'arvindshenoy55@upi',
    isNewPayee: true, merchantCategory: 'P2P', customerAge: 128, city: 'Hyderabad', isFlaggedGT: true,
  },
  // ── FRAUD PATTERN 2: Rapid sub-₹500 IMPS succession ──
  {
    id: 'TXN-005', timestamp: '2025-01-15T14:22:00', amount: 350,
    channel: 'IMPS', type: 'Debit',
    payeeName: 'Priya Stores', payeeId: '9087234561@ibl',
    isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 891, city: 'Chennai', isFlaggedGT: true,
  },
  {
    id: 'TXN-006', timestamp: '2025-01-15T14:25:00', amount: 280,
    channel: 'IMPS', type: 'Debit',
    payeeName: 'Priya Stores', payeeId: '9087234561@ibl',
    isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 891, city: 'Chennai', isFlaggedGT: true,
  },
  {
    id: 'TXN-007', timestamp: '2025-01-15T14:31:00', amount: 490,
    channel: 'IMPS', type: 'Debit',
    payeeName: 'Priya Stores', payeeId: '9087234561@ibl',
    isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 891, city: 'Chennai', isFlaggedGT: true,
  },
  // ── FRAUD PATTERN 3: Crypto / Gaming debits ──
  {
    id: 'TXN-008', timestamp: '2025-01-09T16:44:00', amount: 15000,
    channel: 'UPI', type: 'Debit',
    payeeName: 'CoinSwitch Kuber', payeeId: 'coinswitch@ybl',
    isNewPayee: true, merchantCategory: 'Crypto Exchange', customerAge: 445, city: 'Pune', isFlaggedGT: true,
  },
  {
    id: 'TXN-009', timestamp: '2025-01-19T20:17:00', amount: 8000,
    channel: 'Cards', type: 'Debit',
    payeeName: 'WinZO Games', payeeId: 'WINZO_PG_8823',
    isNewPayee: false, merchantCategory: 'Gaming', customerAge: 204, city: 'Delhi', isFlaggedGT: true,
  },
  {
    id: 'TXN-010', timestamp: '2025-01-24T11:05:00', amount: 22000,
    channel: 'Internet Banking', type: 'Debit',
    payeeName: 'WazirX Exchange', payeeId: 'WAZIRX_ICICI_ACC',
    isNewPayee: true, merchantCategory: 'Crypto Exchange', customerAge: 672, city: 'Mumbai', isFlaggedGT: true,
  },
  // ── NORMAL TRANSACTIONS ──
  { id: 'TXN-011', timestamp: '2025-01-02T09:14:00', amount: 1200,  channel: 'UPI',              type: 'Debit',  payeeName: 'Swiggy India',         payeeId: 'swiggy@icici',        isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 1100, city: 'Bengaluru', isFlaggedGT: false },
  { id: 'TXN-012', timestamp: '2025-01-03T10:22:00', amount: 45000, channel: 'NEFT',             type: 'Credit', payeeName: 'Infosys Ltd Payroll',  payeeId: 'INFY_SALARY_ACC',     isNewPayee: false, merchantCategory: 'P2P',        customerAge: 1100, city: 'Bengaluru', isFlaggedGT: false },
  { id: 'TXN-013', timestamp: '2025-01-03T11:30:00', amount: 3500,  channel: 'UPI',              type: 'Debit',  payeeName: 'Amazon India',         payeeId: 'amazon@upi',          isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 1100, city: 'Bengaluru', isFlaggedGT: false },
  { id: 'TXN-014', timestamp: '2025-01-04T08:55:00', amount: 950,   channel: 'Mobile Banking',   type: 'Debit',  payeeName: 'Mahanagar Gas Ltd',    payeeId: '400891234@hdfcbank',  isNewPayee: false, merchantCategory: 'Utility',    customerAge: 730,  city: 'Mumbai',    isFlaggedGT: false },
  { id: 'TXN-015', timestamp: '2025-01-04T12:10:00', amount: 18000, channel: 'NEFT',             type: 'Debit',  payeeName: 'Prestige Rentals',     payeeId: 'prestige@sbi',        isNewPayee: false, merchantCategory: 'Utility',    customerAge: 730,  city: 'Mumbai',    isFlaggedGT: false },
  { id: 'TXN-016', timestamp: '2025-01-05T14:45:00', amount: 560,   channel: 'UPI',              type: 'Debit',  payeeName: 'Zomato',               payeeId: 'zomato@axl',          isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 620,  city: 'Hyderabad', isFlaggedGT: false },
  { id: 'TXN-017', timestamp: '2025-01-06T09:00:00', amount: 2100,  channel: 'Cards',            type: 'Debit',  payeeName: 'Croma Electronics',    payeeId: 'CROMA_HDFC_TXN',     isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 980,  city: 'Delhi',     isFlaggedGT: false },
  { id: 'TXN-018', timestamp: '2025-01-06T17:22:00', amount: 6200,  channel: 'UPI',              type: 'Debit',  payeeName: 'MakeMyTrip Flights',   payeeId: 'mmt@icici',           isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 980,  city: 'Delhi',     isFlaggedGT: false },
  { id: 'TXN-019', timestamp: '2025-01-07T08:30:00', amount: 700,   channel: 'Mobile Banking',   type: 'Debit',  payeeName: 'Jio Fiber',            payeeId: 'jiofib@upi',          isNewPayee: false, merchantCategory: 'Utility',    customerAge: 1450, city: 'Chennai',   isFlaggedGT: false },
  { id: 'TXN-020', timestamp: '2025-01-08T10:05:00', amount: 30000, channel: 'NEFT',             type: 'Credit', payeeName: 'TCS Ltd Payroll',      payeeId: 'TCS_SALARY_ACC',      isNewPayee: false, merchantCategory: 'P2P',        customerAge: 1450, city: 'Chennai',   isFlaggedGT: false },
  { id: 'TXN-021', timestamp: '2025-01-08T13:40:00', amount: 4800,  channel: 'UPI',              type: 'Debit',  payeeName: 'Myntra Fashion',       payeeId: 'myntra@paytm',        isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 560,  city: 'Pune',      isFlaggedGT: false },
  { id: 'TXN-022', timestamp: '2025-01-09T09:15:00', amount: 1800,  channel: 'UPI',              type: 'Debit',  payeeName: 'Namma Metro',          payeeId: 'nmmetro@upi',         isNewPayee: false, merchantCategory: 'Utility',    customerAge: 820,  city: 'Bengaluru', isFlaggedGT: false },
  { id: 'TXN-023', timestamp: '2025-01-10T11:00:00', amount: 12000, channel: 'IMPS',             type: 'Debit',  payeeName: 'Suresh Babu',          payeeId: 'sureshbabu01@sbi',    isNewPayee: false, merchantCategory: 'P2P',        customerAge: 640,  city: 'Vizag',     isFlaggedGT: false },
  { id: 'TXN-024', timestamp: '2025-01-10T15:30:00', amount: 3200,  channel: 'Cards',            type: 'Debit',  payeeName: 'Nykaa Beauty',         payeeId: 'NYKAA_AXIS_TXN',     isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 750,  city: 'Kolkata',   isFlaggedGT: false },
  { id: 'TXN-025', timestamp: '2025-01-11T08:00:00', amount: 1100,  channel: 'Mobile Banking',   type: 'Debit',  payeeName: 'Airtel Broadband',     payeeId: 'airtel@upi',          isNewPayee: false, merchantCategory: 'Utility',    customerAge: 880,  city: 'Gurgaon',   isFlaggedGT: false },
  { id: 'TXN-026', timestamp: '2025-01-11T14:20:00', amount: 9500,  channel: 'UPI',              type: 'Debit',  payeeName: 'Dr. Ramesh Clinic',    payeeId: 'drramesh@kotak',      isNewPayee: false, merchantCategory: 'P2P',        customerAge: 990,  city: 'Hyderabad', isFlaggedGT: false },
  { id: 'TXN-027', timestamp: '2025-01-12T10:45:00', amount: 25000, channel: 'NEFT',             type: 'Debit',  payeeName: 'HDFC Home Loan EMI',   payeeId: 'HDFC_HL_EMI',        isNewPayee: false, merchantCategory: 'Utility',    customerAge: 1200, city: 'Pune',      isFlaggedGT: false },
  { id: 'TXN-028', timestamp: '2025-01-12T16:50:00', amount: 720,   channel: 'UPI',              type: 'Debit',  payeeName: 'BookMyShow',           payeeId: 'bookmyshow@ybl',      isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 480,  city: 'Delhi',     isFlaggedGT: false },
  { id: 'TXN-029', timestamp: '2025-01-13T09:30:00', amount: 2500,  channel: 'UPI',              type: 'Credit', payeeName: 'Anjali Sharma',        payeeId: 'anjalisharma@paytm',  isNewPayee: false, merchantCategory: 'P2P',        customerAge: 320,  city: 'Jaipur',    isFlaggedGT: false },
  { id: 'TXN-030', timestamp: '2025-01-13T11:45:00', amount: 14000, channel: 'IMPS',             type: 'Debit',  payeeName: 'Kiran Auto Parts',     payeeId: 'kiranauto@sbi',       isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 720,  city: 'Ludhiana',  isFlaggedGT: false },
  { id: 'TXN-031', timestamp: '2025-01-14T10:00:00', amount: 42000, channel: 'NEFT',             type: 'Credit', payeeName: 'Wipro Technologies',   payeeId: 'WIPRO_SAL_ACC',       isNewPayee: false, merchantCategory: 'P2P',        customerAge: 1560, city: 'Bengaluru', isFlaggedGT: false },
  { id: 'TXN-032', timestamp: '2025-01-14T13:10:00', amount: 5500,  channel: 'Cards',            type: 'Debit',  payeeName: 'Reliance Digital',     payeeId: 'RELDGT_ICICI_TXN',   isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 1560, city: 'Bengaluru', isFlaggedGT: false },
  { id: 'TXN-033', timestamp: '2025-01-15T09:55:00', amount: 800,   channel: 'Mobile Banking',   type: 'Debit',  payeeName: 'BESCOM Electricity',   payeeId: 'bescom@icici',        isNewPayee: false, merchantCategory: 'Utility',    customerAge: 891,  city: 'Chennai',   isFlaggedGT: false },
  { id: 'TXN-034', timestamp: '2025-01-16T12:30:00', amount: 6800,  channel: 'UPI',              type: 'Debit',  payeeName: 'Tanishq Jewellery',    payeeId: 'tanishq@upi',         isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 1340, city: 'Surat',     isFlaggedGT: false },
  { id: 'TXN-035', timestamp: '2025-01-16T14:00:00', amount: 3300,  channel: 'Internet Banking', type: 'Debit',  payeeName: 'SBI Life Insurance',   payeeId: 'SBILIFEINS_PREM',     isNewPayee: false, merchantCategory: 'Utility',    customerAge: 1340, city: 'Surat',     isFlaggedGT: false },
  { id: 'TXN-036', timestamp: '2025-01-17T08:45:00', amount: 1650,  channel: 'UPI',              type: 'Debit',  payeeName: 'Zepto Grocery',        payeeId: 'zepto@paytm',         isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 620,  city: 'Noida',     isFlaggedGT: false },
  { id: 'TXN-037', timestamp: '2025-01-17T17:20:00', amount: 10500, channel: 'NEFT',             type: 'Credit', payeeName: 'Ray Thomas Freelance', payeeId: 'RAYTHOMAS_FREELANCE', isNewPayee: false, merchantCategory: 'P2P',        customerAge: 520,  city: 'Kochi',     isFlaggedGT: false },
  { id: 'TXN-038', timestamp: '2025-01-18T09:00:00', amount: 16000, channel: 'IMPS',             type: 'Debit',  payeeName: 'Anand Medical Stores', payeeId: 'anandmed@kotak',      isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 650,  city: 'Nagpur',    isFlaggedGT: false },
  { id: 'TXN-039', timestamp: '2025-01-18T15:40:00', amount: 4200,  channel: 'Cards',            type: 'Debit',  payeeName: 'Decathlon India',      payeeId: 'DECATHLON_AXIS_TXN', isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 720,  city: 'Bengaluru', isFlaggedGT: false },
  { id: 'TXN-040', timestamp: '2025-01-19T10:30:00', amount: 21000, channel: 'NEFT',             type: 'Credit', payeeName: 'HCL Technologies',     payeeId: 'HCL_PAYROLL_ACC',     isNewPayee: false, merchantCategory: 'P2P',        customerAge: 1100, city: 'Noida',     isFlaggedGT: false },
  { id: 'TXN-041', timestamp: '2025-01-20T11:10:00', amount: 900,   channel: 'UPI',              type: 'Debit',  payeeName: 'Ola Electric',         payeeId: 'ola@ybl',             isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 560,  city: 'Bengaluru', isFlaggedGT: false },
  { id: 'TXN-042', timestamp: '2025-01-20T14:55:00', amount: 7500,  channel: 'Internet Banking', type: 'Debit',  payeeName: 'LIC Policy Premium',   payeeId: 'LICPREM_DIRECT',      isNewPayee: false, merchantCategory: 'Utility',    customerAge: 1800, city: 'Chennai',   isFlaggedGT: false },
  { id: 'TXN-043', timestamp: '2025-01-21T09:25:00', amount: 2800,  channel: 'UPI',              type: 'Debit',  payeeName: 'Lenskart',             payeeId: 'lenskart@upi',        isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 420,  city: 'Indore',    isFlaggedGT: false },
  { id: 'TXN-044', timestamp: '2025-01-22T12:00:00', amount: 5100,  channel: 'IMPS',             type: 'Credit', payeeName: 'Vikram Mehta',         payeeId: 'vikrammehta@okhdfc',  isNewPayee: false, merchantCategory: 'P2P',        customerAge: 780,  city: 'Vadodara',  isFlaggedGT: false },
  { id: 'TXN-045', timestamp: '2025-01-22T16:30:00', amount: 1980,  channel: 'Mobile Banking',   type: 'Debit',  payeeName: 'HPCL Petrol Pump',     payeeId: 'hpcl@upi',            isNewPayee: false, merchantCategory: 'Utility',    customerAge: 920,  city: 'Jaipur',    isFlaggedGT: false },
  { id: 'TXN-046', timestamp: '2025-01-23T08:15:00', amount: 38000, channel: 'NEFT',             type: 'Credit', payeeName: 'Bajaj Finance Salary', payeeId: 'BAJAJFIN_PAYROLL',    isNewPayee: false, merchantCategory: 'P2P',        customerAge: 1020, city: 'Pune',      isFlaggedGT: false },
  { id: 'TXN-047', timestamp: '2025-01-23T14:00:00', amount: 11200, channel: 'UPI',              type: 'Debit',  payeeName: 'Tata Cliq Luxury',     payeeId: 'tatacliq@upi',        isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 1020, city: 'Pune',      isFlaggedGT: false },
  { id: 'TXN-048', timestamp: '2025-01-25T10:00:00', amount: 2200,  channel: 'UPI',              type: 'Debit',  payeeName: 'Rapido Cabs',          payeeId: 'rapido@axl',          isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 390,  city: 'Hyderabad', isFlaggedGT: false },
  { id: 'TXN-049', timestamp: '2025-01-26T11:30:00', amount: 8800,  channel: 'Cards',            type: 'Debit',  payeeName: 'Apple India Store',    payeeId: 'APPLE_HDFC_TXN',     isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 1660, city: 'Mumbai',    isFlaggedGT: false },
  { id: 'TXN-050', timestamp: '2025-01-27T15:45:00', amount: 1300,  channel: 'UPI',              type: 'Debit',  payeeName: 'Meesho Seller',        payeeId: 'meesho@paytm',        isNewPayee: false, merchantCategory: 'E-Commerce', customerAge: 340,  city: 'Lucknow',   isFlaggedGT: false },
];
