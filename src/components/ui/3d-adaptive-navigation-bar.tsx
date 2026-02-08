import React, { useState, useRef, useEffect } from 'react'
import { motion, useSpring, AnimatePresence } from 'framer-motion'

interface NavItem {
  label: string
  id: string
}

/**
 * 3D Adaptive Navigation Pill
 * Smart navigation with scroll detection and hover expansion
 */

export const PillBase: React.FC<{ activeSection: string; onSectionClick: (id: string) => void; isLoggedIn?: boolean }> = ({ activeSection, onSectionClick, isLoggedIn = false }) => {
  const [expanded, setExpanded] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navItems: NavItem[] = [
    { label: 'Matrix', id: 'matrix' },
    { label: 'Arena', id: 'arena' },
    { label: 'Vault', id: 'vault' },
    ...(isLoggedIn ? [] : [{ label: 'Login', id: 'login' }]),
  ]


  // Spring animations for smooth motion
  const pillWidth = useSpring(140, { stiffness: 220, damping: 25, mass: 1 })
  const pillShift = useSpring(0, { stiffness: 220, damping: 25, mass: 1 })

  // Handle hover expansion
  useEffect(() => {
    if (hovering) {
      setExpanded(true)
      pillWidth.set(580)
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setExpanded(false)
        pillWidth.set(140)
      }, 60000)
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [hovering, pillWidth])

  const handleMouseEnter = () => {
    setHovering(true)
  }

  const handleMouseLeave = () => {
    setHovering(false)
  }

  const handleSectionClick = (sectionId: string) => {
    // Trigger transition state
    setIsTransitioning(true)
    onSectionClick(sectionId)

    // Collapse the pill after selection
    setHovering(false)

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 400)
  }

  const activeItem = navItems.find(item => item.id === activeSection)

  return (
    <motion.nav
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-full backdrop-blur-2xl"
      style={{
        width: pillWidth,
        height: '56px',
        background: `
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.08) 0%, 
            rgba(255, 255, 255, 0.03) 15%, 
            rgba(255, 255, 255, 0.01) 30%, 
            rgba(0, 0, 0, 0.2) 45%, 
            rgba(0, 0, 0, 0.4) 60%, 
            rgba(0, 0, 0, 0.6) 75%, 
            rgba(0, 0, 0, 0.7) 90%, 
            rgba(0, 0, 0, 0.8) 100%
          )
        `,
        boxShadow: expanded
          ? `
            0 10px 40px -10px rgba(0, 0, 0, 0.8),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 2px 4px rgba(255, 255, 255, 0.15),
            inset 0 -4px 12px rgba(0, 0, 0, 0.5),
            inset 4px 0 8px rgba(255, 255, 255, 0.03),
            inset -4px 0 8px rgba(0, 0, 0, 0.3)
          `
          : isTransitioning
            ? `
            0 8px 32px -8px rgba(0, 0, 0, 0.7),
            0 0 0 1px rgba(255, 255, 255, 0.04),
            inset 0 1px 2px rgba(255, 255, 255, 0.1),
            inset 0 -2px 8px rgba(0, 0, 0, 0.4),
            inset 0 0 20px rgba(255, 255, 255, 0.05)
          `
            : `
            0 8px 32px -8px rgba(0, 0, 0, 0.8),
            0 0 0 1px rgba(255, 255, 255, 0.04),
            inset 0 1px 2px rgba(255, 255, 255, 0.08),
            inset 0 -2px 8px rgba(0, 0, 0, 0.5),
            inset 0 0 15px rgba(255, 255, 255, 0.02)
          `,
        x: pillShift,
        overflow: 'hidden',
        transition: 'box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Liquid lens effect - refracting light at the top */}
      <div
        className="absolute inset-x-0 top-0 rounded-t-full pointer-events-none"
        style={{
          height: '6px',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%)',
          filter: 'blur(1px)',
        }}
      />

      {/* High-intensity specular highlight - The "Glass Chip" */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '10%',
          top: '8%',
          width: expanded ? '200px' : '40px',
          height: '3px',
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 100%)',
          filter: 'blur(0.5px)',
          transition: 'all 0.5s ease',
        }}
      />

      {/* Directional light - Top Left refraction */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 40%)',
        }}
      />

      {/* Premium secondary gloss - "Water layer" */}
      <div
        className="absolute rounded-full pointer-events-none opacity-40"
        style={{
          left: expanded ? '20%' : '18%',
          top: '20%',
          width: expanded ? '300px' : '80px',
          height: '20px',
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 60%, rgba(255, 255, 255, 0) 100%)',
          filter: 'blur(8px)',
          transform: 'rotate(-5deg)',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Bottom curvature refraction */}
      <div
        className="absolute inset-x-0 bottom-0 rounded-b-full pointer-events-none"
        style={{
          height: '40%',
          background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 40%, rgba(255, 255, 255, 0) 100%)',
        }}
      />

      {/* Deep bottom ambient blockage */}
      <div
        className="absolute inset-x-0 bottom-0 rounded-b-full pointer-events-none"
        style={{
          height: '15%',
          background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%)',
          filter: 'blur(3px)',
        }}
      />

      {/* Inner diffuse glow - "Liquid core" */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 30px rgba(105, 104, 166, 0.1)',
          opacity: 0.8,
        }}
      />

      {/* Micro-chamfer edge */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
        }}
      />

      {/* Navigation items container */}
      <div
        ref={containerRef}
        className="relative z-10 h-full flex items-center justify-center px-6"
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro", Poppins, sans-serif',
        }}
      >
        {/* Collapsed state - show only active section with smooth text transitions */}
        {!expanded && (
          <div className="flex items-center relative">
            <AnimatePresence mode="wait">
              {activeItem && (
                <motion.span
                  key={activeItem.id}
                  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{
                    duration: 0.35,
                    ease: [0.4, 0.0, 0.2, 1]
                  }}
                  style={{
                    fontSize: '15.5px',
                    fontWeight: 680,
                    color: '#ffffff',
                    letterSpacing: '0.45px',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textShadow: `
                      0 1px 2px rgba(0, 0, 0, 0.5),
                      0 -1px 0 rgba(255, 255, 255, 0.1)
                    `,
                  }}
                >
                  {activeItem.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Expanded state - show all sections with stagger */}
        {expanded && (
          <div className="flex items-center justify-evenly w-full">
            {navItems.map((item, index) => {
              const isActive = item.id === activeSection

              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{
                    delay: index * 0.08,
                    duration: 0.25,
                    ease: 'easeOut'
                  }}
                  onClick={() => handleSectionClick(item.id)}
                  className="relative cursor-pointer transition-all duration-200"
                  style={{
                    fontSize: isActive ? '15.5px' : '15px',
                    fontWeight: isActive ? 680 : 510,
                    color: isActive ? '#ffffff' : '#888888',
                    textDecoration: 'none',
                    letterSpacing: '0.45px',
                    background: 'transparent',
                    border: 'none',
                    padding: '10px 16px',
                    outline: 'none',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    transform: isActive ? 'translateY(-1.5px)' : 'translateY(0)',
                    textShadow: isActive
                      ? `
                        0 1px 2px rgba(0, 0, 0, 0.6),
                        0 -1px 0 rgba(255, 255, 255, 0.12)
                      `
                      : `
                        0 1px 1px rgba(0, 0, 0, 0.4),
                        0 -1px 0 rgba(255, 255, 255, 0.05)
                      `,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#cccccc'
                      e.currentTarget.style.transform = 'translateY(-0.5px)'
                      e.currentTarget.style.textShadow = `
                        0 1px 1px rgba(0, 0, 0, 0.5),
                        0 -1px 0 rgba(255, 255, 255, 0.08)
                      `
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#888888'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.textShadow = `
                        0 1px 1px rgba(0, 0, 0, 0.4),
                        0 -1px 0 rgba(255, 255, 255, 0.05)
                      `
                    }
                  }}
                >
                  {item.label}
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </motion.nav>
  )
}
