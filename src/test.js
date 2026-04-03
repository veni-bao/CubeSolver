import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

console.log('[TEST] Script loaded');

window.addEventListener('DOMContentLoaded', () => {
  console.log('[TEST] DOM ready');
  
  try {
    const container = document.getElementById('canvas-container');
    console.log('[TEST] container:', container);
    
    if (!container) {
      throw new Error('Container not found');
    }
    
    const loading = document.getElementById('loading');
    console.log('[TEST] loading:', loading);
    
    // Setup Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(container.clientWidth || 800, container.clientHeight || 600);
    container.appendChild(renderer.domElement);
    
    camera.position.z = 5;
    
    // Add a simple cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      controls.update();
      renderer.render(scene, camera);
    }
    
    loading.style.display = 'none';
    console.log('[TEST] Loading hidden, starting animation');
    animate();
    console.log('[TEST] Done');
    
  } catch (e) {
    console.error('[TEST] Error:', e);
    const loading = document.getElementById('loading');
    if (loading) {
      loading.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
    }
  }
});