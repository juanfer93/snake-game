import React, { useEffect, useState } from 'react';
import './Score.css';

interface ScoreProps {
  score: number;
  highscore?: number;
  className?: string;
}

const Score: React.FC<ScoreProps> = ({ score, highscore, className }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 500); // Duración de la animación
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className={`score-container ${className}`}>
      <div className="highscore">
        <span className="static-text">Highscore: </span>
        <span className={`score-number ${animate ? 'show' : ''}`}>
          {highscore}
        </span>
      </div>
      <div className="current-score">
        <span className="static-text">Score: </span>
        <span className={`score-number ${animate ? 'show' : ''}`}>
          {score}
        </span>
      </div>
    </div>
  );
};

export default Score;
