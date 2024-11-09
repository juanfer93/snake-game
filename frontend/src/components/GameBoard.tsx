// src/components/GameBoard.tsx
import React, { useEffect } from 'react';
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

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [direction, isPaused, gameOver]);

  
  useEffect(() => {
    fetch('http://localhost:3001/api/highscore/get')
      .then((response) => response.json())
      .then((data) => setHighscore(data.highscore))
      .catch((error) => console.error('Error fetching highscore:', error));
  }, []);

  
  useEffect(() => {
    if (score > highscore) {
      fetch('http://localhost:3001/api/highscore/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highscore: score }),
      })
        .then((response) => response.json())
        .then((data) => setHighscore(data.highscore))
        .catch((error) => console.error('Error updating highscore:', error));
    }
  }, [score]);

  
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
          Paused. Press "Space" to start.
        </div>
        {bonus && <div className="bonus-timer">Bonus Time: {bonusCountdown}s</div>}
        {gameOver && <div className="game-over">Game Over!</div>}
      </div>
    </div>
  );   
};

export default GameBoard;
