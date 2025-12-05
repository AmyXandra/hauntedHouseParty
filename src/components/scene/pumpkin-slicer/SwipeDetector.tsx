import { useState, useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface GameState {
  score: number
  lives: number
  round: number
  gameStatus: 'menu' | 'playing' | 'gameover' | 'roundComplete'
  pumpkins: any[]
  bats: any[]
  bombs: any[]
  particles: any[]
  scorePopups: any[]
  pumpkinsSlicedThisRound: number
  totalPumpkinsThisRound: number
}

interface SwipeDetectorProps {
  gameState: GameState
  onSlicePumpkin: (id: string, position: THREE.Vector3) => void
}

export default function SwipeDetector({ gameState, onSlicePumpkin }: SwipeDetectorProps) {
  const { camera, scene, gl } = useThree()
  const [swipePoints, setSwipePoints] = useState<{ x: number; y: number; time: number }[]>([])
  const [isSlicing, setIsSlicing] = useState(false)
  const [trailOpacity, setTrailOpacity] = useState(0)
  const [showTrail, setShowTrail] = useState(false)
  const slicedPumpkinsRef = useRef<Set<string>>(new Set())
  const fadeTimeoutRef = useRef<number | null>(null)
  
  // Reset sliced pumpkins when new pumpkins spawn
  useEffect(() => {
    slicedPumpkinsRef.current.clear()
  }, [gameState.pumpkins.length])
  
  useEffect(() => {
    const canvas = gl.domElement
    
    const getPointerPosition = (event: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      if ('touches' in event) {
        const touch = event.touches[0] || event.changedTouches[0]
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        }
      }
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
    }
    
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      event.preventDefault()
      setIsSlicing(true)
      setShowTrail(true)
      setTrailOpacity(0.8)
      const pos = getPointerPosition(event)
      setSwipePoints([{ ...pos, time: Date.now() }])
      slicedPumpkinsRef.current.clear()
      
      // Clear any existing fade timeout
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
    }
    
    const handlePointerMove = (event: MouseEvent | TouchEvent) => {
      if (!isSlicing) return
      event.preventDefault()
      
      const pos = getPointerPosition(event)
      const now = Date.now()
      
      setSwipePoints(prev => {
        const newPoints = [...prev, { ...pos, time: now }]
        
        // Keep only recent points (last 200ms)
        const filtered = newPoints.filter(p => now - p.time < 200)
        
        // Check if this is a fast swipe (moved > 30px in < 200ms)
        if (filtered.length >= 2) {
          const first = filtered[0]
          const last = filtered[filtered.length - 1]
          const distance = Math.sqrt(
            Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2)
          )
          const timeDiff = last.time - first.time
          
          if (distance > 30 && timeDiff < 200) {
            // This is a valid slice - check for pumpkin intersections
            checkSliceIntersections(filtered)
          }
        }
        
        return filtered
      })
    }
    
    const handlePointerUp = () => {
      setIsSlicing(false)
      
      // Start fade out animation
      let opacity = 0.8
      const fadeOut = () => {
        opacity -= 0.05
        setTrailOpacity(opacity)
        
        if (opacity > 0) {
          fadeTimeoutRef.current = setTimeout(fadeOut, 16) // ~60fps
        } else {
          setShowTrail(false)
          setSwipePoints([])
        }
      }
      
      fadeTimeoutRef.current = setTimeout(fadeOut, 100) // Brief pause before fade
    }
    
    const checkSliceIntersections = (points: { x: number; y: number; time: number }[]) => {
      const raycaster = new THREE.Raycaster()
      
      // Check each point along the swipe path
      points.forEach(point => {
        // Convert screen coordinates to normalized device coordinates
        const rect = canvas.getBoundingClientRect()
        const x = (point.x / rect.width) * 2 - 1
        const y = -(point.y / rect.height) * 2 + 1
        
        // Cast ray from camera through the point
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
        
        // Find all pumpkin objects in the scene
        const pumpkinObjects: THREE.Object3D[] = []
        scene.traverse((child: THREE.Object3D) => {
          if (child.userData.pumpkinId && !child.userData.pumpkin.sliced) {
            pumpkinObjects.push(child)
          }
        })
        
        // Check for intersections
        const intersects = raycaster.intersectObjects(pumpkinObjects, true)
        
        intersects.forEach(intersect => {
          // Find the pumpkin group (traverse up to find userData)
          let pumpkinGroup = intersect.object
          while (pumpkinGroup && !pumpkinGroup.userData.pumpkinId) {
            pumpkinGroup = pumpkinGroup.parent!
          }
          
          if (pumpkinGroup && pumpkinGroup.userData.pumpkinId) {
            const pumpkinId = pumpkinGroup.userData.pumpkinId
            
            // Only slice each pumpkin once per swipe
            if (!slicedPumpkinsRef.current.has(pumpkinId)) {
              slicedPumpkinsRef.current.add(pumpkinId)
              onSlicePumpkin(pumpkinId, intersect.point)
            }
          }
        })
      })
    }
    
    // Mouse events
    canvas.addEventListener('mousedown', handlePointerDown)
    canvas.addEventListener('mousemove', handlePointerMove)
    canvas.addEventListener('mouseup', handlePointerUp)
    canvas.addEventListener('mouseleave', handlePointerUp)
    
    // Touch events
    canvas.addEventListener('touchstart', handlePointerDown, { passive: false })
    canvas.addEventListener('touchmove', handlePointerMove, { passive: false })
    canvas.addEventListener('touchend', handlePointerUp)
    canvas.addEventListener('touchcancel', handlePointerUp)
    
    return () => {
      canvas.removeEventListener('mousedown', handlePointerDown)
      canvas.removeEventListener('mousemove', handlePointerMove)
      canvas.removeEventListener('mouseup', handlePointerUp)
      canvas.removeEventListener('mouseleave', handlePointerUp)
      canvas.removeEventListener('touchstart', handlePointerDown)
      canvas.removeEventListener('touchmove', handlePointerMove)
      canvas.removeEventListener('touchend', handlePointerUp)
      canvas.removeEventListener('touchcancel', handlePointerUp)
      
      // Clear timeout on cleanup
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
    }
  }, [camera, scene, gl, isSlicing, onSlicePumpkin])
  
  // Visual slice trail using spheres for better visibility
  if (!showTrail || swipePoints.length < 1) return null
  
  return (
    <group>
      {swipePoints.map((point, i) => {
        // Convert screen to world coordinates for trail visualization
        const rect = gl.domElement.getBoundingClientRect()
        const x = (point.x / rect.width) * 2 - 1
        const y = -(point.y / rect.height) * 2 + 1
        
        // Position trail much closer to camera for visibility
        const distance = 2 // Close to camera
        // Use orthographic camera scaling instead of FOV
        const aspect = gl.domElement.width / gl.domElement.height
        const worldX = x * distance * aspect
        const worldY = y * distance
        const worldZ = camera.position.z - distance
        
        // Make trail points fade with age
        const age = (Date.now() - point.time) / 200
        const scale = Math.max(0.2, 1 - age) * 0.3
        const opacity = Math.max(0.1, trailOpacity * (1 - age * 0.3))
        
        return (
          <mesh key={i} position={[worldX, worldY, worldZ]} scale={scale}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={opacity}
              depthTest={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}