'use client'

import Link from 'next/link'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'

interface TrustBadgeIcon {
  icon: LucideIcon
  label: string
}

interface HeroProps {
  trustBadge?: {
    text: string
    icons?: TrustBadgeIcon[]
  }
  headline: {
    line1: string
    line2: string
  }
  subtitle: string
  stats?: Array<{
    label: string
    value: string
  }>
  buttons?: {
    primary?: {
      text: string
      href?: string
      onClick?: () => void
    }
    secondary?: {
      text: string
      href?: string
      onClick?: () => void
    }
  }
  className?: string
}

const defaultShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)

float rnd(vec2 p) {
  p = fract(p * vec2(12.9898, 78.233));
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float noise(in vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  float a = rnd(i);
  float b = rnd(i + vec2(1, 0));
  float c = rnd(i + vec2(0, 1));
  float d = rnd(i + 1.);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float t = 0., a = 1.;
  mat2 m = mat2(1., -.5, .2, 1.2);
  for (int i = 0; i < 5; i++) {
    t += a * noise(p);
    p *= 2. * m;
    a *= .5;
  }
  return t;
}

float clouds(vec2 p) {
  float d = 1., t = 0.;
  for (float i = 0.; i < 3.; i++) {
    float a = d * fbm(i * 10. + p.x * .2 + .2 * (1. + i) * p.y + d + i * i + p);
    t = mix(t, d, a);
    d = a;
    p *= 2. / (i + 1.);
  }
  return t;
}

void main(void) {
  vec2 uv = (FC - .5 * R) / MN;
  vec2 st = uv * vec2(2.0, 1.0);
  vec3 col = vec3(0.0);
  float bg = clouds(vec2(st.x + T * .32, -st.y));
  uv *= 1.0 - .18 * (sin(T * .18) * .5 + .5);

  for (float i = 1.; i < 11.; i++) {
    uv += .08 * cos(i * vec2(.1 + .01 * i, .75) + i * i + T * .3 + .12 * uv.x);
    vec2 p = uv;
    float d = length(p);
    vec3 tint = vec3(0.06, 0.72, 0.52) + 0.15 * cos(i + vec3(0.0, 1.4, 2.8));
    col += .0016 / max(d, 0.04) * tint;
    float b = noise(i + p + bg * 1.53);
    col += .0025 * b / length(max(p, vec2(max(b * p.x * .03, 0.001), max(p.y, 0.001))));
    col = mix(col, vec3(bg * .03, bg * .16, bg * .12), min(d * 0.9, 1.0));
  }

  col += vec3(0.01, 0.04, 0.06);
  O = vec4(col, 1.0);
}`

const useShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const rendererRef = useRef<WebGLRenderer | null>(null)
  const pointersRef = useRef<PointerHandler | null>(null)
  const [shaderEnabled, setShaderEnabled] = useState(true)

  class WebGLRenderer {
    private canvas: HTMLCanvasElement
    private gl: WebGL2RenderingContext
    private program: WebGLProgram | null = null
    private vs: WebGLShader | null = null
    private fs: WebGLShader | null = null
    private buffer: WebGLBuffer | null = null
    private scale: number
    private shaderSource: string
    private mouseMove: [number, number] = [0, 0]
    private mouseCoords: [number, number] = [0, 0]
    private pointerCoords: number[] = [0, 0]
    private nbrOfPointers = 0

    private readonly vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main() { gl_Position = position; }`

    private readonly vertices = [-1, 1, -1, -1, 1, 1, 1, -1]

    constructor(canvas: HTMLCanvasElement, scale: number) {
      this.canvas = canvas
      this.scale = scale
      const gl = canvas.getContext('webgl2')
      if (!gl) throw new Error('WebGL2 is not supported in this browser')
      this.gl = gl
      this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale)
      this.shaderSource = defaultShaderSource
    }

    updateShader(source: string) {
      this.reset()
      this.shaderSource = source
      this.setup()
      this.init()
    }

    updateMove(deltas: number[]) {
      this.mouseMove = [deltas[0] ?? 0, deltas[1] ?? 0]
    }

    updateMouse(coords: number[]) {
      this.mouseCoords = [coords[0] ?? 0, coords[1] ?? 0]
    }

    updatePointerCoords(coords: number[]) {
      this.pointerCoords = coords
    }

    updatePointerCount(count: number) {
      this.nbrOfPointers = count
    }

    updateScale(scale: number) {
      this.scale = scale
      this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale)
    }

    compile(shader: WebGLShader, source: string) {
      const gl = this.gl
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
      }
    }

    test(source: string) {
      const gl = this.gl
      const shader = gl.createShader(gl.FRAGMENT_SHADER)
      if (!shader) return 'Unable to create shader'
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      const result = gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? null : gl.getShaderInfoLog(shader)
      gl.deleteShader(shader)
      return result
    }

    reset() {
      const gl = this.gl
      if (this.program && !gl.getProgramParameter(this.program, gl.DELETE_STATUS)) {
        if (this.vs) {
          gl.detachShader(this.program, this.vs)
          gl.deleteShader(this.vs)
        }
        if (this.fs) {
          gl.detachShader(this.program, this.fs)
          gl.deleteShader(this.fs)
        }
        gl.deleteProgram(this.program)
      }
    }

    setup() {
      const gl = this.gl
      this.vs = gl.createShader(gl.VERTEX_SHADER)
      this.fs = gl.createShader(gl.FRAGMENT_SHADER)
      if (!this.vs || !this.fs) return
      this.compile(this.vs, this.vertexSrc)
      this.compile(this.fs, this.shaderSource)
      this.program = gl.createProgram()
      if (!this.program) return
      gl.attachShader(this.program, this.vs)
      gl.attachShader(this.program, this.fs)
      gl.linkProgram(this.program)
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(this.program))
      }
    }

    init() {
      const gl = this.gl
      const program = this.program
      if (!program) return

      this.buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW)

      const position = gl.getAttribLocation(program, 'position')
      gl.enableVertexAttribArray(position)
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

      ;(program as unknown as Record<string, WebGLUniformLocation | null>).resolution = gl.getUniformLocation(program, 'resolution')
      ;(program as unknown as Record<string, WebGLUniformLocation | null>).time = gl.getUniformLocation(program, 'time')
      ;(program as unknown as Record<string, WebGLUniformLocation | null>).move = gl.getUniformLocation(program, 'move')
      ;(program as unknown as Record<string, WebGLUniformLocation | null>).touch = gl.getUniformLocation(program, 'touch')
      ;(program as unknown as Record<string, WebGLUniformLocation | null>).pointerCount = gl.getUniformLocation(program, 'pointerCount')
      ;(program as unknown as Record<string, WebGLUniformLocation | null>).pointers = gl.getUniformLocation(program, 'pointers')
    }

    render(now = 0) {
      const gl = this.gl
      const program = this.program
      if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return

      const uniforms = program as unknown as Record<string, WebGLUniformLocation | null>

      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)

      gl.uniform2f(uniforms.resolution, this.canvas.width, this.canvas.height)
      gl.uniform1f(uniforms.time, now * 1e-3)
      gl.uniform2f(uniforms.move, ...this.mouseMove)
      gl.uniform2f(uniforms.touch, ...this.mouseCoords)
      gl.uniform1i(uniforms.pointerCount, this.nbrOfPointers)
      gl.uniform2fv(uniforms.pointers, new Float32Array(this.pointerCoords))
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
  }

  class PointerHandler {
    private scale: number
    private active = false
    private pointers = new Map<number, number[]>()
    private lastCoords: [number, number] = [0, 0]
    private moves: [number, number] = [0, 0]

    constructor(element: HTMLCanvasElement, scale: number) {
      this.scale = scale

      const map = (el: HTMLCanvasElement, factor: number, x: number, y: number) => [
        x * factor,
        el.height - y * factor,
      ]

      element.addEventListener('pointerdown', (event) => {
        this.active = true
        this.pointers.set(event.pointerId, map(element, this.getScale(), event.clientX, event.clientY))
      })

      const stopPointer = (event: PointerEvent) => {
        if (this.count === 1) this.lastCoords = this.first
        this.pointers.delete(event.pointerId)
        this.active = this.pointers.size > 0
      }

      element.addEventListener('pointerup', stopPointer)
      element.addEventListener('pointerleave', stopPointer)

      element.addEventListener('pointermove', (event) => {
        if (!this.active) return
        this.lastCoords = [event.clientX, event.clientY]
        this.pointers.set(event.pointerId, map(element, this.getScale(), event.clientX, event.clientY))
        this.moves = [this.moves[0] + event.movementX, this.moves[1] + event.movementY]
      })
    }

    getScale() {
      return this.scale
    }

    updateScale(scale: number) {
      this.scale = scale
    }

    get count() {
      return this.pointers.size
    }

    get move() {
      return this.moves
    }

    get coords() {
      return this.pointers.size > 0 ? Array.from(this.pointers.values()).flat() : [0, 0]
    }

    get first() {
      return (this.pointers.values().next().value as [number, number] | undefined) || this.lastCoords
    }
  }

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const isAutomated = navigator.webdriver
    const isLargeViewport = window.innerWidth >= 1280

    if (prefersReducedMotion || isAutomated || !isLargeViewport) {
      setShaderEnabled(false)
      return
    }

    const resize = () => {
      const dpr = Math.max(1, 0.5 * window.devicePixelRatio)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      rendererRef.current?.updateScale(dpr)
      pointersRef.current?.updateScale(dpr)
    }

    const loop = (now: number) => {
      if (!rendererRef.current || !pointersRef.current) return
      rendererRef.current.updateMouse(pointersRef.current.first)
      rendererRef.current.updatePointerCount(pointersRef.current.count)
      rendererRef.current.updatePointerCoords(pointersRef.current.coords)
      rendererRef.current.updateMove(pointersRef.current.move)
      rendererRef.current.render(now)
      animationFrameRef.current = requestAnimationFrame(loop)
    }

    let idleId: number | null = null

    const initialize = () => {
      try {
        const dpr = Math.max(1, 0.5 * window.devicePixelRatio)
        rendererRef.current = new WebGLRenderer(canvas, dpr)
        pointersRef.current = new PointerHandler(canvas, dpr)
        rendererRef.current.setup()
        rendererRef.current.init()
        resize()
        if (rendererRef.current.test(defaultShaderSource) === null) {
          rendererRef.current.updateShader(defaultShaderSource)
        }
        loop(0)
        window.addEventListener('resize', resize)
      } catch (error) {
        console.error('Shader hero initialization failed:', error)
        setShaderEnabled(false)
      }
    }

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(() => {
        initialize()
      })
    } else {
      initialize()
    }

    return () => {
      if (idleId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId)
      }
      window.removeEventListener('resize', resize)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      rendererRef.current?.reset()
    }
  }, [])

  return { canvasRef, shaderEnabled }
}

