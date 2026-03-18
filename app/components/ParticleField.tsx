'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Particles({ count = 200 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null)

  // Two interleaved colors: indigo + violet
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const indigoRGB = [0.51, 0.53, 0.98]   // #818cf8
    const violetRGB = [0.67, 0.55, 0.98]   // #a78bfa
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 22
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6
      const c = i % 2 === 0 ? indigoRGB : violetRGB
      col[i * 3]     = c[0]
      col[i * 3 + 1] = c[1]
      col[i * 3 + 2] = c[2]
    }
    return { positions: pos, colors: col }
  }, [count])

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const t = clock.getElapsedTime()
    mesh.current.rotation.y = t * 0.03
    mesh.current.rotation.x = Math.sin(t * 0.018) * 0.06
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        transparent
        opacity={0.85}
        sizeAttenuation
        vertexColors
      />
    </points>
  )
}

export default function ParticleField() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 70 }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      gl={{ antialias: false, alpha: true }}
    >
      <Particles count={200} />
    </Canvas>
  )
}
