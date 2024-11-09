// src/utils/gameLogic.ts
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export const BOARD_SIZE_PX = 800; // Tamaño del tablero en píxeles
export const CELL_SIZE_PX = 40; // Tamaño de cada celda en píxeles (ajusta según el número de celdas que deseas)

export function getRandomFoodPosition(snake: { x: number; y: number }[]): { x: number; y: number } {
  let position: { x: number; y: number };

  while (true) {
    position = {
      x: Math.floor(Math.random() * (BOARD_SIZE_PX / CELL_SIZE_PX)),
      y: Math.floor(Math.random() * (BOARD_SIZE_PX / CELL_SIZE_PX)),
    };

    if (!snake.some(part => part.x === position.x && part.y === position.y)) {
      break;
    }
  }

  return position;
}

export const moveSnake = (
  snake: { x: number; y: number }[],
  direction: Direction,
  prevDirection: Direction
): { x: number; y: number }[] => {
  const head = snake[0];
  let newHead;

  // Evita movimientos en la dirección opuesta inmediata
  if (
    (direction === 'UP' && prevDirection === 'DOWN') ||
    (direction === 'DOWN' && prevDirection === 'UP') ||
    (direction === 'LEFT' && prevDirection === 'RIGHT') ||
    (direction === 'RIGHT' && prevDirection === 'LEFT')
  ) {
    // Si se detecta un movimiento opuesto inmediato, mantener la dirección previa
    switch (prevDirection) {
      case 'UP':
        newHead = { x: head.x, y: head.y - 1 };
        break;
      case 'DOWN':
        newHead = { x: head.x, y: head.y + 1 };
        break;
      case 'LEFT':
        newHead = { x: head.x - 1, y: head.y };
        break;
      case 'RIGHT':
        newHead = { x: head.x + 1, y: head.y };
        break;
      default:
        newHead = { ...head };
    }
  } else {
    // Si no hay movimiento opuesto inmediato, aplicar la dirección actual
    switch (direction) {
      case 'UP':
        newHead = { x: head.x, y: head.y - 1 };
        break;
      case 'DOWN':
        newHead = { x: head.x, y: head.y + 1 };
        break;
      case 'LEFT':
        newHead = { x: head.x - 1, y: head.y };
        break;
      case 'RIGHT':
        newHead = { x: head.x + 1, y: head.y };
        break;
      default:
        newHead = { ...head };
    }
  }

  return [newHead, ...snake.slice(0, -1)];
};

export const checkCollision = (
  snake: { x: number; y: number }[]
): boolean => {
  const [head, ...body] = snake;

  const maxSize = BOARD_SIZE_PX / CELL_SIZE_PX - 1;

  if (head.x < 0 || head.x > maxSize || head.y < 0 || head.y > maxSize) {
    return true;
  }

  for (let segment of body) {
    if (segment.x === head.x && segment.y === head.y) {
      return true;
    }
  }

  return false;
};
