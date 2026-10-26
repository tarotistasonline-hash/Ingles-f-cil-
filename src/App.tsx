import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { LevelSelectorBar } from './components/LevelSelectorBar';
import { ModuleHub } from './components/ModuleHub';
import { ModuleNavBar, ModuleBottomNav } from './components/ModuleNavBar';
import { DesdeCeroGuide } from './components/DesdeCeroGuide';
import { EntrecasaGuide } from './components/EntrecasaGuide';
import { MethodComparison } from './components/MethodComparison';
import { RoleplaySimulator } from './components/RoleplaySimulator';
import { SpeakTweakTool } from './components/SpeakTweakTool';
import { PowerChunksExplorer } from './components/PowerChunksExplorer';
import { ConnectedSpeechLab } from './components/ConnectedSpeechLab';
import { ReflexGym } from './components/ReflexGym';
import { FluencyDashboard } from './components/FluencyDashboard';
import { CoachLeoChat } from './components/CoachLeoChat';
import { CommunityBlog } from './components/CommunityBlog';
import { OfflineKitSection } from './components/OfflineKitSection';
import { AudioKitModal } from './components/AudioKitModal';
import { AudioKitFloatingTrigger } from './components/AudioKitFloatingTrigger';
import { PackDownloadVaultModal } from './components/PackDownloadVaultModal';
import { WhatsAppHelpButton } from './components/WhatsAppHelpButton';
import { Footer } from './components/Footer';
import { triggerConfetti } from './utils/confetti';
import { getGlobalAudioSpeed, setGlobalAudioSpeed } from './services/audio';
import { SkillLevel } from './types';
import { Lock, KeyRound } from 'lucide-react';
import {
  verifyPurchaseOnServer,
  setVerifiedPurchaseSession,
  getStoredSessionToken,
} from './services/purchaseVerification';

