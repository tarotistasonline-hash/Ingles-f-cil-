import React, { useState, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { LevelSelectorBar } from './components/LevelSelectorBar';
import { ModuleHub } from './components/ModuleHub';
import { ModuleNavBar, ModuleBottomNav } from './components/ModuleNavBar';
import { AudioKitFloatingTrigger } from './components/AudioKitFloatingTrigger';
import { WhatsAppHelpButton } from './components/WhatsAppHelpButton';
import { Footer } from './components/Footer';
import { triggerConfetti } from './utils/confetti';

const lazyNamed = <T extends React.ComponentType<any>>(
  loader: () => Promise<Record<string, any>>,
  exportName: string
) =>
  lazy(async () => {
    const mod = await loader();
    return { default: mod[exportName] as T };
  });

const DesdeCeroGuide = lazyNamed(() => import('./components/DesdeCeroGuide'), 'DesdeCeroGuide');
const EntrecasaGuide = lazyNamed(() => import('./components/EntrecasaGuide'), 'EntrecasaGuide');
const MethodComparison = lazyNamed(() => import('./components/MethodComparison'), 'MethodComparison');
const RoleplaySimulator = lazyNamed(() => import('./components/RoleplaySimulator'), 'RoleplaySimulator');
const SpeakTweakTool = lazyNamed(() => import('./components/SpeakTweakTool'), 'SpeakTweakTool');
const PowerChunksExplorer = lazyNamed(() => import('./components/PowerChunksExplorer'), 'PowerChunksExplorer');
const ConnectedSpeechLab = lazyNamed(() => import('./components/ConnectedSpeechLab'), 'ConnectedSpeechLab');
const ReflexGym = lazyNamed(() => import('./components/ReflexGym'), 'ReflexGym');
const FluencyDashboard = lazyNamed(() => import('./components/FluencyDashboard'), 'FluencyDashboard');
const CoachLeoChat = lazyNamed(() => import('./components/CoachLeoChat'), 'CoachLeoChat');
const CommunityBlog = lazyNamed(() => import('./components/CommunityBlog'), 'CommunityBlog');
const OfflineKitSection = lazyNamed(() => import('./components/OfflineKitSection'), 'OfflineKitSection');
const CinemaEarLab = lazyNamed(() => import('./components/CinemaEarLab'), 'CinemaEarLab');
const MusicEarLab = lazyNamed(() => import('./components/MusicEarLab'), 'MusicEarLab');
const AudioKitModal = lazyNamed(() => import('./components/AudioKitModal'), 'AudioKitModal');
const PackDownloadVaultModal = lazyNamed(() => import('./components/PackDownloadVaultModal'), 'PackDownloadVaultModal');

const ModuleLoader: React.FC = () => (
  <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
    <div className="w-8 h-8 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
    <span className="text-xs font-medium">Cargando módulo...</span>
  </div>
);
import { getGlobalAudioSpeed, setGlobalAudioSpeed } from './services/audio';
import { SkillLevel } from './types';
import {
  verifyPurchaseOnServer,
  setVerifiedPurchaseSession,
  getStoredSessionToken,
} from './services/purchaseVerification';
import { recordVisit } from './services/visitorTracker';
import { initWelcomeVoice } from './services/welcomeVoice';
import { initScrollReveal } from './utils/scrollReveal';

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
        'cinema',
        'music',
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
    // Record visit globally on root mount across all devices, routes and tabs
    recordVisit();
    // Automatic spoken welcome greeting (male neutral Latin American voice)
    initWelcomeVoice();
    // Initialize scroll-driven reveal animations
    const cleanupScroll = initScrollReveal();
    return () => {
      cleanupScroll();
    };
  }, []);

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
        'cinema',
        'music',
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
      case 'cinema':
        return (
          <div id="cinema">
            <CinemaEarLab
              currentSpeed={currentSpeed}
              onNavigateToSimulator={() => navigateTo('simulator')}
              onNavigateToMusic={() => navigateTo('music')}
            />
          </div>
        );
      case 'music':
        return (
          <div id="music">
            <MusicEarLab
              currentSpeed={currentSpeed}
              onNavigateToCinema={() => navigateTo('cinema')}
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
            <ReflexGym
              currentSpeed={currentSpeed}
              onOpenKit={() => setIsKitModalOpen(true)}
            />
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
    <div className="min-h-screen flex flex-col font-sans-clean bg-vibrant-dark text-slate-100 selection:bg-amber-400 selection:text-slate-950">
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
      />

      <main className="flex-1">
        {viewMode === 'full' ? (
          <div className="space-y-16 pb-16">
            <div id="hero">
              <HeroSection
                onStartSimulator={() => navigateTo('simulator')}
                onExploreChunks={() => navigateTo('chunks')}
                onTryTweak={() => navigateTo('tweak')}
                onExploreEntrecasa={() => navigateTo('entrecasa')}
                onStartDesdeCero={() => navigateTo('desde-cero')}
                onStartGym={() => navigateTo('gym')}
                onOpenKit={() => setIsKitModalOpen(true)}
                onAskTeacher={() => navigateTo('coach')}
                onOpenBlog={() => navigateTo('blog')}
                onOpenCinema={() => navigateTo('cinema')}
                currentSpeed={currentSpeed}
              />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <LevelSelectorBar
                currentLevel={activeLevel}
                onSelectLevel={handleLevelSelect}
              />
            </div>
            <Suspense fallback={<ModuleLoader />}>
            <div id="desde-cero">
              <DesdeCeroGuide
                currentSpeed={currentSpeed}
                onExploreNextLevel={() => navigateTo('entrecasa')}
              />
            </div>
            <div id="entrecasa">
              <EntrecasaGuide
                currentSpeed={currentSpeed}
                onGoToSimulator={() => navigateTo('simulator')}
                onGoToTweak={() => navigateTo('tweak')}
              />
            </div>
            <div id="simulator">
              <RoleplaySimulator
                currentSpeed={currentSpeed}
                onSpeedChange={handleSpeedChange}
              />
            </div>
            <div id="cinema">
              <CinemaEarLab
                currentSpeed={currentSpeed}
                onNavigateToSimulator={() => navigateTo('simulator')}
                onNavigateToMusic={() => navigateTo('music')}
              />
            </div>
            <div id="music">
              <MusicEarLab
                currentSpeed={currentSpeed}
                onNavigateToCinema={() => navigateTo('cinema')}
              />
            </div>
            <div id="tweak">
              <SpeakTweakTool currentSpeed={currentSpeed} />
            </div>
            <div id="chunks">
              <PowerChunksExplorer currentSpeed={currentSpeed} />
            </div>
            <div id="gym">
              <ReflexGym
                currentSpeed={currentSpeed}
                onOpenKit={() => setIsKitModalOpen(true)}
              />
            </div>
            <div id="connected">
              <ConnectedSpeechLab currentSpeed={currentSpeed} />
            </div>
            <div id="dashboard">
              <FluencyDashboard
                onNavigateToGym={() => navigateTo('gym')}
                onNavigateToSimulator={() => navigateTo('simulator')}
                onNavigateToTweak={() => navigateTo('tweak')}
              />
            </div>
            <div id="coach">
              <CoachLeoChat currentSpeed={currentSpeed} />
            </div>
            <div id="method">
              <MethodComparison
                onNavigateToSimulator={() => navigateTo('simulator')}
              />
            </div>
            <div id="blog">
              <CommunityBlog currentSpeed={currentSpeed} />
            </div>
            <div id="kit">
              <OfflineKitSection
                onNavigateHome={() => navigateTo('hero')}
                onNavigateToGym={() => navigateTo('gym')}
                onOpenVault={() => setIsVaultModalOpen(true)}
              />
            </div>
            </Suspense>
          </div>
        ) : activeTab === 'hero' ? (
          <>
            {/* Hero Section */}
            <div id="hero">
              <HeroSection
                onStartSimulator={() => navigateTo('simulator')}
                onExploreChunks={() => navigateTo('chunks')}
                onTryTweak={() => navigateTo('tweak')}
                onExploreEntrecasa={() => navigateTo('entrecasa')}
                onStartDesdeCero={() => navigateTo('desde-cero')}
                onStartGym={() => navigateTo('gym')}
                onOpenKit={() => setIsKitModalOpen(true)}
                onAskTeacher={() => navigateTo('coach')}
                onOpenBlog={() => navigateTo('blog')}
                onOpenCinema={() => navigateTo('cinema')}
                onOpenMusic={() => navigateTo('music')}
                currentSpeed={currentSpeed}
              />
            </div>

            {/* Level Switcher Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-6 sm:mb-8 relative z-20">
              <LevelSelectorBar
                currentLevel={activeLevel}
                onSelectLevel={handleLevelSelect}
              />
            </div>

            {/* Thematic Panels Hub (Items grouped into panels, appears on click) */}
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
              <Suspense fallback={<ModuleLoader />}>
                {renderActiveModule()}
              </Suspense>
            </div>

            {/* Module Next/Prev & Return Bar */}
            <ModuleBottomNav
              currentModuleId={activeTab}
              onNavigate={navigateTo}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Floating Audio-Kit Trigger (Visible Everywhere across the app) */}
      <AudioKitFloatingTrigger onOpenModal={() => setIsKitModalOpen(true)} />

      {/* Audio-Kit de Bolsillo Popup Window (Ventana Emergente Interactiva) */}
      {isKitModalOpen && (
        <Suspense fallback={null}>
          <AudioKitModal
            isOpen={isKitModalOpen}
            onClose={() => setIsKitModalOpen(false)}
            onGoToFullKit={() => {
              setIsKitModalOpen(false);
              navigateTo('kit');
            }}
            onOpenVault={() => setIsVaultModalOpen(true)}
          />
        </Suspense>
      )}

      {/* Delivery & Instant Download Vault Modal for Buyers */}
      {isVaultModalOpen && (
        <Suspense fallback={null}>
          <PackDownloadVaultModal
            isOpen={isVaultModalOpen}
            onClose={() => setIsVaultModalOpen(false)}
          />
        </Suspense>
      )}

      {/* Floating WhatsApp Quick Consultation Button */}
      <WhatsAppHelpButton />
    </div>
  );
}
