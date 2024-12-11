import React, { useEffect, useRef } from 'react';
import Snake from './Snake';
import Food from './Food';
import Score from './Score';
import useInterval from '../hooks/useInterval';
import { moveSnake, checkCollision, getRandomFoodPosition } from '../utils/gameLogic';
import { useGameStore } from '../store/useGameStore';
import './GameBoard.css';

const BONUS_FREQUENCY = 5;
const BONUS_START_TIME = 3;
const BONUS_MULTIPLIER = 5;

const GameBoard: React.FC = () => {
  const {
    snake,
    food,
    bonus,
    bonusCountdown,
    direction,
    prevDirection,
    speed,
    score,
    highscore,
    gameOver,
    isPaused,
    foodCount,
    isBonusActive,
    headColorChanged,
    setSnake,
    setFood,
    setBonus,
    setDirection,
    setPrevDirection,
    setSpeed,
    setScore,
    setHighscore,
    setGameOver,
    setIsPaused,
    setFoodCount,
    setBonusCountdown,
    setIsBonusActive,
    setHeadColorChanged,
    resetGame,
  } = useGameStore();

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        if (direction !== 'DOWN' && !isPaused) {
          setPrevDirection(direction);
          setDirection('UP');
        }
        break;
      case 'ArrowDown':
        if (direction !== 'UP' && !isPaused) {
          setPrevDirection(direction);
          setDirection('DOWN');
        }
        break;
      case 'ArrowLeft':
        if (direction !== 'RIGHT' && !isPaused) {
          setPrevDirection(direction);
          setDirection('LEFT');
        }
        break;
      case 'ArrowRight':
        if (direction !== 'LEFT' && !isPaused) {
          setPrevDirection(direction);
          setDirection('RIGHT');
        }
        break;
      case ' ':
        if (gameOver) {
          resetGame();
        } else {
          setIsPaused((prev) => !prev);
        }
        break;
      default:
        break;
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (isPaused) {
      setIsPaused(false);
    }
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0 && direction !== 'LEFT') {
        setPrevDirection(direction);
        setDirection('RIGHT');
      } else if (deltaX < 0 && direction !== 'RIGHT') {
        setPrevDirection(direction);
        setDirection('LEFT');
      }
    } else {
      if (deltaY > 0 && direction !== 'UP') {
        setPrevDirection(direction);
        setDirection('DOWN');
      } else if (deltaY < 0 && direction !== 'DOWN') {
        setPrevDirection(direction);
        setDirection('UP');
      }
    }

    touchStartRef.current = null;
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [direction, isPaused, gameOver]);

  useEffect(() => {
    const gameBoardElement = document.querySelector('.game-board');
    if (gameBoardElement) {
      gameBoardElement.addEventListener('touchstart', handleTouchStart as EventListener);
      gameBoardElement.addEventListener('touchend', handleTouchEnd as EventListener);
    }
    return () => {
      if (gameBoardElement) {
        gameBoardElement.removeEventListener('touchstart', handleTouchStart as EventListener);
        gameBoardElement.removeEventListener('touchend', handleTouchEnd as EventListener);
      }
    };
  }, [direction]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/highscore-get`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch highscore');
        }
        return response.json();
      })
      .then((data) => setHighscore(data.highscore))
      .catch((error) => console.error('Error fetching highscore:', error));
  }, []);
  
  useEffect(() => {
    if (score > highscore) {
      fetch(`${process.env.REACT_APP_API_URL}/highscore-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highscore: score }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to update highscore');
          }
          return response.json();
        })
        .then((data) => {
          console.log('Highscore updated:', data.highscore);
          setHighscore(data.highscore);
        })
        .catch((error) => console.error('Error updating highscore:', error));
    }
  }, [score, highscore]);  

  useInterval(() => {
    if (isPaused || gameOver) return;

    const newSnake = moveSnake(snake, direction, prevDirection);

    if (checkCollision(newSnake)) {
      setGameOver(true);
      setIsPaused(true);
      setIsBonusActive(false);
      return;
    }

    if (newSnake[0].x === food.x && newSnake[0].y === food.y) {
      setSnake([...newSnake, newSnake[newSnake.length - 1]]);
      setFood(getRandomFoodPosition(newSnake));
      setScore(score + 1);
      setSpeed(Math.max(50, speed - 8));
      setFoodCount(foodCount + 1);
      setHeadColorChanged(true);
      setTimeout(() => setHeadColorChanged(false), 300);

      if ((foodCount + 1) % BONUS_FREQUENCY === 0) {
        setBonus(getRandomFoodPosition(newSnake));
        setBonusCountdown(BONUS_START_TIME);
        setIsBonusActive(true);
      }
    } else {
      setSnake(newSnake);
    }

    if (bonus && newSnake[0].x === bonus.x && newSnake[0].y === bonus.y) {
      setScore(score + bonusCountdown * BONUS_MULTIPLIER);
      setBonus(null);
      setIsBonusActive(false);
      setHeadColorChanged(true);
      setTimeout(() => setHeadColorChanged(false), 500);
    }
  }, gameOver || isPaused ? null : speed);

  useInterval(() => {
    if (isBonusActive && bonus) {
      if (bonusCountdown > 0) {
        setBonusCountdown(bonusCountdown - 1);
      } else {
        setBonus(null);
        setIsBonusActive(false);
      }
    }
  }, isBonusActive ? 1000 : null);

  return (
    <div className="game-container">
      <div className="score-board">
        <Score score={score} highscore={highscore} />
      </div>
      <div className="game-board">
        <Snake snake={snake} headColorChanged={headColorChanged} />
        <Food position={food} isBonus={false} />
        {bonus && <Food position={bonus} isBonus />}
        <div className={`game-over ${gameOver ? 'show' : ''}`}>
          Game Over! Press "Space" to restart.
        </div>
        <div className={`pause ${isPaused && !gameOver ? 'show' : ''}`}>
          Paused. Tap anywhere to start.
        </div>
        {bonus && <div className="bonus-timer">Bonus Time: {bonusCountdown}s</div>}
      </div>
    </div>
  );
};

export default GameBoard;
