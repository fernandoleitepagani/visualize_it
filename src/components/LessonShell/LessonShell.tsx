import { ReactNode } from 'react';
import styles from './LessonShell.module.css';

interface Props {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  bottomBar: ReactNode;
}

export function LessonShell({ leftPanel, rightPanel, bottomBar }: Props) {
  return (
    <div className={styles.shell}>
      <div className={styles.mainArea}>
        <div className={styles.leftPane}>{leftPanel}</div>
        <div className={styles.rightPane}>{rightPanel}</div>
      </div>
      <div className={styles.bottomArea}>{bottomBar}</div>
    </div>
  );
}
