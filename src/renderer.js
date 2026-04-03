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
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
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

    const gap = 0.05;
    const cubieSize = 1;
    const offset = (cube.n - 1) / 2;

    const boxGeometry = new THREE.BoxGeometry(cubieSize - gap * 0.5, cubieSize - gap * 0.5, cubieSize - gap * 0.5);

    for (const cubie of cube.cubies) {
      const materials = this.createCubieMaterials(cubie, cube.n);
      const mesh = new THREE.Mesh(boxGeometry, materials);
      
      mesh.position.set(
        cubie.pos.x - offset,
        cubie.pos.y - offset,
        cubie.pos.z - offset
      );
      
      this.cubeGroup.add(mesh);
    }

    const groupSize = cube.n * cubieSize + gap * cube.n;
    this.cubeGroup.position.set(0, 0, 0);
  }

  createCubieMaterials(cubie, n) {
    const faceColors = [
      cubie.getColor('R'),
      cubie.getColor('L'),
      cubie.getColor('U'),
      cubie.getColor('D'),
      cubie.getColor('F'),
      cubie.getColor('B')
    ];

    return faceColors.map(color => {
      const isBlack = color === 0x333333 || color === undefined;
      return new THREE.MeshStandardMaterial({
        color: isBlack ? 0x111111 : color,
        metalness: 0.1,
        roughness: 0.6
      });
    });
  }

  setCubeGroup(group) {
    this.cubeGroup = group;
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}