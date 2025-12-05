import { useRef, useMemo, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface DecorationItem {
  id: string
  type: 'pumpkin' | 'cap_pumpkin' | 'joy_pumpkin_man' | 'tree' | 'pine_tree' | 'hat_pumpkin' // Updated with joy_pumpkin_man
  position: THREE.Vector3
  rotation: number
  scale: number
}

/**
 * Instanced trees component for better performance
 */
function InstancedTrees({ trees }: { trees: DecorationItem[] }) {
  // Early return if no trees
  if (trees.length === 0) return null
  
  const trunkRef = useRef<THREE.InstancedMesh>(null)
  const foliage1Ref = useRef<THREE.InstancedMesh>(null)
  const foliage2Ref = useRef<THREE.InstancedMesh>(null)
  const foliage3Ref = useRef<THREE.InstancedMesh>(null)
  
  const trunkGeometry = useMemo(() => new THREE.CylinderGeometry(0.08, 0.12, 0.5, 6), [])
  const foliage1Geometry = useMemo(() => new THREE.ConeGeometry(0.4, 0.6, 6), [])
  const foliage2Geometry = useMemo(() => new THREE.ConeGeometry(0.35, 0.5, 6), [])
  const foliage3Geometry = useMemo(() => new THREE.ConeGeometry(0.25, 0.4, 6), [])
  
  const trunkMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#664422', roughness: 0.9 }), [])
  const foliage1Material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2d5016', roughness: 0.8 }), [])
  const foliage2Material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#336622', roughness: 0.8 }), [])
  const foliage3Material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#44aa33', roughness: 0.8 }), [])
  
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  
  useEffect(() => {
    if (!trunkRef.current || !foliage1Ref.current || !foliage2Ref.current || !foliage3Ref.current) return
    
    trees.forEach((tree, i) => {
      // Trunk
      tempObject.position.set(tree.position.x, 0.25 * tree.scale, tree.position.z)
      tempObject.rotation.set(0, tree.rotation, 0)
      tempObject.scale.setScalar(tree.scale)
      tempObject.updateMatrix()
      trunkRef.current!.setMatrixAt(i, tempObject.matrix)
      
      // Foliage layer 1 (reduced height by 0.2)
      tempObject.position.set(tree.position.x, 0.5 * tree.scale, tree.position.z)
      tempObject.updateMatrix()
      foliage1Ref.current!.setMatrixAt(i, tempObject.matrix)
      
      // Foliage layer 2 (reduced height by 0.2)
      tempObject.position.set(tree.position.x, 0.7 * tree.scale, tree.position.z)
      tempObject.updateMatrix()
      foliage2Ref.current!.setMatrixAt(i, tempObject.matrix)
      
      // Foliage layer 3 (reduced height by 0.2)
      tempObject.position.set(tree.position.x, 0.85 * tree.scale, tree.position.z)
      tempObject.updateMatrix()
      foliage3Ref.current!.setMatrixAt(i, tempObject.matrix)
    })
    
    trunkRef.current.instanceMatrix.needsUpdate = true
    foliage1Ref.current.instanceMatrix.needsUpdate = true
    foliage2Ref.current.instanceMatrix.needsUpdate = true
    foliage3Ref.current.instanceMatrix.needsUpdate = true
  }, [trees, tempObject])
  
  return (
    <group>
      <instancedMesh ref={trunkRef} args={[trunkGeometry, trunkMaterial, trees.length]} />
      <instancedMesh ref={foliage1Ref} args={[foliage1Geometry, foliage1Material, trees.length]} />
      <instancedMesh ref={foliage2Ref} args={[foliage2Geometry, foliage2Material, trees.length]} />
      <instancedMesh ref={foliage3Ref} args={[foliage3Geometry, foliage3Material, trees.length]} />
    </group>
  )
}

/**
 * Pumpkin model component (optimized - no shadows)
 */
function PumpkinModel({ position, rotation, scale }: { position: THREE.Vector3, rotation: number, scale: number }) {
  try {
    const { scene } = useGLTF('/models/pumkin2.glb')
    
    const clonedScene = useMemo(() => {
      const clone = scene.clone()
      
      // Optimize the model for performance
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = false
          child.receiveShadow = false
          
          // Ensure materials are properly configured
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  // Add slight glow for spooky atmosphere
                  mat.emissive = new THREE.Color(0xff3300)
                  mat.emissiveIntensity = 0.1
                }
              })
            } else if (child.material instanceof THREE.MeshStandardMaterial) {
              // Add slight glow for spooky atmosphere
              child.material.emissive = new THREE.Color(0xff3300)
              child.material.emissiveIntensity = 0.1
            }
          }
        }
      })
      
      return clone
    }, [scene])
    
    return (
      <primitive 
        object={clonedScene} 
        position={[position.x, 0, position.z]} 
        rotation={[0, rotation, 0]} 
        scale={scale}
      />
    )
  } catch (error) {
    console.error('Failed to load pumkin2.glb:', error)
    // Enhanced fallback pumpkin shape with better Halloween atmosphere
    return (
      <group position={[position.x, 0, position.z]} rotation={[0, rotation, 0]} scale={scale}>
        {/* Main pumpkin body */}
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.4, 12, 8]} />
          <meshStandardMaterial 
            color="#ff6600" 
            emissive="#ff3300" 
            emissiveIntensity={0.3}
            roughness={0.8}
          />
        </mesh>
        
        {/* Pumpkin stem */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 0.2, 6]} />
          <meshStandardMaterial 
            color="#228833" 
            roughness={0.9}
          />
        </mesh>
        
        {/* Carved face - eyes */}
        <mesh position={[-0.15, 0.5, 0.35]}>
          <boxGeometry args={[0.08, 0.08, 0.1]} />
          <meshStandardMaterial 
            color="#ffaa00" 
            emissive="#ffaa00" 
            emissiveIntensity={0.8}
          />
        </mesh>
        <mesh position={[0.15, 0.5, 0.35]}>
          <boxGeometry args={[0.08, 0.08, 0.1]} />
          <meshStandardMaterial 
            color="#ffaa00" 
            emissive="#ffaa00" 
            emissiveIntensity={0.8}
          />
        </mesh>
        
        {/* Carved face - mouth */}
        <mesh position={[0, 0.3, 0.35]}>
          <boxGeometry args={[0.2, 0.06, 0.1]} />
          <meshStandardMaterial 
            color="#ffaa00" 
            emissive="#ffaa00" 
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>
    )
  }
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
 * Joy Pumpkin Man model component (optimized - no shadows)
 */
