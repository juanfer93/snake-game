// src/components/Food.tsx
import React from 'react';
import './Food.css';

interface FoodProps {
  position: { x: number; y: number };
  isBonus?: boolean;  
}

const Food: React.FC<FoodProps> = ({ position, isBonus = false }) => {
  return (
    <div
      className={`food ${isBonus ? 'bonus' : ''}`}  
      style={{
        left: `${position.x * 20}px`,
        top: `${position.y * 20}px`,
      }}
    ></div>
  );
};

export default Food;
