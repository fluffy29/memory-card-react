import styles from "./CardComp.module.css"
import type { MemoryFragment } from "../types/memory.types"

export type MemoryCardProps = {
	fragment: MemoryFragment
	onFlip: (id: string) => void
	drift?: boolean
	index?: number
	mismatchTick?: number
}

const CardComp = ({ fragment, onFlip, drift = true, index = 0, mismatchTick = 0 }: MemoryCardProps) => {
	const handleClick = () => {
		if (fragment.matched || fragment.flipped) return
		onFlip(fragment.id)
	}

	const driftStyle = drift
		? {
				transform: `translate(${(Math.sin(index + fragment.id.length) * 4).toFixed(2)}px, ${(Math.cos(index * 1.37) * 4).toFixed(2)}px) ${fragment.flipped ? 'rotateY(0deg)' : 'rotateY(180deg)'}`,
			}
		: {}

		const cardClass = [
			styles.card,
			fragment.flipped || fragment.matched ? styles.isFlipped : '',
			mismatchTick && !fragment.flipped && !fragment.matched ? styles.distortPulse : ''
		].filter(Boolean).join(' ')

			const onKey = (e: React.KeyboardEvent) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					handleClick()
				}
			}

			return (
				<article
					onClick={handleClick}
					onKeyDown={onKey}
					className={cardClass}
					role="button"
					tabIndex={0}
					aria-pressed={fragment.flipped}
					aria-label={fragment.flipped ? fragment.prompt : 'Hidden memory fragment'}
					data-matched={fragment.matched}
					style={driftStyle}
				>
				<div className={styles.inner}>
					<div className={styles.face + ' ' + styles.front}>
						<span className={styles.placeholder}>?</span>
					</div>
					<div className={styles.face + ' ' + styles.back}>
						<span className={styles.fragmentText}>{fragment.prompt}</span>
					</div>
				</div>
			</article>
		)
}

export default CardComp

