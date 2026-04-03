import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN from '@tweenjs/tween.js';
import { Cube } from './cube.js';
import { Renderer } from './renderer.js';
import { Animator } from './animator.js';
import { Solver } from './solver.js';
import { UI } from './ui.js';

class App {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.loading = document.getElementById('loading');
    
    if (!this.container || !this.loading) {
      document.body.innerHTML = '<p style="color:red;padding:20px">Required elements not found</p>';
      return;
    }
    
    this.n = 3;
    this.speed = 1.0;
    this.isScrambled = false;
    this.isSolving = false;
    this.needsRender = true;
    
    try {
      this.init();
    } catch (e) {
      console.error('Init error:', e);
      this.loading.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
    }
  }

  init() {
    this.initRenderer();
    this.initCube();
    this.initAnimator();
    this.initSolver();
    this.initUI();
    
    this.loading.style.display = 'none';
    this.animate();
  }

  initRenderer() {
    this.renderer = new Renderer(this.container);
    this.controls = new OrbitControls(this.renderer.camera, this.renderer.domElement || this.renderer.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
  }

  initCube() {
    this.cube = new Cube(this.n);
    this.renderer.render(this.cube);
  }

  initAnimator() {
    this.animator = new Animator(this.renderer, this.cube, () => this.onMoveComplete());
  }

  initSolver() {
    this.solver = new Solver();
  }

  initUI() {
    this.ui = new UI({
      nSlider: document.getElementById('n-slider'),
      nValue: document.getElementById('n-value'),
      speedSlider: document.getElementById('speed-slider'),
      speedValue: document.getElementById('speed-value'),
      scrambleBtn: document.getElementById('scramble-btn'),
      solveBtn: document.getElementById('solve-btn'),
      moveCount: document.getElementById('move-count'),
      status: document.getElementById('status')
    });

    this.ui.onNChange = (n) => this.changeN(n);
    this.ui.onSpeedChange = (speed) => this.changeSpeed(speed);
    this.ui.onScramble = () => this.scramble();
    this.ui.onSolve = () => this.solve();
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
    this.controls.update();
    
    if (this.cube && this.renderer) {
      this.renderer.render(this.cube);
    }
  }
}

new App();