import styles from './CodePanel.module.css';

interface Props {
  code: string[];
  activeLine: number;
}

export function CodePanel({ code, activeLine }: Props) {
  return (
    <div className={styles.panel}>
      <pre className={styles.codeBlock}>
        {code.map((line, idx) => (
          <div
            key={idx}
            className={`${styles.line} ${idx === activeLine ? styles.active : ''}`}
          >
            <span className={styles.lineNumber}>{idx}</span>
            <span className={styles.lineContent}>{line}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}
