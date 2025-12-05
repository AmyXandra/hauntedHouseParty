#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Analyzing boy3.glb file...');

const filePath = path.join(__dirname, '../public/models/boy3.glb');

try {
  const stats = fs.statSync(filePath);
  console.log(`📁 File exists: ${filePath}`);
  console.log(`📊 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📅 Modified: ${stats.mtime}`);
  
  // Read the first few bytes to check GLB header
  const buffer = fs.readFileSync(filePath);
  
  // GLB files start with "glTF" magic number (0x46546C67)
  const magic = buffer.readUInt32LE(0);
  const version = buffer.readUInt32LE(4);
  const length = buffer.readUInt32LE(8);
  
  console.log(`🔮 Magic number: 0x${magic.toString(16)} ${magic === 0x46546C67 ? '✅ (Valid GLB)' : '❌ (Invalid)'}`);
  console.log(`📋 Version: ${version} ${version === 2 ? '✅ (GLB 2.0)' : '⚠️ (Unexpected version)'}`);
  console.log(`📏 Declared length: ${length} bytes`);
  console.log(`📏 Actual length: ${buffer.length} bytes ${length === buffer.length ? '✅' : '⚠️'}`);
  
  if (magic === 0x46546C67 && version === 2) {
    console.log('🏆 VERDICT: Valid GLB 2.0 file ✅');
    console.log('💡 File should load properly in Three.js');
    
    // Try to extract JSON chunk to analyze content
    let offset = 12; // Skip GLB header
    let jsonChunk = null;
    
    // Read first chunk (should be JSON)
    if (offset + 8 <= buffer.length) {
      const chunkLength = buffer.readUInt32LE(offset);
      const chunkType = buffer.readUInt32LE(offset + 4);
      
      if (chunkType === 0x4E4F534A) { // JSON chunk
        const jsonData = buffer.slice(offset + 8, offset + 8 + chunkLength);
        try {
          jsonChunk = JSON.parse(jsonData.toString('utf8'));
          console.log('📦 JSON chunk parsed successfully');
        } catch (e) {
          console.log('❌ Failed to parse JSON chunk');
        }
      }
    }
    
    if (jsonChunk) {
      console.log('\n🔍 DETAILED ANALYSIS:');
      
      // Check for animations
      const animations = jsonChunk.animations || [];
      console.log(`🎬 Animations: ${animations.length}`);
      if (animations.length > 0) {
        animations.forEach((anim, i) => {
          console.log(`  ${i + 1}. "${anim.name || `Animation_${i}`}" - ${anim.channels?.length || 0} channels`);
        });
      }
      
      // Check for nodes (bones/joints)
      const nodes = jsonChunk.nodes || [];
      console.log(`🔗 Nodes: ${nodes.length}`);
      
      // Check for skins (rigging)
      const skins = jsonChunk.skins || [];
      console.log(`🦴 Skins (Rigging): ${skins.length}`);
      if (skins.length > 0) {
        skins.forEach((skin, i) => {
          const jointCount = skin.joints?.length || 0;
          console.log(`  Skin ${i + 1}: ${jointCount} joints/bones`);
        });
      }
      
      // Check for meshes
      const meshes = jsonChunk.meshes || [];
      console.log(`🔷 Meshes: ${meshes.length}`);
      
      // Check for materials
      const materials = jsonChunk.materials || [];
      console.log(`🎨 Materials: ${materials.length}`);
      
      // Final assessment for rigging
      const isRigged = skins.length > 0;
      const hasAnimations = animations.length > 0;
      
      console.log('\n🏆 RIGGING ASSESSMENT:');
      console.log(`   Is Rigged: ${isRigged ? '✅ YES' : '❌ NO'}`);
      console.log(`   Has Animations: ${hasAnimations ? '✅ YES' : '❌ NO'}`);
      console.log(`   File Size: ${(stats.size / 1024 / 1024).toFixed(2)}MB ${stats.size < 5 * 1024 * 1024 ? '✅ Good' : '⚠️ Large'}`);
      
      if (isRigged && hasAnimations) {
        console.log('🎯 VERDICT: EXCELLENT for character animation! ✅');
        console.log('💡 Perfect for endless runner hero character');
      } else if (isRigged && !hasAnimations) {
        console.log('🎯 VERDICT: Rigged but no animations ⚠️');
        console.log('💡 Can be used but may need external animations');
      } else if (!isRigged && hasAnimations) {
        console.log('🎯 VERDICT: Has animations but not rigged ⚠️');
        console.log('💡 Animations may not work properly');
      } else {
        console.log('🎯 VERDICT: Static model (no rigging or animations) ❌');
        console.log('💡 Not suitable for character animation');
      }
    }
    
  } else {
    console.log('❌ VERDICT: Invalid GLB file');
    console.log('💡 File may be corrupted or not a valid GLB');
  }
  
} catch (error) {
  console.error('❌ Error analyzing file:', error.message);
}