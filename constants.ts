import { QuestionType, FilingStatus, TaxFormData } from "./types";

/* ============================================================
   MAIN QUESTION FLOW (STRICT ENUM VERSION)
============================================================ */

export const QUESTIONS = [
  {
    id: "tax_year",
    label: "What tax year are you filing for?",
    type: QuestionType.SELECT,
    required: true,
    helper:
      "Most people file for the most recent tax year. Default is 2025 unless you need to file for a previous year.",
    options: [
      { value: "2025", label: "2025 (current year)" },
      { value: "2024", label: "2024" },
      { value: "2023", label: "2023" },
    ],
  },

  {
    id: "filing_status",
    label: "What is your filing status?",
    type: QuestionType.SELECT,
    required: true,
    helper:
      "Your filing status determines your IRS tax bracket, standard deduction, and credit eligibility. If unsure, choose Single.",
    options: [
      { value: FilingStatus.SINGLE, label: "Single" },
      { value: FilingStatus.MFJ, label: "Married Filing Jointly" },
      { value: FilingStatus.MFS, label: "Married Filing Separately" },
      { value: FilingStatus.HOH, label: "Head of Household" },
    ],
  },

  {
    id: "age_primary",
    label: "How old are you?",
    type: QuestionType.NUMBER,
    required: true,
    helper:
      "Age impacts certain credits like the Earned Income Credit and retirement benefits.",
  },

  {
    id: "age_spouse",
    label: "How old is your spouse?",
    type: QuestionType.NUMBER,
    required: true,
    condition: (data: TaxFormData) =>
      data.filing_status === FilingStatus.MFJ,
    helper: "Only required if you're filing jointly.",
  },

  {
    id: "u17_dependents",
    label: "How many dependents are under age 17?",
    type: QuestionType.NUMBER,
    required: true,
    helper:
      "Dependents under age 17 may qualify for the Child Tax Credit.",
  },

  {
    id: "other_dependents",
    label: "How many other dependents?",
    type: QuestionType.NUMBER,
    required: true,
    helper:
      "Other dependents may qualify for the $500 Credit for Other Dependents.",
  },

  {
    id: "w2_wages",
    label: "How much did you earn from W-2 wages?",
    type: QuestionType.NUMBER,
    required: true,
    helper: "Enter the total from box 1 of all your W-2 forms.",
  },

  {
    id: "federal_withheld",
    label: "How much federal tax was withheld?",
    type: QuestionType.NUMBER,
    required: true,
    helper: "This is usually box 2 on your W-2.",
  },

  {
    id: "unemployment",
    label: "Did you receive unemployment income?",
    type: QuestionType.NUMBER,
    required: true,
    helper: "Enter total unemployment benefits received.",
  },

  {
    id: "student_loan_interest",
    label: "Did you pay student loan interest?",
    type: QuestionType.NUMBER,
    required: true,
    helper:
      "You may be eligible for a Student Loan Interest Deduction (max $2,500).",
  },

  {
    id: "self_employment_gross",
    label: "How much did you earn from self-employment?",
    type: QuestionType.NUMBER,
    required: true,
    helper: "This includes gig work, side jobs, freelance, and 1099 income.",
  },

  {
    id: "self_employment_expenses",
    label: "How much did you spend on business expenses?",
    type: QuestionType.NUMBER,
    required: true,
    helper:
      "Enter deductible expenses such as supplies, mileage, software, advertising, etc.",
  },

  {
    id: "childcare_expenses",
    label: "Did you pay for childcare?",
    type: QuestionType.NUMBER,
    required: true,
    helper:
      "Childcare expenses may qualify you for the Child & Dependent Care Credit.",
  },
];
