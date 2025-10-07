import { useCallback, useEffect, useMemo, useState } from "react"
import CardComp from "./components/CardComp"
import baseCards from "./data/cards.json"
import type { TCard, TCardList } from "./types/card.types"
import ModalComp from "./components/ModalComp"

const App = () => {
  const totalPairs = useMemo(() => baseCards.length, [])

  const buildShuffledDeck = useCallback((): TCardList => {
    const duplicated = baseCards.flatMap((card) => [
      { ...card, id: card.id },
      { ...card, id: card.id + 100 },
    ])
    for (let i = duplicated.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[duplicated[i], duplicated[j]] = [duplicated[j], duplicated[i]]
    }
    return duplicated
  }, [])

  const [gameCards, setGameCards] = useState<TCardList>(() => buildShuffledDeck())
  const [flippedIds, setFlippedIds] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [gameOver, setGameOver] = useState(true)
  const [bestScore, setBestScore] = useState<number | null>(() => {
    const stored = localStorage.getItem("bestScore")
    return stored ? Number(stored) : null
  })

  const startNewGame = useCallback(() => {
    setGameCards(buildShuffledDeck())
    setFlippedIds([])
    setMoves(0)
    setMatches(0)
    setGameOver(false)
  }, [buildShuffledDeck])

  const handleCardClick = (clickedCard: TCard) => {
    if (gameOver) return
    if (clickedCard.matched) return
    if (flippedIds.includes(clickedCard.id)) return
    if (flippedIds.length === 2) return
    setGameCards((prev: TCardList) => prev.map((c: TCard) => (c.id === clickedCard.id ? { ...c, flipped: true } : c)))
    setFlippedIds((prev: number[]) => [...prev, clickedCard.id])
  }

  useEffect(() => {
    if (flippedIds.length !== 2) return
    setMoves((m: number) => m + 1)
    const [id1, id2] = flippedIds
    const card1 = gameCards.find((c: TCard) => c.id === id1)!
    const card2 = gameCards.find((c: TCard) => c.id === id2)!
    if (card1.name === card2.name) {
      setMatches((m: number) => m + 1)
      setGameCards((prev: TCardList) => prev.map((c: TCard) => (c.name === card1.name ? { ...c, matched: true, flipped: true } : c)))
      setFlippedIds([])
    } else {
      const timeout = setTimeout(() => {
        setGameCards((prev: TCardList) => prev.map((c: TCard) => (flippedIds.includes(c.id) ? { ...c, flipped: false } : c)))
        setFlippedIds([])
      }, 1000)
      return () => clearTimeout(timeout)
    }
  }, [flippedIds, gameCards])

  useEffect(() => {
    if (!gameOver && matches === totalPairs) {
      setGameOver(true)
      setBestScore((prev: number | null) => {
        if (prev === null || moves < prev) {
          localStorage.setItem("bestScore", String(moves))
          return moves
        }
        return prev
      })
    }
  }, [matches, totalPairs, gameOver, moves])

  return (
    <div className="main_section">
      <h1>Memory Game</h1>
      <p>
        Moves: {moves} | Matches: {matches}/{totalPairs}
        {bestScore !== null && <span> | Best: {bestScore}</span>}
      </p>
      <div className="card_container" aria-label="Game board">
        {gameCards.map((card) => (
          <CardComp card={card} clickProp={handleCardClick} key={card.id} />
        ))}
      </div>
      <ModalComp
        showModal={gameOver}
        moves={moves}
        bestScore={bestScore}
        onRestart={startNewGame}
        isCompleted={matches === totalPairs && moves > 0}
      />
    </div>
  )
}

export default App
