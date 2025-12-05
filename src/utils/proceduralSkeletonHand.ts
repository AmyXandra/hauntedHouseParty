/**
 * Procedural Skeleton Hand Generator
 * Creates a simple skeleton hand geometry as a fallback when GLB model is unavailable
 * This is a placeholder until a proper 3D model is sourced
 */

import { Group, Mesh, CylinderGeometry, SphereGeometry, MeshStandardMaterial, Color } from 'three'

interface FingerConfig {
  length: number
  segments: number
  angle: number // Spread angle from center
}

/**
 * Creates a procedural skeleton hand with palm and five fingers
 * Optimized for web performance with low polygon count
 */
export function createProceduralSkeletonHand(): Group {
  const handGroup = new Group()
  
  // Shared bone material
  const boneMaterial = new MeshStandardMaterial({
    color: new Color(0.91, 0.86, 0.78), // Off-white bone color
    roughness: 0.6,
    metalness: 0.1
  })

  // Palm - flattened box
  const palmGeometry = new CylinderGeometry(0.15, 0.12, 0.25, 8)
  const palm = new Mesh(palmGeometry, boneMaterial)
  palm.castShadow = true
  palm.rotation.x = Math.PI / 2
  palm.position.set(0, 0, 0)
  handGroup.add(palm)

  // Wrist bone
  const wristGeometry = new CylinderGeometry(0.08, 0.1, 0.15, 8)
  const wrist = new Mesh(wristGeometry, boneMaterial)
  wrist.castShadow = true
  wrist.rotation.x = Math.PI / 2
  wrist.position.set(0, 0, -0.2)
  handGroup.add(wrist)

  // Finger configurations (thumb, index, middle, ring, pinky)
  const fingers: FingerConfig[] = [
    { length: 0.18, segments: 2, angle: -0.6 }, // Thumb (shorter, angled)
    { length: 0.25, segments: 3, angle: -0.3 }, // Index
    { length: 0.28, segments: 3, angle: 0 },    // Middle (longest)
    { length: 0.26, segments: 3, angle: 0.3 },  // Ring
    { length: 0.22, segments: 3, angle: 0.5 }   // Pinky (shortest)
  ]

  // Create each finger
  fingers.forEach((finger, fingerIndex) => {
    const fingerGroup = new Group()
    
    // Calculate finger base position on palm edge
    const baseX = Math.sin(finger.angle) * 0.12
    const baseZ = 0.12 // Front of palm
    
    let currentZ = 0
    const segmentLength = finger.length / finger.segments
    
    // Create finger segments (bones)
    for (let i = 0; i < finger.segments; i++) {
      // Joint (knuckle)
      const jointGeometry = new SphereGeometry(0.025, 6, 6)
      const joint = new Mesh(jointGeometry, boneMaterial)
      joint.castShadow = true
      joint.position.set(0, 0, currentZ)
      fingerGroup.add(joint)
      
      // Bone segment
      const boneGeometry = new CylinderGeometry(0.02, 0.025, segmentLength, 6)
      const bone = new Mesh(boneGeometry, boneMaterial)
      bone.castShadow = true
      bone.rotation.x = Math.PI / 2
      bone.position.set(0, 0, currentZ + segmentLength / 2)
      fingerGroup.add(bone)
      
      currentZ += segmentLength
    }
    
    // Final joint at fingertip
    const tipGeometry = new SphereGeometry(0.02, 6, 6)
    const tip = new Mesh(tipGeometry, boneMaterial)
    tip.castShadow = true
    tip.position.set(0, 0, currentZ)
    fingerGroup.add(tip)
    
    // Position and rotate finger group
    fingerGroup.position.set(baseX, 0, baseZ)
    
    // Slight curl for grasping pose
    const curlAngle = fingerIndex === 0 ? -0.2 : -0.3 // Thumb less curled
    fingerGroup.rotation.x = curlAngle
    fingerGroup.rotation.y = finger.angle * 0.5 // Slight spread
    
    handGroup.add(fingerGroup)
  })

  // Scale entire hand to appropriate size
  handGroup.scale.set(1.2, 1.2, 1.2)
  
  // Rotate to face forward (palm facing camera)
  handGroup.rotation.y = Math.PI

  return handGroup
}

/**
 * Estimates polygon count of procedural hand
 * Used for validation against performance requirements
 */
export function getProceduralHandPolygonCount(): number {
  // Palm: 8 sides cylinder = 16 triangles
  // Wrist: 8 sides cylinder = 16 triangles
  // Per finger: 3 segments * (6 sides cylinder + 6 sides sphere) = ~36 triangles
  // 5 fingers * 36 = 180 triangles
  // Total: ~212 triangles (well under 5000 limit)
  return 212
}
