import styles from './PlayerControls.module.css';

interface Props {
  isPlaying: boolean;
  currentIndex: number;
  totalSteps: number;
  speedMs: number;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  setSpeedMs: (ms: number) => void;
}

export function PlayerControls({ isPlaying, currentIndex, totalSteps, speedMs, play, pause, next, prev, reset, setSpeedMs }: Props) {
  // Mapeamos a view do slider (1 rápido a 10 lento) ou algo mais óbvio.
  // Vamos deixar slider mapear 1000ms a 50ms (inverso na UI para fazer sentido: direita = rápido).
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Range 0 a 100
    const val = Number(e.target.value);
    const mappedMs = 1050 - (val * 10); // 100 -> 50ms, 0 -> 1050ms
    setSpeedMs(mappedMs);
  };

  const sliderVal = (1050 - speedMs) / 10;

  return (
    <div className={styles.controlsBar}>
      <div className={styles.buttons}>
        <button onClick={prev} disabled={currentIndex === 0}>Prev</button>
        {isPlaying ? (
          <button onClick={pause}>Pause</button>
        ) : (
          <button onClick={play} disabled={currentIndex >= totalSteps - 1}>Play</button>
        )}
        <button onClick={next} disabled={currentIndex >= totalSteps - 1}>Next</button>
        <button onClick={reset}>Reset</button>
      </div>

      <div className={styles.sliderGroup}>
        <label>Velocidade</label>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderVal}
          onChange={handleSliderChange}
        />
      </div>

      <div className={styles.counter}>
        Passo {currentIndex + 1} de {totalSteps}
      </div>
    </div>
  );
}
