import React, { useEffect, useRef } from 'react';

const CATEGORIES = [
  { label: 'Frontend', accent: 'gold' },
  { label: 'Backend',  accent: 'orange' },
  { label: 'Testing',  accent: 'red' },
  { label: 'Tools',    accent: 'muted' },
];

// Floating pool of skill pills with light physics:
// random drift + light damping + wall bounce + mouse repulsion + pill-pill push.
export default function SkillsPool({ skillGroups }) {
  const containerRef = useRef(null);
  const pillRefs = useRef([]);
  const stateRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef(0);

  const pills = skillGroups.flatMap((g) =>
    g.skills.map((s) => ({ label: s, accent: g.accent }))
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Respect reduced-motion — skip the animation entirely, pills stay static
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const init = () => {
      const cRect = container.getBoundingClientRect();
      stateRef.current = pillRefs.current.map((el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: Math.random() * Math.max(1, cRect.width  - r.width),
          y: Math.random() * Math.max(1, cRect.height - r.height),
          vx: (Math.random() - 0.5) * 1.4,
          vy: (Math.random() - 0.5) * 1.4,
          w: r.width,
          h: r.height,
        };
      }).filter(Boolean);
    };

    const tick = () => {
      const cRect = container.getBoundingClientRect();
      const W = cRect.width;
      const H = cRect.height;
      const states = stateRef.current;
      const mouse = mouseRef.current;

      // 1) Forces + movement
      for (let i = 0; i < states.length; i++) {
        const s = states[i];

        // Mouse repulsion
        if (mouse.active) {
          const dx = (s.x + s.w / 2) - mouse.x;
          const dy = (s.y + s.h / 2) - mouse.y;
          const distSq = dx * dx + dy * dy;
          const threshold = 110;
          if (distSq < threshold * threshold && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            const force = ((threshold - dist) / threshold) * 1.6;
            s.vx += (dx / dist) * force;
            s.vy += (dy / dist) * force;
          }
        }

        // Tiny ambient jitter so they never fall completely still
        s.vx += (Math.random() - 0.5) * 0.04;
        s.vy += (Math.random() - 0.5) * 0.04;

        // Damping
        s.vx *= 0.985;
        s.vy *= 0.985;

        // Cap top speed so a fast mouse swipe doesn't fling them
        const speed = Math.hypot(s.vx, s.vy);
        const maxSpeed = 4.5;
        if (speed > maxSpeed) {
          s.vx = (s.vx / speed) * maxSpeed;
          s.vy = (s.vy / speed) * maxSpeed;
        }

        s.x += s.vx;
        s.y += s.vy;

        // Wall bounce
        if (s.x < 0)        { s.x = 0;       s.vx =  Math.abs(s.vx) * 0.85; }
        if (s.x > W - s.w)  { s.x = W - s.w; s.vx = -Math.abs(s.vx) * 0.85; }
        if (s.y < 0)        { s.y = 0;       s.vy =  Math.abs(s.vy) * 0.85; }
        if (s.y > H - s.h)  { s.y = H - s.h; s.vy = -Math.abs(s.vy) * 0.85; }
      }

      // 2) Hard AABB collisions — separate overlapping pills and exchange
      // velocity along the collision axis, so they bounce like real objects
      // and the rendered frame is never overlapping. A few passes for stability.
      for (let pass = 0; pass < 3; pass++) {
        let resolved = 0;
        for (let i = 0; i < states.length; i++) {
          const a = states[i];
          for (let j = i + 1; j < states.length; j++) {
            const b = states[j];
            const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
            const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
            if (overlapX <= 0 || overlapY <= 0) continue;

            if (overlapX < overlapY) {
              const dir = (a.x + a.w / 2) < (b.x + b.w / 2) ? -1 : 1;
              a.x += (dir * overlapX) / 2;
              b.x -= (dir * overlapX) / 2;
              const tmp = a.vx;
              a.vx = b.vx * 0.9;
              b.vx = tmp * 0.9;
            } else {
              const dir = (a.y + a.h / 2) < (b.y + b.h / 2) ? -1 : 1;
              a.y += (dir * overlapY) / 2;
              b.y -= (dir * overlapY) / 2;
              const tmp = a.vy;
              a.vy = b.vy * 0.9;
              b.vy = tmp * 0.9;
            }
            resolved++;
          }
        }
        if (resolved === 0) break; // early exit when stable
      }

      // 3) Re-clamp to walls in case collision pushed a pill out, then paint
      for (let i = 0; i < states.length; i++) {
        const s = states[i];
        if (s.x < 0)        { s.x = 0;       if (s.vx < 0) s.vx = -s.vx * 0.85; }
        if (s.x > W - s.w)  { s.x = W - s.w; if (s.vx > 0) s.vx = -s.vx * 0.85; }
        if (s.y < 0)        { s.y = 0;       if (s.vy < 0) s.vy = -s.vy * 0.85; }
        if (s.y > H - s.h)  { s.y = H - s.h; if (s.vy > 0) s.vy = -s.vy * 0.85; }

        const el = pillRefs.current[i];
        if (el) el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mouseRef.current.x = e.clientX - r.left;
      mouseRef.current.y = e.clientY - r.top;
      mouseRef.current.active = true;
    };
    const onLeave = () => { mouseRef.current.active = false; };

    // Let the browser paint pills once before measuring them
    const startId = requestAnimationFrame(() => {
      init();
      rafRef.current = requestAnimationFrame(tick);
    });

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', init);

    return () => {
      cancelAnimationFrame(startId);
      cancelAnimationFrame(rafRef.current);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', init);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="skills-pool-wrap">
      <div className="skills-pool" ref={containerRef}>
        {pills.map((p, i) => (
          <span
            key={p.label}
            ref={(el) => (pillRefs.current[i] = el)}
            className={`skill-pill pill-${p.accent} pool-pill`}
          >
            {p.label}
          </span>
        ))}
      </div>

      <div className="skills-legend">
        {CATEGORIES.map((c) => (
          <span key={c.label} className="legend-item">
            <span className={`legend-dot legend-${c.accent}`} />
            {c.label}
          </span>
        ))}
      </div>

      <style>{`
        .skills-pool {
          position: relative;
          width: 100%;
          height: 320px;
          overflow: hidden;
          border-radius: 14px;
          background: rgba(var(--text-primary-rgb), 0.025);
          border: 1px solid rgba(var(--primary-rgb), 0.1);
        }

        @media (max-width: 640px) {
          .skills-pool { height: 260px; }
        }

        .pool-pill {
          position: absolute;
          top: 0;
          left: 0;
          user-select: none;
          cursor: default;
          will-change: transform;
          /* Pills are positioned by JS every frame — no CSS transition */
        }

        .skills-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          margin-top: 1.25rem;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .legend-item {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
        }

        .legend-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        .legend-gold   { background: var(--primary); box-shadow: 0 0 6px rgba(var(--primary-rgb), 0.4); }
        .legend-orange { background: var(--secondary); box-shadow: 0 0 6px rgba(var(--secondary-rgb), 0.3); }
        .legend-red    { background: var(--accent); box-shadow: 0 0 6px rgba(var(--accent-rgb), 0.3); }
        .legend-muted  { background: var(--text-muted); }

        @media (prefers-reduced-motion: reduce) {
          .skills-pool {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            padding: 1rem;
            height: auto;
          }
          .pool-pill {
            position: static;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
