import styles from './IntegrityBar.module.css'

interface IntegrityBarProps { value: number; distortions: number }

const IntegrityBar = ({ value, distortions }: IntegrityBarProps) => (
  <div className={styles.shell}>
    <div className={styles.labelsTop}>
      <span className={styles.metric}><strong>{(value * 100).toFixed(0)}%</strong> Integrity</span>
      <span className={styles.metric}><strong>{distortions}</strong> Distortions</span>
    </div>
    <div className={styles.barWrapper} aria-label="Mind Integrity" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}>
      <div className={styles.barFill} style={{ width: `${(value * 100).toFixed(1)}%` }} />
    </div>
  </div>
)

export default IntegrityBar
