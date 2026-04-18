import { useEffect, useRef, useCallback } from 'react'

/**
 * useMouseParallax — adds mouse-tracking parallax to an element.
 * Elements with `data-parallax-depth` attribute will shift
 * based on cursor position, proportional to the depth value.
 *
 * Usage: const containerRef = useMouseParallax()
 *   Then attach ref to a container, and add data-parallax-depth="0.05"
 *   to children that should float.
 */
export function useMouseParallax() {
  const containerRef = useRef(null)

  const handleMove = useCallback((e) => {
    const container = containerRef.current
    if (!container) return

    const cx = (e.clientX / window.innerWidth  - 0.5) * 2  // -1..1
    const cy = (e.clientY / window.innerHeight - 0.5) * 2

    const els = container.querySelectorAll('[data-parallax-depth]')
    for (const el of els) {
      const depth = parseFloat(el.dataset.parallaxDepth) || 0
      const tx = cx * depth * 40            // max 40px shift at depth=1
      const ty = cy * depth * 40
      el.style.transform = `translate(${tx}px, ${ty}px)`
    }
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [handleMove])

  return containerRef
}

/**
 * useScrollParallax — adds scroll-based parallax to elements
 * with `data-scroll-speed` attribute. Higher speed value = more shift.
 *
 * Usage: const containerRef = useScrollParallax()
 */
export function useScrollParallax() {
  const containerRef = useRef(null)
  const rafRef = useRef(null)

  const update = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const scrollY = window.scrollY
    const els = container.querySelectorAll('[data-scroll-speed]')

    for (const el of els) {
      const speed = parseFloat(el.dataset.scrollSpeed) || 0
      const ty = scrollY * speed * -0.1
      el.style.transform = `translateY(${ty}px)`
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [update])

  return containerRef
}

/**
 * useCombinedParallax — combines mouse + scroll parallax on one container.
 * Children use:
 *   data-parallax-depth="0.03"  → mouse parallax
 *   data-scroll-speed="1.2"     → scroll parallax
 */
export function useCombinedParallax() {
  const containerRef = useRef(null)
  const rafRef = useRef(null)
  const mousePos = useRef({ x: 0.5, y: 0.5 })

  const update = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const mx = (mousePos.current.x - 0.5) * 2
    const my = (mousePos.current.y - 0.5) * 2
    const sy = window.scrollY

    const els = container.querySelectorAll('[data-parallax-depth], [data-scroll-speed]')

    for (const el of els) {
      const depth = parseFloat(el.dataset.parallaxDepth) || 0
      const scrollSpeed = parseFloat(el.dataset.scrollSpeed) || 0

      const mtx = mx * depth * 30
      const mty = my * depth * 30
      const sty = sy * scrollSpeed * -0.08

      el.style.transform = `translate(${mtx}px, ${mty + sty}px)`
    }
  }, [])

  useEffect(() => {
    const onMouse = (e) => {
      mousePos.current.x = e.clientX / window.innerWidth
      mousePos.current.y = e.clientY / window.innerHeight
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(update)
    }

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(update)
    }

    window.addEventListener('mousemove', onMouse)
    window.addEventListener('scroll', onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [update])

  return containerRef
}
