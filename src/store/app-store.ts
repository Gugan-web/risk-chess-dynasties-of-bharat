import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerProfile } from '../engine/profiles';
import { createPlayerProfile } from '../engine/profiles';

interface AppStore {
  // Settings
  soundEnabled: boolean;
  animationsEnabled: boolean;
  boardFlipped: boolean;

  // Player
  playerProfile: PlayerProfile | null;
  hasCompletedSetup: boolean;

  // Actions
  toggleSound: () => void;
  toggleAnimations: () => void;
  toggleBoardFlip: () => void;
  setPlayerProfile: (profile: PlayerProfile) => void;
  initializePlayer: (name: string) => void;
  completeSetup: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      soundEnabled: true,
      animationsEnabled: true,
      boardFlipped: false,

      playerProfile: null,
      hasCompletedSetup: false,

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleAnimations: () => set((s) => ({ animationsEnabled: !s.animationsEnabled })),
      toggleBoardFlip: () => set((s) => ({ boardFlipped: !s.boardFlipped })),

      setPlayerProfile: (profile: PlayerProfile) => set({ playerProfile: profile }),

      initializePlayer: (name: string) => {
        set({
          playerProfile: createPlayerProfile(name),
          hasCompletedSetup: true,
        });
      },

      completeSetup: () => set({ hasCompletedSetup: true }),
    }),
    {
      name: 'risk-chess-app',
    }
  )
);
