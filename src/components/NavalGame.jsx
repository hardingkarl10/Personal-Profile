import React, { useState, useCallback, useRef, useEffect } from 'react';

// ── Constants ────────────────────────────────────────────────────────────────
const ROOM_MAX_HP = 30;
const PLAYER_NAME = 'The Jade Corsair';
const ENEMY_NAME  = 'The Iron Maiden';
const PLAYER_COLOR = '#22d3ee';
const ENEMY_COLOR  = '#f87171';

// 2x2 grid positions for each room (used for spatial layout)
const ROOM_GRID = {
  cannons: { row: 0, col: 0 },
  helm:    { row: 0, col: 1 },
  sails:   { row: 1, col: 0 },
  hull:    { row: 1, col: 1 },
};

const ROOM_LABELS = {
  cannons: 'Gun Deck',
  helm:    'Helm',
  sails:   'Sail Loft',
  hull:    'Hull Bay',
};

const ROOM_BONUS = {
  cannons: '+35% damage',
  helm:    '30% dodge',
  sails:   '+8 auto-repair',
  hull:    '−25% damage taken',
};

const makeShip = () => ({
  rooms: { cannons: ROOM_MAX_HP, helm: ROOM_MAX_HP, sails: ROOM_MAX_HP, hull: ROOM_MAX_HP },
  // crew id → { room, tile }. Tile is 0..3 in a 2x2 layout within the room:
  //   0 | 1
  //   2 | 3
  crew: {
    0: { room: 'cannons', tile: 0 },
    1: { room: 'hull',    tile: 3 },
  },
});

// ── Game logic helpers ──────────────────────────────────────────────────────
const clamp = (v, lo = 0, hi = ROOM_MAX_HP) => Math.min(hi, Math.max(lo, v));

function crewInRoom(ship, room) {
  return Object.entries(ship.crew).filter(([_, loc]) => loc.room === room).map(([id]) => Number(id));
}

function tileOccupied(ship, room, tile) {
  return Object.values(ship.crew).some(loc => loc.room === room && loc.tile === tile);
}

function findFreeTile(ship, room) {
  for (let t = 0; t < 4; t++) {
    if (!tileOccupied(ship, room, t)) return t;
  }
  return null;
}

function isManned(ship, room) {
  return crewInRoom(ship, room).length > 0 && ship.rooms[room] > 0;
}

function rollDamage(attacker) {
  if (attacker.rooms.cannons === 0) return 0;
  const base       = 14 + Math.random() * 6;             // 14–20
  const cannonMod  = attacker.rooms.cannons / ROOM_MAX_HP;
  const crewBoost  = isManned(attacker, 'cannons') ? 1.35 : 1;
  return Math.round(base * cannonMod * crewBoost);
}

function applyDamage(defender, room, rawDmg) {
  if (rawDmg === 0) return { ship: defender, dmg: 0, dodged: false };
  // Helm dodge
  if (isManned(defender, 'helm') && Math.random() < 0.30) {
    return { ship: defender, dmg: 0, dodged: true };
  }
  // Hull Bay armor reduction
  const reduced = isManned(defender, 'hull') ? Math.round(rawDmg * 0.75) : rawDmg;
  const newRooms = { ...defender.rooms, [room]: clamp(defender.rooms[room] - reduced, 0) };
  return { ship: { ...defender, rooms: newRooms }, dmg: reduced, dodged: false };
}

function applyAutoRepair(ship) {
  if (!isManned(ship, 'sails')) return { ship, healedRoom: null, amount: 0 };
  // Heal the most damaged room. Sails is eligible too — if it's the most damaged,
  // crew patches their own room first (otherwise the auto-repair stream dies).
  let pick = null;
  let lowest = ROOM_MAX_HP;
  for (const room of Object.keys(ship.rooms)) {
    if (ship.rooms[room] < lowest && ship.rooms[room] < ROOM_MAX_HP) {
      lowest = ship.rooms[room];
      pick = room;
    }
  }
  if (!pick) return { ship, healedRoom: null, amount: 0 };
  const amount = Math.min(8, ROOM_MAX_HP - ship.rooms[pick]);
  const newRooms = { ...ship.rooms, [pick]: ship.rooms[pick] + amount };
  return { ship: { ...ship, rooms: newRooms }, healedRoom: pick, amount };
}

