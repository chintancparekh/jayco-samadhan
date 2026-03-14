// src/app/shared/models.ts

// ── API Wrapper ───────────────────────────────────────────────
export interface ApiResult<T = null> {
  success: boolean;
  message: string;
  data?:   T | null;
}

// ── Auth ─────────────────────────────────────────────────────
export interface AuthResponse {
  token:  string;
  userId: number;
  name:   string;
  email:  string;
  role:   string;
  expiry: string;
  isEmailVerified: boolean;
}

export interface RegisterRequest {
  name:     string;
  email:    string;
  gstNo:    string;
  mobileNo: string;
}

export interface VerifyRequest {
  email:    string;
  token:    string;
  password: string;
}

export interface LoginRequest {
  email:    string;
  password: string;
}

// ── Checklist ─────────────────────────────────────────────────
export interface Checklist {
  cl1:  boolean; cl2:  boolean; cl3:  boolean; cl4:  boolean;
  cl5:  boolean; cl6:  boolean; cl7:  boolean; cl8:  boolean;
  cl9:  boolean; cl10: boolean; cl11: boolean; cl12: boolean;
  cl13: boolean; cl14: boolean; cl15: boolean; cl16: boolean;
  cl17: boolean;
  samadhanAppNo?:  string;
  completedCount?: number; // ← NG9 fix
}

// ── CHECKLIST_LABELS — Array (iterable for @for loop) ────────
export interface ChecklistLabel {
  key:   string;
  label: string;
}

export const CHECKLIST_LABELS: ChecklistLabel[] = [
  { key: 'cl1',  label: 'Seller Information' },
  { key: 'cl2',  label: 'Buyer Information' },
  { key: 'cl3',  label: 'EM or Udyam Certificate' },
  { key: 'cl4',  label: 'Annexure I' },
  { key: 'cl5',  label: 'Annexure II' },
  { key: 'cl6',  label: 'Agreement / Contract' },
  { key: 'cl7',  label: 'Purchase Order' },
  { key: 'cl8',  label: 'Invoices' },
  { key: 'cl9',  label: 'Quality Certificate (Seller)' },
  { key: 'cl10', label: 'Quality Certificate (Buyer)' },
  { key: 'cl11', label: 'Delivery Challan' },
  { key: 'cl12', label: 'Payment Details' },
  { key: 'cl13', label: 'Outstanding Amount' },
  { key: 'cl14', label: 'Interest Details' },
  { key: 'cl15', label: 'RPAD Slip' },
  { key: 'cl16', label: 'Balance Sheet' },
  { key: 'cl17', label: 'Samadhan Application No' },
];

// ── CaseQuery ─────────────────────────────────────────────────
export interface CaseQuery {
  id:         number;
  caseId:     number;
  text:       string;
  status:     string;
  raisedAt:   string;
  reply?:     string;
  repliedAt?: string;
  phoneNote?: string;
  emailNote?: string;
}

// alias
export type QueryItem = CaseQuery;

// ── Case List ─────────────────────────────────────────────────
export interface CaseList {
  id:            number;
  caseNo:        string;
  buyerName:     string;
  sellerName:    string;
  amount:        number;
  currency:      string;
  status:        string;
  currentStatus: string;
  filedAt:       string;
}

// alias — CaseListItem નામથી import કરતા components માટે
export type CaseListItem = CaseList;

// ── Case Detail ───────────────────────────────────────────────
export interface CaseDetail extends CaseList {
  invoiceNo:          string;
  buyerGst:           string;
  buyerSme:           string;
  buyerJurisdiction:  string;
  buyerPhone:         string;
  buyerEmail:         string;
  sellerGst:          string;
  sellerSme:          string;
  sellerJurisdiction: string;
  sellerPhone:        string;
  sellerEmail:        string;
  cpoDetails?:        string;
  samadhanAppNo?:     string;
  checklist:          Checklist;
  queries:            CaseQuery[];
  history:            HistoryItem[];
}

export interface HistoryItem {
  status:    string;
  remarks:   string;
  changedAt: string;
}

// ── Dashboard ─────────────────────────────────────────────────
export interface MonthlyItem {
  month:  string;
  count:  number;
  amount: number;
}

export interface StatusChartItem {
  status: string;
  count:  number;
}

export interface Dashboard {
  totalCases:   number;
  activeCases:  number;
  inProcess:    number;
  totalQueries: number;
  settled:      number;
  pending:      number;
  totalAmount:  number;
  monthly:      MonthlyItem[];
  statusChart:  StatusChartItem[];
}

// alias — DashboardStats નામથી import કરતા components માટે
export type DashboardStats = Dashboard;

// ── Audit ─────────────────────────────────────────────────────
export interface AuditLog {
  id:        number;
  userId:    number;
  userEmail: string;
  eventType: string;
  refNo:     string;
  status:    string;
  details:   string;
  timestamp: string;
}

// ── User ─────────────────────────────────────────────────────
export interface UserItem {
  id:              number;
  name:            string;
  email:           string;
  role:            string;
  gstNo:           string;
  mobileNo:        string;
  isActive:        boolean;
  isEmailVerified: boolean;
  createdAt:       string;
}

// ── Grievance ─────────────────────────────────────────────────
export interface Grievance {
  id:          number;
  subject:     string;
  description: string;
  status:      string;
  createdAt:   string;
}