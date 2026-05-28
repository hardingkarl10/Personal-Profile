import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, GraduationCap, ChevronDown, ChevronUp, TrendingUp, MapPin, ExternalLink } from 'lucide-react';
import heroPortrait from '../assets/hero.jpg';

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

const STATS = [
  { value: '6+', label: 'Years Experience' },
  { value: '4', label: 'Companies' },
  { value: '12+', label: 'Countries Explored' },
  { value: '40+', label: 'Board Games Owned' },
];

export default function AboutSection() {
  const [expanded, setExpanded] = useState(0);
  const [reveal, setReveal] = useState(0);
  const introRef = useRef(null);

  const toggle = (id) => setExpanded(expanded === id ? null : id);

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

  return (
    <section id="about" className="about-section container">

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

      <div className="about-body">

        {/* Left: Experience Timeline */}
        <div className="timeline-col">
          <div className="col-heading">
            <Briefcase size={16} className="col-icon" />
            <span>Experience</span>
          </div>

          <div className="timeline">
            {EXPERIENCE.map((job) => (
              <div key={job.id} className={`timeline-entry accent-${job.accent}`}>
                <div className="timeline-dot" />
                <div className="timeline-card glass-card">
                  <button className="timeline-header" onClick={() => toggle(job.id)}>
                    <div className="timeline-meta">
                      <span className={`job-tag tag-${job.accent}`}>{job.tag}</span>
                      <span className="job-period">{job.period}</span>
                    </div>
                    <div className="timeline-titles">
                      <span className="job-role">{job.role}</span>
                      <span className="job-company">{job.company}</span>
                    </div>
                    <div className="timeline-footer-row">
                      <span className={`highlight-chip chip-${job.accent}`}>
                        <TrendingUp size={11} /> {job.highlight}
                      </span>
                      <span className="expand-icon">
                        {expanded === job.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </span>
                    </div>
                  </button>

                  <ul className={`timeline-bullets ${expanded === job.id ? 'bullets-open' : ''}`}>
                    {job.bullets.map((b, i) => (
                      <li key={i} style={{ transitionDelay: expanded === job.id ? `${i * 0.07}s` : '0s' }}>
                        <span className={`bullet-dot dot-${job.accent}`} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Skills + Education */}
        <div className="sidebar-col">

          {/* Skills */}
          <div className="skills-block">
            <div className="col-heading">
              <span className="col-icon">{'</>'}</span>
              <span>Skills</span>
            </div>

            {SKILL_GROUPS.map((group) => (
              <div key={group.label} className="skill-group">
                <span className={`skill-group-label label-${group.accent}`}>{group.label}</span>
                <div className="skill-pills">
                  {group.skills.map((s) => (
                    <span key={s} className={`skill-pill pill-${group.accent}`}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="edu-block glass-card">
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

        </div>
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
            0 30px 60px rgba(0, 0, 0, 0.35),
            0 0 60px rgba(var(--primary-rgb), 0.08);
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

        /* Body layout */
        .about-body {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 3rem;
          margin-bottom: 3rem;
          align-items: start;
        }

        @media (max-width: 900px) {
          .about-body {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }

        /* Column headings */
        .col-heading {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }

        .col-icon {
          color: var(--primary);
          font-size: 1rem;
        }

        /* Timeline */
        .timeline {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 10px;
          top: 12px;
          bottom: 12px;
          width: 1px;
          background: linear-gradient(to bottom, var(--primary), var(--secondary), var(--accent), transparent);
          opacity: 0.3;
        }

        .timeline-entry {
          display: flex;
          gap: 1.25rem;
          padding-bottom: 1.25rem;
          position: relative;
        }

        .timeline-dot {
          flex-shrink: 0;
          width: 21px;
          height: 21px;
          border-radius: 50%;
          margin-top: 14px;
          position: relative;
          z-index: 1;
          border: 2px solid currentColor;
          background: var(--bg-deep);
        }

        .accent-gold .timeline-dot { color: var(--primary); box-shadow: 0 0 10px rgba(var(--primary-rgb), 0.4); }
        .accent-orange .timeline-dot { color: var(--secondary); box-shadow: 0 0 8px rgba(var(--secondary-rgb), 0.3); }
        .accent-red .timeline-dot { color: var(--accent); box-shadow: 0 0 8px rgba(var(--accent-rgb), 0.3); }
        .accent-muted .timeline-dot { color: var(--text-muted); }

        /* Pulse on current role */
        .accent-gold .timeline-dot::after {
          content: '';
          position: absolute;
          inset: -5px;
          border-radius: 50%;
          border: 1px solid var(--primary);
          opacity: 0.4;
          animation: pulse-ring 2s ease-out infinite;
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.85); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .timeline-card {
          flex: 1;
          border-color: var(--border-light);
          overflow: hidden;
          border-radius: 12px;
        }

        .timeline-header {
          width: 100%;
          background: none;
          border: none;
          padding: 1rem 1.25rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          text-align: left;
        }

        .timeline-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .job-tag {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 0.15rem 0.6rem;
          border-radius: 9999px;
        }

        .tag-gold { background: rgba(var(--primary-rgb), 0.15); color: var(--primary); }
        .tag-orange { background: rgba(var(--secondary-rgb), 0.15); color: var(--secondary); }
        .tag-red { background: rgba(var(--accent-rgb), 0.15); color: var(--accent); }
        .tag-muted { background: rgba(var(--text-primary-rgb), 0.06); color: var(--text-muted); }

        .job-period {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .timeline-titles {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .job-role {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .job-company {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .timeline-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.25rem;
        }

        .highlight-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
        }

        .chip-gold { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); }
        .chip-orange { background: rgba(var(--secondary-rgb), 0.1); color: var(--secondary); }
        .chip-red { background: rgba(var(--accent-rgb), 0.1); color: var(--accent); }
        .chip-muted { background: rgba(var(--text-primary-rgb), 0.05); color: var(--text-muted); }

        .expand-icon {
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }

        .timeline-bullets {
          list-style: none;
          padding: 0 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          border-top: 0px solid var(--border-light);
          margin-top: 0;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.3s ease,
                      padding 0.3s ease,
                      border-top-width 0.3s ease;
        }

        .timeline-bullets.bullets-open {
          max-height: 400px;
          opacity: 1;
          padding: 1rem 1.25rem 1.25rem;
          border-top-width: 1px;
        }

        .timeline-bullets li {
          display: flex;
          gap: 0.6rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          align-items: flex-start;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.25s ease, transform 0.25s ease;
        }

        .timeline-bullets.bullets-open li {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0s;
        }

        .bullet-dot {
          flex-shrink: 0;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          margin-top: 6px;
        }

        .dot-gold { background: var(--primary); }
        .dot-orange { background: var(--secondary); }
        .dot-red { background: var(--accent); }
        .dot-muted { background: var(--text-muted); }

        /* Sidebar */
        .sidebar-col {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* Skills */
        .skills-block {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .skill-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .skill-group-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .label-gold { color: var(--primary); }
        .label-orange { color: var(--secondary); }
        .label-red { color: var(--accent); }
        .label-muted { color: var(--text-muted); }

        .skill-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .skill-pill {
          font-size: 0.8rem;
          font-weight: 500;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          border: 1px solid transparent;
          transition: var(--transition-fast);
        }

        .pill-gold {
          background: rgba(var(--primary-rgb), 0.08);
          border-color: rgba(var(--primary-rgb), 0.2);
          color: var(--primary);
        }
        .pill-gold:hover { background: rgba(var(--primary-rgb), 0.18); }

        .pill-orange {
          background: rgba(var(--secondary-rgb), 0.08);
          border-color: rgba(var(--secondary-rgb), 0.2);
          color: var(--secondary);
        }
        .pill-orange:hover { background: rgba(var(--secondary-rgb), 0.18); }

        .pill-red {
          background: rgba(var(--accent-rgb), 0.08);
          border-color: rgba(var(--accent-rgb), 0.2);
          color: var(--accent);
        }
        .pill-red:hover { background: rgba(var(--accent-rgb), 0.18); }

        .pill-muted {
          background: rgba(var(--text-primary-rgb), 0.04);
          border-color: var(--border-light);
          color: var(--text-secondary);
        }
        .pill-muted:hover { background: rgba(var(--text-primary-rgb), 0.08); }

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

        /* Stats bar */
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr) repeat(3, auto);
          align-items: center;
          padding: 2rem 3rem;
          border-color: rgba(var(--primary-rgb), 0.12);
          background: rgba(18, 69, 89, 0.5);
        }

        @media (max-width: 768px) {
          .stats-bar {
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            padding: 1.75rem;
          }
          .stat-divider { display: none; }
        }

        .stat-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          text-align: center;
        }

        .stat-val {
          font-family: var(--font-display);
          font-size: 2.25rem;
          font-weight: 800;
          line-height: 1;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .stat-lbl {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .stat-divider {
          width: 1px;
          height: 44px;
          background: var(--border-light);
        }
      `}</style>
    </section>
  );
}
