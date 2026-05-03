'use client';

import { useMemo, useState } from 'react';
import { updateGame } from '@/api/rollWithMe';
import { useRollWithMeStore, isMyTurn } from '@/hooks/useRollWithMeStore';
import {
  calculateScores,
  emptyScoreboard,
  isScoreboardComplete,
  rollDice
} from '@/utils/rollWithMeScoring';
import type { GameStatePatch, RollWithMeGame, Slot } from '@/types/rollWithMe';
import { Dice } from './Dice';
import { Scoreboard } from './Scoreboard';

interface GameBoardProps {
  game: RollWithMeGame;
  myUid: string | undefined;
}

const ROLL_TEXT: Record<number, string> = {
  0: 'Roll',
  1: 'Roll Again',
  2: 'Last Roll',
  3: 'Turn Over'
};

export const GameBoard = ({ game, myUid }: GameBoardProps) => {
  const setGame = useRollWithMeStore(s => s.setGame);
  const selectedSlot = useRollWithMeStore(s => s.selectedSlot);
  const setSelectedSlot = useRollWithMeStore(s => s.setSelectedSlot);
  const [isRolling, setIsRolling] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const myTurn = isMyTurn(game, myUid);
  const hasRolled = game.currentRollNum > 0;
  const canRoll = myTurn && !isRolling && game.currentRollNum < 3;
  const available = useMemo(
    () => (hasRolled ? calculateScores(game.currentRoll) : emptyScoreboard()),
    [game.currentRoll, hasRolled]
  );

  const persist = async (patch: GameStatePatch) => {
    const updated = await updateGame(game.id, patch);
    if (updated) setGame(updated);
  };

  const handleRoll = async () => {
    if (!canRoll) return;
    setIsRolling(true);
    try {
      const next = rollDice(game.currentRoll, game.lockedDice);
      const nextRollNum = game.currentRollNum + 1;
      // Optimistic local update
      setGame({ ...game, currentRoll: next, currentRollNum: nextRollNum });
      setSelectedSlot(null);
      await persist({ currentRoll: next, currentRollNum: nextRollNum });
    } finally {
      setIsRolling(false);
    }
  };

  const handleToggleLock = async (dieIndex: number) => {
    if (!myTurn || !hasRolled) return;
    const isLocked = game.lockedDice.includes(dieIndex);
    const next = isLocked ? game.lockedDice.filter(d => d !== dieIndex) : [...game.lockedDice, dieIndex];
    setGame({ ...game, lockedDice: next });
    await persist({ lockedDice: next });
  };

  const handleSelectSlot = (slot: Slot) => {
    if (!myTurn || !hasRolled) return;
    setSelectedSlot(slot === selectedSlot ? null : slot);
  };

  const activeColumn: 'player1' | 'player2' = game.currentPlayer;

  const handlePlay = async () => {
    if (!myTurn || !selectedSlot || !hasRolled || isPlaying) return;
    setIsPlaying(true);
    try {
      const score = available[selectedSlot];
      const patch: GameStatePatch = {
        currentRoll: [0, 0, 0, 0, 0],
        currentRollNum: 0,
        lockedDice: []
      };

      const player1Scores =
        activeColumn === 'player1' ? { ...game.player1.scores, [selectedSlot]: score } : game.player1.scores;
      const player2Scores =
        activeColumn === 'player2' && game.player2
          ? { ...game.player2.scores, [selectedSlot]: score }
          : game.player2?.scores;

      if (activeColumn === 'player1') patch.player1Scores = player1Scores;
      if (activeColumn === 'player2') patch.player2Scores = player2Scores;

      // Switch turn in versus when there's a player2 still with open slots
      if (game.type === 'versus' && game.player2) {
        const otherDone = isScoreboardComplete(activeColumn === 'player1' ? player2Scores! : player1Scores);
        patch.currentPlayer = otherDone ? activeColumn : activeColumn === 'player1' ? 'player2' : 'player1';
      }

      const p1Done = isScoreboardComplete(player1Scores);
      const p2Done = game.type === 'versus' && game.player2 ? isScoreboardComplete(player2Scores!) : true;
      if (p1Done && p2Done) patch.isGameOver = true;

      // Optimistic
      setGame({
        ...game,
        currentRoll: [0, 0, 0, 0, 0],
        currentRollNum: 0,
        lockedDice: [],
        player1: { ...game.player1, scores: player1Scores },
        player2: game.player2 && player2Scores ? { ...game.player2, scores: player2Scores } : game.player2,
        currentPlayer: patch.currentPlayer ?? game.currentPlayer,
        isGameOver: patch.isGameOver ?? game.isGameOver
      });
      setSelectedSlot(null);

      await persist(patch);
    } finally {
      setIsPlaying(false);
    }
  };

  const turnLabel = myTurn
    ? `Your turn — ${game.currentRollNum}/3 rolls`
    : `${activeColumn === 'player1' ? game.player1.name : game.player2?.name ?? 'Opponent'}'s turn`;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="text-center mb-2 text-neutral-300 text-sm">{turnLabel}</div>

      <Dice
        currentRoll={game.currentRoll}
        currentRollNum={game.currentRollNum}
        lockedDice={game.lockedDice}
        isRolling={isRolling}
        canInteract={myTurn}
        onToggleLock={handleToggleLock}
      />

      <div className="flex gap-3 justify-center my-4">
        <button
          type="button"
          onClick={handleRoll}
          disabled={!canRoll}
          className="bg-brand-500 hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-md cursor-pointer min-w-32"
        >
          {isRolling ? 'Rolling…' : ROLL_TEXT[game.currentRollNum]}
        </button>
        <button
          type="button"
          onClick={handlePlay}
          disabled={!myTurn || !selectedSlot || !hasRolled || isPlaying}
          className="bg-neutral-700 hover:bg-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-md cursor-pointer min-w-24"
        >
          Play
        </button>
      </div>

      <Scoreboard
        player1={game.player1}
        player2={game.player2}
        available={available}
        selectedSlot={selectedSlot}
        canSelect={myTurn}
        hasRolled={hasRolled}
        activeColumn={activeColumn}
        onSelectSlot={handleSelectSlot}
      />
    </div>
  );
};
