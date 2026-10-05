import React, { useEffect, useRef } from 'react';

export default function HeroVideo() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Floating particles and dynamic educational scenes
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 3 + 1,
      speedX: Math.random() * 0.4 - 0.2,
      speedY: Math.random() * 0.4 - 0.2,
      opacity: Math.random() * 0.5 + 0.2
    }));

    // Floating scene icons representing Papar workshops
    const workshopIcons = [
      { text: '🍰 Bakery Class', x: width * 0.15, y: height * 0.3, speedY: 0.15, phase: 0 },
      { text: '🧵 Sewing Workshop', x: width * 0.8, y: height * 0.25, speedY: -0.12, phase: 1.5 },
      { text: '💻 ICT & Digital', x: width * 0.25, y: height * 0.75, speedY: 0.1, phase: 3.0 },
      { text: '📊 Keusahawanan', x: width * 0.75, y: height * 0.7, speedY: -0.18, phase: 4.5 }
    ];

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Deep rich animated gradient background simulating video atmosphere
      const gradient = ctx.createLinearGradient(
        Math.sin(time * 0.3) * width,
        0,
        width,
        height
      );
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.4, '#1e1b4b');
      gradient.addColorStop(0.8, '#0f766e');
      gradient.addColorStop(1, '#0284c7');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Animated soft ambient lights simulating classroom & Papar town lights
      for (let i = 0; i < 3; i++) {
        const lx = width * (0.3 + 0.3 * Math.sin(time * 0.5 + i * 2));
        const ly = height * (0.4 + 0.2 * Math.cos(time * 0.4 + i));
        const rad = 250 + 50 * Math.sin(time + i);
        const lightGrad = ctx.createRadialGradient(lx, ly, 10, lx, ly, rad);
        lightGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
        lightGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw floating skill particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });

      // Draw floating workshop badges in background video space
      workshopIcons.forEach((icon) => {
        const floatY = icon.y + Math.sin(time + icon.phase) * 15;
        ctx.save();
        ctx.font = '600 13px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        
        const textWidth = ctx.measureText(icon.text).width;
        const px = icon.x - textWidth / 2 - 12;
        const py = floatY - 14;
        const pw = textWidth + 24;
        const ph = 28;

        ctx.beginPath();
        ctx.roundRect(px, py, pw, ph, 14);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(241, 245, 249, 0.7)';
        ctx.fillText(icon.text, icon.x - textWidth / 2, floatY + 4);
        ctx.restore();
      });

      // Dark transparent overlay for high text readability
      ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Subtle overlay vignette grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
}
