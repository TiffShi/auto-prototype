import React, { useMemo } from 'react';
import '../styles/FlowerBloom.css';

function RoseSVG({ flower, size }) {
  const petals = [];
  const count = 5;
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i;
    petals.push(
      <ellipse
        key={i}
        cx={size / 2}
        cy={size / 2 - size * 0.22}
        rx={size * 0.13}
        ry={size * 0.22}
        fill={i % 2 === 0 ? flower.primaryColor : flower.secondaryColor}
        opacity="0.9"
        transform={`rotate(${angle}, ${size / 2}, ${size / 2})`}
      />
    );
  }
  // Inner petals
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i + 36;
    petals.push(
      <ellipse
        key={`inner-${i}`}
        cx={size / 2}
        cy={size / 2 - size * 0.13}
        rx={size * 0.09}
        ry={size * 0.15}
        fill={flower.secondaryColor}
        opacity="0.85"
        transform={`rotate(${angle}, ${size / 2}, ${size / 2})`}
      />
    );
  }
  return (
    <>
      {petals}
      <circle cx={size / 2} cy={size / 2} r={size * 0.08} fill={flower.centerColor} />
    </>
  );
}

function SunflowerSVG({ flower, size }) {
  const petals = [];
  const count = 12;
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i;
    petals.push(
      <ellipse
        key={i}
        cx={size / 2}
        cy={size / 2 - size * 0.28}
        rx={size * 0.07}
        ry={size * 0.2}
        fill={i % 2 === 0 ? flower.primaryColor : flower.secondaryColor}
        opacity="0.95"
        transform={`rotate(${angle}, ${size / 2}, ${size / 2})`}
      />
    );
  }
  return (
    <>
      {petals}
      <circle cx={size / 2} cy={size / 2} r={size * 0.18} fill={flower.centerColor} />
      <circle cx={size / 2} cy={size / 2} r={size * 0.12} fill="#3e2000" opacity="0.6" />
    </>
  );
}

function TulipSVG({ flower, size }) {
  const cx = size / 2;
  const cy = size / 2;
  return (
    <>
      {/* Stem */}
      <line
        x1={cx}
        y1={cy + size * 0.1}
        x2={cx}
        y2={cy + size * 0.45}
        stroke="#4caf50"
        strokeWidth={size * 0.04}
        strokeLinecap="round"
      />
      {/* Left petal */}
      <ellipse
        cx={cx - size * 0.1}
        cy={cy - size * 0.05}
        rx={size * 0.12}
        ry={size * 0.22}
        fill={flower.primaryColor}
        opacity="0.9"
        transform={`rotate(-15, ${cx - size * 0.1}, ${cy - size * 0.05})`}
      />
      {/* Right petal */}
      <ellipse
        cx={cx + size * 0.1}
        cy={cy - size * 0.05}
        rx={size * 0.12}
        ry={size * 0.22}
        fill={flower.primaryColor}
        opacity="0.9"
        transform={`rotate(15, ${cx + size * 0.1}, ${cy - size * 0.05})`}
      />
      {/* Center petal */}
      <ellipse
        cx={cx}
        cy={cy - size * 0.1}
        rx={size * 0.1}
        ry={size * 0.24}
        fill={flower.secondaryColor}
        opacity="0.95"
      />
    </>
  );
}

function CherryBlossomSVG({ flower, size }) {
  const petals = [];
  const count = 5;
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i;
    petals.push(
      <ellipse
        key={i}
        cx={size / 2}
        cy={size / 2 - size * 0.2}
        rx={size * 0.11}
        ry={size * 0.18}
        fill={flower.primaryColor}
        opacity="0.88"
        transform={`rotate(${angle}, ${size / 2}, ${size / 2})`}
      />
    );
  }
  // Notched petal tips (decorative circles)
  for (let i = 0; i < count; i++) {
    const angle = ((360 / count) * i * Math.PI) / 180;
    const r = size * 0.2;
    const px = size / 2 + r * Math.sin(angle);
    const py = size / 2 - r * Math.cos(angle);
    petals.push(
      <circle key={`tip-${i}`} cx={px} cy={py} r={size * 0.04} fill={flower.secondaryColor} opacity="0.7" />
    );
  }
  return (
    <>
      {petals}
      <circle cx={size / 2} cy={size / 2} r={size * 0.07} fill={flower.centerColor} />
      {/* Stamens */}
      {[0, 72, 144, 216, 288].map((a, i) => {
        const rad = (a * Math.PI) / 180;
        return (
          <line
            key={`stamen-${i}`}
            x1={size / 2}
            y1={size / 2}
            x2={size / 2 + Math.sin(rad) * size * 0.1}
            y2={size / 2 - Math.cos(rad) * size * 0.1}
            stroke={flower.centerColor}
            strokeWidth={size * 0.015}
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}

function DaisySVG({ flower, size }) {
  const petals = [];
  const count = 8;
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i;
    petals.push(
      <ellipse
        key={i}
        cx={size / 2}
        cy={size / 2 - size * 0.24}
        rx={size * 0.09}
        ry={size * 0.2}
        fill={flower.primaryColor}
        stroke={flower.secondaryColor}
        strokeWidth={size * 0.01}
        opacity="0.95"
        transform={`rotate(${angle}, ${size / 2}, ${size / 2})`}
      />
    );
  }
  return (
    <>
      {petals}
      <circle cx={size / 2} cy={size / 2} r={size * 0.12} fill={flower.centerColor} />
      <circle cx={size / 2} cy={size / 2} r={size * 0.07} fill="#e6a800" opacity="0.7" />
    </>
  );
}

const FLOWER_SVGS = {
  rose: RoseSVG,
  sunflower: SunflowerSVG,
  tulip: TulipSVG,
  cherry_blossom: CherryBlossomSVG,
  daisy: DaisySVG,
};

export default function FlowerBloom({ flower, x, y, animationDelay = 0, size = 80 }) {
  const FlowerSVGComponent = FLOWER_SVGS[flower.id] || DaisySVG;

  const style = useMemo(
    () => ({
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      animationDelay: `${animationDelay}ms`,
    }),
    [x, y, size, animationDelay]
  );

  return (
    <div className="flower-bloom" style={style} aria-hidden="true">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
        className="flower-bloom__svg"
      >
        <FlowerSVGComponent flower={flower} size={size} />
      </svg>
    </div>
  );
}