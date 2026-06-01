import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, GraduationCap, TrendingUp, MapPin, ExternalLink, Code2 } from 'lucide-react';
import heroPortrait from '../assets/hero.jpg';
import SkillsPool from './SkillsPool';

const EXPERIENCE = [
  {
    id: 0,
    role: 'Software Developer III',
    company: 'Buildertrend',
    period: 'Oct 2023 – Present',
    tag: 'Current',
    accent: 'gold',
    highlight: '+38% payment onboarding success',
    bullets: [
      'Revamped payment onboarding — 20% faster average time & 38% more completions',
      'Led architecture planning sessions with cross-functional team buy-in',
      'Shipped robust test suite reducing bugs by 18%',
    ],
  },
  {
    id: 1,
    role: 'Software Developer II',
    company: 'Buildertrend',
    period: 'Jun 2018 – Oct 2023',
    tag: '5 yrs',
    accent: 'orange',
    highlight: '+24% notification engagement',
    bullets: [
      'Built centralized in-app notification system — +24% daily active user engagement',
      'Led code reviews and shipped projects to 100% of the user base',
      'Implemented GCP pub/sub pattern — 5% API response time improvement',
      'Launched career fair web app — 30% more resumes collected',
    ],
  },
  {
    id: 2,
    role: 'Software Developer Consultant',
    company: 'Make48',
    period: 'Oct 2022 – Aug 2023',
    tag: 'Consulting',
    accent: 'red',
    highlight: '99% uptime achieved',
    bullets: [
      'Guided non-technical stakeholders through a full application overhaul',
      'Modernized TailwindCSS, Material UI & Laravel stack end-to-end',
      'Achieved 99% uptime post-modernization',
    ],
  },
  {
    id: 3,
    role: 'Junior Developer',
    company: 'BRIDGE Lab',
    period: 'May 2017 – Dec 2017',
    tag: 'First role',
    accent: 'muted',
    highlight: '50% faster registration',
    bullets: [
      'Built university e-learning platform — +10% student engagement',
      'Created class registration system — 50% reduction in sign-up time',
    ],
  },
];

const SKILL_GROUPS = [
  {
    label: 'Frontend',
    accent: 'gold',
    skills: ['React', 'JavaScript', 'HTML', 'CSS'],
  },
  {
    label: 'Backend',
    accent: 'orange',
    skills: ['C#', 'ASP.NET', 'SQL', 'PHP'],
  },
  {
    label: 'Testing',
    accent: 'red',
    skills: ['Jest', 'FakeItEasy'],
  },
  {
    label: 'Tools & Process',
    accent: 'muted',
    skills: ['Git', 'Google Cloud', 'Agile / Scrum', 'Technical Docs', 'AI-Assisted Dev'],
  },
];

