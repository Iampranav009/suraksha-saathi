'use client';

import { useState } from 'react';
import Link from 'next/link';

type DrillState = 'idle' | 'ringing' | 'active' | 'pass' | 'fail';

const DRILL_SCRIPT = [
  'नमस्कार, मी SBI बँकेतून बोलतोय.',
  'तुमचे खाते संशयास्पद व्यवहारामुळे 10 मिनिटात बंद होणार आहे.',
  'खाते सुरक्षित ठेवण्यासाठी तुम्हाला आत्ता OTP सांगावा लागेल.',
  'तुमच्या फोनवर एक OTP आला असेल — तो मला सांगा.',
];

const LESSON = {
  title: 'हे एक बनावट कॉल होते! — This was a fake call!',
  points: [
    { mr: 'खरी बँक कधीही OTP मागत नाही.', en: 'Real banks never ask for OTP over the phone.' },
    { mr: '"10 मिनिटात बंद होईल" — ही घाई दाखवणे हे फसवणुकीचे लक्षण आहे.', en: '"Will be blocked in 10 minutes" — urgency is a scam tactic.' },
    { mr: 'संशयास्पद वाटल्यास फोन ठेवा आणि बँकेच्या अधिकृत क्रमांकावर फोन करा.', en: 'If suspicious, hang up and call the bank\'s official number.' },
  ],
  score: 'या आठवड्यात: 1 पैकी 0 पास — Week 1: 0 / 1 passed',
};

function speakText(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const mr = voices.find((v) => v.lang === 'mr-IN');
  const hi = voices.find((v) => v.lang === 'hi-IN');
  if (mr) utter.voice = mr;
  else if (hi) utter.voice = hi;
  utter.lang = mr ? 'mr-IN' : hi ? 'hi-IN' : 'en-IN';
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
}

function speakScript() {
  speakText(DRILL_SCRIPT.join(' '));
}

