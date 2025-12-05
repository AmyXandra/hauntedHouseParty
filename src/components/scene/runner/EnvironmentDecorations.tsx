import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface DecorationItem {
  id: string
  type: 'cap_pumpkin' | 'pine_tree' | 'forest_tree'
  position: THREE.Vector3
  rotation: number
  scale: number
}





/**
 * Cap Pumpkin model component (optimized - no shadows)
 */
function CapPumpkinModel({ position, rotation, scale }: { position: THREE.Vector3, rotation: number, scale: number }) {
  try {
    const { scene } = useGLTF('/models/cap_pumpkin.glb')
    const clonedScene = useMemo(() => scene.clone(), [scene])
    
    return (
      <primitive 
        object={clonedScene} 
        position={[position.x, 0, position.z]} 
        rotation={[0, rotation, 0]} 
        scale={scale}
      />
    )
  } catch (error) {
    console.error('Failed to load cap_pumpkin.glb:', error)
    // Fallback cap pumpkin shape
    return (
      <group position={[position.x, 0, position.z]} rotation={[0, rotation, 0]} scale={scale}>
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.4, 8, 6]} />
          <meshStandardMaterial 
            color="#ff8800" 
            emissive="#ff4400" 
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 0.2, 6]} />
          <meshStandardMaterial color="#228833" />
        </mesh>
        {/* Cap/hat */}
        <mesh position={[0, 0.9, 0]}>
          <coneGeometry args={[0.3, 0.4, 8]} />
          <meshStandardMaterial color="#442222" />
        </mesh>
      </group>
    )
  }
}



/**
 * Pine Tree model component for background depth (optimized - no shadows)
 */
function PineTreeModel({ position, rotation, scale }: { position: THREE.Vector3, rotation: number, scale: number }) {
  try {
    const { scene } = useGLTF('/models/pine_tree.glb')
    const clonedScene = useMemo(() => scene.clone(), [scene])
    
    return (
      <primitive 
        object={clonedScene} 
        position={[position.x, 0, position.z]} 
        rotation={[0, rotation, 0]} 
        scale={scale}
      />
    )
  } catch (error) {
    console.error('Failed to load pine_tree.glb:', error)
    // Fallback pine tree shape
    return (
      <group position={[position.x, 0, position.z]} rotation={[0, rotation, 0]} scale={scale}>
        {/* Main trunk */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 2, 6]} />
          <meshStandardMaterial color="#332211" roughness={0.9} />
        </mesh>
        {/* Pine foliage layers */}
        <mesh position={[0, 1.8, 0]}>
          <coneGeometry args={[0.6, 1.2, 8]} />
          <meshStandardMaterial color="#1a4d1a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 2.4, 0]}>
          <coneGeometry args={[0.5, 1.0, 8]} />
          <meshStandardMaterial color="#2d5d2d" roughness={0.8} />
        </mesh>
        <mesh position={[0, 2.8, 0]}>
          <coneGeometry args={[0.4, 0.8, 8]} />
          <meshStandardMaterial color="#336633" roughness={0.8} />
        </mesh>
      </group>
    )
  }
}

/**
 * Forest Tree model component for dense forest areas
 */
function ForestTreeModel({ position, rotation, scale }: { position: THREE.Vector3, rotation: number, scale: number }) {
  try {
    const { scene } = useGLTF('/models/forest_tree.glb')
    
    const clonedScene = useMemo(() => {
      const clone = scene.clone()
      
      // Configure tree materials for spooky forest effect
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
          
          // Darken trees for atmospheric effect
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.color.multiplyScalar(0.6) // Make darker
                  mat.roughness = Math.max(mat.roughness, 0.9)
                }
              })
            } else if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.color.multiplyScalar(0.6) // Make darker
              child.material.roughness = Math.max(child.material.roughness, 0.9)
            }
          }
        }
      })
      
      return clone
    }, [scene])
    
    return (
      <primitive 
        object={clonedScene} 
        position={[position.x, position.y, position.z]} 
        rotation={[0, rotation, 0]} 
        scale={scale}
      />
    )
  } catch (error) {
    console.error('Failed to load forest_tree.glb:', error)
    // Fallback tree
    return (
      <group position={[position.x, position.y, position.z]} rotation={[0, rotation, 0]} scale={scale}>
        <mesh position={[0, 2, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 4, 8]} />
          <meshStandardMaterial color="#332211" roughness={0.9} />
        </mesh>
        <mesh position={[0, 4, 0]}>
          <coneGeometry args={[1.5, 3, 8]} />
          <meshStandardMaterial color="#1a4d1a" roughness={0.8} />
        </mesh>
      </group>
    )
  }
}



