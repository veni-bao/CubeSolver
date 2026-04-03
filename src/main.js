import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN from '@tweenjs/tween.js';
import { Cube } from './cube.js';
import { Renderer } from './renderer.js';
import { Animator } from './animator.js';
import { Solver } from './solver.js';
import { UI } from './ui.js';

console.log('[DEBUG] main.js loaded');

class App {
  constructor() {
    console.log('[DEBUG] App constructor start');
    
    const container = document.getElementById('canvas-container');
    const loading = document.getElementById('loading');
    
    console.log('[DEBUG] container:', container ? 'found' : 'NOT FOUND');
    console.log('[DEBUG] loading:', loading ? 'found' : 'NOT FOUND');
    
    // Critical: Store loading FIRST before any operations that could fail
    this.container = container;
    this.loading = loading;
    
    // Now safe to proceed
    this.n = 3;
    this.speed = 1.0;
    this.isScrambled = false;
    this.isSolving = false;
    this.needsRender = true;
    this.cube = null;
    this.renderer = null;
    this.animator = null;
    this.solver = null;
    this.ui = null;
    this.controls = null;
    
    console.log('[DEBUG] About to call init()');
    
    try {
      this.init();
      console.log('[DEBUG] init() returned normally');
    } catch (e) {
      console.error('[DEBUG] Error caught in constructor:', e.message);
      console.error('[DEBUG] Stack:', e.stack);
      this.handleError(e);
    }
    
    console.log('[DEBUG] Constructor complete');
  }

  handleError(e) {
    console.log('[DEBUG] handleError called');
    const loadingEl = document.getElementById('loading');
    console.log('[DEBUG] loadingEl in handleError:', loadingEl ? 'found' : 'NOT FOUND');
    
    if (loadingEl) {
      loadingEl.innerHTML = `<p style="color:red;font-size:14px">Error: ${e.message}</p>
        <p style="font-size:10px;max-width:400px;word-break:break-all">${e.stack}</p>`;
    } else {
      document.body.innerHTML = `<div style="padding:20px;color:red"><h1>Error</h1><p>${e.message}</p><pre>${e.stack}</pre></div>`;
    }
  }

  init() {
    console.log('[DEBUG] init() - initRenderer');
    this.initRenderer();
    
    console.log('[DEBUG] init() - initCube');
    this.initCube();
    
    console.log('[DEBUG] init() - initAnimator');
    this.initAnimator();
    
    console.log('[DEBUG] init() - initSolver');
    this.initSolver();
    
    console.log('[DEBUG] init() - initUI');
    this.initUI();
    
    console.log('[DEBUG] init() - hiding loading');
    this.loading.style.display = 'none';
    
    console.log('[DEBUG] init() - starting animate');
    this.animate();
    
    console.log('[DEBUG] init() - COMPLETE');
  }

  initRenderer() {
    console.log('[DEBUG-R] Creating Renderer');
    this.renderer = new Renderer(this.container);
    console.log('[DEBUG-R] Renderer created');
    console.log('[DEBUG-R] renderer.domElement:', this.renderer.domElement);
    console.log('[DEBUG-R] renderer.domElement.style:', this.renderer.domElement?.style);
    
    if (!this.renderer.domElement) {
      throw new Error('Renderer.domElement is undefined!');
    }
    
    console.log('[DEBUG-R] Setting up OrbitControls');
    this.controls = new OrbitControls(this.renderer.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    console.log('[DEBUG-R] Controls ready');
  }

  initCube() {
    console.log('[DEBUG-C] Creating Cube n=' + this.n);
    this.cube = new Cube(this.n);
    console.log('[DEBUG-C] Cube has', this.cube.cubies.length, 'cubies');
    
    console.log('[DEBUG-C] Calling renderer.render');
    this.renderer.render(this.cube);
    console.log('[DEBUG-C] render complete');
  }

  initAnimator() {
    console.log('[DEBUG-A] Creating Animator');
    this.animator = new Animator(this.renderer, this.cube, () => this.onMoveComplete());
    console.log('[DEBUG-A] Animator ready');
  }

  initSolver() {
    console.log('[DEBUG-S] Creating Solver');
    this.solver = new Solver();
    console.log('[DEBUG-S] Solver ready');
  }

  initUI() {
    console.log('[DEBUG-U] Looking up UI elements');
    const elements = {
      nSlider: document.getElementById('n-slider'),
      nValue: document.getElementById('n-value'),
      speedSlider: document.getElementById('speed-slider'),
      speedValue: document.getElementById('speed-value'),
      scrambleBtn: document.getElementById('scramble-btn'),
      solveBtn: document.getElementById('solve-btn'),
      moveCount: document.getElementById('move-count'),
      status: document.getElementById('status')
    };
    
    for (const [key, el] of Object.entries(elements)) {
      console.log(`[DEBUG-U] ${key}:`, el ? 'found' : 'NOT FOUND');
    }
    
    this.ui = new UI(elements);
    this.ui.onNChange = (n) => this.changeN(n);
    this.ui.onSpeedChange = (speed) => this.changeSpeed(speed);
    this.ui.onScramble = () => this.scramble();
    this.ui.onSolve = () => this.solve();
    console.log('[DEBUG-U] UI ready');
  }

  changeN(n) {
    this.n = n;
    this.cube = new Cube(n);
    this.renderer.render(this.cube);
    this.animator.setCube(this.cube);
    this.isScrambled = false;
    this.ui.setStatus('Ready');
    this.ui.setMoveCount(0);
    this.ui.setSolveEnabled(false);
    this.ui.setScrambleEnabled(true);
  }

  changeSpeed(speed) {
    this.speed = speed;
    this.animator.setSpeed(speed);
  }

  async scramble() {
    if (this.isSolving || this.isScrambled) return;
    const scrambleMoves = this.cube.generateScramble();
    this.isScrambled = true;
    this.ui.setStatus('Scrambling...');
    this.ui.setScrambleEnabled(false);
    this.ui.setSolveEnabled(false);
    let moveCount = 0;
    for (const move of scrambleMoves) {
      moveCount++;
      this.ui.setMoveCount(moveCount);
      await this.animator.animateMove(move);
    }
    this.ui.setStatus('Scrambled');
    this.ui.setSolveEnabled(true);
    this.ui.setMoveCount(0);
    this.needsRender = true;
  }

  async solve() {
    if (!this.isScrambled || this.isSolving) return;
    this.isSolving = true;
    this.ui.setSolveEnabled(false);
    this.ui.setScrambleEnabled(false);
    this.ui.setStatus('Solving...');
    const solution = this.solver.solve(this.cube);
    let moveCount = 0;
    for (const move of solution) {
      moveCount++;
      this.ui.setMoveCount(moveCount);
      await this.animator.animateMove(move);
    }
    this.isScrambled = false;
    this.isSolving = false;
    this.ui.setScrambleEnabled(true);
    this.ui.setStatus('Solved!');
    this.ui.setMoveCount(0);
    this.needsRender = true;
  }

  onMoveComplete() {
    this.needsRender = true;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    TWEEN.update();
    if (this.controls) {
      this.controls.update();
    }
    if (this.needsRender && this.cube && this.renderer) {
      this.renderer.render(this.cube);
      this.needsRender = false;
    }
  }
}

console.log('[DEBUG] Creating App instance');
new App();
console.log('[DEBUG] App created');