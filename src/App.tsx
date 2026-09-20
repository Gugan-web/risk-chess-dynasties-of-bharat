import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/app-store';
import { useGameStore } from './store/game-store';
import type { GameMode, GameConfig } from './engine/game-state';
import { NameScreen } from './components/screens/NameScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { SetupScreen } from './components/screens/SetupScreen';
import { GameScreen } from './components/screens/GameScreen';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { TutorialScreen } from './components/screens/TutorialScreen';
import { DemoScreen } from './components/screens/DemoScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';

type ScreenState = 'home' | 'setup' | 'game' | 'tutorial' | 'demo' | 'profile';

export const App: React.FC = () => {
  const { hasCompletedSetup, playerProfile, soundEnabled, toggleSound } = useAppStore();
  const { phase, initGame, resetGame } = useGameStore();

  const [screen, setScreen] = useState<ScreenState>('home');
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');

  // If match ends, automatically display game over screen
  const isGameOver = phase === 'game_over';

  const handleSelectMode = (mode: GameMode) => {
    setSelectedMode(mode);
    if (mode === 'tutorial') {
      setScreen('tutorial');
    } else if (mode === 'demo') {
      setScreen('demo');
    } else {
      setScreen('setup');
    }
  };

  const handleStartGame = async (config: GameConfig) => {
    await initGame(config);
    setScreen('game');
  };

  const handleReturnHome = () => {
    resetGame();
    setScreen('home');
  };

  const handlePlayAgain = async () => {
    const { config } = useGameStore.getState();
    await initGame(config);
    setScreen('game');
  };

  // Onboarding screen for first-time launch
  if (!hasCompletedSetup || !playerProfile) {
    return <NameScreen onComplete={() => setScreen('home')} />;
  }

  return (
    <div className="app">
      {/* Top right floating quick actions */}
      <div className="settings-bar" aria-label="Quick Settings">
        <button
          type="button"
          className={`settings-btn ${soundEnabled ? 'settings-btn--active' : ''}`}
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          aria-label={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? '♪' : '✕'}
        </button>
      </div>

      {isGameOver ? (
        <GameOverScreen
          onPlayAgain={handlePlayAgain}
          onReturnHome={handleReturnHome}
        />
      ) : screen === 'home' ? (
        <HomeScreen
          onSelectMode={handleSelectMode}
          onOpenProfile={() => setScreen('profile')}
        />
      ) : screen === 'setup' ? (
        <SetupScreen
          mode={selectedMode}
          onStart={handleStartGame}
          onBack={() => setScreen('home')}
        />
      ) : screen === 'game' ? (
        <GameScreen onReturnHome={handleReturnHome} />
      ) : screen === 'tutorial' ? (
        <TutorialScreen
          onComplete={() => {
            setSelectedMode('classic');
            setScreen('setup');
          }}
          onExit={() => setScreen('home')}
        />
      ) : screen === 'demo' ? (
        <DemoScreen onReturnHome={handleReturnHome} />
      ) : screen === 'profile' ? (
        <ProfileScreen onBack={() => setScreen('home')} />
      ) : null}
    </div>
  );
};

export default App;
