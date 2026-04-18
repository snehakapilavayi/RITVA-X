import { useEffect, useRef, useCallback } from 'react'
import './ParticleBackground.css'

/* -------------------------------------------------------
   RITVA X — Interactive Particle Background
   • Mouse parallax (dots shift based on cursor position)
   • Scroll parallax (layers drift at different speeds)
   • Interactive lines that connect nearby dots on scroll
   ------------------------------------------------------- */

// ──── Configuration ────
const CFG = {
  dotCount:        120,
  connectRadius:   140,     // px – max distance to draw a line
  lineWidth:       0.6,
  baseDotSpeed:    0.25,
  mouseInfluence:  28,      // px – max shift from mouse
  scrollFactor:    0.35,    // how strongly scroll affects dots
  parallaxLayers:  3,       // depth layers (1 = nearest)
  colors: [
    { r: 0, g: 240, b: 255 },   // cyan
    { r: 112, g: 0, b: 255 },   // purple
    { r: 8, g: 125, b: 209 },   // blue
    { r: 255, g: 255, b: 255 }, // white
  ],
}

function randomBetween(a, b) { return a + Math.random() * (b - a) }

function createDot(w, h) {
  const layer = Math.floor(Math.random() * CFG.parallaxLayers) + 1
  const depthScale = layer / CFG.parallaxLayers           // 0..1
  const colorSrc = CFG.colors[Math.floor(Math.random() * CFG.colors.length)]
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    baseX: 0, baseY: 0,                                   // set after creation
    vx: randomBetween(-CFG.baseDotSpeed, CFG.baseDotSpeed) * (1 + depthScale * 0.5),
    vy: randomBetween(-CFG.baseDotSpeed, CFG.baseDotSpeed) * (1 + depthScale * 0.5),
    radius: randomBetween(0.8, 2.6) * (0.5 + depthScale * 0.7),
    opacity: randomBetween(0.15, 0.6) * depthScale,
    layer,
    depthScale,
    color: colorSrc,
    pulsePhase: Math.random() * Math.PI * 2,
    pulseSpeed: randomBetween(0.005, 0.02),
  }
}

export default function ParticleBackground() {
  const canvasRef = useRef(null)
  const dotsRef   = useRef([])
  const mouse     = useRef({ x: 0.5, y: 0.5 })           // normalised 0..1
  const scrollY   = useRef(0)
  const rafId     = useRef(0)
  const dims      = useRef({ w: 0, h: 0 })

  // ── Resize ──
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width  = w * dpr
    canvas.height = h * dpr
    canvas.style.width  = w + 'px'
    canvas.style.height = h + 'px'
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    dims.current = { w, h }

    // re-create dots on major resize
    dotsRef.current = Array.from({ length: CFG.dotCount }, () => createDot(w, h))
    dotsRef.current.forEach(d => { d.baseX = d.x; d.baseY = d.y })
  }, [])

  // ── Mouse ──
  const handleMouseMove = useCallback((e) => {
    mouse.current.x = e.clientX / window.innerWidth
    mouse.current.y = e.clientY / window.innerHeight
  }, [])

  // ── Scroll ──
  const handleScroll = useCallback(() => {
    scrollY.current = window.scrollY
  }, [])

  // ── Animation Loop ──
  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { w, h } = dims.current
    ctx.clearRect(0, 0, w, h)

    const dots = dotsRef.current
    const mx = (mouse.current.x - 0.5) * 2   // -1..1
    const my = (mouse.current.y - 0.5) * 2
    const sy = scrollY.current

    // ── Update dots ──
    for (const d of dots) {
      // base motion
      d.x += d.vx
      d.y += d.vy

      // wrap around
      if (d.x < -20) d.x = w + 20
      if (d.x > w + 20) d.x = -20
      if (d.y < -20) d.y = h + 20
      if (d.y > h + 20) d.y = -20

      // pulse opacity
      d.pulsePhase += d.pulseSpeed
      const pulse = Math.sin(d.pulsePhase) * 0.15

      // mouse parallax offset (deeper layers move less)
      const mouseOffX = mx * CFG.mouseInfluence * d.depthScale
      const mouseOffY = my * CFG.mouseInfluence * d.depthScale

      // scroll parallax offset
      const scrollOff = sy * CFG.scrollFactor * d.depthScale * 0.3

      d.renderX = d.x + mouseOffX
      d.renderY = d.y + mouseOffY - scrollOff
      d.renderOpacity = Math.max(0.05, Math.min(1, d.opacity + pulse))
    }

    // ── Draw connections ──
    // Compute scroll activation: connections get stronger as user scrolls
    const scrollNorm = Math.min(sy / 600, 1)   // 0..1 ramp over 600px
    const connectAlphaMultiplier = 0.2 + scrollNorm * 0.8

    for (let i = 0; i < dots.length; i++) {
      const a = dots[i]
      for (let j = i + 1; j < dots.length; j++) {
        const b = dots[j]
        // only connect same or adjacent layers for visual clarity
        if (Math.abs(a.layer - b.layer) > 1) continue

        const dx = a.renderX - b.renderX
        const dy = a.renderY - b.renderY
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < CFG.connectRadius) {
          const alpha = (1 - dist / CFG.connectRadius) * connectAlphaMultiplier * 0.35
          // blend colors of the two dots
          const r = Math.round((a.color.r + b.color.r) / 2)
          const g = Math.round((a.color.g + b.color.g) / 2)
          const bv = Math.round((a.color.b + b.color.b) / 2)
          ctx.beginPath()
          ctx.moveTo(a.renderX, a.renderY)
          ctx.lineTo(b.renderX, b.renderY)
          ctx.strokeStyle = `rgba(${r},${g},${bv},${alpha})`
          ctx.lineWidth = CFG.lineWidth
          ctx.stroke()
        }
      }
    }

    // ── Draw dots ──
    for (const d of dots) {
      const { r, g, b } = d.color
      ctx.beginPath()
      ctx.arc(d.renderX, d.renderY, d.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${r},${g},${b},${d.renderOpacity})`
      ctx.fill()

      // glow for brighter dots
      if (d.renderOpacity > 0.35) {
        ctx.beginPath()
        ctx.arc(d.renderX, d.renderY, d.radius * 3, 0, Math.PI * 2)
        const grad = ctx.createRadialGradient(
          d.renderX, d.renderY, d.radius * 0.5,
          d.renderX, d.renderY, d.radius * 3
        )
        grad.addColorStop(0, `rgba(${r},${g},${b},${d.renderOpacity * 0.25})`)
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = grad
        ctx.fill()
      }
    }

    rafId.current = requestAnimationFrame(animate)
  }, [])

  // ── Mount / Unmount ──
  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll, { passive: true })

    rafId.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId.current)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleResize, handleMouseMove, handleScroll, animate])

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      aria-hidden="true"
    />
  )
}
