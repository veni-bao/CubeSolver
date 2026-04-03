import * as THREE from 'three';

export class Renderer {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    this.init();
  }

  init() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 600;
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.camera.position.set(5, 5, 7);
    this.camera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    this.scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-5, -5, -5);
    this.scene.add(directionalLight2);

    this.cubeGroup = new THREE.Group();
    this.scene.add(this.cubeGroup);

    window.addEventListener('resize', () => this.onResize());
  }

  render(cube) {
    while (this.cubeGroup.children.length > 0) {
      const child = this.cubeGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      this.cubeGroup.remove(child);
    }

    if (cube.n <= 10) {
      this.renderIndividual(cube);
    } else {
      this.renderInstancedOptimized(cube);
    }
  }

  renderIndividual(cube) {
    const gap = 0.05;
    const cubieSize = 1;
    const offset = (cube.n - 1) / 2;

    const boxGeometry = new THREE.BoxGeometry(cubieSize - gap * 0.5, cubieSize - gap * 0.5, cubieSize - gap * 0.5);

    for (const cubie of cube.cubies) {
      const materials = this.createCubieMaterials(cubie);
      const mesh = new THREE.Mesh(boxGeometry, materials);
      
      mesh.position.set(
        cubie.pos.x - offset,
        cubie.pos.y - offset,
        cubie.pos.z - offset
      );
      
      this.cubeGroup.add(mesh);
    }
  }

  renderInstancedOptimized(cube) {
    const offset = (cube.n - 1) / 2;
    const cubieSize = Math.max(0.3, 2 / cube.n);
    const gap = cubieSize * 0.05;

    const boxGeometry = new THREE.BoxGeometry(cubieSize - gap, cubieSize - gap, cubieSize - gap);
    const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.1, roughness: 0.8 });

    const instancedMesh = new THREE.InstancedMesh(boxGeometry, blackMaterial, cube.cubies.length);
    const matrix = new THREE.Matrix4();

    for (let i = 0; i < cube.cubies.length; i++) {
      const cubie = cube.cubies[i];
      matrix.setPosition(
        (cubie.pos.x - offset) * cubieSize,
        (cubie.pos.y - offset) * cubieSize,
        (cubie.pos.z - offset) * cubieSize
      );
      instancedMesh.setMatrixAt(i, matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    this.cubeGroup.add(instancedMesh);

    const cameraDistance = Math.max(5, cube.n * 0.8);
    this.camera.position.set(cameraDistance, cameraDistance, cameraDistance * 1.2);
    this.camera.lookAt(0, 0, 0);
  }

  createCubieMaterials(cubie) {
    const faceColors = [
      cubie.faceColors.px || 0x333333,
      cubie.faceColors.nx || 0x333333,
      cubie.faceColors.py || 0x333333,
      cubie.faceColors.ny || 0x333333,
      cubie.faceColors.pz || 0x333333,
      cubie.faceColors.nz || 0x333333
    ];

    return faceColors.map(color => {
      return new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.1,
        roughness: 0.6
      });
    });
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}