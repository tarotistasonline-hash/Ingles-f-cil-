export type SkillLevel = 'cero' | 'principiante' | 'avanzado';

export interface PowerChunk {
  id: string;
  chunk: string;
  literalMeaning: string;
  realUse: string;
  category: 'starters' | 'polite' | 'opinions' | 'reactions' | 'casual' | 'fillers';
  level?: SkillLevel;
  phoneticSpelling?: string;
  examples: {
    en: string;
    es: string;
    soundTip?: string;
  }[];
  trapToAvoid: string;
}

export interface Scenario {
  id: string;
  title: string;
  tagline: string;
  image: string;
  persona: string;
  location: string;
  initialPrompt: string;
  initialEn: string;
  level?: SkillLevel;
  sampleResponses: {
    text: string;
    label: string;
    phonetic?: string;
  }[];
}

export interface RoleplayMessage {
  id: string;
  role: 'character' | 'user';
  text: string;
  audioBase64?: string;
  feedback?: {
    naturalness: 'excellent' | 'natural' | 'understandable_but_stiff' | 'needs_work';
    nativeAlternative: string;
    soundTip: string;
    whyExplanation: string;
  };
  timestamp: number;
}

export interface ConnectedSpeechLesson {
  id: string;
  title: string;
  subtitle: string;
  pattern: string;
  schoolVersion: string;
  nativePronunciation: string;
  spokenAudioText: string;
  phoneticGuide: string;
  explanation: string;
  level?: SkillLevel;
  examples: {
    formal: string;
    nativeSpoken: string;
    translation: string;
  }[];
}

export interface ReflexChallenge {
  id: string;
  situation: string;
  hintSpanish: string;
  expectedChunk: string;
  targetEnglish: string;
  audioPrompt: string;
  timeLimitSec: number;
  level?: SkillLevel;
}

export interface SpeakTweakResult {
  literalSchool: string;
  nativeReal: string;
  casualSlang: string;
  connectedSpeech: string;
  whyItSoundsNatural: string;
  powerChunk: string;
}

export interface EntrecasaPhrase {
  id: string;
  category: 'cocina_comida' | 'descanso_hogar' | 'favores_convivencia' | 'charlas_amigos';
  categoryLabel: string;
  spanishSituation: string;
  schoolStiff: string;
  entrecasaNative: string;
  pronunciationGuide: string;
  phoneticEasy?: string; // pronunciación figurada amigable para español ("JAI DER")
  cozyTip: string;
  audioText: string;
  level?: SkillLevel;
}

export interface SessionConfidenceFeedback {
  overallConfidenceScore: number;
  spontaneityScore: number;
  chunksScore: number;
  comfortScore: number;
  badgeTitle: string;
  keyStrength: string;
  topNativeTweak: {
    whatUserSaid: string;
    nativeUpgrade: string;
    whyItFlows: string;
  };
  summaryFeedback: string;
  recommendedNextStep: string;
}