export default function AboutSection() {
  const [reveal, setReveal] = useState(0);
  const introRef = useRef(null);
  const sectionRef = useRef(null);

  // Scroll-driven parallax: 0 when intro band is below the viewport,
  // 1 once it's well into view. Drives both the slide-in and a subtle drift.
  useEffect(() => {
    const compute = () => {
      const el = introRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // Start the reveal when the band's top crosses 90% of the viewport,
      // finish when it has scrolled up by another 55% of viewport height.
      const start = vh * 0.9;
      const span  = vh * 0.55;
      const p = 1 - (rect.top - (start - span)) / span;
      setReveal(Math.max(0, Math.min(1, p)));
    };
    compute();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, []);

  // Scroll-progress reveal — each .reveal-on-scroll element gets its own
  // --reveal CSS var (0 → 1) based on where it sits in the viewport.
  // Matches the intro band's smooth scroll-linked feel.
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll('.reveal-on-scroll'));

    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // Reveal begins when element top crosses the viewport bottom (vh),
      // completes when it has scrolled up another 25% of viewport height
      // (i.e., element top is 75% from the top of the viewport).
      const startY = vh * 1.0;
      const endY   = vh * 0.75;
      const span   = startY - endY;
      targets.forEach((el) => {
        const top = el.getBoundingClientRect().top;
        const p = Math.max(0, Math.min(1, (startY - top) / span));
        el.style.setProperty('--reveal', p);
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <section ref={sectionRef} id="about" className="about-section container">

      {/* Parallax intro band — photo slides in from left, copy from right */}
      <div
        ref={introRef}
        className="about-intro"
        style={{ '--reveal': reveal }}
      >
        <div className="intro-photo">
          <div className="intro-photo-outline" aria-hidden="true" />
          <div className="intro-photo-frame">
            <img src={heroPortrait} alt="Karl Harding" />
          </div>
        </div>

        <div className="intro-copy">
          <h2 className="about-title">About Me</h2>
          <p className="about-subtitle">
            Software engineer by trade, explorer by habit. I build high-performance systems at Buildertrend by day —
            and chase new countries, shoot 35mm film on a Nikon FG20, and obsess over tabletop strategy games everywhere else.
          </p>
          <div className="contact-row">
            <a href="https://www.linkedin.com/in/harding-karl" target="_blank" rel="noopener noreferrer" className="contact-chip">
              <ExternalLink size={13} /> LinkedIn
            </a>
            <span className="contact-chip">
              <MapPin size={13} /> Prairie Village, KS
            </span>
          </div>
        </div>
      </div>

      {/* Skills — floating pool with light physics */}
      <div className="skills-prominent reveal-on-scroll reveal-up">
        <div className="block-heading">
          <Code2 size={18} className="block-heading-icon" />
          <span className="block-heading-text">Skills</span>
        </div>

        <SkillsPool skillGroups={SKILL_GROUPS} />
      </div>

      {/* Career rail — compact, anchored by years */}
      <div className="career-section">
        <div className="career-header reveal-on-scroll reveal-up">
          <div className="block-heading">
            <Briefcase size={18} className="block-heading-icon" />
            <span className="block-heading-text">Experience</span>
          </div>
          <div className="career-stat">
            <span className="career-stat-num">6+</span>
            <span className="career-stat-lbl">years in software<br/>· 4 roles · still shipping</span>
          </div>
        </div>

        <div className="career-rail">
          {EXPERIENCE.map((job) => (
            <div
              key={job.id}
              className={`career-row accent-${job.accent} reveal-on-scroll reveal-right`}
            >
              <div className="career-dot" />
              <div className="career-period">{job.period}</div>
              <div className="career-main">
                <span className="career-role">{job.role}</span>
                <span className="career-company">{job.company}</span>
              </div>
              <div className="career-highlight">
                <TrendingUp size={12} /> {job.highlight}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education — small tag below */}
      <div className="edu-block glass-card reveal-on-scroll reveal-up">
        <div className="edu-header">
          <div className="edu-icon-wrap">
            <GraduationCap size={20} />
          </div>
          <div>
            <span className="edu-degree">BS, Computer Engineering</span>
            <span className="edu-school">University of Nebraska–Lincoln</span>
          </div>
        </div>
        <span className="edu-period">Aug 2015 – May 2019 · Omaha, NE</span>
      </div>

      <style>{`
        .about-section {
          padding-top: 5rem;
          padding-bottom: 6rem;
        }

        /* Parallax intro band */
        .about-intro {
          display: grid;
          grid-template-columns: minmax(260px, 380px) 1fr;
          gap: 3.5rem;
          align-items: center;
          margin-bottom: 4.5rem;
          /* --reveal is set inline from 0 → 1 as the band scrolls into view */
        }

        @media (max-width: 820px) {
          .about-intro {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
            margin-bottom: 3.5rem;
          }
        }

        .intro-photo {
          position: relative;
          aspect-ratio: 4 / 5;
          width: 100%;
          /* Slide in from the left, then a gentle continuing parallax drift */
          transform: translate3d(calc((1 - var(--reveal, 0)) * -80px), 0, 0);
          opacity: var(--reveal, 0);
          transition: transform 0.25s ease-out, opacity 0.4s ease-out;
          will-change: transform, opacity;
        }

        /* The actual photo, clipped to a soft organic blob */
        .intro-photo-frame {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border: 1px solid rgba(var(--primary-rgb), 0.22);
          background: rgba(var(--text-primary-rgb), 0.03);
          border-radius: 62% 38% 47% 53% / 45% 62% 38% 55%;
          box-shadow:
            0 30px 60px rgba(42, 24, 16, 0.15),
            0 0 60px rgba(var(--primary-rgb), 0.18);
          animation: blob-morph-a 18s ease-in-out infinite;
        }

        .intro-photo-frame img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          /* Subtle Ken-Burns-style parallax against the slide-in */
          transform: scale(1.05) translateY(calc((var(--reveal, 0) - 0.5) * -14px));
          transition: transform 0.4s ease-out;
        }

        /* A second, slightly different organic shape behind — the "outline" */
        .intro-photo-outline {
          position: absolute;
          inset: -18px -14px -14px -18px;
          z-index: 0;
          border: 1.5px solid rgba(var(--primary-rgb), 0.45);
          border-radius: 55% 45% 35% 65% / 52% 64% 36% 48%;
          pointer-events: none;
          animation: blob-morph-b 22s ease-in-out infinite;
        }

        /* Slow morph so the shapes feel hand-drawn, not stamped */
        @keyframes blob-morph-a {
          0%, 100% { border-radius: 62% 38% 47% 53% / 45% 62% 38% 55%; }
          33%      { border-radius: 56% 44% 58% 42% / 52% 48% 52% 48%; }
          66%      { border-radius: 48% 52% 36% 64% / 60% 42% 58% 40%; }
        }

        @keyframes blob-morph-b {
          0%, 100% { border-radius: 55% 45% 35% 65% / 52% 64% 36% 48%; transform: rotate(-3deg); }
          50%      { border-radius: 45% 55% 60% 40% / 38% 52% 48% 62%; transform: rotate(3deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .intro-photo-frame,
          .intro-photo-outline { animation: none; }
        }

        /* Reveal-on-scroll — scroll-progress driven so the slide-in actually
           tracks the user's scroll position, matching the intro band's feel. */
        .reveal-on-scroll {
          opacity: var(--reveal, 0);
          will-change: opacity, transform;
        }

        .reveal-right {
          transform: translate3d(calc((1 - var(--reveal, 0)) * 60px), 0, 0);
        }
        .reveal-up {
          transform: translate3d(0, calc((1 - var(--reveal, 0)) * 28px), 0);
        }

        /* Career dot scales in alongside its row's reveal progress */
        .career-row.reveal-on-scroll .career-dot {
          transform: scale(var(--reveal, 0));
        }

        @media (max-width: 820px) {
          /* On mobile the body is single-column; soften the horizontal slide */
          .reveal-right {
            transform: translate3d(calc((1 - var(--reveal, 0)) * 30px),
                                   calc((1 - var(--reveal, 0)) * 12px), 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal-on-scroll,
          .career-row.reveal-on-scroll .career-dot {
            opacity: 1;
            transform: none;
          }
        }

        .intro-copy {
          /* Slide in from the right */
          transform: translate3d(calc((1 - var(--reveal, 0)) * 80px), 0, 0);
          opacity: var(--reveal, 0);
          transition: transform 0.25s ease-out, opacity 0.4s ease-out;
          will-change: transform, opacity;
        }

        @media (max-width: 820px) {
          /* On mobile, both elements fade up together — no horizontal slide */
          .intro-photo {
            max-width: 320px;
            margin: 0 auto;
            transform: translate3d(0, calc((1 - var(--reveal, 0)) * 40px), 0);
          }
          .intro-copy {
            transform: translate3d(0, calc((1 - var(--reveal, 0)) * 40px), 0);
          }
        }

        .about-title {
          font-size: clamp(2rem, 4vw, 3rem);
          margin: 0 0 1rem;
          background: linear-gradient(135deg, var(--text-primary) 0%, var(--primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .about-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 1.5rem;
          max-width: 560px;
        }

        @media (max-width: 820px) {
          .about-subtitle { margin-left: auto; margin-right: auto; }
        }

        .contact-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        @media (max-width: 820px) {
          .contact-row { justify-content: center; }
        }

        .contact-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          background: rgba(var(--text-primary-rgb), 0.05);
          border: 1px solid var(--border-light);
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          text-decoration: none;
          transition: var(--transition-fast);
        }

        .contact-chip:hover {
          color: var(--text-primary);
          border-color: var(--primary);
          background: rgba(var(--primary-rgb), 0.08);
        }

        /* Shared block heading (replaces the old .col-heading) */
        .block-heading {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--text-muted);
        }

        .block-heading-icon { color: var(--primary); }
        .block-heading-text { color: var(--text-secondary); }

        /* ── Skills — promoted to the dominant block ─────────────────────── */
        .skills-prominent {
          margin-bottom: 4rem;
        }

        .skills-prominent .block-heading {
          margin-bottom: 1.5rem;
        }

        /* Base pill styling — inherited by the floating pool's .pool-pill */
        .skill-pill {
          font-size: 0.88rem;
          font-weight: 600;
          padding: 0.45rem 1rem;
          border-radius: 9999px;
          border: 1px solid transparent;
          transition: var(--transition-fast);
          cursor: default;
        }

        .pill-gold {
          background: rgba(var(--primary-rgb), 0.18);
          border-color: rgba(var(--primary-rgb), 0.35);
          color: var(--primary);
        }
        .pill-gold:hover { background: rgba(var(--primary-rgb), 0.28); }

        .pill-orange {
          background: rgba(var(--secondary-rgb), 0.18);
          border-color: rgba(var(--secondary-rgb), 0.35);
          color: var(--secondary);
        }
        .pill-orange:hover { background: rgba(var(--secondary-rgb), 0.28); }

        .pill-red {
          background: rgba(var(--accent-rgb), 0.18);
          border-color: rgba(var(--accent-rgb), 0.35);
          color: var(--accent);
        }
        .pill-red:hover { background: rgba(var(--accent-rgb), 0.28); }

        .pill-muted {
          background: rgba(var(--text-primary-rgb), 0.1);
          border-color: rgba(var(--text-primary-rgb), 0.2);
          color: var(--text-secondary);
        }
        .pill-muted:hover { background: rgba(var(--text-primary-rgb), 0.16); }

        /* ── Career rail — compact, anchored by years ─────────────────── */
        .career-section { margin-bottom: 2.5rem; }

        .career-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 1.75rem;
          flex-wrap: wrap;
        }

        .career-stat {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
        }

        .career-stat-num {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 5vw, 3.6rem);
          font-weight: 800;
          line-height: 1;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .career-stat-lbl {
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .career-rail {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .career-rail::before {
          content: '';
          position: absolute;
          left: 7px;
          top: 14px;
          bottom: 14px;
          width: 1px;
          background: linear-gradient(to bottom, var(--primary), var(--secondary), var(--accent), transparent);
          opacity: 0.35;
        }

        .career-row {
          display: grid;
          grid-template-columns: 16px 130px 1fr auto;
          gap: 1.25rem;
          align-items: center;
          padding: 0.9rem 0;
          border-bottom: 1px solid var(--border-light);
          position: relative;
        }

        .career-row:last-child { border-bottom: none; }

        @media (max-width: 720px) {
          .career-row {
            grid-template-columns: 16px 1fr;
            row-gap: 0.35rem;
            column-gap: 1rem;
          }
          .career-period   { grid-column: 2; order: 1; }
          .career-main     { grid-column: 2; order: 2; }
          .career-highlight{ grid-column: 2; order: 3; }
        }

        .career-dot {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 2px solid currentColor;
          background: var(--bg-deep);
          position: relative;
          z-index: 1;
        }

        .accent-gold .career-dot   { color: var(--primary);    box-shadow: 0 0 10px rgba(var(--primary-rgb), 0.4); }
        .accent-orange .career-dot { color: var(--secondary);  box-shadow: 0 0 8px rgba(var(--secondary-rgb), 0.3); }
        .accent-red .career-dot    { color: var(--accent);     box-shadow: 0 0 8px rgba(var(--accent-rgb), 0.3); }
        .accent-muted .career-dot  { color: var(--text-muted); }

        /* Pulse on the current role */
        .accent-gold .career-dot::after {
          content: '';
          position: absolute;
          inset: -5px;
          border-radius: 50%;
          border: 1px solid var(--primary);
          opacity: 0.4;
          animation: pulse-ring 2s ease-out infinite;
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.85); opacity: 0.5; }
          100% { transform: scale(1.5);  opacity: 0;   }
        }

        .career-period {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.02em;
        }

        .career-main { display: flex; flex-direction: column; gap: 0.1rem; }

        .career-role {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .career-company {
          font-size: 0.82rem;
          color: var(--text-secondary);
        }

        .career-highlight {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .career-highlight svg { color: var(--primary); }

        /* Education */
        .edu-block {
          padding: 1.5rem;
          border-color: rgba(var(--primary-rgb), 0.15);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .edu-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .edu-icon-wrap {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(var(--primary-rgb), 0.1);
          border: 1px solid rgba(var(--primary-rgb), 0.2);
          color: var(--primary);
          flex-shrink: 0;
        }

        .edu-degree {
          display: block;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .edu-school {
          display: block;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .edu-period {
          font-size: 0.75rem;
          color: var(--text-muted);
          padding-left: 0.25rem;
        }
      `}</style>
    </section>
  );
}
