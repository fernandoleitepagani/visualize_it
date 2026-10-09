import type { SortState } from '../../engine/types';
import styles from './ArrayView.module.css';

interface Props {
  state?: SortState;
}

export function ArrayView({ state }: Props) {
  if (!state) return <div className={styles.container}>Gerando...</div>;

  const { array, comparing, currentMin, swapping } = state;
  // Previne divisão por zero se o array for zerado
  const maxVal = Math.max(...array.map(e => e.value), 1);

  return (
    <div className={styles.container}>
      {array.map((item, index) => {
        const heightPercent = (item.value / maxVal) * 100;
        const leftPercent = (index / array.length) * 100;
        const widthPercent = 100 / array.length;

        let stateClass = styles.default;
        if (swapping.includes(index)) stateClass = styles.swapping;
        else if (currentMin === index) stateClass = styles.min;
        else if (comparing.includes(index)) stateClass = styles.comparing;

        return (
          <div
            key={item.id}
            className={`${styles.bar} ${stateClass}`}
            style={{
              height: `${Math.max(heightPercent, 5)}%`, // Altura mínima de 5% pra não sumir
              left: `${leftPercent}%`,
              width: `calc(${widthPercent}% - 4px)` // Margem dinâmica
            }}
          >
            <span className={styles.label}>{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}
