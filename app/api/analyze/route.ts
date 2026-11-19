import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithRules } from '@/lib/scamRules';

const MODELS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-flash-lite-latest'];

async function callGemini(prompt: string): Promise<{ explanation_mr: string; explanation_hi: string } | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 350 },
          }),
          signal: AbortSignal.timeout(8000),
        }
      );
      if (res.status === 503) continue; // try next model
      if (!res.ok) return null;
      const data = await res.json();
      const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch {
      // timeout or network — try next model
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  let body: { message?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 });
  }

  const rules = analyzeWithRules(message);

  const prompt = `You are a cyber fraud detection assistant. The message below has been classified as "${rules.level}" risk. Write a clear, simple 2-sentence explanation in Marathi (for a 65-year-old who is not tech-savvy) and one in Hindi explaining WHY it is ${rules.level} risk. Reply ONLY with valid JSON, no extra text:
{"explanation_mr":"<Marathi>","explanation_hi":"<Hindi>"}

Message: "${message.slice(0, 400)}"
Risk signals: ${rules.signals.map((s) => s.signal).join(', ')}`;

  const gemini = await callGemini(prompt);

  return NextResponse.json({
    ...rules,
    explanation_mr: gemini?.explanation_mr ?? null,
    explanation_hi: gemini?.explanation_hi ?? null,
  });
}
