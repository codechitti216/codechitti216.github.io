import { useRef, useEffect, useCallback } from 'react';

/**
 * Direct React port of their VectorCanvas.svelte.
 * Renders a tiny canvas of colored horizontal lines representing vector dimensions.
 */
export default function VectorCanvas({ active = false, data, colorScale, vectorHeight }) {
  const canvasRef = useRef(null);

  const defaultColor = useCallback((t) => {
    // gray 100 → gray 400 interpolation
    const r = Math.round(243 + (156 - 243) * t);
    const g = Math.round(244 + (163 - 244) * t);
    const b = Math.round(246 + (175 - 246) * t);
    return `rgb(${r},${g},${b})`;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const width = parent.clientWidth;
    const height = parent.clientHeight;
    if (!width || !height) return;

    const ratio = 4;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const color = typeof colorScale === 'function' ? colorScale : defaultColor;
    const lineH = 1;

    for (let i = 0; i < height / lineH; i++) {
      const value = data ? data[i % data.length] : Math.random();
      ctx.fillStyle = color(value, i);
      ctx.fillRect(0, i * lineH * ratio, width * ratio, lineH * ratio);
    }
  }, [data, colorScale, defaultColor]);

  useEffect(() => {
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [draw, vectorHeight]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'block',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        opacity: active ? 1 : 0,
        transition: 'opacity 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.opacity = 0; }}
    />
  );
}
