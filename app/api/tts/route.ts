import { NextRequest, NextResponse } from 'next/server';

// Gemini TTS returns raw PCM (24 kHz, 16-bit, mono). Wrap in WAV so the browser can play it.
function pcmToWav(pcmBase64: string): string {
  const pcmBytes = Buffer.from(pcmBase64, 'base64');
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const dataSize = pcmBytes.length;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(dataSize + 36, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE((sampleRate * numChannels * bitsPerSample) / 8, 28);
  header.writeUInt16LE((numChannels * bitsPerSample) / 8, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, pcmBytes]).toString('base64');
}

const TTS_MODELS = ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts', 'gemini-3.1-flash-tts-preview'];

// Aoede: warm female voice — best for Marathi/Hindi Devanagari across Gemini TTS
const VOICE = 'Aoede';

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: 'No API key' }, { status: 500 });

  let text: string;
  try {
    ({ text } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!text?.trim()) return NextResponse.json({ error: 'No text' }, { status: 400 });

  for (const model of TTS_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } },
              },
            },
          }),
          signal: AbortSignal.timeout(15000),
        }
      );

      if (!res.ok) continue; // 429 quota / 503 overload on one model: try the next

      const data = await res.json();
      const part = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (!part?.data) continue;

      const audioBase64 =
        part.mimeType === 'audio/pcm' ? pcmToWav(part.data) : part.data;
      const mimeType = part.mimeType === 'audio/pcm' ? 'audio/wav' : part.mimeType;

      return NextResponse.json({ audioBase64, mimeType });
    } catch {
      // timeout or network — try next model
    }
  }

  return NextResponse.json({ error: 'TTS unavailable' }, { status: 503 });
}
