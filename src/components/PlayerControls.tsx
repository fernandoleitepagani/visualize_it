import type { Playback } from '@/engine/usePlayback';
import { cx } from '@/lib/cx';

const BASE_MS = 1600;
const MIN_SPEED = 1;
const MAX_SPEED = 10;

const toSlider = (speedMs: number) =>
  Math.min(MAX_SPEED, Math.max(MIN_SPEED, Math.round(BASE_MS / Math.max(speedMs, 1))));
const toMs = (slider: number) => Math.round(BASE_MS / slider);

const button =
  'rounded-md border border-line-2 bg-surface-2 px-3.5 py-1.5 text-[13.5px] text-ink transition-colors hover:border-accent-dim disabled:cursor-not-allowed disabled:opacity-35';

export function PlayerControls({ playback }: { playback: Playback }) {
  const { isPlaying, atStart, atEnd, index, total, speedMs } = playback;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3">
      <button type="button" className={button} onClick={playback.reset}>
        Recomeçar
      </button>
      <button type="button" className={button} onClick={playback.prev} disabled={atStart}>
        Anterior
      </button>
      <button
        type="button"
        className={cx(
          button,
          'border-accent bg-accent font-semibold text-canvas hover:bg-accent hover:border-accent',
        )}
        onClick={playback.toggle}
        disabled={atEnd && !isPlaying}
      >
        {isPlaying ? 'Pausar' : 'Executar'}
      </button>
      <button type="button" className={button} onClick={playback.next} disabled={atEnd}>
        Próximo
      </button>

      <span className="ml-auto flex items-center gap-2 text-[12.5px] text-muted">
        <label htmlFor="speed">velocidade</label>
        <input
          id="speed"
          type="range"
          min={MIN_SPEED}
          max={MAX_SPEED}
          value={toSlider(speedMs)}
          onChange={(e) => playback.setSpeedMs(toMs(Number(e.target.value)))}
          className="w-[100px] accent-accent"
        />
      </span>

      <span className="font-mono text-[12.5px] text-muted">
        {index + 1} / {total}
      </span>
    </div>
  );
}
