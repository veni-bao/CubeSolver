import TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';
import { BASE_MOVES } from './cube.js';

export class Animator {
  constructor(renderer, cube, onComplete) {
    this.renderer = renderer;
    this.cube = cube;
    this.onComplete = onComplete;
    this.speed = 1.0;
    this.isAnimating = false;
    this.moveQueue = [];

    this.pivotGroup = new THREE.Group();
    this.renderer.scene.add(this.pivotGroup);
  }

  setCube(cube) {
    this.cube = cube;
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  async animateMove(move) {
    const face = move.replace("'", '');
    const isPrime = move.includes("'");
    const axis = this.getAxis(face);
    const layer = this.getLayer(face);
    const direction = isPrime ? -1 : 1;
    const clockwise = face === 'U' || face === 'R' || face === 'F' ? !isPrime : isPrime;

    const cubiesInLayer = this.cube.getCubiesInLayer(axis, layer);
    const offset = (this.cube.n - 1) / 2;

    this.pivotGroup.rotation.set(0, 0, 0);
    this.pivotGroup.updateMatrixWorld();

    for (const cubie of cubiesInLayer) {
      const mesh = this.findMeshForCubie(cubie);
      if (mesh) {
        this.pivotGroup.attach(mesh);
      }
    }

    const targetRotation = Math.PI / 2 * direction;
    const actualRotation = clockwise ? targetRotation : -targetRotation;

    const rotationAxis = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) }[axis];

    const animationDuration = 300 / this.speed;

    await new Promise(resolve => {
      const startState = { rotation: 0 };
      
      new TWEEN.Tween(startState)
        .to({ rotation: actualRotation }, animationDuration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
          const currentRotation = startState.rotation;
          
          if (axis === 'x') {
            this.pivotGroup.rotation.x = currentRotation;
          } else if (axis === 'y') {
            this.pivotGroup.rotation.y = currentRotation;
          } else if (axis === 'z') {
            this.pivotGroup.rotation.z = currentRotation;
          }
        })
        .onComplete(() => {
          cubiesInLayer.forEach(cubie => {
            const mesh = this.findMeshInPivot(cubie);
            if (mesh) {
              this.renderer.cubeGroup.attach(mesh);
            }
          });

          this.cube.move(move);
          this.renderer.render(this.cube);
          resolve();
        })
        .start();
    });

    this.pivotGroup.rotation.set(0, 0, 0);
  }

  getAxis(face) {
    const axes = { U: 'y', D: 'y', L: 'x', R: 'x', F: 'z', B: 'z' };
    return axes[face];
  }

  getLayer(face) {
    const layers = { U: this.cube.n - 1, D: 0, L: 0, R: this.cube.n - 1, F: this.cube.n - 1, B: 0 };
    return layers[face];
  }

  findMeshForCubie(cubie) {
    const offset = (this.cube.n - 1) / 2;
    const targetPos = new THREE.Vector3(cubie.pos.x - offset, cubie.pos.y - offset, cubie.pos.z - offset);

    for (const mesh of this.renderer.cubeGroup.children) {
      if (mesh.position.distanceTo(targetPos) < 0.1) {
        return mesh;
      }
    }
    return null;
  }

  findMeshInPivot(cubie) {
    const offset = (this.cube.n - 1) / 2;
    const targetPos = new THREE.Vector3(cubie.pos.x - offset, cubie.pos.y - offset, cubie.pos.z - offset);

    for (const mesh of this.pivotGroup.children) {
      if (mesh.position.distanceTo(targetPos) < 0.1) {
        return mesh;
      }
    }
    return null;
  }
}