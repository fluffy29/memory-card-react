import type { TCard } from "../types/card.types"
import styles from "./CardComp.module.css"

export type TCardProps = {
	clickProp: (card: TCard) => void
	card: TCard
}

const CardComp = ({ clickProp, card }: TCardProps) => {
	const handleClick = () => {
		clickProp(card)
	}

	return (
		<article
			onClick={handleClick}
			className={`${styles.card} ${card.flipped ? styles.animate__rotate : ""}`}
			role="button"
			aria-pressed={card.flipped}
			aria-label={card.flipped ? card.name : "Hidden card"}
			data-matched={card.matched}
		>
			<img src={`/imgs/${card.image}`} alt={card.name} loading="lazy" />
		</article>
	)
}

export default CardComp
