// ============================================================================
//  TAX MOGULS — FRONTEND GEMINI SERVICE (FINAL STABLE VERSION)
//  Detects backend errors, stabilizes parsing, prevents false zero refunds.
// ============================================================================

import { TaxFormData, GeminiResponse, TaxBreakdown } from "../types";

const API = import.meta.env.VITE_API_URL;
const EMBED_TOKEN = import.meta.env.VITE_EMBED_TOKEN;

// ============================================================================
// RATE LIMIT
// ============================================================================
const MAX_CALLS_PER_MIN = 5;
const RATE_KEY = "gemini_device_rate_history_v1";

function checkDeviceRateLimit() {
  const now = Date.now();
  const oneMinAgo = now - 60000;

  let history: number[] = [];
  try {
    history = JSON.parse(localStorage.getItem(RATE_KEY) || "[]");
  } catch {}

  const recent = history.filter((t) => t > oneMinAgo);
  if (recent.length >= MAX_CALLS_PER_MIN)
    throw new Error("Too many requests. Please wait a moment.");

  history = [...recent, now];
  localStorage.setItem(RATE_KEY, JSON.stringify(history));
}

// ============================================================================
// CACHE
// ============================================================================
const CACHE_KEY = "gemini_tax_cache_v1";

function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCache(c: any) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(c));
}

function simpleHash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return String(h | 0);
}

// ============================================================================
// PAYLOAD MAPPER (Matches Backend Exactly)
// ============================================================================
function mapToProxyPayload(d: TaxFormData) {
  return {
    tax_year: Number(d.tax_year),
    filing_status: d.filing_status,
    w2_wages: Number(d.w2_wages || 0),
    unemployment: Number(d.unemployment || 0),
    student_loan_interest: Number(d.student_loan_interest || 0),

    dependents:
      Number(d.u17_dependents || 0) + Number(d.other_dependents || 0),

    self_employment_net: Number(d.self_employment_net || 0),
    self_employed: Number(d.self_employment_net || 0) > 0,

    // FIXED
    federal_withholding:
      Number(d.federal_withholding ?? d.federal_withheld ?? 0),

    language:
      (navigator.language || "").startsWith("es") ? "es" : "en",
  };
}

// ============================================================================
// MAIN API CALL
// ============================================================================
export default async function getGeminiResponse(
  userData: TaxFormData
): Promise<GeminiResponse> {
  if (!API) throw new Error("VITE_API_URL missing");

  checkDeviceRateLimit();

  // cache
  const cacheKey = simpleHash(JSON.stringify(userData));
  const cache = loadCache();
  if (cache[cacheKey]) return cache[cacheKey];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const payload = mapToProxyPayload(userData);
    console.log("📤 Sending Payload:", payload);

    const res = await fetch(`${API}/estimate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-embed-token": EMBED_TOKEN,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const raw = await res.json();
    console.log("📥 Raw Backend Response:", raw);

    // ============================================================================
    // BACKEND ERROR DETECTION
    // ============================================================================
    if (raw.error) {
      console.error("❌ Backend error:", raw);
      throw new Error(raw.error || "Backend error.");
    }

    // ============================================================================
    // STRICT PARSING — BACKEND ALWAYS RETURNS:
    // json_result.estimate
    // ============================================================================
    const est = raw?.json_result?.estimate;

    if (!est) {
      console.error("❌ BACKEND DID NOT RETURN ESTIMATE:", raw);
      throw new Error(
        "Backend returned invalid estimate. AI likely produced invalid JSON."
      );
    }

    const breakdown: TaxBreakdown = est.breakdown || {
      agi: 0,
      standard_deduction: 0,
      taxable_income: 0,
      tentative_tax: 0,
      se_tax: 0,
      credits: {
        ctc_nonrefundable: 0,
        ctc_refundable: 0,
        odc: 0,
        eitc: 0,
      },
      total_credits: 0,
      refundable_credits: 0,
      withholding: 0,
      total_tax: 0,
    };

    const finalResponse: GeminiResponse = {
      json_result: {
        inputs: userData,
        estimate: {
          refund_low: Number(est.refund_low),
          refund_high: Number(est.refund_high),
          breakdown,
        },
        disclaimer: "",
      },
      summary: raw.summary || "",
    };

    console.log("✅ Parsed Response:", finalResponse);

    cache[cacheKey] = finalResponse;
    saveCache(cache);

    return finalResponse;
  } finally {
    clearTimeout(timeout);
  }
}