function enemyPickTarget(player) {
  // Priority: low hull → finish them. Otherwise weighted random favoring cannons/hull.
  if (player.rooms.hull > 0 && player.rooms.hull < 12) return 'hull';
  const weighted = [];
  if (player.rooms.cannons > 0) weighted.push('cannons', 'cannons');
  if (player.rooms.hull > 0)    weighted.push('hull', 'hull', 'hull');
  if (player.rooms.helm > 0)    weighted.push('helm');
  if (player.rooms.sails > 0)   weighted.push('sails');
  return weighted[Math.floor(Math.random() * weighted.length)] || 'hull';
}

function enemyMaybeMove(enemy, player) {
  // 35% chance the enemy reorganizes a crew member based on the situation.
  if (Math.random() > 0.35) return enemy.crew;
  const crewIds = Object.keys(enemy.crew).map(Number);
  if (crewIds.length === 0) return enemy.crew;

  // Priority: man cannons if undefended, then hull when wounded, then sails if hurt anywhere.
  const someoneIn = (room) => crewInRoom(enemy, room).length > 0;
  let desired = null;
  if (!someoneIn('cannons') && enemy.rooms.cannons > 0)       desired = 'cannons';
  else if (enemy.rooms.hull < 18 && !someoneIn('hull'))       desired = 'hull';
  else if (Object.values(enemy.rooms).some(h => h < 22) && !someoneIn('sails') && enemy.rooms.sails > 0) desired = 'sails';
  else if (!someoneIn('helm') && enemy.rooms.helm > 0 && Math.random() < 0.4) desired = 'helm';
  if (!desired) return enemy.crew;

  // Pick crew from a different room and a free tile in the destination
  const movableId = crewIds.find(id => enemy.crew[id].room !== desired);
  if (movableId === undefined) return enemy.crew;
  const freeTile = findFreeTile(enemy, desired);
  if (freeTile === null) return enemy.crew;
  return { ...enemy.crew, [movableId]: { room: desired, tile: freeTile } };
}

