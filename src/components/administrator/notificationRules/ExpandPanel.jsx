import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'

// Animated accordion panel — smoothly expands/collapses its children by animating height.
// Props: open (boolean), children, duration (animation ms, default 420)
export default function ExpandPanel({ open, children, duration = 420 }) {
  const innerRef = useRef(null)
  // shouldRender keeps children in the DOM during the close animation, then removes them after
  const [shouldRender, setShouldRender] = useState(open)
  // height drives the CSS transition: 0 = collapsed, scrollHeight = expanding, 'auto' = fully open
  const [height, setHeight] = useState(open ? 'auto' : 0)
  // Skip the expand animation on the very first render if already open
  const skipFirstAnim = useRef(open && shouldRender)

  // Mount children as soon as open becomes true (before animation starts)
  useEffect(() => {
    if (open) setShouldRender(true)
  }, [open])

  useLayoutEffect(() => {
    if (!shouldRender || !innerRef.current) return
    // First render while open — jump straight to auto without animating
    if (skipFirstAnim.current) {
      skipFirstAnim.current = false
      setHeight('auto')
      return
    }
    const el = innerRef.current
    if (open) {
      // Start from 0, then after two animation frames set the real height to trigger the CSS transition
      setHeight(0)
      let raf2 = 0
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          if (innerRef.current) setHeight(innerRef.current.scrollHeight)
        })
      })
      return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
    } else {
      // Lock to current pixel height first, then animate to 0
      setHeight(el.scrollHeight)
      let raf2 = 0
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setHeight(0))
      })
      return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
    }
  }, [open, shouldRender])

  const handleTransitionEnd = (e) => {
    // Ignore events from child elements or non-height transitions
    if (e.propertyName !== 'height' || e.target !== e.currentTarget) return
    if (open) {
      // Switch to 'auto' so the panel can grow if its content changes after opening
      setHeight('auto')
      e.currentTarget.style.overflow = 'visible'
    } else {
      // Unmount children after the close animation finishes
      setShouldRender(false)
    }
  }

  if (!shouldRender) return null

  return (
    <div
      style={{
        height,
        overflow: open && height === 'auto' ? 'visible' : 'hidden',
        transition: `height ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        willChange: 'height',
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      <div ref={innerRef}>
        {children}
      </div>
    </div>
  )
}
