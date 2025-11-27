// ============================================================================
//  TAX MOGULS — FULL FEDERAL TAX ENGINE BACKEND (JSON_RESULT + SUMMARY)
//  Supports 2024 + 2025 IRS tables
//  IMPROVED: Bulletproof JSON extraction + sanitization
// ============================================================================

import express from "express";
import cors from "cors";
import axios from "axios";
import { z } from "zod";

const app = express();
app.use(express.json());

// =============================
// CORS
// =============================
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin))
        return cb(null, true);
      cb(new Error("CORS blocked"));
    },
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-embed-token"],
  })
);

app.options("*", cors());

// =============================
// AUTH
// =============================
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return next();
  if (process.env.EMBED_TOKEN) {
    const token = req.header("x-embed-token");
    if (token !== process.env.EMBED_TOKEN)
      return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// =============================
// PAYLOAD SCHEMA
// =============================
const Payload = z.object({
  tax_year: z.number().int().min(2020).max(2030).default(2025),
  filing_status: z.enum([
    "single",
    "married_joint",
    "married_separate",
    "hoh",
  ]),
  w2_wages: z.number().min(0).default(0),
  self_employment_net: z.number().min(0).default(0),
  self_employed: z.boolean().default(false),
  dependents: z.number().int().min(0).default(0),
  federal_withholding: z.number().min(0).default(0),
  unemployment: z.number().min(0).default(0),
  student_loan_interest: z.number().min(0).default(0),
});

// =============================
// CACHE
// =============================
const cache = new Map();
const CACHE_TTL = 60000;

function getCache(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.exp) return null;
  return hit.value;
}

function setCache(key, value) {
  cache.set(key, { value, exp: Date.now() + CACHE_TTL });
}

// =============================
// MAIN ENDPOINT
// =============================
app.post("/estimate", async (req, res) => {
  const parsed = Payload.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parsed.error.issues });

  const input = parsed.data;

  // language detection
  const inputLang = req.body.language;
  const acceptLang = req.headers["accept-language"] || "";
  const lang =
    inputLang || (acceptLang.startsWith("es") ? "es" : "en");

  const key = JSON.stringify({ ...input, lang });
  const cached = getCache(key);
  if (cached) return res.json(cached);

  // =====================================================================
  // PROMPT
  // =====================================================================
  const prompt = `
You are "Tax Moguls – U.S. Federal Refund Engine," a precise IRS-accurate AI.
You ALWAYS return ONLY JSON. Never return markdown, comments, or code blocks.

Return *strictly* this EXACT JSON shape:

{
  "json_result": {
    "estimate": {
      "refund_low": number,
      "refund_high": number,
      "breakdown": {
        "agi": number,
        "standard_deduction": number,
        "taxable_income": number,
        "tentative_tax": number,
        "se_tax": number,
        "credits": {
          "ctc_nonrefundable": number,
          "ctc_refundable": number,
          "odc": number,
          "eitc": number
        },
        "total_credits": number,
        "total_tax": number,
        "refundable_credits": number,
        "withholding": number
      }
    },
    "inputs": ${JSON.stringify(input)}
  },
  "summary": "Write a 3–5 sentence paragraph in ${
    lang === "es" ? "Spanish" : "English"
  } explaining the estimate in simple terms."
}

ONLY return JSON. Do not wrap in backticks.
INPUT: ${JSON.stringify(input)}
`;

  try {
    const up = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      { params: { key: process.env.GEMINI_API_KEY } }
    );

    const raw =
      up.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("🔥 RAW GEMINI OUTPUT:", raw);

    // =====================================================================
    // BULLETPROOF JSON EXTRACTOR
    // =====================================================================
    let clean = raw;

    // Remove any markdown fences/backticks
    clean = clean.replace(/```json/g, "");
    clean = clean.replace(/```/g, "");

    // Extract first JSON object
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("❌ No JSON object found");
      return res.status(500).json({
        error: "AI returned no valid JSON",
        raw,
      });
    }

    clean = match[0];

    // Remove trailing commas
    clean = clean.replace(/,\s*}/g, "}");
    clean = clean.replace(/,\s*]/g, "]");

    // Convert single → double quotes
    clean = clean.replace(/'/g, '"');

    // Validate and parse
    let json;
    try {
      json = JSON.parse(clean);
    } catch (e) {
      console.error("❌ JSON Parse Error:", clean);
      return res.status(500).json({
        error: "AI JSON parse failed",
        detail: e.message,
        raw,
      });
    }

    // =====================================================================
    // SUCCESS
    // =====================================================================
    setCache(key, json);
    return res.json(json);
  } catch (err) {
    console.error("Gemini API Error:", err?.response?.data || err.message);
    return res.status(500).json({
      error: "Upstream error",
      detail: err?.response?.data || err.message,
    });
  }
});

// =============================
app.get("/healthz", (_, res) => res.send("ok"));
app.listen(process.env.PORT || 8080, "0.0.0.0", () =>
  console.log(
    "🚀 Tax Moguls IRS Engine Live (JSON_RESULT + SUMMARY + HARDENED PARSER)"
  )
);
