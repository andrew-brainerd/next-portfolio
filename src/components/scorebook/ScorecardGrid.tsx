'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';

import { clearFrisbeeGolfScore, getFrisbeeGolfRound, setFrisbeeGolfScore } from '@/api/scorebook';
import { formatOverUnder } from '@/utils/frisbeeGolfLeaderboard';
import { brandButtonSx, brandContainedButtonSx } from '@/components/scorebook/fieldStyles';
import { NumberInput } from '@/components/scorebook/NumberInput';
import { PlayerAvatar } from '@/components/scorebook/PlayerAvatar';
import type { FrisbeeGolfRound } from '@/types/scorebook';

const MAX_SCORE = 15;

interface ScorecardGridProps {
  round: FrisbeeGolfRound;
  // Only the owner/gamemaster may edit; everyone else views it read-only.
  canEdit: boolean;
  onRoundUpdate?: (round: FrisbeeGolfRound) => void;
}

interface EditingCell {
  playerId: string;
  holeNumber: number;
}

// Full players×holes scorecard. The owner/gamemaster can tap any cell to set or
// clear that score directly (no hole-by-hole stepping); everyone else sees the
// same grid read-only. Realtime is owned by the parent — this reads `round` and
// writes through `onRoundUpdate`.
export const ScorecardGrid = ({ round, canEdit, onRoundUpdate }: ScorecardGridProps) => {
  const [editing, setEditing] = useState<EditingCell | null>(null);
  const [draft, setDraft] = useState(1);
  const [saving, setSaving] = useState(false);

  const editingPlayer = editing && round.players.find(p => p.id === editing.playerId);
  const editingHole = editing && round.holes.find(h => h.number === editing.holeNumber);
  const editingSaved = editing ? round.scores[editing.playerId]?.[editing.holeNumber] : undefined;

  const openCell = (playerId: string, holeNumber: number, par: number) => {
    const existing = round.scores[playerId]?.[holeNumber];
    setDraft(typeof existing === 'number' ? existing : par);
    setEditing({ playerId, holeNumber });
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await setFrisbeeGolfScore(round.id, editing.playerId, editing.holeNumber, draft);
      if (updated) onRoundUpdate?.(updated);
      setEditing(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await clearFrisbeeGolfScore(round.id, editing.playerId, editing.holeNumber);
      const fresh = await getFrisbeeGolfRound(round.id);
      if (fresh) onRoundUpdate?.(fresh);
      setEditing(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="overflow-x-auto rounded border border-neutral-700">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-800 text-neutral-400">
              <th className="sticky left-0 z-10 bg-neutral-800 p-2 text-left font-medium">Player</th>
              {round.holes.map(h => (
                <th key={h.number} className="whitespace-nowrap px-2 py-1 text-center font-medium">
                  <div className="text-white">{h.number}</div>
                  <div className="text-[10px] font-normal text-neutral-500">par {h.par}</div>
                </th>
              ))}
              <th className="px-2 py-1 text-center font-medium text-white">Tot</th>
            </tr>
          </thead>
          <tbody>
            {round.players.map(player => {
              const scores = round.scores[player.id] || {};
              const played = round.holes.filter(h => typeof scores[h.number] === 'number');
              const total = played.reduce((sum, h) => sum + (scores[h.number] as number), 0);
              const overUnder = played.reduce((sum, h) => sum + ((scores[h.number] as number) - h.par), 0);
              const disqualified = (round.disqualifiedPlayerIds ?? []).includes(player.id);
              return (
                <tr key={player.id} className="border-t border-neutral-700">
                  <td className="sticky left-0 z-10 bg-neutral-800 p-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <PlayerAvatar
                        userId={player.userId}
                        displayName={player.displayName}
                        photoURL={player.photoURL}
                        color={player.color}
                      />
                      <span
                        className={`max-w-[8rem] truncate font-medium ${
                          disqualified ? 'text-neutral-500 line-through' : 'text-white'
                        }`}
                      >
                        {player.displayName}
                      </span>
                      {disqualified && (
                        <span className="rounded bg-red-500/20 px-1 text-[9px] font-semibold uppercase text-red-400">
                          DQ
                        </span>
                      )}
                    </span>
                  </td>
                  {round.holes.map(h => {
                    const value = scores[h.number];
                    const isEditing = editing?.playerId === player.id && editing?.holeNumber === h.number;
                    const display = typeof value === 'number' ? value : '—';
                    const cellBase = `h-10 w-10 rounded font-mono text-white ${
                      typeof value === 'number' ? 'bg-neutral-800' : 'bg-neutral-800/40 text-neutral-500'
                    }`;
                    return (
                      <td key={h.number} className="p-0.5 text-center">
                        {canEdit ? (
                          <button
                            type="button"
                            onClick={() => openCell(player.id, h.number, h.par)}
                            aria-label={`${player.displayName} hole ${h.number} score`}
                            className={`${cellBase} transition-colors hover:bg-neutral-700 ${
                              isEditing ? 'ring-2 ring-brand-400' : ''
                            }`}
                          >
                            {display}
                          </button>
                        ) : (
                          <div className={`${cellBase} flex items-center justify-center`}>{display}</div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 text-center">
                    <div className="font-mono text-white">{total}</div>
                    <div className="text-[10px] text-neutral-400">{formatOverUnder(overUnder)}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {canEdit && editing && editingPlayer && editingHole && (
        <div className="flex flex-wrap items-center gap-3 rounded border border-brand-600/50 bg-neutral-800 p-3">
          <div className="min-w-0">
            <div className="truncate font-medium text-white">{editingPlayer.displayName}</div>
            <div className="text-xs text-neutral-400">
              Hole {editingHole.number} · Par {editingHole.par}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <NumberInput value={draft} onChange={setDraft} min={1} max={MAX_SCORE} ariaLabel="Score" />
            <Button variant="contained" onClick={save} disabled={saving} sx={brandContainedButtonSx}>
              Save
            </Button>
            {typeof editingSaved === 'number' && (
              <Button variant="outlined" onClick={clear} disabled={saving} sx={brandButtonSx}>
                Clear
              </Button>
            )}
            <Button
              variant="text"
              onClick={() => setEditing(null)}
              disabled={saving}
              sx={{ color: 'var(--color-neutral-400)', textTransform: 'none' }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};
