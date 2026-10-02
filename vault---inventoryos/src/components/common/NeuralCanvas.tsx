import React, { useEffect, useRef } from 'react';

interface NeuralCanvasProps {
  mode?: 'default' | 'locked' | 'unlocked' | 'building' | 'scrolling';
  sceneIndex?: number;
  speedMultiplier?: number;
}

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

export const NeuralCanvas: React.FC<NeuralCanvasProps> = ({
  mode = 'default',
  sceneIndex = 0,
  speedMultiplier = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modeRef = useRef(mode);
  const sceneRef = useRef(sceneIndex);
  const prevSceneRef = useRef(sceneIndex);
  const speedRef = useRef(speedMultiplier);

  modeRef.current = mode;
  sceneRef.current = sceneIndex;
  speedRef.current = speedMultiplier;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let animationFrameId: number;
    let lastTime = performance.now();

    // Scene camera drift velocity (creates smooth inertial translation when changing scenes)
    let cameraDriftY = 0;
    let targetCameraDriftY = 0;

    // Background gradient lerping states
    let currentBgR = 13, currentBgG = 17, currentBgB = 26;
    let currentAuraR = 83, currentAuraG = 86, currentAuraB = 255;
    let targetBgR = 13, targetBgG = 17, targetBgB = 26;
    let targetAuraR = 83, targetAuraG = 86, targetAuraB = 255;

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
      radius: 170,
    };

    function getParticleCount(w: number) {
      if (w < 640) return 40;
      if (w < 1024) return 80;
      return 120;
    }

    class Particle {
      x = 0;
      y = 0;
      originX = 0;
      originY = 0;
      layer = 0;
      radius = 1;
      baseOpacity = 0.3;
      speed = 0.3;
      hasGlow = false;
      vx = 0;
      vy = 0;
      dx = 0;
      dy = 0;
      // Smooth color lerping
      r = 83;
      g = 86;
      b = 255;
      targetR = 83;
      targetG = 86;
      targetB = 255;

      constructor(w: number, h: number) {
        this.reset(w, h);
      }

      reset(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.originX = this.x;
        this.originY = this.y;

        const layerRand = Math.random();
        if (layerRand < 0.45) {
          this.layer = 0;
          this.radius = 0.8 + Math.random() * 0.4;
          this.baseOpacity = 0.16 + Math.random() * 0.12;
          this.speed = 0.18 + Math.random() * 0.12;
          this.hasGlow = false;
        } else if (layerRand < 0.82) {
          this.layer = 1;
          this.radius = 1.3 + Math.random() * 0.6;
          this.baseOpacity = 0.35 + Math.random() * 0.18;
          this.speed = 0.28 + Math.random() * 0.16;
          this.hasGlow = false;
        } else {
          this.layer = 2;
          this.radius = 2.0 + Math.random() * 0.8;
          this.baseOpacity = 0.65 + Math.random() * 0.25;
          this.speed = 0.4 + Math.random() * 0.2;
          this.hasGlow = true;
        }

        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;

        this.dx = 0;
        this.dy = 0;
        this.updateTargetColor(true);
      }

      updateTargetColor(instant = false) {
        const curMode = modeRef.current;
        const curScene = sceneRef.current;
        const rand = Math.random();

        let tR = 83, tG = 86, tB = 255;

        if (curMode === 'locked') {
          if (rand < 0.55) { tR = 239; tG = 68; tB = 68; } // crimson alert
          else if (rand < 0.85) { tR = 245; tG = 158; tB = 11; } // amber
          else { tR = 120; tG = 110; tB = 230; }
        } else if (curMode === 'unlocked') {
          if (rand < 0.6) { tR = 16; tG = 185; tB = 129; } // emerald
          else { tR = 56; tG = 189; tB = 248; } // cyan
        } else if (curMode === 'building') {
          if (rand < 0.5) { tR = 245; tG = 158; tB = 11; } // warm amber
          else if (rand < 0.8) { tR = 130; tG = 207; tB = 255; } // soft cyan
          else { tR = 192; tG = 193; tB = 255; }
        } else if (curMode === 'scrolling') {
          if (curScene === 0) {
            // Command Deck: Electric Indigo & Cyan
            if (rand < 0.55) { tR = 83; tG = 86; tB = 255; }
            else { tR = 56; tG = 189; tB = 248; }
          } else if (curScene === 1) {
            // Architecture: Vivid Violet & Purple
            if (rand < 0.55) { tR = 168; tG = 85; tB = 247; }
            else { tR = 99; tG = 102; tB = 241; }
          } else if (curScene === 2) {
            // Consensus: Emerald Green & Ice Cyan
            if (rand < 0.55) { tR = 16; tG = 185; tB = 129; }
            else { tR = 56; tG = 189; tB = 248; }
          } else {
            // Gateway: Deep Azure & Soft Lavender
            if (rand < 0.55) { tR = 56; tG = 189; tB = 248; }
            else { tR = 192; tG = 193; tB = 255; }
          }
        } else {
          if (rand < 0.45) { tR = 165; tG = 180; tB = 252; }
          else if (rand < 0.75) { tR = 83; tG = 86; tB = 255; }
          else { tR = 56; tG = 189; tB = 248; }
        }

        this.targetR = tR;
        this.targetG = tG;
        this.targetB = tB;

        if (instant) {
          this.r = tR;
          this.g = tG;
          this.b = tB;
        }
      }

      update(w: number, h: number, dt: number, cameraY: number) {
        const mult = speedRef.current;

        // Smooth color lerping (never snaps!)
        const colorLerpRate = 0.05 * dt;
        this.r += (this.targetR - this.r) * colorLerpRate;
        this.g += (this.targetG - this.g) * colorLerpRate;
        this.b += (this.targetB - this.b) * colorLerpRate;

        // Base velocity + parallax camera drift
        this.originX += this.vx * mult * dt;
        this.originY += (this.vy * mult + cameraY * (this.layer * 0.4 + 0.4)) * dt;

        // Toroidal screen wrapping
        if (this.originX < -30) this.originX = w + 30;
        if (this.originX > w + 30) this.originX = -30;
        if (this.originY < -30) this.originY = h + 30;
        if (this.originY > h + 30) this.originY = -30;

        // Organic mouse physics with smooth damping
        if (mouse.active) {
          const distX = this.originX + this.dx - mouse.x;
          const distY = this.originY + this.dy - mouse.y;
          const dist = Math.sqrt(distX * distX + distY * distY);

          if (dist < mouse.radius && dist > 0) {
            const normalized = 1 - dist / mouse.radius;
            const force = normalized * normalized; // Soft quadratic falloff
            const repelStrength = 45 * (this.layer + 1) * 0.5;
            const targetDx = (distX / dist) * force * repelStrength;
            const targetDy = (distY / dist) * force * repelStrength;

            this.dx += (targetDx - this.dx) * (0.16 * dt);
            this.dy += (targetDy - this.dy) * (0.16 * dt);
          } else {
            const decay = Math.pow(0.91, dt);
            this.dx *= decay;
            this.dy *= decay;
          }
        } else {
          const decay = Math.pow(0.91, dt);
          this.dx *= decay;
          this.dy *= decay;
        }

        this.x = this.originX + this.dx;
        this.y = this.originY + this.dy;
      }

      draw(context: CanvasRenderingContext2D) {
        const intR = Math.round(this.r);
        const intG = Math.round(this.g);
        const intB = Math.round(this.b);

        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${intR}, ${intG}, ${intB}, ${this.baseOpacity})`;
        context.fill();

        if (this.hasGlow) {
          context.beginPath();
          context.arc(this.x, this.y, this.radius * 2.8, 0, Math.PI * 2);
          context.fillStyle = `rgba(${intR}, ${intG}, ${intB}, ${this.baseOpacity * 0.25})`;
          context.fill();
        }
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      if (!canvas || !ctx) return;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const targetCount = getParticleCount(width);
      particles = [];
      for (let i = 0; i < targetCount; i++) {
        particles.push(new Particle(width, height));
      }
    }

    resize();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    const connectionThreshold = 125;
    let colorCheckTimer = 0;

    function render(currentTime: number) {
      if (!ctx) return;

      // Delta time normalization (60fps baseline, clamps large stalls)
      const elapsed = currentTime - lastTime;
      const dt = Math.min(elapsed / 16.67, 2.0);
      lastTime = currentTime;

      // Handle scene change camera impulse
      const currentScene = sceneRef.current;
      if (currentScene !== prevSceneRef.current) {
        const deltaScene = currentScene - prevSceneRef.current;
        targetCameraDriftY = -deltaScene * 3.5;
        prevSceneRef.current = currentScene;

        // Notify particles to update their color target smoothly
        for (let i = 0; i < particles.length; i++) {
          particles[i].updateTargetColor(false);
        }
      }

      // Smooth decay of camera drift
      cameraDriftY += (targetCameraDriftY - cameraDriftY) * (0.08 * dt);
      targetCameraDriftY *= Math.pow(0.93, dt);

      // Smooth mouse coordinate tracking
      if (mouse.active) {
        const mouseLerp = 0.16 * dt;
        mouse.x += (mouse.targetX - mouse.x) * mouseLerp;
        mouse.y += (mouse.targetY - mouse.y) * mouseLerp;
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
      }

      ctx.clearRect(0, 0, width, height);

      // Determine target background & aura colors based on mode and scene
      const curMode = modeRef.current;
      if (curMode === 'locked') {
        targetBgR = 17; targetBgG = 10; targetBgB = 18;
        targetAuraR = 239; targetAuraG = 68; targetAuraB = 68;
      } else if (curMode === 'unlocked') {
        targetBgR = 10; targetBgG = 20; targetBgB = 21;
        targetAuraR = 16; targetAuraG = 185; targetAuraB = 129;
      } else if (curMode === 'building') {
        targetBgR = 12; targetBgG = 17; targetBgB = 28;
        targetAuraR = 245; targetAuraG = 158; targetAuraB = 11;
      } else if (curMode === 'scrolling') {
        if (currentScene === 0) {
          targetBgR = 13; targetBgG = 17; targetBgB = 26;
          targetAuraR = 83; targetAuraG = 86; targetAuraB = 255;
        } else if (currentScene === 1) {
          targetBgR = 18; targetBgG = 12; targetBgB = 28;
          targetAuraR = 168; targetAuraG = 85; targetAuraB = 247;
        } else if (currentScene === 2) {
          targetBgR = 10; targetBgG = 20; targetBgB = 22;
          targetAuraR = 16; targetAuraG = 185; targetAuraB = 129;
        } else {
          targetBgR = 12; targetBgG = 18; targetBgB = 30;
          targetAuraR = 56; targetAuraG = 189; targetAuraB = 248;
        }
      } else {
        targetBgR = 13; targetBgG = 17; targetBgB = 26;
        targetAuraR = 83; targetAuraG = 86; targetAuraB = 255;
      }

      // Smooth background color blending (never abruptly cuts)
      const bgLerpRate = 0.04 * dt;
      currentBgR += (targetBgR - currentBgR) * bgLerpRate;
      currentBgG += (targetBgG - currentBgG) * bgLerpRate;
      currentBgB += (targetBgB - currentBgB) * bgLerpRate;

      currentAuraR += (targetAuraR - currentAuraR) * bgLerpRate;
      currentAuraG += (targetAuraG - currentAuraG) * bgLerpRate;
      currentAuraB += (targetAuraB - currentAuraB) * bgLerpRate;

      const roundBgR = Math.round(currentBgR);
      const roundBgG = Math.round(currentBgG);
      const roundBgB = Math.round(currentBgB);

      const roundAuraR = Math.round(currentAuraR);
      const roundAuraG = Math.round(currentAuraG);
      const roundAuraB = Math.round(currentAuraB);

      // Deep atmospheric background radial gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        10,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85
      );
      bgGrad.addColorStop(0, `rgb(${roundBgR}, ${roundBgG}, ${roundBgB})`);
      bgGrad.addColorStop(0.6, `rgb(${Math.round(roundBgR * 0.7)}, ${Math.round(roundBgG * 0.7)}, ${Math.round(roundBgB * 0.7)})`);
      bgGrad.addColorStop(1, '#05070c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient luminous aura glow
      const heroGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        40,
        width * 0.5,
        height * 0.45,
        Math.max(width, height) * 0.55
      );
      heroGlow.addColorStop(0, `rgba(${roundAuraR}, ${roundAuraG}, ${roundAuraB}, 0.08)`);
      heroGlow.addColorStop(0.7, `rgba(${roundAuraR}, ${roundAuraG}, ${roundAuraB}, 0.02)`);
      heroGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = heroGlow;
      ctx.fillRect(0, 0, width, height);

      // Periodic check to ensure target colors are maintained
      colorCheckTimer += dt;
      if (colorCheckTimer > 35) {
        colorCheckTimer = 0;
        for (let i = 0; i < particles.length; i++) {
          if (Math.random() < 0.2) particles[i].updateTargetColor(false);
        }
      }

      // Update particles with delta-time and camera drift
      const count = particles.length;
      for (let i = 0; i < count; i++) {
        particles[i].update(width, height, dt, cameraDriftY);
      }

      // Draw synaptic neural connections with smooth distance falloff
      ctx.lineWidth = 0.65;
      for (let i = 0; i < count; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < count; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectionThreshold * connectionThreshold) {
            const dist = Math.sqrt(distSq);
            let connAlpha = (1 - dist / connectionThreshold) * 0.24;

            if (mouse.active) {
              const midX = (p1.x + p2.x) * 0.5;
              const midY = (p1.y + p2.y) * 0.5;
              const mDist = Math.hypot(midX - mouse.x, midY - mouse.y);
              if (mDist < 140) {
                connAlpha += (1 - mDist / 140) * 0.22;
              }
            }

            // Blend line colors between connected particles
            const avgR = Math.round((p1.r + p2.r) * 0.5);
            const avgG = Math.round((p1.g + p2.g) * 0.5);
            const avgB = Math.round((p1.b + p2.b) * 0.5);

            ctx.strokeStyle = `rgba(${avgR}, ${avgG}, ${avgB}, ${connAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes
      for (let i = 0; i < count; i++) {
        particles[i].draw(ctx);
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
