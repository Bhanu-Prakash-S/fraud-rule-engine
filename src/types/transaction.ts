export type Channel =
  | 'UPI'
  | 'IMPS'
  | 'NEFT'
  | 'Cards'
  | 'Internet Banking'
  | 'Mobile Banking';

export type TxnType = 'Debit' | 'Credit';

export type MerchantCategory =
  | 'P2P'
  | 'E-Commerce'
  | 'Utility'
  | 'Gaming'
  | 'Crypto Exchange';

export interface Transaction {
  id: string;               // "TXN-001" format
  timestamp: string;        // ISO 8601, IST implied
  amount: number;           // in INR (paise-free)
  channel: Channel;
  type: TxnType;
  payeeName: string;        // realistic Indian names
  payeeId: string;          // UPI handle or account no.
  isNewPayee: boolean;      // first time with this payee
  merchantCategory: MerchantCategory;
  customerAge: number;      // account age in days
  city: string;             // Indian city
  isFlaggedGT: boolean;     // ground truth — manually marked ~10 as truly fraudulent
}