const ActionButton = ({
  href,
  onClick,
  className,
  children,
}: {
  href?: string
  onClick?: () => void
  className: string
  children: React.ReactNode
}) => {
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  )
}

export default function AnimatedShaderHero({
  trustBadge,
  headline,
  subtitle,
  stats,
  buttons,
  className = '',
}: HeroProps) {
  const { canvasRef, shaderEnabled } = useShaderBackground()

  const statItems = useMemo(
    () =>
      stats ?? [
        { label: 'Detection SLA', value: '< 2 hrs' },
        { label: 'Clouds Supported', value: 'AWS · Azure · GCP' },
        { label: 'Pricing Model', value: '15% of verified savings' },
      ],
    [stats]
  )

  return (
    <section className={`relative isolate min-h-screen overflow-hidden bg-[#0A0E1A] ${className}`}>
      {shaderEnabled && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none object-cover opacity-70"
          style={{ background: '#050814' }}
        />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_32%),linear-gradient(180deg,rgba(10,14,26,0.25)_0%,rgba(10,14,26,0.85)_55%,rgba(10,14,26,1)_100%)]" />
      <div className="hero-grid absolute inset-0 opacity-40" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-24">
        <div className="max-w-4xl">
          {trustBadge && (
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#10B981]/30 bg-[#0F1629]/70 px-4 py-2.5 text-sm text-[#CFFAEA] shadow-[0_0_0_1px_rgba(16,185,129,0.05)] backdrop-blur-md">
              {trustBadge.icons && trustBadge.icons.length > 0 && (
                <div className="flex items-center gap-2 text-[#10B981]">
                  {trustBadge.icons.map(({ icon: Icon, label }) => (
                    <span key={label} title={label} className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#10B981]/20 bg-[#10B981]/10">
                      <Icon size={14} />
                    </span>
                  ))}
                </div>
              )}
              <span className="font-medium">{trustBadge.text}</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="max-w-5xl text-5xl font-black leading-[0.98] tracking-[-0.04em] text-[#F1F5F9] md:text-7xl lg:text-8xl">
                <span className="block">{headline.line1}</span>
                <span className="block bg-gradient-to-r from-[#10B981] via-[#6EE7B7] to-[#34D399] bg-clip-text text-transparent">
                  {headline.line2}
                </span>
              </h1>
            </div>

            <p className="max-w-3xl text-lg leading-8 text-[#94A3B8] md:text-xl">
              {subtitle}
            </p>

            {(buttons?.primary || buttons?.secondary) && (
              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                {buttons.primary && (
                  <ActionButton
                    href={buttons.primary.href}
                    onClick={buttons.primary.onClick}
                    className="inline-flex items-center justify-center rounded-xl bg-brand-gradient px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(16,185,129,0.28)] transition hover:scale-[1.02] hover:shadow-[0_18px_48px_rgba(16,185,129,0.34)]"
                  >
                    {buttons.primary.text}
                  </ActionButton>
                )}
                {buttons.secondary && (
                  <ActionButton
                    href={buttons.secondary.href}
                    onClick={buttons.secondary.onClick}
                    className="inline-flex items-center justify-center rounded-xl border border-[#1E2D4F] bg-[#0F1629]/70 px-6 py-3.5 text-sm font-semibold text-[#E2E8F0] backdrop-blur-md transition hover:border-[#10B981]/40 hover:bg-[#141C33]"
                  >
                    {buttons.secondary.text}
                  </ActionButton>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {statItems.map((item) => (
            <div key={item.label} className="glass-card p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#3D5070]">{item.label}</div>
              <div className="mt-3 text-lg font-semibold text-[#F1F5F9] md:text-xl">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
