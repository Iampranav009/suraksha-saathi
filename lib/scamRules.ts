export type RiskLevel = 'red' | 'yellow' | 'green';

export interface ScamSignal {
  signal: string;
  mr: string;
}

export interface RulesResult {
  level: RiskLevel;
  signals: ScamSignal[];
  safeAction: string;
  safeAction_mr: string;
}

const OTP_RE = /\b(otp|pin|cvv|password|passcode|upi\s*pin|atm\s*pin)\b/i;
const URGENCY_RE = /\b(urgent|immediately|tonight|today|10\s*min|blocked|suspended|freeze|deactivate|expire|last\s*chance|within\s*\d+|band\s*honar)\b/i;
const AUTHORITY_RE = /\b(cbi|ed|enforcement|police|court|arrest|ibo|ministry|government|govt|rbi|sebi|income\s*tax|cyber\s*cell|customs)\b/i;
const LINK_RE = /https?:\/\/(?!(?:www\.)?(sbi\.co\.in|hdfcbank|icicibank|axisbank|kotakbank|pnbindia|bankofbaroda|irdai\.gov|uidai\.gov|npci\.org\.in|bhimupi|gov\.in))[^\s]+/i;
const MONEY_RE = /\b(prize|won|winner|lottery|lucky\s*draw|cashback|refund|reward|free\s*gift|lucky|bumper)\b/i;
const COLLECT_RE = /\b(collect\s*request|collect\s*₹|collect\s*rs|pay\s*₹\s*1|pay\s*re\s*1|upi\s*collect|receive\s*money.*accept)\b/i;
const FAKE_JOB_RE = /\b(work\s*from\s*home|part\s*time.*earn|registration\s*fee|joining\s*fee|training\s*fee|job\s*offer.*pay)\b/i;
const FAKE_STORE_RE = /\b(instagram.*order|order.*instagram|advance\s*payment.*deliver|delivery\s*charge.*extra|cod\s*not\s*available)\b/i;

export function analyzeWithRules(message: string): RulesResult {
  const signals: ScamSignal[] = [];
  const lower = message.toLowerCase();

  if (OTP_RE.test(lower)) {
    signals.push({ signal: 'Requests OTP, PIN, or password', mr: 'OTP किंवा PIN मागत आहे' });
  }
  if (AUTHORITY_RE.test(lower)) {
    signals.push({ signal: 'Claims government or law enforcement authority', mr: 'सरकारी अधिकाराचा आव आणत आहे' });
  }
  if (URGENCY_RE.test(lower) && signals.length > 0) {
    signals.push({ signal: 'Uses urgency or threat to pressure you', mr: 'घाई आणि भीती दाखवत आहे' });
  }
  if (LINK_RE.test(message)) {
    signals.push({ signal: 'Contains an unverified link', mr: 'संशयास्पद लिंक आहे' });
  }
  if (COLLECT_RE.test(lower)) {
    signals.push({ signal: 'UPI collect request — money goes OUT, not in', mr: 'UPI कलेक्ट विनंती — पैसे जातील, येणार नाहीत' });
  }
  if (MONEY_RE.test(lower)) {
    signals.push({ signal: 'Unexpected prize or money offer', mr: 'अनपेक्षित बक्षीस किंवा पैशाचे आमिष' });
  }
  if (FAKE_JOB_RE.test(lower)) {
    signals.push({ signal: 'Fake job offer asking for upfront payment', mr: 'बनावट नोकरीची ऑफर — आधी पैसे मागत आहे' });
  }
  if (FAKE_STORE_RE.test(lower)) {
    signals.push({ signal: 'Suspicious online store payment pattern', mr: 'बनावट ऑनलाइन स्टोअरची शक्यता' });
  }

  const isRed =
    OTP_RE.test(lower) ||
    AUTHORITY_RE.test(lower) ||
    COLLECT_RE.test(lower) ||
    (URGENCY_RE.test(lower) && LINK_RE.test(message));

  if (isRed) {
    return {
      level: 'red',
      signals: signals.length ? signals : [{ signal: 'High-risk fraud pattern detected', mr: 'धोकादायक फसवणुकीचे संकेत आढळले' }],
      safeAction: 'Do not share any information. Hang up or ignore. Call your bank on its official number.',
      safeAction_mr: 'थांबा! कोणतीही माहिती देऊ नका. फोन ठेवा किंवा संदेश दुर्लक्षित करा. बँकेच्या अधिकृत क्रमांकावरच फोन करा.',
    };
  }

  const isYellow = signals.length > 0 || LINK_RE.test(message) || MONEY_RE.test(lower) || FAKE_JOB_RE.test(lower);

  if (isYellow) {
    if (!signals.length) {
      signals.push({ signal: 'Contains unverified link or unexpected offer', mr: 'संशयास्पद लिंक किंवा अनपेक्षित ऑफर' });
    }
    return {
      level: 'yellow',
      signals,
      safeAction: 'Do not click any links. Verify by calling the sender on their official number before acting.',
      safeAction_mr: 'कोणत्याही लिंकवर क्लिक करू नका. कारवाई करण्यापूर्वी अधिकृत क्रमांकावर पडताळणी करा.',
    };
  }

  return {
    level: 'green',
    signals: [{ signal: 'No obvious fraud signals detected', mr: 'स्पष्ट फसवणुकीचे संकेत आढळले नाहीत' }],
    safeAction: 'Stay alert. If anything feels wrong, ask a family member before acting.',
    safeAction_mr: 'सावध राहा. काही शंका असल्यास कारवाई करण्यापूर्वी कुटुंबातील सदस्याला विचारा.',
  };
}
