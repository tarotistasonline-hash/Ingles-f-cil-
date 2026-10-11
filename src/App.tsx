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
import { Footer } from './components/Footer';
import { getGlobalAudioSpeed, setGlobalAudioSpeed } from './services/audio';
import { SkillLevel } from './types';

export default function App() {
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

  React.useEffect(() => {
    const handleHash = () => {
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
      />

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
                  currentSpeed={currentSpeed}
                />
              </div>

              {/* Level Switcher Bar */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 mb-8 sm:mb-12 relative z-20">
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
                onOpenKit={() => navigateTo('kit')}
                currentSpeed={currentSpeed}
              />
            </div>

            {/* Global Level Switcher Sticky / Prominent Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 mb-8 sm:mb-12 relative z-20">
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
              />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}