function JoyPumpkinManModel({ position, rotation, scale }: { position: THREE.Vector3, rotation: number, scale: number }) {
  try {
    const { scene } = useGLTF('/models/joy_pumpkin_man.glb')
    
    const clonedScene = useMemo(() => {
      const clone = scene.clone()
      
      // Ensure all meshes are visible and have proper materials
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.visible = true
          child.castShadow = false
          child.receiveShadow = false
          
          // Ensure material visibility
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat instanceof THREE.Material) {
                  mat.transparent = false
                  mat.opacity = 1
                  mat.side = THREE.DoubleSide
                  // Add glow effect for spooky atmosphere
                  if (mat instanceof THREE.MeshStandardMaterial) {
                    mat.emissive = new THREE.Color(0xff6600)
                    mat.emissiveIntensity = 0.2
                  }
                }
              })
            } else if (child.material instanceof THREE.Material) {
              child.material.transparent = false
              child.material.opacity = 1
              child.material.side = THREE.DoubleSide
              // Add glow effect for spooky atmosphere
              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.emissive = new THREE.Color(0xff6600)
                child.material.emissiveIntensity = 0.2
              }
            }
          }
        }
      })
      
      return clone
    }, [scene])
    
    return (
      <primitive 
        object={clonedScene} 
        position={[position.x, 0, position.z]} 
        rotation={[0, rotation, 0]} 
        scale={scale}
      />
    )
  } catch (error) {
    console.error('Failed to load joy_pumpkin_man.glb:', error)
    // Fallback pumpkin man shape
    return (
      <group position={[position.x, 0, position.z]} rotation={[0, rotation, 0]} scale={scale}>
        {/* Pumpkin head */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.4, 12, 8]} />
          <meshStandardMaterial 
            color="#ff6600" 
            emissive="#ff3300" 
            emissiveIntensity={0.3}
            roughness={0.8}
          />
        </mesh>
        
        {/* Body */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 0.8, 8]} />
          <meshStandardMaterial 
            color="#ff8800" 
            emissive="#ff4400" 
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Arms */}
        <mesh position={[-0.5, 1.0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.1, 0.1, 0.6, 6]} />
          <meshStandardMaterial color="#ff8800" />
        </mesh>
        <mesh position={[0.5, 1.0, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.1, 0.1, 0.6, 6]} />
          <meshStandardMaterial color="#ff8800" />
        </mesh>
        
        {/* Legs */}
        <mesh position={[-0.2, 0.2, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.4, 6]} />
          <meshStandardMaterial color="#ff8800" />
        </mesh>
        <mesh position={[0.2, 0.2, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.4, 6]} />
          <meshStandardMaterial color="#ff8800" />
        </mesh>
        
        {/* Face - eyes */}
        <mesh position={[-0.15, 1.6, 0.35]}>
          <boxGeometry args={[0.08, 0.08, 0.1]} />
          <meshStandardMaterial 
            color="#ffaa00" 
            emissive="#ffaa00" 
            emissiveIntensity={0.8}
          />
        </mesh>
        <mesh position={[0.15, 1.6, 0.35]}>
          <boxGeometry args={[0.08, 0.08, 0.1]} />
          <meshStandardMaterial 
            color="#ffaa00" 
            emissive="#ffaa00" 
            emissiveIntensity={0.8}
          />
        </mesh>
        
        {/* Face - mouth */}
        <mesh position={[0, 1.4, 0.35]}>
          <boxGeometry args={[0.2, 0.06, 0.1]} />
          <meshStandardMaterial 
            color="#ffaa00" 
            emissive="#ffaa00" 
            emissiveIntensity={0.8}
          />
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

