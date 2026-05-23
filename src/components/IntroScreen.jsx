import React, { useState, useEffect, useRef } from 'react';

// ─── Chess pieces (spread around board edges to make convergence dramatic) ───
const INITIAL_PIECES = [
  { id: 'kn1', symbol: '♘', name: 'knight', row: 0, col: 1, color: 'var(--primary)' },
  { id: 'kn2', symbol: '♞', name: 'knight', row: 7, col: 6, color: 'var(--secondary)' },
  { id: 'rk1', symbol: '♜', name: 'rook',   row: 0, col: 7, color: 'var(--primary)' },
  { id: 'rk2', symbol: '♖', name: 'rook',   row: 7, col: 0, color: 'var(--secondary)' },
  { id: 'bs1', symbol: '♗', name: 'bishop', row: 0, col: 5, color: 'var(--accent)' },
  { id: 'bs2', symbol: '♝', name: 'bishop', row: 7, col: 1, color: 'var(--accent)' },
  { id: 'qn1', symbol: '♛', name: 'queen',  row: 0, col: 4, color: 'var(--primary)' },
  { id: 'kg1', symbol: '♔', name: 'king',   row: 4, col: 0, color: 'var(--accent)' },
];

const BOARD_DEG = -8;
const INSIDE = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

function validMoves(name, row, col, occupied = new Set()) {
  if (name === 'knight') {
    return [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]
      .map(([dr, dc]) => ({ r: row + dr, c: col + dc }))
      .filter(({ r, c }) => INSIDE(r, c));
  }
  const slideDirs = {
    rook:   [[-1,0],[1,0],[0,-1],[0,1]],
    bishop: [[-1,-1],[-1,1],[1,-1],[1,1]],
    queen:  [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]],
  };
  if (slideDirs[name]) {
    const moves = [];
    slideDirs[name].forEach(([dr, dc]) => {
      for (let step = 1; step <= 7; step++) {
        const r = row + dr * step, c = col + dc * step;
        if (!INSIDE(r, c) || occupied.has(`${r},${c}`)) break;
        moves.push({ r, c });
      }
    });
    return moves;
  }
  return [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]
    .map(([dr, dc]) => ({ r: row + dr, c: col + dc }))
    .filter(({ r, c }) => INSIDE(r, c));
}

// Returns the free square adjacent (Chebyshev dist 1) to the mouse that is
// closest to the piece. Excludes squares in `occupied` (other pieces + mouse).
// Bishops are color-bound, so only same-parity squares are considered.
function getBestAdjacentTarget(piece, tRow, tCol, occupied) {
  const bishopParity = piece.name === 'bishop' ? (piece.row + piece.col) % 2 : -1;
  const candidates = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = tRow + dr, c = tCol + dc;
      if (!INSIDE(r, c) || occupied.has(`${r},${c}`)) continue;
      if (bishopParity !== -1 && (r + c) % 2 !== bishopParity) continue;
      candidates.push({ r, c });
    }
  }
  if (!candidates.length) return null;
  return candidates.reduce((best, m) =>
    Math.abs(m.r - piece.row) + Math.abs(m.c - piece.col) <
    Math.abs(best.r - piece.row) + Math.abs(best.c - piece.col) ? m : best
  );
}