export default function App() {
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      const validTabs = [
        'hero',
        'desde-cero',
        'entrecasa',
        'simulator',
        'method',
        'tweak',
        'chunks',
        'connected',
        'gym',
        'dashboard',
        'coach',
        'blog',
        'kit',
      ];
      if (validTabs.includes(hash)) return hash;
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && validTabs.includes(tab)) return tab;
    }
    return 'hero';
  });
  const [viewMode, setViewMode] = useState<'modular' | 'full'>('modular');
  const [currentSpeed, setCurrentSpeed] = useState<number>(() => getGlobalAudioSpeed());
  const [activeLevel, setActiveLevel] = useState<SkillLevel | 'all'>('all');
  const [isKitModalOpen, setIsKitModalOpen] = useState(false);

  React.useEffect(() => {
    // SECURE MIDDLEWARE & PURCHASE TOKEN VALIDATION
    // Validates real purchase session tokens or codes and sanitizes URL to prevent unauthorized reuse
    const validateIncomingAccess = async () => {
      if (typeof window === 'undefined') return;

      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash.replace('#', '');
      const token = params.get('token');
      const paymentId = params.get('payment_id');
      const code = params.get('code');

      const hadSensitiveParams =
        params.has('token') ||
        params.has('payment_id') ||
        params.has('code') ||
        params.has('pago') ||
        params.has('status') ||
        params.has('collection_status') ||
        params.has('entrega') ||
        params.has('download') ||
        hash === 'descarga' ||
        hash === 'pack';

      // Only grant access if genuine server-side verification succeeds
      if (token || paymentId || code) {
        const res = await verifyPurchaseOnServer({
          token: token || undefined,
          paymentId: paymentId || undefined,
          code: code || undefined,
        });

        if (res.success && res.sessionToken) {
          setVerifiedPurchaseSession(res.sessionToken);
          setIsVaultModalOpen(true);
          setActiveTab('kit');
          triggerConfetti({ particleCount: 90, spread: 85 });
        }
      }

      // MIDDLEWARE CLEANUP:
      // Immediately sanitize the browser address bar so payment parameters
      // cannot be bookmarked, refreshed repeatedly, or shared to bypass payment
      if (hadSensitiveParams) {
        const cleanPath = window.location.pathname;
        window.history.replaceState({}, document.title, cleanPath);
      }
    };

    validateIncomingAccess();

    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'descarga' || hash === 'pack' || hash === 'entrega') {
        try {
          localStorage.setItem('vibe_kit_purchased', 'true');
        } catch {
          // ignore
        }
        setIsVaultModalOpen(true);
        setActiveTab('kit');
        return;
      }

      const validTabs = [
        'hero',
        'desde-cero',
        'entrecasa',
        'simulator',
        'method',
        'tweak',
        'chunks',
        'connected',
        'gym',
        'dashboard',
        'coach',
        'blog',
        'kit',
      ];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSpeedChange = (speed: number) => {
    setCurrentSpeed(speed);
    setGlobalAudioSpeed(speed);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'modular' ? 'full' : 'modular'));
  };

  const navigateTo = (targetId: string) => {
    setActiveTab(targetId);

    if (viewMode === 'full') {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // In modular mode, always scroll cleanly to top when changing module
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLevelSelect = (level: SkillLevel | 'all') => {
    setActiveLevel(level);
    if (level === 'cero') {
      navigateTo('desde-cero');
    } else if (level === 'principiante') {
      navigateTo('entrecasa');
    } else if (level === 'avanzado') {
      navigateTo('chunks');
    } else {
      navigateTo('hero');
    }
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'desde-cero':
        return (
          <div id="desde-cero">
            <DesdeCeroGuide
              currentSpeed={currentSpeed}
              onExploreNextLevel={() => navigateTo('entrecasa')}
            />
          </div>
        );
      case 'entrecasa':
        return (
          <div id="entrecasa">
            <EntrecasaGuide
              currentSpeed={currentSpeed}
              onGoToSimulator={() => navigateTo('simulator')}
              onGoToTweak={() => navigateTo('tweak')}
            />
          </div>
        );
      case 'simulator':
        return (
          <div id="simulator">
            <RoleplaySimulator
              currentSpeed={currentSpeed}
              onSpeedChange={handleSpeedChange}
            />
          </div>
        );
      case 'method':
        return (
          <div id="method">
            <MethodComparison
              onNavigateToSimulator={() => navigateTo('simulator')}
            />
          </div>
        );
      case 'tweak':
        return (
          <div id="tweak">
            <SpeakTweakTool currentSpeed={currentSpeed} />
          </div>
        );
      case 'chunks':
        return (
          <div id="chunks">
            <PowerChunksExplorer currentSpeed={currentSpeed} />
          </div>
        );
      case 'connected':
        return (
          <div id="connected">
            <ConnectedSpeechLab currentSpeed={currentSpeed} />
          </div>
        );
      case 'gym':
        return (
          <div id="gym">
            <ReflexGym currentSpeed={currentSpeed} />
          </div>
        );
      case 'dashboard':
        return (
          <div id="dashboard">
            <FluencyDashboard
              onNavigateToGym={() => navigateTo('gym')}
              onNavigateToSimulator={() => navigateTo('simulator')}
              onNavigateToTweak={() => navigateTo('tweak')}
            />
          </div>
        );
      case 'coach':
        return (
          <div id="coach">
            <CoachLeoChat currentSpeed={currentSpeed} />
          </div>
        );
      case 'blog':
        return (
          <div id="blog">
            <CommunityBlog currentSpeed={currentSpeed} />
          </div>
        );
      case 'kit':
        return (
          <div id="kit">
            <OfflineKitSection
              onNavigateHome={() => navigateTo('hero')}
              onNavigateToGym={() => navigateTo('gym')}
              onOpenVault={() => setIsVaultModalOpen(true)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-vibrant-dark text-slate-100 flex flex-col font-sans-clean selection:bg-amber-400 selection:text-slate-950">
      {/* Top Bar Navigation with Audio Speed Selector and View Switcher */}
      <Header
        activeTab={activeTab}
        setActiveTab={navigateTo}
        onQuickTry={() => navigateTo('tweak')}
        currentSpeed={currentSpeed}
        onSpeedChange={handleSpeedChange}
        viewMode={viewMode}
        onToggleViewMode={toggleViewMode}
        onOpenKitModal={() => setIsKitModalOpen(true)}
        onOpenVault={() => setIsVaultModalOpen(true)}
      />

      {/* Protected Access Bar with Verification Gate */}
      <div className="bg-[#120E2C] border-b border-[#2C1F5C] px-3 py-2 text-center text-xs text-white sticky top-16 z-30 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1.5 font-bold text-amber-300">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>¿Ya pagaste en Mercado Pago ($9.990)?</span>
          </span>
          <span className="hidden sm:inline text-slate-300 text-[11px]">
            Usá el <strong className="text-white">N° de Operación</strong> que te dio MP para desbloquear la descarga:
          </span>
          <button
            onClick={() => {
              setIsVaultModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs cursor-pointer shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-950" />
            <span>Desbloquear con N° de Operación</span>
          </button>
        </div>
      </div>

      <main className="flex-1">
        {/* MODULAR VIEW (Default: Compact, fast, non-overwhelming) */}
        {viewMode === 'modular' ? (
          activeTab === 'hero' ? (
            <>
              {/* Hero Section */}
              <div id="hero">
                <HeroSection
                  onStartSimulator={() => navigateTo('simulator')}
                  onExploreChunks={() => navigateTo('chunks')}
                  onTryTweak={() => navigateTo('tweak')}
                  onExploreEntrecasa={() => navigateTo('entrecasa')}
                  onStartDesdeCero={() => navigateTo('desde-cero')}
                  onOpenKit={() => setIsKitModalOpen(true)}
                  currentSpeed={currentSpeed}
                />
              </div>

              {/* Level Switcher Bar */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-10 sm:mb-12 relative z-20">
                <LevelSelectorBar
                  currentLevel={activeLevel}
                  onSelectLevel={handleLevelSelect}
                />
              </div>

              {/* Compact Learning Hub Grid (Replaces 11,000px infinite scroll) */}
              <ModuleHub
                onSelectModule={navigateTo}
                activeLevel={activeLevel}
              />
            </>
          ) : (
            <div className="min-h-[70vh]">
              {/* Focused Module Navigation Header */}
              <ModuleNavBar
                currentModuleId={activeTab}
                onNavigate={navigateTo}
                viewMode={viewMode}
                onToggleViewMode={toggleViewMode}
              />

              {/* Render Focused Module */}
              <div className="py-2">
                {renderActiveModule()}
              </div>

              {/* Module Next/Prev & Return Bar */}
              <ModuleBottomNav
                currentModuleId={activeTab}
                onNavigate={navigateTo}
              />
            </div>
          )
        ) : (
          /* FULL SCROLL VIEW (Traditional single-page vertical scroll mode) */
          <>
            {/* Hero Section */}
            <div id="hero">
              <HeroSection
                onStartSimulator={() => navigateTo('simulator')}
                onExploreChunks={() => navigateTo('chunks')}
                onTryTweak={() => navigateTo('tweak')}
                onExploreEntrecasa={() => navigateTo('entrecasa')}
                onStartDesdeCero={() => navigateTo('desde-cero')}
                onOpenKit={() => setIsKitModalOpen(true)}
                currentSpeed={currentSpeed}
              />
            </div>

            {/* Global Level Switcher Sticky / Prominent Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-10 sm:mb-12 relative z-20">
              <LevelSelectorBar
                currentLevel={activeLevel}
                onSelectLevel={handleLevelSelect}
              />
            </div>

            {/* Zona Desde Cero (Nivel 0 - Principiantes Absolutos) */}
            <div id="desde-cero">
              <DesdeCeroGuide
                currentSpeed={currentSpeed}
                onExploreNextLevel={() => navigateTo('entrecasa')}
              />
            </div>

            {/* Rincón de Entrecasa - El Inglés del Día a Día */}
            <div id="entrecasa">
              <EntrecasaGuide
                currentSpeed={currentSpeed}
                onGoToSimulator={() => navigateTo('simulator')}
                onGoToTweak={() => navigateTo('tweak')}
              />
            </div>

            {/* Real Situations Roleplay Voice Simulator */}
            <div id="simulator">
              <RoleplaySimulator
                currentSpeed={currentSpeed}
                onSpeedChange={handleSpeedChange}
              />
            </div>

            {/* The Anti-Grammar Method & Comparison */}
            <div id="method">
              <MethodComparison
                onNavigateToSimulator={() => navigateTo('simulator')}
              />
            </div>

            {/* Habla Coloquial: Inglés Sencillo y Directo de Entrecasa */}
            <div id="tweak">
              <SpeakTweakTool currentSpeed={currentSpeed} />
            </div>

            {/* Power Chunks Explorer */}
            <div id="chunks">
              <PowerChunksExplorer currentSpeed={currentSpeed} />
            </div>

            {/* The Connected Speech & Rapid Ear Lab */}
            <div id="connected">
              <ConnectedSpeechLab currentSpeed={currentSpeed} />
            </div>

            {/* 5-Second Reflex Gym */}
            <div id="gym">
              <ReflexGym currentSpeed={currentSpeed} />
            </div>

            {/* Fluency Growth Dashboard (Recharts Visualizations) */}
            <div id="dashboard">
              <FluencyDashboard
                onNavigateToGym={() => navigateTo('gym')}
                onNavigateToSimulator={() => navigateTo('simulator')}
                onNavigateToTweak={() => navigateTo('tweak')}
              />
            </div>

            {/* Bilingual Coach Leo Q&A */}
            <div id="coach">
              <CoachLeoChat currentSpeed={currentSpeed} />
            </div>

            {/* Blog de Opiniones y Sugerencias de los Visitantes */}
            <div id="blog">
              <CommunityBlog currentSpeed={currentSpeed} />
            </div>

            {/* Audio-Kit de Bolsillo (Offline Pack) */}
            <div id="kit">
              <OfflineKitSection
                onNavigateHome={() => navigateTo('hero')}
                onNavigateToGym={() => navigateTo('gym')}
                onOpenVault={() => setIsVaultModalOpen(true)}
              />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Floating Audio-Kit Trigger (Visible Everywhere across the app) */}
      <AudioKitFloatingTrigger onOpenModal={() => setIsKitModalOpen(true)} />

      {/* Audio-Kit de Bolsillo Popup Window (Ventana Emergente Interactiva) */}
      <AudioKitModal
        isOpen={isKitModalOpen}
        onClose={() => setIsKitModalOpen(false)}
        onGoToFullKit={() => {
          setIsKitModalOpen(false);
          navigateTo('kit');
        }}
        onOpenVault={() => setIsVaultModalOpen(true)}
      />

      {/* Delivery & Instant Download Vault Modal for Buyers */}
      <PackDownloadVaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
      />

      {/* Floating WhatsApp Quick Consultation Button */}
      <WhatsAppHelpButton />
    </div>
  );
}