// Scale multipliers for different model types to ensure consistent sizing
const MODEL_SCALE_MULTIPLIERS = {
  pumpkin: 0.5,        // pumkin2.glb base scale
  cap_pumpkin: 1.5,    // cap_pumpkin.glb is typically larger
  joy_pumpkin_man: 1.0, // joy_pumpkin_man.glb base scale
  tree: 1.0,           // procedural trees
  pine_tree: 1.0,      // pine_tree.glb
  hat_pumpkin: 0.8     // hat_pumpkin.glb if it exists
} as const

/**
 * Environment decorations component
 * OPTIMIZED: Reduced decoration count, no shadows, simplified geometry
 */
export default function EnvironmentDecorations() {
  
  // Generate layered decorations within camera FOV for optimal performance
  const { foregroundPumpkins, middleLayerTrees, middleLayerLanterns, backgroundTrees } = useMemo(() => {
    const foregroundPumpkinItems: DecorationItem[] = []
    const middleLayerTreeItems: DecorationItem[] = []
    const middleLayerLanternItems: DecorationItem[] = []
    const backgroundTreeItems: DecorationItem[] = []
    
    // Camera FOV range: Z=-10 to Z=40 for visible area only
    
    // FOREGROUND LAYER: Pumpkins in a single line close to path edges
    // Path borders are at ±3.2, so place pumpkins just outside for clear visibility
    for (let z = -10; z <= 40; z += 4) { // Less dense - every 4 units
      // Left side pumpkins - fixed distance from path for consistent line
      const isPumpkinLeft = Math.random() > 0.4 // 60% regular, 40% cap pumpkins
      foregroundPumpkinItems.push({
        id: `fg_left_${z}`,
        type: isPumpkinLeft ? 'pumpkin' : 'cap_pumpkin',
        position: new THREE.Vector3(
          -3.7, // Fixed X position for consistent line (no random variation)
          0,
          z + (Math.random() - 0.5) * 1.5 // Smaller Z variation to keep tighter line
        ),
        rotation: Math.random() * Math.PI * 2,
        scale: 0.8 + Math.random() * 0.4 // Scale: 0.8-1.2
      })
      
      // Right side pumpkins - fixed distance from path for consistent line
      const isPumpkinRight = Math.random() > 0.4 // 60% regular, 40% cap pumpkins
      foregroundPumpkinItems.push({
        id: `fg_right_${z}`,
        type: isPumpkinRight ? 'pumpkin' : 'cap_pumpkin',
        position: new THREE.Vector3(
          3.7, // Fixed X position for consistent line (no random variation)
          0,
          z + (Math.random() - 0.5) * 1.5 // Smaller Z variation to keep tighter line
        ),
        rotation: Math.random() * Math.PI * 2,
        scale: 0.8 + Math.random() * 0.4 // Scale: 0.8-1.2
      })
    }
    
    // MIDDLE LAYER: Sparse trees + limited pumpkin men behind the pumpkins (X: ±4.5 to ±7.5)
    // Clear separation from foreground pumpkins at ±3.5 to ±4.0
    for (let z = -10; z <= 40; z += 6) { // Sparser spacing - every 6 units instead of 3
      // Left side middle layer - behind the pumpkins (sparser)
      for (let x = -4.5; x >= -7.5; x -= 2) { // Sparser rows: -4.5, -6.5 (skip -5.5, -7.5)
        if (Math.random() > 0.3) { // Only 70% chance to place something (making it sparser)
          const isTree = Math.random() > 0.4 // 60% trees, 40% pumpkin men
          if (isTree) {
            middleLayerTreeItems.push({
              id: `mid_tree_left_${z}_${x}`,
              type: 'tree',
              position: new THREE.Vector3(
                x + (Math.random() - 0.5) * 0.5, // Slightly more variation
                0,
                z + (Math.random() - 0.5) * 3 // More Z variation for organic feel
              ),
              rotation: Math.random() * Math.PI * 2,
              scale: 1.0 + Math.random() * 1.0 // Scale: 1.0-2.0 (smaller for sparser look)
            })
          } else {
            middleLayerLanternItems.push({
              id: `mid_pumpkin_man_left_${z}_${x}`,
              type: 'joy_pumpkin_man',
              position: new THREE.Vector3(
                x + (Math.random() - 0.5) * 0.5, // Slightly more variation
                0,
                z + (Math.random() - 0.5) * 3 // More Z variation
              ),
              rotation: Math.random() * Math.PI * 2,
              scale: 1.2 + Math.random() * 0.4 // Base scale (will be multiplied by MODEL_SCALE_MULTIPLIERS)
            })
          }
        }
      }
      
      // Right side middle layer - behind the pumpkins (sparser with limited pumpkin men)
      let pumpkinMenCountRight = 0
      const maxPumpkinMenRight = Math.floor(Math.random() * 3) + 1 // 1-3 pumpkin men per section
      
      for (let x = 4.5; x <= 7.5; x += 2) { // Sparser rows: 4.5, 6.5 (skip 5.5, 7.5)
        if (Math.random() > 0.3) { // Only 70% chance to place something (making it sparser)
          const shouldBePumpkinMan = pumpkinMenCountRight < maxPumpkinMenRight && Math.random() > 0.6
          
          if (shouldBePumpkinMan) {
            pumpkinMenCountRight++
            middleLayerLanternItems.push({
              id: `mid_pumpkin_man_right_${z}_${x}`,
              type: 'joy_pumpkin_man',
              position: new THREE.Vector3(
                x + (Math.random() - 0.5) * 0.5, // Slightly more variation
                0,
                z + (Math.random() - 0.5) * 3 // More Z variation
              ),
              rotation: Math.random() * Math.PI * 2,
              scale: 1.2 + Math.random() * 0.4 // Base scale (will be multiplied by MODEL_SCALE_MULTIPLIERS)
            })
          } else {
            middleLayerTreeItems.push({
              id: `mid_tree_right_${z}_${x}`,
              type: 'tree',
              position: new THREE.Vector3(
                x + (Math.random() - 0.5) * 0.5, // Slightly more variation
                0,
                z + (Math.random() - 0.5) * 3 // More Z variation for organic feel
              ),
              rotation: Math.random() * Math.PI * 2,
              scale: 1.0 + Math.random() * 1.0 // Scale: 1.0-2.0 (smaller for sparser look)
            })
          }
        }
      }
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
        type: 'pine_tree' as any,
        position: new THREE.Vector3(pos.x, 0, pos.z),
        rotation: Math.random() * Math.PI * 2,
        scale: pos.scale
      })
    })
    
    console.log(`Generated layered decorations:`)
    console.log(`- Foreground pumpkins: ${foregroundPumpkinItems.length}`)
    console.log(`- Middle trees: ${middleLayerTreeItems.length}`)
    console.log(`- Middle pumpkin men: ${middleLayerLanternItems.length}`)
    console.log(`- Background trees: ${backgroundTreeItems.length}`)
    return { 
      foregroundPumpkins: foregroundPumpkinItems, 
      middleLayerTrees: middleLayerTreeItems,
      middleLayerLanterns: middleLayerLanternItems,
      backgroundTrees: backgroundTreeItems 
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
      
      {/* MIDDLE LAYER: Mix of instanced trees and joy pumpkin men */}
      <InstancedTrees trees={middleLayerTrees} />
      {middleLayerLanterns.map(pumpkinMan => (
        <JoyPumpkinManModel
          key={pumpkinMan.id}
          position={pumpkinMan.position}
          rotation={pumpkinMan.rotation}
          scale={pumpkinMan.scale * MODEL_SCALE_MULTIPLIERS[pumpkinMan.type]}
        />
      ))}
      
      {/* FOREGROUND LAYER: Mix of pumpkins and cap pumpkins (closest to path) */}
      {foregroundPumpkins.map(pumpkin => {
        const finalScale = pumpkin.scale * MODEL_SCALE_MULTIPLIERS[pumpkin.type]
        
        if (pumpkin.type === 'pumpkin') {
          return (
            <PumpkinModel
              key={pumpkin.id}
              position={pumpkin.position}
              rotation={pumpkin.rotation}
              scale={finalScale}
            />
          )
        } else {
          return (
            <CapPumpkinModel
              key={pumpkin.id}
              position={pumpkin.position}
              rotation={pumpkin.rotation}
              scale={finalScale}
            />
          )
        }
      })}
    </group>
  )
}

// Preload the models
useGLTF.preload('/models/pumkin2.glb')
useGLTF.preload('/models/cap_pumpkin.glb')
useGLTF.preload('/models/joy_pumpkin_man.glb')
useGLTF.preload('/models/pine_tree.glb')
