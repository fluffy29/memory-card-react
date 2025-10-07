import styles from './VignetteOverlay.module.css'

interface VignetteOverlayProps {
  open: boolean
  vignetteLines: string[]
  onClose: () => void
  title?: string
  endingCategory?: string | null
}

const endingText: Record<string, string> = {
  resolved: 'The truth feels whole.',
  neutral: 'You remember, but edges shimmer.',
  fragmented: 'You remember… but something feels wrong.'
}

const VignetteOverlay = ({ open, vignetteLines, onClose, title = 'Recovered Memory', endingCategory }: VignetteOverlayProps) => {
  if (!open) return null
  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.panel}>
        <h3>{title}</h3>
        <div className={styles.lines}>{vignetteLines.join('\n')}</div>
        {endingCategory && <p style={{ fontSize: '.75rem', opacity: .8 }}>{endingText[endingCategory]}</p>}
        <button className={styles.closeBtn} onClick={onClose}>Continue</button>
      </div>
    </div>
  )
}

export default VignetteOverlay
