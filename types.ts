// ============================================================================
//  UPDATED ENUMS
// ============================================================================

export enum FilingStatus {
  SINGLE = "single",
  MFJ = "married_joint",
  MFS = "married_separate",
  HOH = "hoh",
  QSS = "qss",
}

export enum QuestionType {
  NUMBER,
  SELECT,
  TEXT,
}

// ============================================================================
//  UPDATED TAX FORM DATA (frontend → backend)
// ============================================================================

export interface TaxFormData {
  tax_year: number;
  filing_status: FilingStatus;

  age_primary: number;
  age_spouse: number | null;

  u17_dependents: number;
  other_dependents: number;

  w2_wages: number;
  federal_withheld: number;

  self_employment_gross: number;
  self_employment_expenses: number;
  self_employment_net: number;

  unemployment: number;
  student_loan_interest: number;

  childcare_expenses: number;
}

// ============================================================================
//  TAX BREAKDOWN (backend → UI)
// ============================================================================

export interface TaxBreakdown {
  agi: number;
  standard_deduction: number;
  taxable_income: number;
  tentative_tax: number;
  se_tax: number;

  credits: {
    ctc_nonrefundable: number;
    ctc_refundable: number;
    odc: number;
    eitc: number;
  };

  total_credits: number;
  total_tax: number;
  refundable_credits: number;
  withholding: number;
}

// ============================================================================
//  BACKEND JSON RESULT (MATCHES NEW /estimate RESPONSE)
// ============================================================================

export interface JsonResult {
  refund_low: number;
  refund_high: number;
  breakdown: TaxBreakdown;
}

// ============================================================================
//  GEMINI RESPONSE (final UI object)
// ============================================================================

export interface GeminiResponse {
  json_result: JsonResult; // ⭐ EXACT backend shape
  summary: string;         // ⭐ New AI-written paragraph
}
