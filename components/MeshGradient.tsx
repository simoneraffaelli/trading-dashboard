"use client";

import { useEffect, useRef } from "react";

export default function MeshGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      time += 0.002;
      const w = canvas.width;
      const h = canvas.height;

      // Dark base
      ctx.fillStyle = "#07070a";
      ctx.fillRect(0, 0, w, h);

      // Animated gradient blobs
      const blobs = [
        {
          x: w * (0.3 + 0.1 * Math.sin(time * 0.7)),
          y: h * (0.3 + 0.1 * Math.cos(time * 0.5)),
          r: Math.min(w, h) * 0.4,
          color: "rgba(0, 212, 255, 0.06)",
        },
        {
          x: w * (0.7 + 0.1 * Math.cos(time * 0.6)),
          y: h * (0.6 + 0.1 * Math.sin(time * 0.8)),
          r: Math.min(w, h) * 0.35,
          color: "rgba(124, 58, 237, 0.05)",
        },
        {
          x: w * (0.5 + 0.15 * Math.sin(time * 0.4)),
          y: h * (0.8 + 0.05 * Math.cos(time * 0.9)),
          r: Math.min(w, h) * 0.3,
          color: "rgba(34, 197, 94, 0.03)",
        },
      ];

      for (const blob of blobs) {
        const gradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          blob.r
        );
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      aria-hidden="true"
    />
  );
}