export default function DrillPage() {
  const [state, setState] = useState<DrillState>('idle');
  const [scriptLine, setScriptLine] = useState(0);
  const [reading, setReading] = useState(false);

  function startDrill() {
    setState('ringing');
    setTimeout(() => setState('active'), 1500);
  }

  function advanceScript() {
    if (scriptLine < DRILL_SCRIPT.length - 1) {
      setScriptLine((n) => n + 1);
    }
  }

  function handleSpeak() {
    setReading(true);
    speakText(DRILL_SCRIPT[scriptLine]);
    setTimeout(() => setReading(false), 3000);
  }

  function handleShareOTP() {
    window.speechSynthesis.cancel();
    setState('fail');
  }

  function handleHangUp() {
    window.speechSynthesis.cancel();
    setState('pass');
  }

  function reset() {
    setState('idle');
    setScriptLine(0);
    setReading(false);
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-blue-600 text-sm">← Back</Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">🔔 Scam Fire-Drill</h1>
          <p className="text-xs text-gray-500">सुरक्षा साथी — प्रशिक्षण</p>
        </div>
      </div>

      {/* IDLE */}
      {state === 'idle' && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏋️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">KYC Scam Drill</h2>
          <p className="text-gray-600 mb-2">
            तुम्हाला एक बनावट "SBI बँक" कॉल येईल.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            You will receive a simulated fake bank call. Practice how to respond.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left mb-6">
            <p className="text-sm font-semibold text-blue-800 mb-2">आठवड्याचे डाव — This week&apos;s drills</p>
            <div className="space-y-1">
              {['KYC Scam Call', 'Electricity Bill Threat', 'Digital Arrest', 'Pension Update Fraud'].map((d, i) => (
                <div key={d} className={`flex items-center gap-2 text-sm ${i === 0 ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>
                  <span>{i === 0 ? '▶' : '○'}</span>
                  {d}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={startDrill}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-xl"
          >
            सराव सुरू करा — Start Drill
          </button>
        </div>
      )}

      {/* RINGING */}
      {state === 'ringing' && (
        <div className="text-center py-16">
          <div className="text-7xl mb-4 animate-bounce">📞</div>
          <p className="text-2xl font-bold text-gray-900">Incoming Call…</p>
          <p className="text-gray-500 mt-2">+91-XXXX-XX1234 (Unknown)</p>
          <p className="text-sm text-blue-600 mt-4 animate-pulse">Connecting to drill…</p>
        </div>
      )}

      {/* ACTIVE — drill in progress */}
      {state === 'active' && (
        <div>
          <div className="bg-gray-900 rounded-2xl p-5 mb-5 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-lg">🤖</div>
              <div>
                <p className="font-semibold text-sm">SBI Bank Officer (AI)</p>
                <p className="text-xs text-gray-400">🔴 Live — Drill in progress</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 min-h-24 mb-4">
              <p className="text-gray-300 text-xs mb-2 uppercase tracking-wide">Scammer says:</p>
              <p className="text-white text-base leading-relaxed">{DRILL_SCRIPT[scriptLine]}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSpeak}
                disabled={reading}
                className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-sm py-2.5 rounded-lg"
              >
                {reading ? '🔊 बोलत आहे…' : '🔊 ऐका'}
              </button>
              {scriptLine < DRILL_SCRIPT.length - 1 && (
                <button
                  onClick={advanceScript}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2.5 rounded-lg"
                >
                  Next line →
                </button>
              )}
              <button
                onClick={speakScript}
                className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-2.5 rounded-lg"
              >
                Full script
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 font-medium mb-4">
            तुम्ही काय कराल? — What will you do?
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShareOTP}
              className="bg-red-100 border-2 border-red-300 hover:bg-red-200 text-red-800 font-semibold py-5 rounded-xl text-center"
            >
              <div className="text-2xl mb-1">📲</div>
              <div className="text-sm">OTP सांगतो</div>
              <div className="text-xs opacity-70">Share OTP</div>
            </button>
            <button
              onClick={handleHangUp}
              className="bg-green-100 border-2 border-green-300 hover:bg-green-200 text-green-800 font-semibold py-5 rounded-xl text-center"
            >
              <div className="text-2xl mb-1">📵</div>
              <div className="text-sm">फोन ठेवतो</div>
              <div className="text-xs opacity-70">Hang Up</div>
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            This is a safe training simulation. No real call, no real data.
          </p>
        </div>
      )}

      {/* FAIL */}
      {state === 'fail' && (
        <div>
          <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-5 mb-5">
            <div className="text-center mb-4">
              <span className="text-5xl">😟</span>
              <h2 className="text-xl font-bold text-red-800 mt-2">OTP दिला — Drill Failed</h2>
              <p className="text-red-700 text-sm mt-1">
                खऱ्या scammer ला OTP मिळाला असता!
              </p>
              <p className="text-gray-500 text-xs mt-1">In a real scam, the criminal would now have your OTP.</p>
            </div>

            <div className="bg-white rounded-xl p-4">
              <p className="font-bold text-gray-800 mb-3">{LESSON.title}</p>
              <ul className="space-y-3">
                {LESSON.points.map((p, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-red-500 font-bold shrink-0">{i + 1}.</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.mr}</p>
                      <p className="text-xs text-gray-500">{p.en}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 bg-red-100 rounded-xl px-4 py-3 text-center">
              <p className="text-red-800 font-bold text-sm">{LESSON.score}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">📱 Caregiver notification sent:</p>
            <p className="text-sm text-blue-700">
              &quot;Aaji fell for the KYC drill. Week 1: 0 / 1 passed. Lesson sent.&quot;
            </p>
          </div>

          <button
            onClick={reset}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl"
          >
            पुन्हा प्रयत्न करा — Try Again
          </button>
        </div>
      )}

      {/* PASS */}
      {state === 'pass' && (
        <div>
          <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-5 mb-5">
            <div className="text-center mb-4">
              <span className="text-5xl">🎉</span>
              <h2 className="text-xl font-bold text-green-800 mt-2">फोन ठेवला! — Drill Passed!</h2>
              <p className="text-green-700 text-sm mt-1">शाब्बास! तुम्ही scam ओळखला!</p>
              <p className="text-gray-500 text-xs mt-1">You correctly identified and refused a fake bank call.</p>
            </div>

            <div className="bg-white rounded-xl p-4">
              <p className="font-bold text-gray-800 mb-2">तुम्ही बरोबर केले कारण:</p>
              <ul className="space-y-2">
                {LESSON.points.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-green-500 font-bold shrink-0">✓</span>
                    <span className="text-gray-700">{p.mr}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 bg-green-100 rounded-xl px-4 py-3 text-center">
              <p className="text-green-800 font-bold text-sm">या आठवड्यात: 1 पैकी 1 पास ✓</p>
              <p className="text-green-700 text-xs">Week 1: 1 / 1 passed ✓</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">📱 Caregiver notification sent:</p>
            <p className="text-sm text-blue-700">
              &quot;Aaji passed the KYC drill! Week 1: 1 / 1 passed ✓&quot;
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={reset}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl text-sm"
            >
              पुन्हा — Retry
            </button>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm text-center"
            >
              SMS Checker →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
