'use client';

import { useState } from 'react';
import Link from 'next/link';
import { sampleMessages } from '@/data/sampleMessages';
import type { RiskLevel, ScamSignal } from '@/lib/scamRules';

interface AnalyzeResult {
  level: RiskLevel;
  signals: ScamSignal[];
  safeAction: string;
  safeAction_mr: string;
  explanation_mr: string | null;
  explanation_hi: string | null;
}

const RISK_CONFIG = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    badge: 'bg-red-600 text-white',
    icon: '🚨',
    label: 'धोका — SCAM',
    mr: 'हा संदेश संशयास्पद आहे!',
    textColor: 'text-red-800',
    signalBg: 'bg-red-100 text-red-800',
  },
  yellow: {
    bg: 'bg-amber-50',
    border: 'border-amber-500',
    badge: 'bg-amber-500 text-white',
    icon: '⚠️',
    label: 'सावधान — CAUTION',
    mr: 'पडताळणी करा, घाई करू नका',
    textColor: 'text-amber-800',
    signalBg: 'bg-amber-100 text-amber-800',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    badge: 'bg-green-600 text-white',
    icon: '✅',
    label: 'सुरक्षित — SAFE',
    mr: 'स्पष्ट धोका आढळला नाही',
    textColor: 'text-green-800',
    signalBg: 'bg-green-100 text-green-800',
  },
};

async function speakMarathi(text: string) {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const { audioBase64, mimeType } = await res.json();
      const audio = new Audio(`data:${mimeType};base64,${audioBase64}`);
      audio.play();
      return;
    }
  } catch { /* fall through */ }
  // Fallback: Web Speech API
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const mr = voices.find((v) => v.lang === 'mr-IN');
  const hi = voices.find((v) => v.lang === 'hi-IN');
  if (mr) utter.voice = mr;
  else if (hi) utter.voice = hi;
  utter.lang = mr ? 'mr-IN' : hi ? 'hi-IN' : 'en-IN';
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
}

export default function Home() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState('');
  const [speaking, setSpeaking] = useState(false);

  async function handleCheck() {
    if (!message.trim()) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error('Server error');
      setResult(await res.json());
    } catch {
      setError('Could not check the message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSpeak() {
    if (!result) return;
    const text =
      result.explanation_mr ||
      result.safeAction_mr ||
      RISK_CONFIG[result.level].mr;
    setSpeaking(true);
    await speakMarathi(text);
    setTimeout(() => setSpeaking(false), 1000);
  }

  const cfg = result ? RISK_CONFIG[result.level] : null;

  return (
    <main className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">सुरक्षा साथी</h1>
          <p className="text-sm text-gray-500">Suraksha Saathi</p>
        </div>
        <Link
          href="/drill"
          className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-700"
        >
          🔔 Scam Fire-Drill
        </Link>
      </div>

      <p className="text-gray-600 text-sm mb-5">
        संशयास्पद SMS किंवा WhatsApp संदेश इथे पेस्ट करा आणि तपासा.
        <br />
        <span className="text-gray-400">Paste any suspicious SMS or message below.</span>
      </p>

      {/* Sample messages */}
      <div className="mb-3">
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Demo messages — tap to load</p>
        <div className="flex flex-wrap gap-2">
          {sampleMessages.map((s) => (
            <button
              key={s.label}
              onClick={() => { setMessage(s.text); setResult(null); }}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                s.badge === 'RED'
                  ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                  : s.badge === 'YELLOW'
                  ? 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'
                  : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
              }`}
            >
              {s.badge === 'RED' ? '🚨' : s.badge === 'YELLOW' ? '⚠️' : '✅'} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <textarea
        value={message}
        onChange={(e) => { setMessage(e.target.value); setResult(null); }}
        placeholder="संदेश इथे पेस्ट करा… (Paste message here)"
        rows={5}
        className="w-full border border-gray-300 rounded-xl p-4 text-base text-gray-900 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
      />

      <button
        onClick={handleCheck}
        disabled={!message.trim() || loading}
        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold text-lg py-4 rounded-xl transition-colors"
      >
        {loading ? '…तपासत आहे' : '🔍 संदेश तपासा — Check Message'}
      </button>

      {error && <p className="mt-3 text-red-600 text-sm text-center">{error}</p>}

      {/* Result */}
      {result && cfg && (
        <div className={`mt-5 rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-5`}>
          {/* Risk badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{cfg.icon}</span>
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${cfg.badge}`}>
                {cfg.label}
              </span>
              <p className={`mt-1 text-lg font-bold ${cfg.textColor}`}>{cfg.mr}</p>
            </div>
          </div>

          {/* Signals */}
          {result.signals.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                संकेत — Warning signs
              </p>
              <ul className="space-y-2">
                {result.signals.map((s, i) => (
                  <li key={i} className={`flex gap-2 items-start rounded-lg px-3 py-2 ${cfg.signalBg}`}>
                    <span className="mt-0.5 shrink-0">•</span>
                    <div>
                      <p className="text-sm font-medium">{s.mr}</p>
                      <p className="text-xs opacity-70">{s.signal}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Marathi explanation from Gemini */}
          {result.explanation_mr && (
            <div className="mb-4 bg-white bg-opacity-60 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">स्पष्टीकरण</p>
              <p className={`text-base ${cfg.textColor}`}>{result.explanation_mr}</p>
            </div>
          )}

          {/* Safe action */}
          <div className="bg-white bg-opacity-70 rounded-xl p-3 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">काय करावे — What to do</p>
            <p className={`text-base font-semibold ${cfg.textColor}`}>{result.safeAction_mr}</p>
            <p className="text-sm text-gray-500 mt-1">{result.safeAction}</p>
          </div>

          {/* Audio button */}
          <button
            onClick={handleSpeak}
            className={`w-full py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 ${
              speaking
                ? 'bg-gray-200 text-gray-500'
                : 'bg-white border-2 border-current hover:bg-opacity-80 ' + cfg.textColor
            }`}
          >
            🔊 {speaking ? 'बोलत आहे…' : 'मराठीत ऐका — Listen in Marathi'}
          </button>

          <p className="mt-3 text-center text-sm text-gray-500">
            Cyber fraud helpline: <span className="font-bold text-gray-700">1930</span>
          </p>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/drill" className="text-blue-600 text-sm underline">
          → Try the Scam Fire-Drill demo
        </Link>
      </div>

      <section className="mt-10" aria-labelledby="demo-video-title">
        <h2 id="demo-video-title" className="text-lg font-bold text-gray-900">
          डेमो व्हिडिओ — Watch the demo
        </h2>
        <p className="text-sm text-gray-500 mb-3">How Suraksha Saathi works, in 2 minutes.</p>
        {/* preload="none": nothing downloads until play, so the checker stays fast */}
        <video
          className="w-full aspect-video rounded-xl bg-gray-200 shadow-sm"
          src="/video/suraksha-saathi-demo.mp4"
          poster="/video/suraksha-saathi-demo-poster.jpg"
          width={1280}
          height={720}
          controls
          playsInline
          preload="none"
        />
      </section>
    </main>
  );
}
