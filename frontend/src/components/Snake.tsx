// src/components/Snake.tsx
import React from 'react';
import './Snake.css';

interface SnakeProps {
  snake: { x: number; y: number }[];
  headColorChanged: boolean;
}

const Snake: React.FC<SnakeProps> = ({ snake, headColorChanged }) => {
  return (
    <>
      {snake.map((segment, index) => (
        <div
          key={index}
          className={`snake-segment ${
            index === 0 && headColorChanged ? 'head-eating' : index === 0 ? 'head-changed' : ''
          }`}
          style={{ left: `${segment.x * 20}px`, top: `${segment.y * 20}px` }}
        />
      ))}
    </>
  );
};

export default Snake;