// BFS: finds the first step on the shortest legal path to (tRow, tCol).
// mouseRow/mouseCol is always off-limits. Other pieces are obstacles.
function bfsStep(piece, tRow, tCol, allPieces, mouseRow, mouseCol) {
  if (piece.row === tRow && piece.col === tCol) return null;

  const occupied = new Set(
    allPieces.filter(p => p.id !== piece.id).map(p => `${p.row},${p.col}`)
  );
  occupied.add(`${mouseRow},${mouseCol}`);

  const queue = [{ r: piece.row, c: piece.col, first: null }];
  const visited = new Set([`${piece.row},${piece.col}`]);

  while (queue.length) {
    const { r, c, first } = queue.shift();
    for (const move of validMoves(piece.name, r, c, occupied)) {
      const first2 = first ?? move;
      if (move.r === tRow && move.c === tCol) return first2; // reached target
      const key = `${move.r},${move.c}`;
      if (!visited.has(key) && !occupied.has(key)) {
        visited.add(key);
        queue.push({ r: move.r, c: move.c, first: first2 });
      }
    }
  }

  // Fallback: greedy step toward target
  const free = validMoves(piece.name, piece.row, piece.col, occupied);
  if (!free.length) return null;
  return free.reduce((best, m) =>
    Math.abs(m.r - tRow) + Math.abs(m.c - tCol) <
    Math.abs(best.r - tRow) + Math.abs(best.c - tCol) ? m : best
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function IntroScreen({ onComplete }) {
  const [visible, setVisible]   = useState(false);
  const [exiting, setExiting]   = useState(false);
  const [pieces, setPieces]     = useState(INITIAL_PIECES);
  const [target, setTarget]     = useState({ row: 4, col: 4 });

  const nameRef   = useRef(null);
  const boardRef  = useRef(null);
  const targetRef = useRef(target);

  useEffect(() => { targetRef.current = target; }, [target]);

  // Fade in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Mouse → board square (inverse-rotate around board center)
  useEffect(() => {
    const onMove = (e) => {
      const board = boardRef.current;
      if (!board) return;

      const rect  = board.getBoundingClientRect();
      const cx    = rect.left + rect.width  / 2;
      const cy    = rect.top  + rect.height / 2;
      const size  = board.offsetWidth; // actual size before CSS rotation

      const rad = (-BOARD_DEG) * Math.PI / 180; // inverse rotation
      const relX = e.clientX - cx;
      const relY = e.clientY - cy;
      const rx =  relX * Math.cos(rad) + relY * Math.sin(rad);
      const ry = -relX * Math.sin(rad) + relY * Math.cos(rad);

      const col = Math.floor((rx + size / 2) / (size / 8));
      const row = Math.floor((ry + size / 2) / (size / 8));
      setTarget({
        row: Math.max(0, Math.min(7, row)),
        col: Math.max(0, Math.min(7, col)),
      });
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Move pieces toward target via BFS every tick
  useEffect(() => {
    const id = setInterval(() => {
      setPieces(prev => {
        const { row: tRow, col: tCol } = targetRef.current;
        const next = [...prev];

        // Randomise move order so no piece gets permanent priority
        const order = [...next.keys()].sort(() => Math.random() - 0.5);
        for (const i of order) {
          if (Math.max(Math.abs(next[i].row - tRow), Math.abs(next[i].col - tCol)) <= 1) {
            continue;
          }
          // Find the closest free square adjacent to the mouse (reachable BFS target)
          const otherOcc = new Set(
            next.filter((_, j) => j !== i).map(p => `${p.row},${p.col}`)
          );
          otherOcc.add(`${tRow},${tCol}`);
          const adj = getBestAdjacentTarget(next[i], tRow, tCol, otherOcc);
          if (!adj) continue;
          const step = bfsStep(next[i], adj.r, adj.c, next, tRow, tCol);
          if (step) {
            next[i] = { ...next[i], row: step.r, col: step.c };
          } else {
            // BFS found no path — pick a random valid move to break the deadlock
            const occ2 = new Set(next.filter((_, j) => j !== i).map(p => `${p.row},${p.col}`));
            occ2.add(`${tRow},${tCol}`);
            const any = validMoves(next[i].name, next[i].row, next[i].col, occ2);
            if (any.length) next[i] = { ...next[i], ...any[Math.floor(Math.random() * any.length)] };
          }
        }
        return next;
      });
    }, 650);
    return () => clearInterval(id);
  }, []);

  // Click → FLIP name to header
  const handleClick = () => {
    if (!visible || exiting) return;
    setExiting(true);

    const nameEl   = nameRef.current;
    const targetEl = document.getElementById('header-logo-name');
    if (nameEl && targetEl) {
      const from  = nameEl.getBoundingClientRect();
      const to    = targetEl.getBoundingClientRect();
      const scale = to.height / from.height;
      const dx    = (to.left + to.width  / 2) - (from.left + from.width  / 2);
      const dy    = (to.top  + to.height / 2) - (from.top  + from.height / 2);

      void nameEl.offsetHeight;
      nameEl.style.transition = 'transform 0.72s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease 0.22s';
      nameEl.style.transform  = `translate(${dx}px, ${dy}px) scale(${scale})`;
      nameEl.style.opacity    = '0';
    }

    setTimeout(onComplete, 950);
  };

  const cls = ['intro-overlay', visible ? 'visible' : '', exiting ? 'exiting' : ''].join(' ');

  return (
    <div className={cls} onClick={handleClick}>

      {/* Interactive chess board */}
      <div ref={boardRef} className="intro-board">
        {Array.from({ length: 64 }).map((_, idx) => {
          const r = Math.floor(idx / 8);
          const c = idx % 8;
          const isTarget = r === target.row && c === target.col;
          return (
            <div
              key={idx}
              className={`intro-cell ${(r + c) % 2 === 1 ? 'cell-dark' : 'cell-light'} ${isTarget ? 'cell-target' : ''}`}
            />
          );
        })}

        {pieces.map(piece => (
          <span
            key={piece.id}
            className="intro-piece"
            style={{
              left: `${piece.col * 12.5}%`,
              top:  `${piece.row * 12.5}%`,
              color: piece.color,
              textShadow: `0 0 14px ${piece.color}55`,
            }}
          >
            {piece.symbol}
          </span>
        ))}
      </div>

      {/* Name + subtitle */}
      <div className="intro-center">
        <h1 ref={nameRef} className="intro-name">Karl Harding</h1>
        <div className="intro-line" />
        <p className="intro-sub">Software Engineer</p>
      </div>

      <p className="intro-hint">Click anywhere to continue</p>

      <style>{`
        .intro-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #0d3b66;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;
          transition: background-color 0.55s ease 0.5s;
        }
        .intro-overlay.exiting {
          background-color: transparent;
          pointer-events: none;
        }

        /* ── Board ── */
        .intro-board {
          position: absolute;
          top: 50%;
          left: 50%;
          width: min(119vw, 119vh);
          aspect-ratio: 1;
          transform: translate(-50%, -50%) rotate(${BOARD_DEG}deg);
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          grid-template-rows: repeat(8, 1fr);
          border: 1px solid rgba(244, 211, 94, 0.12);
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 0 80px rgba(244, 211, 94, 0.04);
          pointer-events: none;
        }
        .intro-cell { width: 100%; height: 100%; transition: background 0.25s ease; }
        .cell-dark   { background: rgba(244, 211, 94, 0.06); }
        .cell-light  { background: rgba(255, 255, 255, 0.01); }
        .cell-target { background: rgba(249, 87, 56, 0.22) !important; }

        .intro-piece {
          position: absolute;
          width: 12.5%;
          height: 12.5%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(2.5rem, 5.6vw, 4.4rem);
          line-height: 1;
          opacity: 0.4;
          filter: drop-shadow(0 0 8px currentColor);
          transition: left 0.55s cubic-bezier(0.25, 0.8, 0.25, 1),
                      top  0.55s cubic-bezier(0.25, 0.8, 0.25, 1);
          pointer-events: none;
        }

        /* ── Name ── */
        .intro-center {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .intro-name {
          font-family: 'Aboreto', serif;
          font-size: clamp(2.6rem, 8vw, 7.5rem);
          font-weight: 400;
          color: #faf0ca;
          letter-spacing: 0.05em;
          margin: 0;
          line-height: 1;
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.9s ease 0.15s,
                      transform 0.9s cubic-bezier(0.25, 0.8, 0.25, 1) 0.15s;
          transform-origin: center center;
          will-change: transform, opacity;
          text-shadow: 0 0 80px rgba(244, 211, 94, 0.1);
        }
        .intro-overlay.visible .intro-name { opacity: 1; transform: translateY(0); }

        .intro-line {
          width: 0;
          height: 1px;
          background: rgba(244, 211, 94, 0.35);
          margin: 1.5rem 0 1.25rem;
          transition: width 0.7s ease 0.85s;
        }
        .intro-overlay.visible .intro-line,
        .intro-overlay.exiting .intro-line { width: 100%; }
        .intro-overlay.exiting .intro-line { opacity: 0; transition: opacity 0.15s ease; }

        .intro-sub {
          font-size: clamp(0.65rem, 1.4vw, 0.85rem);
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(250, 240, 202, 0.5);
          margin: 0;
          opacity: 0;
          transition: opacity 0.7s ease 1s;
        }
        .intro-overlay.visible .intro-sub { opacity: 1; }
        .intro-overlay.exiting .intro-sub { opacity: 0; transition: opacity 0.15s ease; }

        /* ── Hint ── */
        .intro-hint {
          position: absolute;
          bottom: 2.5rem;
          z-index: 1;
          font-size: 0.68rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(250, 240, 202, 0.35);
          margin: 0;
          opacity: 0;
          transition: opacity 0.6s ease 1.5s;
        }
        .intro-overlay.visible .intro-hint {
          opacity: 1;
          animation: hint-pulse 2.8s ease-in-out 1.5s infinite;
        }
        .intro-overlay.exiting .intro-hint {
          opacity: 0 !important;
          animation: none !important;
          transition: opacity 0.1s ease !important;
        }
        @keyframes hint-pulse {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.7;  }
        }
      `}</style>
    </div>
  );
}
