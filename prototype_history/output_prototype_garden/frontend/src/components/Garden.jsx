import React, { useEffect, useRef, useState, useCallback } from 'react';
import FlowerBloom from './FlowerBloom.jsx';
import { getFlowerById } from '../data/flowers.js';

const FLOWER_SIZE = 90;
const PADDING = 20;
const MIN_DISTANCE = 60;

function getRandomPosition(containerW, containerH, existing) {
  const maxAttempts = 50;
  const w = containerW - FLOWER_SIZE - PADDING * 2;
  const h = containerH - FLOWER_SIZE - PADDING * 2;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const x = PADDING + Math.random() * w;
    const y = PADDING + Math.random() * h;

    let tooClose = false;
    for (const pos of existing) {
      const dx = pos.x - x;
      const dy = pos.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < MIN_DISTANCE) {
        tooClose = true;
        break;
      }
    }

    if (!tooClose) return { x, y };
  }

  // Fallback: just place it randomly
  return {
    x: PADDING + Math.random() * w,
    y: PADDING + Math.random() * h,
  };
}

export default function Garden({ flowerType, bloomCount }) {
  const containerRef = useRef(null);
  const [flowers, setFlowers] = useState([]);
  const flowerDef = getFlowerById(flowerType);

  const addFlowers = useCallback(
    (targetCount) => {
      setFlowers((prev) => {
        if (prev.length >= targetCount) return prev;

        const container = containerRef.current;
        if (!container) return prev;

        const { clientWidth: w, clientHeight: h } = container;
        const newFlowers = [...prev];

        while (newFlowers.length < targetCount) {
          const pos = getRandomPosition(w, h, newFlowers);
          newFlowers.push({
            id: `flower-${Date.now()}-${newFlowers.length}-${Math.random()}`,
            x: pos.x,
            y: pos.y,
            animationDelay: Math.random() * 300,
            size: FLOWER_SIZE + Math.floor(Math.random() * 20) - 10,
          });
        }

        return newFlowers;
      });
    },
    []
  );

  useEffect(() => {
    if (bloomCount > 0) {
      addFlowers(bloomCount);
    }
  }, [bloomCount, addFlowers]);

  // Reset flowers when flower type changes
  useEffect(() => {
    setFlowers([]);
  }, [flowerType]);

  return (
    <div className="garden" ref={containerRef}>
      {flowers.map((f) => (
        <FlowerBloom
          key={f.id}
          flower={flowerDef}
          x={f.x}
          y={f.y}
          animationDelay={f.animationDelay}
          size={f.size}
        />
      ))}
    </div>
  );
}