// Scale multipliers for different model types to ensure consistent sizing
const MODEL_SCALE_MULTIPLIERS = {
  cap_pumpkin: 1.5,    // cap_pumpkin.glb is typically larger
  pine_tree: 1.0,      // pine_tree.glb
  forest_tree: 1.0,    // forest_tree.glb
} as const

/**
 * Environment decorations component
 * SIMPLIFIED: Only cap pumpkins and background pine trees for clean aesthetic
 */
export default function EnvironmentDecorations() {
  
  // Generate layered decorations within camera FOV for optimal performance
  const { foregroundPumpkins, backgroundTrees, forestTrees } = useMemo(() => {
    const foregroundPumpkinItems: DecorationItem[] = []
    const backgroundTreeItems: DecorationItem[] = []
    const forestTreeItems: DecorationItem[] = []
    
    // Camera FOV range: Z=-10 to Z=40 for visible area only
    
    // FOREGROUND LAYER: Only cap pumpkins in a single line close to path edges
    // Path borders are at ±3.2, so place pumpkins just outside for clear visibility
    for (let z = -10; z <= 40; z += 4) { // Less dense - every 4 units
      // Left side pumpkins - fixed distance from path for consistent line
      foregroundPumpkinItems.push({
        id: `fg_left_${z}`,
        type: 'cap_pumpkin',
        position: new THREE.Vector3(
          -3.7, // Fixed X position for consistent line (no random variation)
          0,
          z + (Math.random() - 0.5) * 1.5 // Smaller Z variation to keep tighter line
        ),
        rotation: Math.random() * Math.PI * 2,
        scale: 0.8 + Math.random() * 0.4 // Scale: 0.8-1.2
      })
      
      // Right side pumpkins - fixed distance from path for consistent line
      foregroundPumpkinItems.push({
        id: `fg_right_${z}`,
        type: 'cap_pumpkin',
        position: new THREE.Vector3(
          3.7, // Fixed X position for consistent line (no random variation)
          0,
          z + (Math.random() - 0.5) * 1.5 // Smaller Z variation to keep tighter line
        ),
        rotation: Math.random() * Math.PI * 2,
        scale: 0.8 + Math.random() * 0.4 // Scale: 0.8-1.2
      })
    }
    
    // Generate background trees to fill the entire FOV space
    // Camera at Z=15, hero at Z=8, so visible range is roughly Z=-10 to Z=40
    const backgroundPositions = []
    
    // Left side - dense background forest
    for (let z = -10; z <= 40; z += 4) { // Every 4 units along the path
      for (let x = -8; x >= -30; x -= 3) { // Dense depth layers every 3 units
        backgroundPositions.push({
          x: x + (Math.random() - 0.5) * 2, // Add some variation
          z: z + (Math.random() - 0.5) * 3,
          scale: 2.0 + Math.random() * 1.5 // Scale 2.0-3.5 for background depth
        })
      }
    }
    
    // Right side - dense background forest
    for (let z = -10; z <= 40; z += 4) { // Every 4 units along the path
      for (let x = 8; x <= 30; x += 3) { // Dense depth layers every 3 units
        backgroundPositions.push({
          x: x + (Math.random() - 0.5) * 2, // Add some variation
          z: z + (Math.random() - 0.5) * 3,
          scale: 2.0 + Math.random() * 1.5 // Scale 2.0-3.5 for background depth
        })
      }
    }
    
    backgroundPositions.forEach((pos, i) => {
      backgroundTreeItems.push({
        id: `bg_tree_${i}`,
        type: 'pine_tree',
        position: new THREE.Vector3(pos.x, 0, pos.z),
        rotation: Math.random() * Math.PI * 2,
        scale: pos.scale
      })
    })
    
    // DENSE FOREST AT START - Creates forest ahead effect
    // Create dense forest wall at the start (Z = -50 to -60)
    for (let z = -60; z <= -50; z += 2) { // Every 2 units in depth
      for (let x = -15; x <= 15; x += 3) { // Every 3 units across width
        forestTreeItems.push({
          id: `forest_tree_${z}_${x}`,
          type: 'forest_tree',
          position: new THREE.Vector3(
            x + (Math.random() - 0.5) * 1.5, // Add some random variation
            -1.0 + (Math.random() - 0.5) * 0.5, // Negative Y with slight variation
            z + (Math.random() - 0.5) * 1.5
          ),
          rotation: Math.random() * Math.PI * 2,
          scale: 0.5 + Math.random() * 0.3 // Reduced scale: 0.5-0.8 for shorter trees
        })
      }
    }
    
    // Add additional depth layers for denser forest
    for (let z = -70; z <= -60; z += 4) { // Sparser behind
      for (let x = -20; x <= 20; x += 4) {
        forestTreeItems.push({
          id: `forest_tree_back_${z}_${x}`,
          type: 'forest_tree',
          position: new THREE.Vector3(
            x + (Math.random() - 0.5) * 2,
            -1.2 + (Math.random() - 0.5) * 0.5, // Negative Y with slight variation
            z + (Math.random() - 0.5) * 2
          ),
          rotation: Math.random() * Math.PI * 2,
          scale: 0.6 + Math.random() * 0.4 // Reduced scale: 0.6-1.0 for back trees
        })
      }
    }
    
    console.log(`Generated layered decorations:`)
    console.log(`- Foreground pumpkins: ${foregroundPumpkinItems.length}`)
    console.log(`- Background trees: ${backgroundTreeItems.length}`)
    console.log(`- Forest trees: ${forestTreeItems.length}`)
    return { 
      foregroundPumpkins: foregroundPumpkinItems, 
      backgroundTrees: backgroundTreeItems,
      forestTrees: forestTreeItems
    }
  }, [])
  
  // Static decorations - no movement for better performance
  // The world moves around the player, not the decorations
  
  return (
    <group>
      {/* BACKGROUND LAYER: Pine trees (furthest back) */}
      {backgroundTrees.map(tree => (
        <PineTreeModel
          key={tree.id}
          position={tree.position}
          rotation={tree.rotation}
          scale={tree.scale}
        />
      ))}
      
      {/* DENSE FOREST LAYER: Forest trees at start of path */}
      {forestTrees.map(tree => {
        const finalScale = tree.scale * MODEL_SCALE_MULTIPLIERS[tree.type]
        
        return (
          <ForestTreeModel
            key={tree.id}
            position={tree.position}
            rotation={tree.rotation}
            scale={finalScale}
          />
        )
      })}
      
      {/* FOREGROUND LAYER: Only cap pumpkins (closest to path) */}
      {foregroundPumpkins.map(pumpkin => {
        const finalScale = pumpkin.scale * MODEL_SCALE_MULTIPLIERS[pumpkin.type]
        
        return (
          <CapPumpkinModel
            key={pumpkin.id}
            position={pumpkin.position}
            rotation={pumpkin.rotation}
            scale={finalScale}
          />
        )
      })}
    </group>
  )
}

// Preload the models
useGLTF.preload('/models/cap_pumpkin.glb')
useGLTF.preload('/models/pine_tree.glb')
useGLTF.preload('/models/forest_tree.glb')
