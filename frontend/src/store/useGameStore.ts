import { create } from 'zustand';
import { Direction, getRandomFoodPosition } from '../utils/gameLogic';

interface GameState {
  snake: { x: number; y: number }[];
  food: { x: number; y: number };
  bonus: { x: number; y: number } | null;
  bonusCountdown: number;
  direction: Direction;
  prevDirection: Direction;
  speed: number;
  score: number;
  highscore: number;
  gameOver: boolean;
  isPaused: boolean;
  foodCount: number;
  isBonusActive: boolean;
  headColorChanged: boolean;
  setSnake: (snake: { x: number; y: number }[]) => void;
  setFood: (food: { x: number; y: number }) => void;
  setBonus: (bonus: { x: number; y: number } | null) => void;
  setDirection: (direction: Direction) => void;
  setPrevDirection: (prevDirection: Direction) => void;
  setSpeed: (speed: number) => void;
  setScore: (score: number) => void;
  setHighscore: (highscore: number) => void;
  setGameOver: (gameOver: boolean) => void;
  setIsPaused: (paused: boolean | ((prev: boolean) => boolean)) => void; 
  setFoodCount: (foodCount: number) => void;
  setBonusCountdown: (bonusCountdown: number) => void;
  setIsBonusActive: (isBonusActive: boolean) => void;
  setHeadColorChanged: (headColorChanged: boolean) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  snake: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ],
  food: getRandomFoodPosition([]),
  bonus: null,
  bonusCountdown: 3,
  direction: 'RIGHT',
  prevDirection: 'RIGHT',
  speed: 200,
  score: 0,
  highscore: 0,
  gameOver: false,
  isPaused: true,
  foodCount: 0,
  isBonusActive: false,
  headColorChanged: false,
  setSnake: (snake) => set({ snake }),
  setFood: (food) => set({ food }),
  setBonus: (bonus) => set({ bonus }),
  setDirection: (direction) => set({ direction }),
  setPrevDirection: (prevDirection) => set({ prevDirection }),
  setSpeed: (speed) => set({ speed }),
  setScore: (score) => set({ score }),
  setHighscore: (highscore) => set({ highscore }),
  setGameOver: (gameOver) => set({ gameOver }),
  setIsPaused: (paused) => set((state) => ({ isPaused: typeof paused === 'boolean' ? paused : paused(state.isPaused) })),
  setFoodCount: (foodCount) => set({ foodCount }),
  setBonusCountdown: (bonusCountdown) => set({ bonusCountdown }),
  setIsBonusActive: (isBonusActive) => set({ isBonusActive }),
  setHeadColorChanged: (headColorChanged) => set({ headColorChanged }),
  resetGame: () => {
    set({
      snake: [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ],
      food: getRandomFoodPosition([]),
      bonus: null,
      bonusCountdown: 3,
      direction: 'RIGHT',
      prevDirection: 'RIGHT',
      speed: 200,
      score: 0,
      gameOver: false,
      isPaused: true,
      foodCount: 0,
      isBonusActive: false,
      headColorChanged: false,
    });
  },
}));
