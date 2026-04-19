"use client";

import { useEffect, useRef } from "react";

type FactoryPipelineProps = {
  width?: number;
  height?: number;
  className?: string;
};

export function FactoryPipeline({
  width = 460,
  height = 440,
  className,
}: FactoryPipelineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const W = width;
    const H = height;
    const rows = [
      { y: 96, label: "Design" },
      { y: 220, label: "Build" },
      { y: 344, label: "Ship" },
    ];
    const beltLeft = 64;
    const beltRight = W - 28;
    const botX = W * 0.5;

    type Job = { rowY: number; x: number; speed: number };
    const jobs: Job[] = rows
      .map((r, ri) =>
        Array.from({ length: 3 }, (_, i) => ({
          rowY: r.y,
          x: beltLeft + (i / 3 + ri * 0.15) * (beltRight - beltLeft),
          speed: 26 + ri * 6,
        })),
      )
      .flat();

    const startT = performance.now();
    let lastT = startT;

    const drawBot = (x: number, y: number, t: number, ri: number) => {
      const bob = Math.sin(t * 0.0022 + ri * 1.2) * 1.3;
      const armSwing = Math.sin(t * 0.006 + ri * 2) * 0.35;
      ctx.save();
      ctx.translate(x, y + bob);

      ctx.fillStyle = "rgba(148,163,184,0.05)";
      ctx.beginPath();
      ctx.ellipse(0, 34, 28, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(17,24,39,1)";
      ctx.strokeStyle = "rgba(148,163,184,0.32)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-14, 6);
      ctx.lineTo(14, 6);
      ctx.lineTo(18, 30);
      ctx.lineTo(-18, 30);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "rgba(148,163,184,0.18)";
      ctx.strokeRect(-6, 12, 12, 10);
      const ind = 0.5 + Math.sin(t * 0.008 + ri) * 0.5;
      ctx.fillStyle = `rgba(251,191,36,${0.4 + ind * 0.4})`;
      ctx.beginPath();
      ctx.arc(0, 17, 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(148,163,184,0.35)";
      ctx.fillRect(-3, 2, 6, 5);

      ctx.fillStyle = "rgba(15,20,32,1)";
      ctx.strokeStyle = "rgba(148,163,184,0.42)";
      ctx.lineWidth = 1;
      const hw = 30,
        hh = 22,
        hr = 6;
      const hy = -12;
      ctx.beginPath();
      ctx.moveTo(-hw / 2 + hr, hy - hh / 2);
      ctx.lineTo(hw / 2 - hr, hy - hh / 2);
      ctx.quadraticCurveTo(hw / 2, hy - hh / 2, hw / 2, hy - hh / 2 + hr);
      ctx.lineTo(hw / 2, hy + hh / 2 - hr);
      ctx.quadraticCurveTo(hw / 2, hy + hh / 2, hw / 2 - hr, hy + hh / 2);
      ctx.lineTo(-hw / 2 + hr, hy + hh / 2);
      ctx.quadraticCurveTo(-hw / 2, hy + hh / 2, -hw / 2, hy + hh / 2 - hr);
      ctx.lineTo(-hw / 2, hy - hh / 2 + hr);
      ctx.quadraticCurveTo(-hw / 2, hy - hh / 2, -hw / 2 + hr, hy - hh / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const eyePulse = 0.6 + Math.sin(t * 0.005 + ri * 0.9) * 0.4;
      const drawEye = (ex: number) => {
        ctx.fillStyle = `rgba(251,191,36,${0.12 + eyePulse * 0.14})`;
        ctx.beginPath();
        ctx.arc(ex, hy - 1, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(251,191,36,${0.7 + eyePulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(ex, hy - 1, 2.1, 0, Math.PI * 2);
        ctx.fill();
      };
      drawEye(-7);
      drawEye(7);

      ctx.strokeStyle = "rgba(148,163,184,0.32)";
      ctx.lineWidth = 1;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(-4 + i * 4, hy + 6);
        ctx.lineTo(-4 + i * 4 + 2, hy + 6);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(148,163,184,0.5)";
      ctx.beginPath();
      ctx.moveTo(0, hy - hh / 2);
      ctx.lineTo(0, hy - hh / 2 - 7);
      ctx.stroke();
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(0, hy - hh / 2 - 8, 1.6, 0, Math.PI * 2);
      ctx.fill();

      const drawArm = (sx: number, dir: number) => {
        ctx.save();
        ctx.translate(sx, 8);
        ctx.rotate(dir * (0.6 + armSwing));
        ctx.strokeStyle = "rgba(148,163,184,0.45)";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 10);
        ctx.stroke();
        ctx.translate(0, 10);
        ctx.rotate(dir * 0.4);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 10);
        ctx.stroke();
        ctx.fillStyle = "rgba(148,163,184,0.6)";
        ctx.beginPath();
        ctx.arc(0, 11, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      drawArm(-14, -1);
      drawArm(14, 1);

      ctx.restore();
    };

    const drawBelt = (y: number) => {
      ctx.strokeStyle = "rgba(148,163,184,0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(beltLeft, y + 40);
      ctx.lineTo(beltRight, y + 40);
      ctx.stroke();

      ctx.strokeStyle = "rgba(148,163,184,0.22)";
      ctx.setLineDash([4, 8]);
      ctx.lineDashOffset = -((performance.now() - startT) / 1000) * 18;
      ctx.beginPath();
      ctx.moveTo(beltLeft, y + 40);
      ctx.lineTo(beltRight, y + 40);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const drawJob = (j: Job) => {
      const x = j.x;
      const y = j.rowY + 40;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
      g.addColorStop(0, "rgba(245,158,11,0.35)");
      g.addColorStop(1, "rgba(245,158,11,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(x - 2.5, y - 2.5, 5, 5);
    };

    const drawLabel = (r: { y: number; label: string }) => {
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.font = "500 11.5px Manrope, sans-serif";
      ctx.fillStyle = "rgba(148,163,184,0.75)";
      ctx.fillText(r.label, beltLeft - 14, r.y);
    };

    const draw = (now: number) => {
      const dt = Math.min(64, now - lastT) / 1000;
      lastT = now;
      ctx.clearRect(0, 0, W, H);
      for (const r of rows) {
        drawBelt(r.y);
        drawLabel(r);
      }
      for (const j of jobs) {
        j.x += j.speed * dt;
        if (j.x > beltRight + 8) j.x = beltLeft - 8;
        drawJob(j);
      }
      rows.forEach((r, i) => drawBot(botX, r.y, now, i));
    };

    draw(performance.now());

    if (prefersReducedMotion) return;

    const id = setInterval(() => draw(performance.now()), 1000 / 30);
    return () => clearInterval(id);
  }, [width, height]);

  return (
    <div
      className={className}
      style={{ width, height, position: "relative" }}
    >
      <canvas
        ref={canvasRef}
        style={{ width, height, display: "block" }}
        aria-hidden="true"
      />
    </div>
  );
}
