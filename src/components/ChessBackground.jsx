import React, { useState, useEffect } from "react";

// Unicode Chess Symbols
// White: ♔ ♕ ♖ ♗ ♘ ♙
// Black: ♚ ♛ ♜ ♝ ♞ ♟
const PIECES_CONFIG = [
  {
    id: "knight-w",
    symbol: "♘",
    name: "knight",
    row: 1,
    col: 2,
    color: "var(--secondary)",
  },
  {
    id: "rook-b",
    symbol: "♜",
    name: "rook",
    row: 0,
    col: 0,
    color: "var(--primary)",
  },
  {
    id: "bishop-w",
    symbol: "♗",
    name: "bishop",
    row: 2,
    col: 5,
    color: "var(--accent)",
  },
  {
    id: "queen-b",
    symbol: "♛",
    name: "queen",
    row: 4,
    col: 3,
    color: "var(--primary)",
  },
  {
    id: "pawn-1",
    symbol: "♙",
    name: "pawn",
    row: 6,
    col: 4,
    color: "var(--text-muted)",
  },
  {
    id: "knight-b",
    symbol: "♞",
    name: "knight",
    row: 5,
    col: 1,
    color: "var(--secondary)",
  },
];

export default function ChessBackground() {
  const [pieces, setPieces] = useState(PIECES_CONFIG);

  const calculateNextMove = (piece, occupied) => {
    const { name, row, col } = piece;
    let validMoves = [];
    const isInside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
    const isFree = (r, c) => !occupied.some((sq) => sq.r === r && sq.c === c);

    const slide = (dirs) => {
      dirs.forEach(([dr, dc]) => {
        for (let step = 1; step <= 7; step++) {
          const nr = row + dr * step, nc = col + dc * step;
          if (!isInside(nr, nc) || !isFree(nr, nc)) break;
          validMoves.push({ r: nr, c: nc });
        }
      });
    };

    if (name === "knight") {
      [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr, dc]) => {
        const nr = row + dr, nc = col + dc;
        if (isInside(nr, nc) && isFree(nr, nc)) validMoves.push({ r: nr, c: nc });
      });
    } else if (name === "rook") {
      slide([[-1,0],[1,0],[0,-1],[0,1]]);
    } else if (name === "bishop") {
      slide([[-1,-1],[-1,1],[1,-1],[1,1]]);
    } else if (name === "queen") {
      slide([[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]);
    } else {
      [[-1,0],[1,0]].forEach(([dr, dc]) => {
        const nr = row + dr, nc = col + dc;
        if (isInside(nr, nc) && isFree(nr, nc)) validMoves.push({ r: nr, c: nc });
      });
    }

    if (validMoves.length === 0) {
      let best = null, bestDist = Infinity;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (isFree(r, c)) {
            const dist = Math.abs(r - row) + Math.abs(c - col);
            if (dist < bestDist) { bestDist = dist; best = { r, c }; }
          }
        }
      }
      return best ?? { r: row, c: col };
    }
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  };

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPieces((prevPieces) => {
        const idxToMove = Math.floor(Math.random() * prevPieces.length);
        const pieceToMove = prevPieces[idxToMove];
        const occupied = prevPieces
          .filter((_, i) => i !== idxToMove)
          .map((p) => ({ r: p.row, c: p.col }));
        const nextSq = calculateNextMove(pieceToMove, occupied);
        return prevPieces.map((p, i) =>
          i === idxToMove ? { ...p, row: nextSq.r, col: nextSq.c } : p
        );
      });
    }, 3000);

    return () => clearInterval(moveInterval);
  }, []);

  return (
    <div className="chess-bg-container">
      {/* 8x8 Board Grid */}
      <div className="chess-board">
        {Array.from({ length: 64 }).map((_, idx) => {
          const r = Math.floor(idx / 8);
          const c = idx % 8;
          const isDark = (r + c) % 2 === 1;
          return (
            <div
              key={idx}
              className={`board-cell ${isDark ? "cell-dark" : "cell-light"}`}
            />
          );
        })}

        {/* Floating Pieces */}
        {pieces.map((piece) => {
          const leftPercent = piece.col * 12.5;
          const topPercent = piece.row * 12.5;

          return (
            <span
              key={piece.id}
              className="chess-bg-piece"
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                color: piece.color,
                textShadow: `0 0 10px ${piece.color}33`,
              }}
            >
              {piece.symbol}
            </span>
          );
        })}
      </div>

      <style>{`
        .chess-bg-container {
          position: fixed;
          top: 50svh;
          left: 50vw;
          transform: translate(-50%, -50%) rotate(-8deg);
          width: min(119vw, 119svh);
          aspect-ratio: 1/1;
          z-index: 0;
          pointer-events: none;
          user-select: none;
        }

        .chess-board {
          position: relative;
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          grid-template-rows: repeat(8, 1fr);
          border: 1px solid rgba(var(--primary-rgb), 0.15);
          border-radius: 4px;
          overflow: hidden;
          box-shadow:
            0 0 80px rgba(var(--primary-rgb), 0.1),
            inset 0 0 40px rgba(165, 95, 63, 0.1);
        }

        .board-cell {
          width: 100%;
          height: 100%;
        }

        .cell-dark {
          background: rgba(var(--accent-rgb), 0.1);
        }

        .cell-light {
          background: rgba(var(--tertiary-rgb), 0.06);
        }

        .chess-bg-piece {
          position: absolute;
          width: 12.5%;
          height: 12.5%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(2.5rem, 5.6vw, 4.4rem);
          line-height: 1;
          transition: left 1.4s cubic-bezier(0.25, 0.8, 0.25, 1), top 1.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          font-weight: normal;
          opacity: 0.25;
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  );
}