// ── Ship grid (FTL-style spatial tiles + free-floating crew) ────────────────
// The 260x260 grid is divided into a 4x4 lattice of tiles. Every 2x2 block of
// tiles is one "room". Crew occupy specific tiles and slide between them via
// CSS transition on left/top. Layering: tiles (z:1, clickable) → rooms
// (z:2, pointer-events:none, hold HP/label/damage visuals) → crew (z:5).
function ShipGrid({
  ship, isPlayer, color, name,
  selectedCrew, targetedRoom,
  onCrewClick, onTileClick,
}) {
  // Tile center as % of the grid (used to position crew)
  const tilePos = (room, tile) => {
    const { row: rRow, col: rCol } = ROOM_GRID[room];
    const tCol = tile % 2;
    const tRow = Math.floor(tile / 2);
    return {
      x: rCol * 50 + tCol * 25 + 12.5,
      y: rRow * 50 + tRow * 25 + 12.5,
    };
  };

  // Flat list of all 16 tiles with their {room, tileIdx, left%, top%}
  const allTiles = Object.entries(ROOM_GRID).flatMap(([roomName, { row, col }]) =>
    [0, 1, 2, 3].map(tileIdx => {
      const tCol = tileIdx % 2;
      const tRow = Math.floor(tileIdx / 2);
      return {
        roomName,
        tileIdx,
        left: col * 50 + tCol * 25,
        top:  row * 50 + tRow * 25,
        // Only draw inner dividers — outer edges are handled by the grid border
        // and the cross-room dividers (ship-grid ::before / ::after).
        drawRight:  tCol === 0,
        drawBottom: tRow === 0,
      };
    })
  );

  return (
    <div className="ship-wrap">
      <div className="ship-title" style={{ color }}>{name}</div>
      <div className="ship-grid">
        {/* Wall dividers (cross at 50%) drawn via CSS pseudo-elements on .ship-grid */}

        {/* ── Tile overlays (clickable) ── */}
        {allTiles.map(({ roomName, tileIdx, left, top, drawRight, drawBottom }) => {
          const destroyed = ship.rooms[roomName] === 0;
          const occupied  = tileOccupied(ship, roomName, tileIdx);

          let cls = 'tile';
          if (drawRight)  cls += ' tile-div-r';
          if (drawBottom) cls += ' tile-div-b';
          if (isPlayer && selectedCrew !== null && !destroyed && !occupied) cls += ' tile-movable';
          if (!isPlayer && !destroyed) cls += ' tile-targetable';

          return (
            <div
              key={`${roomName}-${tileIdx}`}
              className={cls}
              style={{ left: `${left}%`, top: `${top}%`, width: '25%', height: '25%' }}
              onClick={() => onTileClick(roomName, tileIdx)}
            />
          );
        })}

        {/* ── Room visuals (non-interactive — clicks pass through to tiles) ── */}
        {Object.entries(ROOM_GRID).map(([roomName, { row, col }]) => {
          const hp        = ship.rooms[roomName];
          const pct       = (hp / ROOM_MAX_HP) * 100;
          const manned    = crewInRoom(ship, roomName).length > 0 && hp > 0;
          const destroyed = hp === 0;
          const targeted  = !isPlayer && targetedRoom === roomName;
          const damageOverlay = (1 - hp / ROOM_MAX_HP) * 0.45;

          const hpColor = hp > ROOM_MAX_HP * 0.6 ? color
                        : hp > ROOM_MAX_HP * 0.3 ? '#f59e0b'
                        : '#ef4444';

          let classes = 'room';
          if (manned)    classes += ' room-manned';
          if (destroyed) classes += ' room-destroyed';
          if (targeted)  classes += ' room-targeted';

          return (
            <div
              key={roomName}
              className={classes}
              style={{
                left:   `${col * 50}%`,
                top:    `${row * 50}%`,
                width:  '50%',
                height: '50%',
              }}
            >
              <div className="room-damage" style={{ opacity: damageOverlay }} />
              <div className="room-hp-bar">
                <div className="room-hp-fill" style={{ width: `${pct}%`, background: hpColor }} />
              </div>
              <div className="room-label">{ROOM_LABELS[roomName]}</div>
              <div className="room-hp-num" style={{ color: hp < 10 ? '#f87171' : 'rgba(255,255,255,0.55)' }}>{hp}</div>
              <div className={`room-bonus${manned ? ' bonus-on' : ''}`}>{ROOM_BONUS[roomName]}</div>
            </div>
          );
        })}

        {/* ── Crew pieces ── */}
        {Object.keys(ship.crew).map(cidStr => {
          const cid = Number(cidStr);
          const loc = ship.crew[cid];
          const { x, y } = tilePos(loc.room, loc.tile);
          return (
            <button
              key={cid}
              className={`crew-piece${selectedCrew === cid && isPlayer ? ' crew-selected' : ''}`}
              style={{
                left: `${x}%`,
                top:  `${y}%`,
                background: color,
                cursor: isPlayer ? 'pointer' : 'default',
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (isPlayer) onCrewClick(cid);
              }}
              aria-label={`Crew member ${cid + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Main game component ────────────────────────────────────────────────────
export default function NavalGame({ onBack }) {
  const [player, setPlayer]   = useState(makeShip);
  const [enemy,  setEnemy]    = useState(makeShip);
  const [phase,  setPhase]    = useState('aim');   // aim | resolving | win | lose
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [targetedRoom, setTargetedRoom] = useState(null);
  const [log,    setLog]      = useState([{ id: 0, msg: '⚓ The Iron Maiden cuts through the fog. Battle stations!' }]);
  const [round,  setRound]    = useState(1);
  const [anims,  setAnims]    = useState({ playerFires: false, enemyFires: false });
  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const pushLog = useCallback((msg) => {
    setLog(prev => {
      const id = prev.length > 0 ? prev[0].id + 1 : 1;
      return [{ id, msg }, ...prev].slice(0, 14);
    });
  }, []);

  // ── Click handlers ──
  const onPlayerCrewClick = (cid) => {
    if (phase !== 'aim') return;
    setSelectedCrew(prev => (prev === cid ? null : cid));
  };

  const onPlayerTileClick = (room, tile) => {
    if (phase !== 'aim') return;
    if (selectedCrew === null) return; // need a crew selected before tile clicks do anything
    if (player.rooms[room] === 0) {
      pushLog('⚠ That room is destroyed — your crew refuses to enter.');
      return;
    }
    const loc = player.crew[selectedCrew];
    if (loc.room === room && loc.tile === tile) {
      setSelectedCrew(null); // clicked the tile they're already standing on → deselect
      return;
    }
    if (tileOccupied(player, room, tile)) {
      pushLog('⚠ That tile is already occupied.');
      return;
    }
    setPlayer(p => ({ ...p, crew: { ...p.crew, [selectedCrew]: { room, tile } } }));
    setSelectedCrew(null);
  };

  // Enemy tile clicks fire at the room — tile index is ignored
  const onEnemyTileClick = (room) => {
    if (phase !== 'aim') return;
    if (enemy.rooms[room] === 0) {
      pushLog('⚠ That section is already in splinters. Choose another target.');
      return;
    }
    fire(room);
  };

  // No-op (enemy crew isn't selectable)
  const onEnemyCrewClick = () => {};

  // Skip-turn: lets player wait (e.g. when cannons are destroyed)
  const onSkipTurn = () => { if (phase === 'aim') fire(null); };

  // ── Round resolution ──
  const fire = (targetRoom) => {
    setPhase('resolving');
    setTargetedRoom(targetRoom);

    // Snapshot outcomes BEFORE applying either (true simultaneous resolution)
    const playerDmgRaw = targetRoom ? rollDamage(player) : 0;
    const enemyTarget  = enemyPickTarget(player);
    const enemyDmgRaw  = rollDamage(enemy);

    setAnims({
      playerFires: playerDmgRaw > 0,
      enemyFires:  enemyDmgRaw  > 0,
    });

    timerRef.current = setTimeout(() => {
      setAnims({ playerFires: false, enemyFires: false });

      // Apply both attacks based on START-of-round state
      const playerStrike = targetRoom ? applyDamage(enemy,  targetRoom, playerDmgRaw) : { ship: enemy,  dmg: 0, dodged: false };
      const enemyStrike  = applyDamage(player, enemyTarget, enemyDmgRaw);

      let newEnemy  = playerStrike.ship;
      let newPlayer = enemyStrike.ship;

      // Passive auto-repair from Sails (each side independently)
      const pRepair = applyAutoRepair(newPlayer);
      const eRepair = applyAutoRepair(newEnemy);
      newPlayer = pRepair.ship;
      newEnemy  = eRepair.ship;

      // Enemy may reposition crew after the volley
      newEnemy = { ...newEnemy, crew: enemyMaybeMove(newEnemy, newPlayer) };

      // ── Log ──
      if (targetRoom) {
        if (playerStrike.dodged) {
          pushLog(`🌊 They evade your shot at ${ROOM_LABELS[targetRoom]} — a clean miss!`);
        } else if (playerStrike.dmg > 0) {
          pushLog(`⚡ You strike their ${ROOM_LABELS[targetRoom]} — ${playerStrike.dmg} damage!`);
        } else {
          pushLog('🔇 Your guns are silent — Gun Deck disabled!');
        }
      } else {
        pushLog('⏳ You hold fire and tend to the ship.');
      }

      if (enemyDmgRaw > 0) {
        if (enemyStrike.dodged) {
          pushLog(`🌊 You roll the helm and dodge their shot at ${ROOM_LABELS[enemyTarget]}!`);
        } else {
          pushLog(`💥 ${ENEMY_NAME} fires at your ${ROOM_LABELS[enemyTarget]} — ${enemyStrike.dmg} damage!`);
        }
      } else {
        pushLog(`🔇 ${ENEMY_NAME}'s cannons are silent — their guns are wrecked.`);
      }

      if (pRepair.healedRoom) pushLog(`🔧 Your crew patches ${ROOM_LABELS[pRepair.healedRoom]} (+${pRepair.amount}).`);
      if (eRepair.healedRoom) pushLog(`🔧 Their crew patches ${ROOM_LABELS[eRepair.healedRoom]} (+${eRepair.amount}).`);

      setPlayer(newPlayer);
      setEnemy(newEnemy);
      setTargetedRoom(null);
      setRound(r => r + 1);

      // Win/lose — Hull Bay at 0 = ship sinks. Enemy checked first → player wins ties.
      if (newEnemy.rooms.hull === 0) {
        setPhase('win');
        pushLog('🏴‍☠️ Their hull is breached! The Iron Maiden slips beneath the waves.');
      } else if (newPlayer.rooms.hull === 0) {
        setPhase('lose');
        pushLog('💀 Your hull caves in. The sea claims The Jade Corsair.');
      } else {
        setPhase('aim');
      }
    }, 1350);
  };

  const restart = () => {
    // Cancel any pending volley so it doesn't clobber the freshly reset state.
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPlayer(makeShip());
    setEnemy(makeShip());
    setLog([{ id: 0, msg: '⚓ The Iron Maiden returns from the depths. Prepare to fight!' }]);
    setRound(1);
    setSelectedCrew(null);
    setTargetedRoom(null);
    setPhase('aim');
    setAnims({ playerFires: false, enemyFires: false });
  };

  // ── Hint banner text ──
  let hint;
  if (phase === 'resolving')      hint = '⚔ Exchanging fire…';
  else if (selectedCrew !== null) hint = 'Click any of your rooms to move this crew. Click them again to cancel.';
  else if (player.rooms.cannons === 0) hint = 'Gun Deck destroyed — wait for repairs or hit Skip Turn.';
  else                             hint = 'Click your crew to move them. Click an enemy room to fire.';

  const cannotFire = player.rooms.cannons === 0;

  return (
    <div className="naval-page">
      {/* ── Top bar ── */}
      <header className="naval-topbar">
        <button onClick={onBack} className="back-btn">← Portfolio</button>
        <div className="title-block">
          <h1 className="naval-title">Naval Combat</h1>
          <span className="round-info">Round {round}</span>
        </div>
        <button onClick={restart} className="restart-mini" title="Restart">↻</button>
      </header>

      {/* ── Arena ── */}
      <div className="naval-arena">
        <ShipGrid
          ship={player}
          isPlayer={true}
          name={PLAYER_NAME}
          color={PLAYER_COLOR}
          selectedCrew={selectedCrew}
          targetedRoom={null}
          onTileClick={onPlayerTileClick}
          onCrewClick={onPlayerCrewClick}
        />

        <div className="battle-area">
          {anims.playerFires && <div className="cannonball ball-right" />}
          {anims.enemyFires  && <div className="cannonball ball-left"  />}

          <div className="vs-divider">
            <div className="vs-line" />
            <span className="vs-text">VS</span>
            <div className="vs-line" />
          </div>

          <div className={`hint-banner ${phase === 'resolving' ? 'hint-resolving' : ''}`}>{hint}</div>

          {phase === 'aim' && (
            <button
              className={`skip-btn${cannotFire ? ' skip-urgent' : ''}`}
              onClick={onSkipTurn}
            >
              {cannotFire ? 'Skip Turn (no guns)' : 'Skip Turn'}
            </button>
          )}
        </div>

        <ShipGrid
          ship={enemy}
          isPlayer={false}
          name={ENEMY_NAME}
          color={ENEMY_COLOR}
          selectedCrew={null}
          targetedRoom={targetedRoom}
          onTileClick={onEnemyTileClick}
          onCrewClick={onEnemyCrewClick}
        />
      </div>

      {/* ── End overlay ── */}
      {(phase === 'win' || phase === 'lose') && (
        <div className="end-overlay">
          <div className="end-card">
            <div className="end-icon">{phase === 'win' ? '🏴‍☠️' : '💀'}</div>
            <div className="end-title" style={{ color: phase === 'win' ? PLAYER_COLOR : ENEMY_COLOR }}>
              {phase === 'win' ? 'Victory!' : 'Defeated.'}
            </div>
            <div className="end-sub">Survived {round - 1} round{round - 1 === 1 ? '' : 's'}</div>
            <button onClick={restart} className="end-btn end-btn-primary">Sail Again</button>
            <button onClick={onBack} className="end-btn end-btn-ghost">Back to Portfolio</button>
          </div>
        </div>
      )}

      {/* ── Log ── */}
      <div className="combat-log">
        {log.map(({ id, msg }, i) => (
          <div key={id} className={`log-line${i === 0 ? ' log-fresh' : ''}`}>{msg}</div>
        ))}
      </div>

      <style>{`
        .naval-page {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse at center top, #0c2d4a 0%, #06111e 70%, #000 100%);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          color: #e5e7eb;
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
          overflow: hidden;
        }

        /* ── Topbar ── */
        .naval-topbar {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0.85rem 1.5rem;
          background: rgba(0,0,0,0.5);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(8px);
        }

        .back-btn, .restart-mini {
          background: transparent;
          color: rgba(255,255,255,0.65);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 0.45rem 0.95rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.82rem;
          transition: all 0.15s;
          font-family: inherit;
        }
        .restart-mini { padding: 0.45rem 0.7rem; justify-self: end; }
        .back-btn:hover, .restart-mini:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.04);
        }

        .title-block {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .naval-title {
          font-family: 'Aboreto', var(--font-display, serif);
          font-size: 1.45rem;
          margin: 0;
          letter-spacing: 0.06em;
          background: linear-gradient(135deg, #fff 0%, ${PLAYER_COLOR} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .round-info {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 2px;
        }

        /* ── Arena ── */
        .naval-arena {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          gap: 1.5rem;
          position: relative;
          min-height: 0;
          overflow: hidden;
        }

        .ship-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          flex: 0 0 auto;
        }

        .ship-title {
          font-family: 'Aboreto', var(--font-display, serif);
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .ship-grid {
          position: relative;
          width: 260px;
          height: 260px;
          background: rgba(8, 20, 32, 0.55);
          border: 1.5px solid rgba(255,255,255,0.18);
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,0.4), inset 0 0 40px rgba(0,0,0,0.3);
        }

        /* Cross-shaped wall dividers — pure decoration, clicks pass through */
        .ship-grid::before, .ship-grid::after {
          content: '';
          position: absolute;
          background: rgba(255,255,255,0.13);
          pointer-events: none;
          z-index: 2;
        }
        .ship-grid::before {
          top: 0; bottom: 0; left: 50%;
          width: 1.5px;
          margin-left: -0.75px;
        }
        .ship-grid::after {
          left: 0; right: 0; top: 50%;
          height: 1.5px;
          margin-top: -0.75px;
        }

        /* ── Tile overlays (clickable; sit BELOW room visuals so HP/labels show on top) ── */
        .tile {
          position: absolute;
          z-index: 1;
          transition: background 0.15s;
        }
        /* Inner tile dividers — only on tiles that need an edge (outer edges
           are covered by the grid border and the cross room divider). */
        .tile-div-r  { border-right:  1px solid rgba(255,255,255,0.05); }
        .tile-div-b  { border-bottom: 1px solid rgba(255,255,255,0.05); }

        .tile-targetable { cursor: pointer; }
        .tile-targetable:hover { background: rgba(251,191,36,0.10); }

        .tile-movable    { cursor: pointer; }
        .tile-movable:hover { background: rgba(34,211,238,0.10); }

        /* ── Room visuals (non-interactive; sit ABOVE tiles for HP/labels/damage) ── */
        .room {
          position: absolute;
          pointer-events: none;
          z-index: 2;
          background: rgba(255,255,255,0.015);
          overflow: hidden;
        }
        .room-manned { background: rgba(255,255,255,0.035); }

        .room-targeted {
          background: rgba(251,191,36,0.16);
          box-shadow: inset 0 0 24px rgba(251,191,36,0.35);
        }

        .room-destroyed {
          background: rgba(60, 10, 10, 0.35);
        }

        /* Red damage tint that grows as room HP drops */
        .room-damage {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center,
            rgba(239,68,68,0.55) 0%,
            rgba(239,68,68,0.15) 50%,
            transparent 80%);
          pointer-events: none;
          transition: opacity 0.4s ease;
        }

        /* HP bar — thin strip across the top of each room */
        .room-hp-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2.5px;
          background: rgba(255,255,255,0.06);
          z-index: 1;
        }
        .room-hp-fill {
          height: 100%;
          transition: width 0.45s ease, background 0.3s;
        }

        .room-label {
          position: absolute;
          top: 8px; left: 8px;
          font-size: 0.62rem;
          font-weight: 700;
          color: rgba(255,255,255,0.78);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          z-index: 1;
        }
        .room-hp-num {
          position: absolute;
          top: 7px; right: 8px;
          font-size: 0.7rem;
          font-variant-numeric: tabular-nums;
          font-weight: 600;
          z-index: 1;
          transition: color 0.3s;
        }
        .room-bonus {
          position: absolute;
          bottom: 6px; left: 6px; right: 6px;
          font-size: 0.6rem;
          color: rgba(255,255,255,0.32);
          text-align: center;
          letter-spacing: 0.02em;
          line-height: 1.15;
          z-index: 1;
        }
        .bonus-on { color: rgba(255,255,255,0.85); font-weight: 600; }

        /* ── Crew pieces — rendered as siblings of rooms, position via left/top % ── */
        .crew-piece {
          position: absolute;
          width: 16px;
          height: 16px;
          margin-left: -8px;
          margin-top:  -8px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.45);
          padding: 0;
          z-index: 5;
          /* The slide-between-rooms animation */
          transition: left 0.45s cubic-bezier(0.4, 0, 0.2, 1),
                      top  0.45s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.2s;
        }
        .crew-piece:hover { z-index: 6; }
        .crew-selected {
          border-color: #fff;
          animation: crewPulse 1.2s ease-in-out infinite;
          z-index: 6;
        }
        @keyframes crewPulse {
          0%, 100% { box-shadow: 0 0 5px #fff, 0 0 10px rgba(255,255,255,0.4); }
          50%      { box-shadow: 0 0 9px #fff, 0 0 20px rgba(255,255,255,0.7); }
        }

        /* ── Battle area ── */
        .battle-area {
          flex: 1;
          position: relative;
          align-self: stretch;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          min-width: 180px;
        }

        .vs-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          max-width: 280px;
        }
        .vs-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        }
        .vs-text {
          font-family: 'Aboreto', var(--font-display, serif);
          color: rgba(255,255,255,0.35);
          font-size: 1rem;
          letter-spacing: 0.2em;
        }

        .hint-banner {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.55);
          text-align: center;
          padding: 0 1rem;
          line-height: 1.5;
          max-width: 240px;
        }
        .hint-resolving { animation: breathe 0.9s ease-in-out infinite; }

        @keyframes breathe {
          0%, 100% { opacity: 0.45; }
          50%      { opacity: 1;    }
        }

        .skip-btn {
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 0.5rem 1.2rem;
          border-radius: 9999px;
          cursor: pointer;
          font-size: 0.78rem;
          font-family: inherit;
          transition: all 0.15s;
        }
        .skip-btn:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.08);
        }
        .skip-urgent {
          color: #fbbf24;
          border-color: rgba(251,191,36,0.4);
          background: rgba(251,191,36,0.08);
          animation: nudge 1.6s ease-in-out infinite;
        }
        @keyframes nudge {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-2px); }
        }

        /* ── Cannonballs (positioned in battle-area, fly past edges into ship grids) ── */
        .cannonball {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 11px;
          height: 11px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 3;
        }
        .ball-right {
          background: #fbbf24;
          box-shadow: 0 0 12px #f59e0b, 0 0 24px rgba(245,158,11,0.5);
          animation: ballRight 1.25s ease-in forwards;
        }
        .ball-left {
          background: #fb7185;
          box-shadow: 0 0 12px #ef4444, 0 0 24px rgba(239,68,68,0.5);
          animation: ballLeft 1.25s ease-in forwards;
        }
        /* left/right percentages resolve against the parent (.battle-area), which is what we want */
        @keyframes ballRight {
          from { left: -15%;  opacity: 0.2; }
          15%  { left: 0%;    opacity: 1;   }
          to   { left: 115%;  opacity: 0.3; }
        }
        @keyframes ballLeft {
          from { right: -15%; opacity: 0.2; }
          15%  { right: 0%;   opacity: 1;   }
          to   { right: 115%; opacity: 0.3; }
        }

        /* ── Combat log ── */
        .combat-log {
          background: rgba(0,0,0,0.55);
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 0.65rem 1.5rem;
          max-height: 96px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.18rem;
          flex-shrink: 0;
        }
        .log-line {
          font-size: 0.76rem;
          color: rgba(255,255,255,0.38);
          line-height: 1.45;
          transition: color 0.3s;
        }
        .log-fresh { color: rgba(255,255,255,0.9); }

        /* ── End overlay ── */
        .end-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          animation: fadeIn 0.4s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .end-card {
          background: rgba(15, 25, 40, 0.95);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          padding: 2.5rem 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.85rem;
          text-align: center;
          min-width: 280px;
        }
        .end-icon  { font-size: 3rem; }
        .end-title {
          font-family: 'Aboreto', var(--font-display, serif);
          font-size: 1.8rem;
          font-weight: 700;
        }
        .end-sub {
          color: rgba(255,255,255,0.5);
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
        }
        .end-btn {
          padding: 0.6rem 1.5rem;
          border-radius: 9999px;
          font-family: 'Aboreto', var(--font-display, serif);
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.15s;
          min-width: 220px;
          letter-spacing: 0.05em;
        }
        .end-btn-primary {
          background: rgba(34,211,238,0.15);
          color: ${PLAYER_COLOR};
          border: 1px solid rgba(34,211,238,0.4);
        }
        .end-btn-primary:hover {
          background: ${PLAYER_COLOR};
          color: #0a1628;
          box-shadow: 0 0 18px rgba(34,211,238,0.45);
        }
        .end-btn-ghost {
          background: transparent;
          color: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.18);
        }
        .end-btn-ghost:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.45);
        }

        /* ── Responsive ── */
        @media (max-width: 980px) {
          .naval-arena {
            flex-direction: column;
            padding: 1rem;
            gap: 0.85rem;
            justify-content: flex-start;
            overflow-y: auto;
          }
          .battle-area {
            min-height: 130px;
            width: 100%;
            align-self: auto;
          }
          /* Ships stack vertically on mobile — horizontal cannonballs don't make spatial sense. Hide them. */
          .cannonball { display: none; }
        }

        @media (max-width: 600px) {
          .naval-topbar { padding: 0.7rem 1rem; }
          .naval-title  { font-size: 1.15rem; }
          /* Shrink the spatial grid on phones — crew positions are in %, so they scale with it */
          .ship-grid    { width: 220px; height: 220px; }
          .room-label   { font-size: 0.56rem; top: 6px; left: 6px; }
          .room-hp-num  { font-size: 0.65rem; top: 5px; right: 6px; }
          .room-bonus   { font-size: 0.55rem; }
          .end-card     { padding: 2rem 1.5rem; min-width: 0; width: 90%; max-width: 320px; }
          .end-btn      { min-width: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
