export type MemoryFragment = {
  id: string
  memoryKey: string
  prompt: string
  image?: string
  sound?: string
  tags: string[]
  vignette?: string
  flipped?: boolean
  matched?: boolean
}

export type MemoryFragmentList = MemoryFragment[]

export type MemoryVignette = {
  key: string
  lines: string[]
}

export type MemoryGameState = {
  deck: MemoryFragmentList
  flippedIds: string[]
  matches: number
  totalPairs: number
  distortions: number
  integrity: number
  lastMatchedKey: string | null
  unlockedVignettes: string[]
  completed: boolean
  endingCategory: 'resolved' | 'neutral' | 'fragmented' | null
  mismatchTick: number
  lost: boolean
  lossReason?: string
  seed?: string
}

export interface UseMemoryGameOptions {
  pairs?: number
  distortionLimit?: number
  flipBackDelayMs?: number
  maxDistortions?: number
  seed?: string
}

export interface UseMemoryGameReturn extends MemoryGameState {
  flip: (id: string) => void
  restart: () => void
}
