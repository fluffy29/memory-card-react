import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import fragmentsData from '../data/fragments.json'
import type { MemoryFragment, MemoryFragmentList, MemoryGameState, UseMemoryGameOptions, UseMemoryGameReturn } from '../types/memory.types'

const groupByKey = (list: MemoryFragmentList) => {
  return list.reduce<Record<string, MemoryFragment[]>>((acc, frag) => {
    acc[frag.memoryKey] = acc[frag.memoryKey] || []
    acc[frag.memoryKey].push(frag)
    return acc
  }, {})
}


const lightReshuffle = <T extends { id: string; matched?: boolean }>(deck: T[]): T[] => {
  const unmatched = deck.filter(d => !d.matched)
  if (unmatched.length < 4) return deck
  const copy = [...deck]
  for (let k = 0; k < 3; k++) {
    const i = Math.floor(Math.random() * copy.length)
    const j = Math.floor(Math.random() * copy.length)
    if (i !== j && !copy[i].matched && !copy[j].matched) {
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
  }
  return copy
}

export const useMemoryGame = (opts: UseMemoryGameOptions = {}): UseMemoryGameReturn => {
  const { pairs = 4, flipBackDelayMs = 1100, persistKey = 'memory_game_session_v1', maxDistortions = 20, seed } = opts as UseMemoryGameOptions & { persistKey?: string }

  const prng = useMemo(() => {
    if (!seed) return Math.random
    let h = 2166136261 >>> 0
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return () => {
      h += h << 13; h ^= h >>> 7; h += h << 3; h ^= h >>> 17; h += h << 5
      return (h >>> 0) / 4294967296
    }
  }, [seed])

  const grouped = useMemo(() => groupByKey(fragmentsData as MemoryFragmentList), [])
  const availableKeys = useMemo(() => Object.keys(grouped), [grouped])

  const buildDeck = useCallback((): MemoryFragmentList => {
    const shuffleDet = <T,>(arr: T[]): T[] => {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(prng() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }
    const chosenKeys = shuffleDet(availableKeys).slice(0, Math.min(pairs, availableKeys.length))
    const fragments: MemoryFragmentList = []
    chosenKeys.forEach(k => {
      const variants = grouped[k]
      if (variants.length < 2) return
      const pick = shuffleDet(variants).slice(0, 2).map(v => ({ ...v }))
      fragments.push(...pick)
    })
    const prepared = fragments.map(f => ({ ...f, flipped: false, matched: false }))
    return shuffleDet(prepared)
  }, [availableKeys, grouped, pairs, prng])

  const loadPersisted = (): MemoryGameState | null => {
    try {
      const raw = localStorage.getItem(persistKey)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (!parsed || !Array.isArray(parsed.deck)) return null
      return parsed as MemoryGameState
    } catch { return null }
  }

  const initial = loadPersisted()

  const [state, setState] = useState<MemoryGameState>(() => initial || ({
      deck: buildDeck(),
      flippedIds: [],
      matches: 0,
      totalPairs: pairs,
      distortions: 0,
      integrity: 0,
      lastMatchedKey: null,
      unlockedVignettes: [],
      completed: false,
      endingCategory: null,
      mismatchTick: 0,
      lost: false,
      seed
    }))

  const persistTimer = useRef<number | null>(null)
  const persist = useCallback((snap: MemoryGameState) => {
    try { localStorage.setItem(persistKey, JSON.stringify(snap)) } catch {}
  }, [persistKey])

  const restart = useCallback(() => {
    setState({
      deck: buildDeck(),
      flippedIds: [],
      matches: 0,
      totalPairs: pairs,
      distortions: 0,
      integrity: 0,
      lastMatchedKey: null,
      unlockedVignettes: [],
      completed: false,
      endingCategory: null,
      mismatchTick: 0,
      lost: false,
      lossReason: undefined
    })
  try { localStorage.removeItem(persistKey) } catch {}
  }, [buildDeck, pairs, persistKey, seed])

  const flip = useCallback((id: string) => {
    setState(prev => {
      if (prev.completed || prev.lost) return prev
      if (prev.flippedIds.length === 2) return prev
      if (prev.flippedIds.includes(id)) return prev
      const deck = prev.deck.map(f => f.id === id ? { ...f, flipped: true } : f)
      return { ...prev, deck, flippedIds: [...prev.flippedIds, id] }
    })
  }, [])

  useEffect(() => {
    setState(prev => ({ ...prev, integrity: prev.totalPairs === 0 ? 0 : prev.matches / prev.totalPairs }))
  }, [state.matches, state.totalPairs])

  useEffect(() => {
    if (persistTimer.current) window.clearTimeout(persistTimer.current)
    persistTimer.current = window.setTimeout(() => {
      persist(state)
    }, 160)
    return () => { if (persistTimer.current) window.clearTimeout(persistTimer.current) }
  }, [state.deck, state.matches, state.distortions, state.completed, state.mismatchTick, persist])

  useEffect(() => {
    if (state.flippedIds.length !== 2) return
    const [aId, bId] = state.flippedIds
    const a = state.deck.find(f => f.id === aId)!
    const b = state.deck.find(f => f.id === bId)!
    if (a.memoryKey === b.memoryKey && a.id !== b.id) {
      setState(prev => {
        const deck = prev.deck.map(f => f.memoryKey === a.memoryKey ? { ...f, matched: true, flipped: true } : f)
        const matches = prev.matches + 1
        const completed = matches === prev.totalPairs
        let endingCategory: MemoryGameState['endingCategory'] = prev.endingCategory
        if (completed) {
          const ratio = prev.distortions / (prev.totalPairs || 1)
            endingCategory = ratio < 0.5 ? 'resolved' : ratio < 1 ? 'neutral' : 'fragmented'
        }
        return {
          ...prev,
          deck,
          flippedIds: [],
            matches,
          lastMatchedKey: a.memoryKey,
          unlockedVignettes: prev.unlockedVignettes.includes(a.memoryKey) ? prev.unlockedVignettes : [...prev.unlockedVignettes, a.memoryKey],
          completed,
          endingCategory
        }
      })
    } else {
      const timeout = setTimeout(() => {
        setState(prev => {
          const deck = prev.deck.map(f => prev.flippedIds.includes(f.id) && !f.matched ? { ...f, flipped: false } : f)
          const distortions = prev.distortions + 1
          const reshuffled = distortions % 3 === 0 ? lightReshuffle(deck) : deck
          const lost = distortions >= maxDistortions
          return { ...prev, deck: reshuffled, flippedIds: [], distortions, mismatchTick: prev.mismatchTick + 1, lost, lossReason: lost ? 'cognitive_collapse' : prev.lossReason }
        })
      }, flipBackDelayMs)
      return () => clearTimeout(timeout)
    }
  }, [state.flippedIds, state.deck, flipBackDelayMs, state.totalPairs, maxDistortions])

  return { ...state, flip, restart }
}

export default useMemoryGame
