import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });

export interface LineItem {
  description: string;
  quantity: number | null;
  unit_price: number | null;
  amount: number | null;
}

export interface ExtractedInvoice {
  vendor_name: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  due_date: string | null;
  line_items: LineItem[];
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  currency: string | null;
  notes: string | null;
}

const EMPTY: ExtractedInvoice = {
  vendor_name: null,
  invoice_number: null,
  invoice_date: null,
  due_date: null,
  line_items: [],
  subtotal: null,
  tax: null,
  total: null,
  currency: null,
  notes: null,
};

const PROMPT = `Extract all invoice details from this document and return ONLY a valid JSON object with this exact structure (use null for any field you cannot find):
{
  "vendor_name": string | null,
  "invoice_number": string | null,
  "invoice_date": string | null,
  "due_date": string | null,
  "line_items": [{ "description": string, "quantity": number | null, "unit_price": number | null, "amount": number | null }],
  "subtotal": number | null,
  "tax": number | null,
  "total": number | null,
  "currency": string | null,
  "notes": string | null
}
Return only the JSON — no markdown fences, no explanation.`;

export async function extractInvoiceData(
  fileBuffer: Buffer,
  mimeType: string,
): Promise<ExtractedInvoice> {
  const base64 = fileBuffer.toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      { inlineData: { data: base64, mimeType } },
      PROMPT,
    ],
  });

  const text = response.text ?? "";

  try {
    // Strip accidental markdown fences if the model includes them
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    return JSON.parse(cleaned) as ExtractedInvoice;
  } catch {
    return EMPTY;
  }
}
