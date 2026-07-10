// Board rotation scenes. Clock + weather are backed by real data (via SceneContext);
// notes come from the brainerd-api /board backend. Each render fn is pure:
// (ctx, rows, cols) → grid of flap codes.

import type { BoardNote, BoardScene, SceneContext } from '@/types/board';
import { colorCode, fillRow, layoutText, wrapText } from '@/utils/vestaboard';
import { formatWeatherLines } from '@/utils/weather';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const pad = (n: number): string => n.toString().padStart(2, '0');

const renderClock = ({ now }: SceneContext, rows: number, cols: number): number[][] => {
  const hours = now.getHours();
  const ampm = hours < 12 ? 'AM' : 'PM';
  const hour12 = ((hours + 11) % 12) + 1;
  const date = `${DAYS[now.getDay()]} ${MONTHS[now.getMonth()]} ${now.getDate()}`;
  const time = `${hour12}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${ampm}`;
  return layoutText([date, '', time], rows, cols);
};

const renderWeather = ({ weather, weatherStatus }: SceneContext, rows: number, cols: number): number[][] => {
  if (weatherStatus === 'ready' && weather) return layoutText(formatWeatherLines(weather), rows, cols);
  if (weatherStatus === 'loading') return layoutText(['LOADING', 'WEATHER'], rows, cols);
  return layoutText(['WEATHER', '', 'ENABLE LOCATION', 'IN YOUR BROWSER'], rows, cols);
};

const noteScene = (note: BoardNote): BoardScene => ({
  id: `note-${note.id}`,
  kind: 'note',
  dwellMs: 16000,
  render: (_ctx, rows, cols) => {
    const grid = layoutText(wrapText(note.text, cols), rows, cols);
    if (note.color) {
      const code = colorCode(note.color);
      fillRow(grid, 0, [code]);
      fillRow(grid, rows - 1, [code]);
    }
    return grid;
  }
});

// TODO(B-E): add the calendar scene once Google Calendar is wired up. See spec §10 Phase B-E.
export const buildScenes = (notes: BoardNote[]): BoardScene[] => {
  const scenes: BoardScene[] = [
    { id: 'clock', kind: 'clock', dwellMs: 20000, render: renderClock },
    { id: 'weather', kind: 'weather', dwellMs: 16000, render: renderWeather }
  ];
  for (const note of notes) {
    if (note.enabled && note.text) scenes.push(noteScene(note));
  }
  return scenes;
};
