import styles from "./ModalComp.module.css"

export type TModalProps = {
	showModal: boolean
	moves: number
	bestScore: number | null
	onRestart: () => void
	isCompleted: boolean
}

const ModalComp = ({ showModal, moves, bestScore, onRestart, isCompleted }: TModalProps) => {
	return (
		<section
			className={styles.final_result}
			style={{ visibility: showModal ? "visible" : "hidden" }}
			role="dialog"
			aria-modal="true"
			aria-labelledby="game-result-title"
		>
			{showModal && (
				<div className={styles.final_container}>
					<h2 id="game-result-title">{isCompleted ? "Great Job!" : "Memory Game"}</h2>
					{isCompleted ? (
						<>
							<p className={styles.final_score}>Your moves: {moves}</p>
							{bestScore !== null && (
								<p>
									Best (lower is better): <strong>{bestScore}</strong>
								</p>
							)}
						</>
					) : (
						<p>Click start to begin a new game.</p>
					)}
					<div style={{ display: "flex", gap: ".75rem", marginTop: "1rem" }}>
						<button
							onClick={onRestart}
							className={styles.final_btn}
							aria-label={isCompleted ? "Play again" : "Start game"}
						>
							{isCompleted ? "Play Again" : "Start"}
						</button>
					</div>
				</div>
			)}
		</section>
	)
}

export default ModalComp
