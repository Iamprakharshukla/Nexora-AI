'use client';

import { useEffect, useRef } from 'react';

export default function UniverseCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: {
      x: number;
      y: number;
      z: number;
      radius: number;
      color: string;
      angle: number;
      speed: number;
      distance: number;
    }[] = [];

    // Colors: cyan, pink, neon blue, white glow
    const colors = ['#00ffcc', '#cc00ff', '#0077ff', '#ffffff'];
    const particleCount = 200;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: 0,
        y: 0,
        z: Math.random() * 400 - 200,
        radius: Math.random() * 2 + 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        speed: (Math.random() * 0.003 + 0.0008) * (Math.random() > 0.5 ? 1 : -1),
        distance: Math.random() * 260 + 50,
      });
    }

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = (e.clientX - rect.left - width / 2) * 0.18;
      targetMouseY = (e.clientY - rect.top - height / 2) * 0.18;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.fillStyle = 'rgba(3, 3, 3, 0.18)'; // trail alpha
      ctx.fillRect(0, 0, width, height);

      // Smooth mouse camera shifts
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      // Draw galactic orbit rings
      ctx.strokeStyle = 'rgba(0, 255, 204, 0.02)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(width / 2 + mouseX, height / 2 + mouseY, 150, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(204, 0, 255, 0.02)';
      ctx.beginPath();
      ctx.arc(width / 2 + mouseX, height / 2 + mouseY, 250, 0, Math.PI * 2);
      ctx.stroke();

      // Render glowing central crystal core
      const glowGrad = ctx.createRadialGradient(
        width / 2 + mouseX,
        height / 2 + mouseY,
        0,
        width / 2 + mouseX,
        height / 2 + mouseY,
        60
      );
      glowGrad.addColorStop(0, 'rgba(0, 255, 204, 0.22)');
      glowGrad.addColorStop(0.5, 'rgba(204, 0, 255, 0.1)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(width / 2 + mouseX, height / 2 + mouseY, 60, 0, Math.PI * 2);
      ctx.fill();

      // Rotate and render particles
      particles.forEach((p) => {
        p.angle += p.speed;

        // Perspective 3D rotation coordinates
        const rotX = Math.cos(p.angle) * p.distance;
        const rotY = Math.sin(p.angle) * p.distance * 0.42; // Tilt compression

        const posX = width / 2 + rotX + mouseX;
        const posY = height / 2 + rotY + mouseY + p.z * 0.08;

        // Depth perspective scale
        const depth = (p.z + 300) / 400; // 0.25 to 1.25
        const currentRadius = Math.max(0.3, p.radius * depth);

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = depth > 0.95 ? 6 : 0;
        ctx.beginPath();
        ctx.arc(posX, posY, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Render proximity connection strings
        particles.forEach((other) => {
          if (p === other) return;
          const otherRotX = Math.cos(other.angle) * other.distance;
          const otherRotY = Math.sin(other.angle) * other.distance * 0.42;
          const otherX = width / 2 + otherRotX + mouseX;
          const otherY = height / 2 + otherRotY + mouseY + other.z * 0.08;

          const dx = posX - otherX;
          const dy = posY - otherY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 55) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.07 * (1 - dist / 55)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(posX, posY);
            ctx.lineTo(otherX, otherY);
            ctx.stroke();
          }
        });
      });

      // Render Floating Core text overlays
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 9px Inter';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '1px';
      ctx.fillText('NEXORA LUXURY ESTATES', width / 2 + mouseX, height / 2 + mouseY - 5);
      
      ctx.fillStyle = '#00ffcc';
      ctx.font = '400 8px Inter';
      ctx.fillText('LIVE ESTATE PORTAL ACTIVE', width / 2 + mouseX, height / 2 + mouseY + 8);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-auto z-0"
    />
  );
}
