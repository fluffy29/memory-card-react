import { useState, useEffect, useRef } from 'react'
import CardComp from './components/CardComp'
import IntegrityBar from './components/IntegrityBar'
import VignetteOverlay from './components/VignetteOverlay'
import { useMemoryGame } from './hooks/useMemoryGame'

const App = () => {
  const [difficulty, setDifficulty] = useState<'calm' | 'standard' | 'deep' | 'overload'>('standard')
  const [seed, setSeed] = useState<string>('')
  const difficultyPairs: Record<typeof difficulty, number> = {
    calm: 3,
    standard: 4,
    deep: 6,
    overload: 8,
  }
  const distortionCaps: Record<typeof difficulty, number> = {
    calm: 14,
    standard: 20,
    deep: 24,
    overload: 28
  }
  const { deck, flip, integrity, distortions, lastMatchedKey, unlockedVignettes, completed, endingCategory, restart, mismatchTick, lost, lossReason, seed: activeSeed } = useMemoryGame({ pairs: difficultyPairs[difficulty], maxDistortions: distortionCaps[difficulty], seed: seed || undefined })
  const boardRef = useRef<HTMLDivElement | null>(null)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const [parallaxIntensity, setParallaxIntensity] = useState(1)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!boardRef.current) return
      if (reducedMotion || parallaxIntensity === 0) return
      const rect = boardRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / rect.width
      const dy = (e.clientY - cy) / rect.height
      setParallax({ x: dx * parallaxIntensity, y: dy * parallaxIntensity })
    }
    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [parallaxIntensity, reducedMotion])
  const [showVignette, setShowVignette] = useState(false)

  useEffect(() => {
    if (lastMatchedKey) {
      setShowVignette(true)
    }
  }, [lastMatchedKey])

  useEffect(() => {
    if (completed) {
      setShowVignette(true)
      setRunning(false)
    }
  }, [completed])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setElapsedMs(ms => ms + 1000), 1000)
    return () => clearInterval(id)
  }, [running])

  const timeStr = () => {
    const s = Math.floor(elapsedMs / 1000)
    const m = Math.floor(s / 60)
    const ss = String(s % 60).padStart(2, '0')
    return `${m}:${ss}`
  }

  const efficiency = (() => {
    const repaired = unlockedVignettes.length
    if (repaired === 0) return 0
    return (repaired / (distortions + repaired)) * 100
  })()

  const recordKey = 'memory_game_records_v1'
  const [records, setRecords] = useState<{ bestTime?: number; leastDistortions?: number; bestEfficiency?: number }>({})
  useEffect(() => {
    try { const r = localStorage.getItem(recordKey); if (r) setRecords(JSON.parse(r)) } catch {}
  }, [])
  useEffect(() => {
    if (!completed) return
    setRecords(prev => {
      const next = { ...prev }
      if (elapsedMs > 0 && (next.bestTime === undefined || elapsedMs < next.bestTime)) next.bestTime = elapsedMs
      if (next.leastDistortions === undefined || distortions < next.leastDistortions) next.leastDistortions = distortions
      if (efficiency > 0 && (next.bestEfficiency === undefined || efficiency > next.bestEfficiency)) next.bestEfficiency = efficiency
      try { localStorage.setItem(recordKey, JSON.stringify(next)) } catch {}
      return next
    })
  }, [completed])

  const currentVignetteLines = (() => {
    if (completed) {
      return deck
        .filter(f => f.matched && f.vignette)
        .reduce<string[]>((acc, f) => (acc.includes(f.vignette!) ? acc : [...acc, f.vignette!]), [])
    }
    if (!lastMatchedKey) return []
    return deck.filter(f => f.memoryKey === lastMatchedKey).map(f => f.vignette || f.prompt)
  })()

  const title = completed ? 'Recovered Memory Sequence' : 'Memory Fragment Repaired'

  const matchedKeys = Array.from(new Set(deck.filter(f => f.matched).map(f => f.memoryKey)))

  return (
    <div className="main_section" style={{ paddingBottom: '4rem' }}>
      <h1 style={{ textAlign: 'center' }}>Cognitive Reconstruction</h1>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '.5rem' }}>
        <button onClick={() => setShowSettings(s => !s)}>{showSettings ? 'Close Settings' : 'Settings'}</button>
        <button onClick={() => setShowGallery(s => !s)} disabled={matchedKeys.length === 0}>Memory Gallery ({matchedKeys.length})</button>
        <button onClick={() => { restart(); setElapsedMs(0); setRunning(true) }}>Restart</button>
        <button onClick={() => { setSeed(Math.random().toString(36).slice(2,10)); restart(); setElapsedMs(0); setRunning(true) }}>New Seed</button>
      </div>
      {showSettings && (
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem 1.25rem', borderRadius: '12px', width: '100%', maxWidth: '680px', marginBottom: '1rem', backdropFilter: 'blur(6px) saturate(160%)', boxShadow: '0 4px 18px -6px #000' }}>
          <h2 style={{ margin: '0 0 .75rem', fontSize: '1rem', letterSpacing: '.5px' }}>Session Settings</h2>
          <div style={{ display: 'grid', gap: '.75rem', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
            <label style={{ fontSize: '.7rem', textTransform: 'uppercase', opacity: .75, display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
              Parallax Intensity
              <input type="range" min={0} max={1.5} step={0.25} value={parallaxIntensity} onChange={e => setParallaxIntensity(Number(e.target.value))} />
              <span style={{ fontSize: '.65rem' }}>{parallaxIntensity.toFixed(2)}</span>
            </label>
            <label style={{ fontSize: '.7rem', textTransform: 'uppercase', opacity: .75, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <input type="checkbox" checked={reducedMotion} onChange={e => setReducedMotion(e.target.checked)} /> Reduced Motion
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              <span style={{ fontSize: '.7rem', textTransform: 'uppercase', opacity: .75 }}>Difficulty</span>
              <select value={difficulty} onChange={e => { const d = e.target.value as typeof difficulty; setDifficulty(d); restart(); setElapsedMs(0); setRunning(true) }} style={{ padding: '.4rem .5rem', borderRadius: '6px', background: '#1f2a33', color: 'var(--contrast)', border: '1px solid #334' }}>
                <option value="calm">Calm (3 pairs)</option>
                <option value="standard">Standard (4)</option>
                <option value="deep">Deep (6)</option>
                <option value="overload">Overload (8)</option>
              </select>
            </div>
            <label style={{ fontSize: '.7rem', textTransform: 'uppercase', opacity: .75, display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
              Seed
              <input value={seed} onChange={e => setSeed(e.target.value)} placeholder="optional" style={{ padding: '.4rem .5rem', borderRadius: '6px', background: '#1f2a33', color: 'var(--contrast)', border: '1px solid #334' }} />
              <span style={{ fontSize: '.6rem', opacity: .6 }}>Active: {activeSeed || 'random'}</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              <span style={{ fontSize: '.7rem', textTransform: 'uppercase', opacity: .75 }}>Timer</span>
              <span style={{ fontSize: '.85rem' }}>{timeStr()}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              <span style={{ fontSize: '.7rem', textTransform: 'uppercase', opacity: .75 }}>Efficiency</span>
              <span style={{ fontSize: '.85rem' }}>{efficiency.toFixed(0)}%</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              <span style={{ fontSize: '.7rem', textTransform: 'uppercase', opacity: .75 }}>Records</span>
              <span style={{ fontSize: '.6rem', lineHeight: 1.2 }}>
                {records.bestTime !== undefined && <span>Best: {Math.floor(records.bestTime/1000)}s<br/></span>}
                {records.leastDistortions !== undefined && <span>Min Dist: {records.leastDistortions}<br/></span>}
                {records.bestEfficiency !== undefined && <span>Max Eff: {records.bestEfficiency.toFixed(0)}%</span>}
                {records.bestTime === undefined && '—'}
              </span>
            </div>
          </div>
        </div>
      )}
      {showGallery && (
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem 1.25rem', borderRadius: '12px', width: '100%', maxWidth: '680px', marginBottom: '1rem', display: 'grid', gap: '.75rem' }}>
          <h2 style={{ margin: '0 0 .5rem', fontSize: '1rem' }}>Recovered Fragments</h2>
          {matchedKeys.map(k => (
            <div key={k} style={{ fontSize: '.75rem', padding: '.5rem .75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
              <strong style={{ letterSpacing: '.5px', fontSize: '.7rem', opacity: .8 }}>{k}</strong>
              {deck.filter(f => f.memoryKey === k && f.vignette).slice(0,2).map(f => <span key={f.id} style={{ opacity: .85 }}>{f.vignette}</span>)}
            </div>
          ))}
          {matchedKeys.length === 0 && <p style={{ fontSize: '.7rem', opacity: .6 }}>No fragments yet.</p>}
        </div>
      )}
      <IntegrityBar value={integrity} distortions={distortions} />
      <div aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, margin: -1, padding: 0, overflow: 'hidden', clip: 'rect(0 0 0 0)', border: 0 }}>
        {lastMatchedKey && !completed && `Recovered fragment group ${lastMatchedKey}`}
        {completed && `All memories reconstructed. Ending: ${endingCategory}`}
      </div>
      <div
        ref={boardRef}
        className="card_container"
        aria-label="Memory field"
        style={{
          position: 'relative',
          transform: reducedMotion ? 'none' : `perspective(1600px) rotateX(${parallax.y * 4}deg) rotateY(${parallax.x * -6}deg)`,
          transition: 'transform 320ms ease',
        }}
      >
        {deck.map((f, i) => (
          <CardComp key={f.id} fragment={f} onFlip={lost ? () => {} : flip} index={i} mismatchTick={mismatchTick} />
        ))}
        {lost && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px) brightness(.35)', background: 'rgba(10,12,16,0.6)', animation: 'fadeIn 800ms ease forwards', zIndex: 20 }}>
            <div style={{ textAlign: 'center', maxWidth: '480px', padding: '1.75rem 2rem', background: 'linear-gradient(145deg,#141b22,#1d2731)', border: '1px solid #2d3b47', borderRadius: '18px', boxShadow: '0 6px 32px -8px #000' }}>
              <h2 style={{ margin: '0 0 .75rem', fontSize: '1.6rem', letterSpacing: '.06em', background: 'linear-gradient(90deg,#ff6b81,#ffa8b5)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Consciousness Fading</h2>
              <p style={{ margin: '0 0 1rem', fontSize: '.9rem', lineHeight: 1.4, opacity: .85 }}>
                {lossReason === 'cognitive_collapse' ? 'Too many distortions fractured the cognitive field. The patient slips beneath recall.' : 'Connection lost.'}
              </p>
              <div style={{ fontSize: '.7rem', letterSpacing: '.05em', opacity: .6, marginBottom: '.75rem' }}>Distortions: {distortions} / {distortionCaps[difficulty]}</div>
              <div style={{ display: 'grid', gap: '.5rem', fontSize: '.65rem', textAlign: 'left', background: 'rgba(255,255,255,0.04)', padding: '.75rem .9rem', borderRadius: '10px', marginBottom: '1rem' }}>
                <div style={{ opacity: .7 }}>Analysis</div>
                <div>Fragments repaired: {unlockedVignettes.length}</div>
                <div>Integrity reached: {(integrity * 100).toFixed(0)}%</div>
                <div>Efficiency: {efficiency.toFixed(0)}%</div>
                <div>Time survived: {timeStr()}</div>
                <div>Seed: {activeSeed || 'random'}</div>
              </div>
              <button onClick={() => { restart(); setElapsedMs(0); setRunning(true) }}>Attempt Reconstruction Again</button>
            </div>
          </div>
        )}
      </div>
      <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '.7rem', opacity: .75, display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span>Repaired: {unlockedVignettes.length}/{deck.length / 2}</span>
        <span>Distortions: {distortions}/{distortionCaps[difficulty]}</span>
        <span>Integrity: {(integrity * 100).toFixed(0)}%</span>
        <span>Time: {timeStr()}</span>
        <span>Eff: {efficiency.toFixed(0)}%</span>
        {activeSeed && <span>Seed: {activeSeed}</span>}
      </div>
      <VignetteOverlay
        open={showVignette}
        vignetteLines={currentVignetteLines}
        onClose={() => setShowVignette(false)}
        title={title}
        endingCategory={completed ? endingCategory : null}
      />
    </div>
  )
}

export default App
