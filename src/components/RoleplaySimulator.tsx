import React, { useState, useEffect, useRef } from 'react';
import { SCENARIOS } from '../data/defaultData';
import { Scenario, RoleplayMessage, SessionConfidenceFeedback } from '../types';
import { sendRoleplayTurn, evaluateRoleplaySession } from '../services/api';
import { playEnglishVoice, createSpeechRecognizer, stopAllAudio, SPEED_LEVELS } from '../services/audio';
import { KeyTakeawaysToggle, TakeawayItem } from './KeyTakeawaysToggle';
import { triggerSuperConfetti, triggerConfetti } from '../utils/confetti';
import { recordRoleplayTurnEvent, recordRoleplaySessionEvaluation } from '../services/fluencyTracker';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  RefreshCw,
  Sparkles,
  MapPin,
  Award,
  ArrowRight,
  CheckCircle2,
  X,
  Gauge,
  PartyPopper,
} from 'lucide-react';

interface RoleplaySimulatorProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export const RoleplaySimulator: React.FC<RoleplaySimulatorProps> = ({
  currentSpeed,
  onSpeedChange,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voicePlayingId, setVoicePlayingId] = useState<string | null>(null);

  // Confidence Score state
  const [confidenceReport, setConfidenceReport] = useState<SessionConfidenceFeedback | null>(null);
  const [isEvaluatingConfidence, setIsEvaluatingConfidence] = useState(false);
  const [showConfidenceModal, setShowConfidenceModal] = useState(false);

  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const userMessagesCount = messages.filter((m) => m.role === 'user').length;

  // Initialize or reset scenario
  useEffect(() => {
    resetScenario(selectedScenario);
  }, [selectedScenario]);

  const resetScenario = (scenario: Scenario) => {
    stopAllAudio();
    const initialMsg: RoleplayMessage = {
      id: 'init-1',
      role: 'character',
      text: scenario.initialEn,
      timestamp: Date.now(),
    };
    setMessages([initialMsg]);
    setInputText('');
    setConfidenceReport(null);
    setShowConfidenceModal(false);
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleToggleMic = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer(
      (transcript) => {
        setInputText(transcript);
        setIsListening(false);
      },
      (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer) {
      recognitionRef.current = recognizer;
      try {
        recognizer.start();
        setIsListening(true);
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
        setIsListening(false);
      }
    } else {
      alert(
        'El reconocimiento de voz no está soportado en este navegador. Puedes escribir directamente en el campo de texto.'
      );
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: RoleplayMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);
    recordRoleplayTurnEvent();

    try {
      const response = await sendRoleplayTurn({
        scenarioId: selectedScenario.id,
        scenarioTitle: selectedScenario.title,
        scenarioPersona: selectedScenario.persona,
        history: newHistory.map((m) => ({ role: m.role, text: m.text })),
        userSpeech: text,
      });

      const characterReply: RoleplayMessage = {
        id: `char-${Date.now()}`,
        role: 'character',
        text: response.characterReply,
        feedback: response.userFeedback,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, characterReply]);

      // Automatically play the character's voice using beginner-friendly speed
      handlePlayVoice(response.characterReply, characterReply.id);
    } catch (err) {
      console.error('Error in roleplay turn:', err);
      const fallbackReply: RoleplayMessage = {
        id: `char-${Date.now()}`,
        role: 'character',
        text: "Got it! That sounds completely natural. Anything else I can help with?",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVoice = async (text: string, id: string, speedOverride?: number) => {
    setVoicePlayingId(id);
    try {
      await playEnglishVoice(text, 'Kore', speedOverride || currentSpeed);
    } finally {
      setVoicePlayingId(null);
    }
  };

  // Trigger Confidence Score feedback calculation
  const handleCalculateConfidence = async () => {
    if (userMessagesCount === 0) return;
    setIsEvaluatingConfidence(true);
    setShowConfidenceModal(true);

    try {
      const report = await evaluateRoleplaySession({
        scenarioTitle: selectedScenario.title,
        scenarioPersona: selectedScenario.persona,
        messages: messages.map((m) => ({ role: m.role, text: m.text })),
      });
      setConfidenceReport(report);
      recordRoleplaySessionEvaluation(report);
      // Trigger festive celebration for completing the roleplay conversation!
      triggerSuperConfetti();
    } catch (err) {
      console.error('Failed to evaluate session confidence:', err);
    } finally {
      setIsEvaluatingConfidence(false);
    }
  };

  const handleNextScenario = () => {
    const currentIndex = SCENARIOS.findIndex((s) => s.id === selectedScenario.id);
    const nextScenario = SCENARIOS[(currentIndex + 1) % SCENARIOS.length];
    setSelectedScenario(nextScenario);
  };

  return (
    <section id="simulator" className="py-12 sm:py-16 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-amber-400">
              <span>Práctica Conversacional Inmersiva</span>
              <span aria-hidden="true">·</span>
              <span>Medidor de Confianza y Fluidez</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Simulador de Situaciones de la Vida Real
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Habla o escribe con personajes nativos. Puedes ajustar la velocidad del audio a un ritmo pausado
              para entender cada sonido sin estrés, y revisar tu <strong className="text-white font-semibold">Confidence Score</strong> al terminar.
            </p>
          </div>

          {/* Speed & Confidence Score Trigger */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {/* Speed toggle for beginners with explicit labels */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 bg-[#14102E] px-3 py-1.5 rounded-xl border border-[#2D245A] text-xs text-slate-300 shadow-xs">
              <span className="text-amber-300 font-semibold flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Velocidad de audio:</span>
              </span>
              <div className="flex items-center gap-1">
                {SPEED_LEVELS.map((lvl) => {
                  const isSelected = currentSpeed === lvl.value;
                  return (
                    <button
                      key={lvl.value}
                      onClick={() => onSpeedChange(lvl.value)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-bold shadow-xs ring-1 ring-amber-300'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title={lvl.tag}
                    >
                      <span>{lvl.label}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-slate-950 font-bold' : 'text-slate-400'}`}>
                        ({lvl.shortTag})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confidence Score Action Button */}
            <button
              onClick={handleCalculateConfidence}
              disabled={userMessagesCount === 0 || isEvaluatingConfidence}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap ${
                userMessagesCount > 0
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-amber-400/10'
                  : 'bg-[#1A1440] text-slate-500 border border-[#2D245A] cursor-not-allowed'
              }`}
              title={
                userMessagesCount === 0
                  ? 'Responde al menos una vez para evaluar tu confianza'
                  : 'Calcular puntuación de confianza y flujo natural'
              }
            >
              <Award className="w-4 h-4" />
              <span>
                {isEvaluatingConfidence
                  ? 'Calculando fluidez...'
                  : confidenceReport
                  ? `Confianza: ${confidenceReport.overallConfidenceScore}%`
                  : 'Ver Mi Nivel de Confianza'}
              </span>
            </button>
          </div>
        </div>

        {/* Key Takeaways Toggle */}
        <KeyTakeawaysToggle
          moduleName="Simulador de Diálogos & Confidence Score"
          takeaways={[
            {
              point: 'El contexto reduce la carga cognitiva',
              highlight: 'Respuestas breves y naturales',
              explanation: 'En un café o en la cocina de casa con Sam, una respuesta corta como "Just tea, please" o "I\'m making pasta" es 100% natural. No necesitas estructurar párrafos complejos.',
            },
            {
              point: 'El Confidence Score premia el flujo, no la gramática de libro',
              highlight: 'Confidence Score %',
              explanation: 'El medidor analiza qué tan natural suena tu respuesta, premiando el uso de conectores coloquiales y frases de entrecasa por encima de la rigidez académica.',
            },
            {
              point: 'Ajusta la velocidad a tu nivel de inicio',
              highlight: '0.7x Principiante / 0.85x Intermedio',
              explanation: 'Si sientes que el nativo habla rápido, activa el modo Principiante (0.7x). Entenderás cada fonema sin frustración y ganarás seguridad para responder.',
            },
            {
              point: 'Usa preguntas de rebote para que la charla no muera',
              highlight: 'How about you? / What about yourself?',
              explanation: 'Una conversación fluye cuando devuelves la pelota. Tras responder tu parte, añade una pregunta corta para mantener el ida y vuelta.',
            },
          ]}
        />

        {/* Scenario Selection Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SCENARIOS.map((sc) => {
            const isSelected = selectedScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-[#1A1440] border-amber-400/80 shadow-md ring-1 ring-amber-400/40'
                    : 'bg-[#14102E]/70 border-[#281F54] hover:border-[#3B2D75] hover:bg-[#1A1440]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={sc.image}
                    alt={sc.title}
                    className="w-12 h-12 rounded-lg object-cover shrink-0 opacity-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {sc.title}
                      </h3>
                      {sc.level === 'cero' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          🌱 Desde Cero
                        </span>
                      )}
                      {sc.level === 'principiante' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ☕ Principiante
                        </span>
                      )}
                      {sc.level === 'avanzado' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          ⚡ Avanzado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{sc.persona}</p>
                    <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {sc.location}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Two-Zone Interactive Sandbox Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#14102E]/90 rounded-2xl border border-[#2D245A] shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Left / Visual Context Deck */}
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#281F54] p-6 flex flex-col justify-between bg-[#0C0A1D]/70">
            <div className="space-y-5">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] border border-[#281F54] shadow-xs">
                <img
                  src={selectedScenario.image}
                  alt={selectedScenario.title}
                  className="w-full h-full object-cover opacity-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A1D] via-[#0C0A1D]/30 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                      {selectedScenario.persona}
                    </p>
                    <p className="text-xs text-slate-300">{selectedScenario.tagline}</p>
                  </div>
                </div>
              </div>

              {/* Progress & Live Turns indicator */}
              <div className="bg-[#14102E] p-3.5 rounded-xl border border-[#281F54] flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Intercambios en la sesión
                  </span>
                  <span className="font-semibold text-slate-200">
                    {userMessagesCount} {userMessagesCount === 1 ? 'respuesta' : 'respuestas'} de tu parte
                  </span>
                </div>
                {userMessagesCount > 0 && (
                  <button
                    onClick={handleCalculateConfidence}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Evaluar fluidez</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Situación de partida
                </span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#14102E] p-3.5 rounded-xl border border-[#281F54]">
                  {selectedScenario.initialPrompt}
                </p>
              </div>

              {/* Quick suggestion chips */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  ¿Te quedaste en blanco? Prueba responder con:
                </span>
                <div className="space-y-1.5">
                  {selectedScenario.sampleResponses.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(sample.text)}
                      disabled={isLoading}
                      className="w-full text-left p-2.5 rounded-lg bg-[#14102E] hover:bg-[#1D1742] border border-[#281F54] hover:border-amber-400/50 text-xs text-slate-200 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-slate-100 group-hover:text-amber-300">
                          "{sample.text}"
                        </span>
                        <span className="text-[10px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/40">
                          {sample.label}
                        </span>
                      </div>
                      {sample.phonetic && (
                        <div className="text-[10px] text-emerald-300 font-mono-clean mt-1">
                          🔊 Pronunciación: {sample.phonetic}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#281F54] flex items-center justify-between">
              <button
                onClick={() => resetScenario(selectedScenario)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reiniciar conversación</span>
              </button>

              <button
                onClick={handleNextScenario}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Otro escenario</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right / Live Chat & Real-Time Feedback Deck */}
          <div className="lg:col-span-7 flex flex-col h-[580px] bg-[#14102E]/60">
            {/* Messages Stream */}
            <div
              ref={chatScrollRef}
              className="flex-1 p-5 overflow-y-auto space-y-4"
            >
              {messages.map((msg) => {
                const isChar = msg.role === 'character';
                return (
                  <div key={msg.id} className="space-y-2">
                    <div
                      className={`flex items-start gap-2.5 ${
                        isChar ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      {isChar && (
                        <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                          {selectedScenario.persona.charAt(0)}
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm shadow-xs ${
                          isChar
                            ? 'bg-[#1C1642] text-slate-100 border border-[#2F2563] rounded-tl-xs'
                            : 'bg-amber-400 text-slate-950 font-semibold rounded-tr-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span
                            className={`text-[11px] font-semibold ${
                              isChar ? 'text-amber-300' : 'text-slate-900 font-bold'
                            }`}
                          >
                            {isChar ? selectedScenario.persona : 'Tú'}
                          </span>
                          {isChar && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handlePlayVoice(msg.text, msg.id, 0.65)}
                                className="text-[10px] text-slate-400 hover:text-amber-300 px-1 py-0.5 rounded bg-[#130F30] border border-[#2D245A] cursor-pointer"
                                title="Escuchar en cámara lenta (0.65x)"
                              >
                                0.65x
                              </button>
                              <button
                                onClick={() => handlePlayVoice(msg.text, msg.id)}
                                className="text-slate-400 hover:text-white p-1 cursor-pointer"
                                title="Reproducir audio"
                              >
                                <Volume2
                                  className={`w-3.5 h-3.5 ${
                                    voicePlayingId === msg.id ? 'text-amber-400 animate-pulse' : ''
                                  }`}
                                />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    </div>

                    {/* Instant Feedback Card for User's Previous Turn */}
                    {isChar && msg.feedback && (
                      <div className="ml-9 mr-2 bg-amber-950/25 border border-amber-900/50 rounded-xl p-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-amber-300 font-semibold text-[11px]">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            Ajuste Nativo (Sin Gramática)
                          </span>
                          <span className="text-[10px] bg-[#14102E] px-2 py-0.5 rounded border border-amber-800/60 uppercase font-bold text-amber-400">
                            {msg.feedback.naturalness === 'excellent'
                              ? 'Excelente'
                              : 'Mejora con Bloque'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p className="text-slate-200 font-medium">
                            <strong className="text-amber-300">Cómo suena más natural: </strong>
                            "{msg.feedback.nativeAlternative}"
                          </p>
                          <p className="text-slate-400 leading-normal">
                            {msg.feedback.whyExplanation}
                          </p>
                        </div>

                        {msg.feedback.soundTip && (
                          <div className="pt-1.5 border-t border-amber-900/40 flex items-center gap-1.5 text-[11px] text-amber-300">
                            <strong className="font-semibold">Tip de oído:</strong>
                            <span>{msg.feedback.soundTip}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-400 pl-9 italic">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></div>
                  <span>{selectedScenario.persona} está respondiendo...</span>
                </div>
              )}
            </div>

            {/* Input & Mic Bar */}
            <div className="p-3.5 border-t border-[#281F54] bg-[#0C0A1D] flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMic}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 shadow-md animate-pulse'
                    : 'bg-[#14102E] text-slate-300 border-[#2D245A] hover:bg-[#1E1745] hover:text-white'
                }`}
                title={isListening ? 'Detener grabación' : 'Hablar en inglés (Micrófono)'}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4 text-amber-400" />
                )}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={
                  isListening
                    ? 'Escuchando tu inglés... habla ahora'
                    : 'Escribe o presiona el micro para responder en inglés...'
                }
                className="flex-1 bg-[#14102E] border border-[#2D245A] rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputText.trim()}
                className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 disabled:opacity-40 transition-colors cursor-pointer shadow-sm"
                title="Enviar respuesta"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Confidence Score Modal / Feedback Panel */}
        {showConfidenceModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-700 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-amber-400">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Evaluación de Confianza Conversacional</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">
                    Tu Nivel de Fluidez Natural
                  </h3>
                  <p className="text-xs text-slate-400">
                    Escenario: {selectedScenario.title} ({userMessagesCount} {userMessagesCount === 1 ? 'intervención' : 'intervenciones'})
                  </p>
                </div>
                <button
                  onClick={() => setShowConfidenceModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  title="Cerrar reporte"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isEvaluatingConfidence ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-8 h-8 rounded-full border-3 border-amber-400 border-t-transparent animate-spin mx-auto"></div>
                  <p className="text-sm font-semibold text-slate-200">
                    Analizando tu espontaneidad y bloques conversacionales...
                  </p>
                  <p className="text-xs text-slate-400">
                    Medición basada en flujo de la vida real, sin penalizaciones de examen.
                  </p>
                </div>
              ) : confidenceReport ? (
                <div className="space-y-6">
                  {/* Hero Percentage Card */}
                  <div className="bg-gradient-to-br from-amber-950/40 to-slate-950 rounded-2xl p-6 border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center sm:text-left">
                      <span className="text-xs font-semibold tracking-wider uppercase text-amber-400">
                        Confidence Score
                      </span>
                      <h4 className="font-display text-xl sm:text-2xl font-bold text-white">
                        {confidenceReport.badgeTitle}
                      </h4>
                      <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                        {confidenceReport.summaryFeedback}
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-amber-500/40 shadow-sm shrink-0 min-w-[130px] space-y-2">
                      <span className="font-mono text-4xl sm:text-5xl font-extrabold tabular-nums text-amber-400">
                        {confidenceReport.overallConfidenceScore}%
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Flujo Natural
                      </span>
                      <button
                        type="button"
                        onClick={() => triggerSuperConfetti()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/15 hover:bg-amber-400 hover:text-slate-950 text-amber-300 text-[11px] font-semibold transition-all cursor-pointer border border-amber-400/30"
                        title="Celebrar de nuevo con confeti"
                      >
                        <PartyPopper className="w-3 h-3" />
                        <span>¡Celebrar!</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Metric Breakdown Bars */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">Espontaneidad</span>
                        <span className="font-mono font-bold tabular-nums text-emerald-400">
                          {confidenceReport.spontaneityScore}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                          style={{ width: `${confidenceReport.spontaneityScore}%` }}
                        ></div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Respuesta rápida sin titubeos ni parálisis.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">Uso de Bloques</span>
                        <span className="font-mono font-bold tabular-nums text-amber-400">
                          {confidenceReport.chunksScore}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all duration-700"
                          style={{ width: `${confidenceReport.chunksScore}%` }}
                        ></div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Frases prefabricadas en lugar de palabras sueltas.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">Comodidad</span>
                        <span className="font-mono font-bold tabular-nums text-sky-400">
                          {confidenceReport.comfortScore}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-400 h-full rounded-full transition-all duration-700"
                          style={{ width: `${confidenceReport.comfortScore}%` }}
                        ></div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Seguridad para comunicar tu intención real.
                      </p>
                    </div>
                  </div>

                  {/* Key Strength Callout */}
                  <div className="bg-emerald-950/30 border border-emerald-900/60 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                        Tu Mayor Acierto en este Diálogo
                      </span>
                      <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                        {confidenceReport.keyStrength}
                      </p>
                    </div>
                  </div>

                  {/* Top Native Tweak Upgrade */}
                  {confidenceReport.topNativeTweak && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        El Próximo Salto de Calidad (Micro-Ajuste)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                            Tu frase:
                          </span>
                          <p className="font-medium text-slate-200">
                            "{confidenceReport.topNativeTweak.whatUserSaid}"
                          </p>
                        </div>
                        <div className="bg-amber-950/40 p-3 rounded-lg border border-amber-900/60">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-amber-400 uppercase font-bold">
                              Versión 100% nativa:
                            </span>
                            <button
                              onClick={() =>
                                playEnglishVoice(
                                  confidenceReport.topNativeTweak.nativeUpgrade,
                                  'Kore',
                                  currentSpeed
                                )
                              }
                              className="text-amber-400 hover:text-amber-300 cursor-pointer"
                              title="Escuchar audio"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="font-bold text-white">
                            "{confidenceReport.topNativeTweak.nativeUpgrade}"
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">
                        💡 {confidenceReport.topNativeTweak.whyItFlows}
                      </p>
                    </div>
                  )}

                  {/* Next Step Advice */}
                  <div className="p-3.5 bg-amber-950/30 rounded-xl border border-amber-900/60 text-xs text-amber-200 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold text-amber-300">Consejo de Oro: </strong>
                      {confidenceReport.recommendedNextStep}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => setShowConfidenceModal(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Seguir Conversando
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowConfidenceModal(false);
                          resetScenario(selectedScenario);
                        }}
                        className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Repetir Escenario
                      </button>
                      <button
                        onClick={() => {
                          setShowConfidenceModal(false);
                          handleNextScenario();
                        }}
                        className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>Siguiente Escenario</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
