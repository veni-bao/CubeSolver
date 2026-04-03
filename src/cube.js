const FACES = ['U', 'D', 'L', 'R', 'F', 'B'];
const COLORS = {
  U: 0xffffff,
  D: 0xffff00,
  L: 0x00ff00,
  R: 0x0000ff,
  F: 0xff0000,
  B: 0xff8800
};
const FACE_AXIS = {
  U: { axis: 'y', layer: 'max', dir: 1 },
  D: { axis: 'y', layer: 'min', dir: -1 },
  L: { axis: 'x', layer: 'min', dir: -1 },
  R: { axis: 'x', layer: 'max', dir: 1 },
  F: { axis: 'z', layer: 'max', dir: 1 },
  B: { axis: 'z', layer: 'min', dir: -1 }
};
const BASE_MOVES = ['U', 'D', 'L', 'R', 'F', 'B'];

class Cubie {
  constructor(x, y, z, n) {
    this.pos = { x, y, z };
    this.n = n;
    this.faceColors = {
      px: x === n - 1 ? COLORS.R : null,
      nx: x === 0 ? COLORS.L : null,
      py: y === n - 1 ? COLORS.U : null,
      ny: y === 0 ? COLORS.D : null,
      pz: z === n - 1 ? COLORS.F : null,
      nz: z === 0 ? COLORS.B : null
    };
  }

  hasColor(face) {
    const key = { U: 'py', D: 'ny', R: 'px', L: 'nx', F: 'pz', B: 'nz' }[face];
    return this.faceColors[key] !== null;
  }

  getColor(face) {
    const key = { U: 'py', D: 'ny', R: 'px', L: 'nx', F: 'pz', B: 'nz' }[face];
    return this.faceColors[key] || 0x333333;
  }

  rotateFaceColors(face, clockwise) {
    const old = { ...this.faceColors };
    
    if (face === 'U' || face === 'D') {
      if (face === 'U' ? clockwise : !clockwise) {
        this.faceColors.px = old.nz;
        this.faceColors.pz = old.px;
        this.faceColors.nx = old.pz;
        this.faceColors.nz = old.nx;
      } else {
        this.faceColors.px = old.pz;
        this.faceColors.pz = old.nz;
        this.faceColors.nx = old.nz;
        this.faceColors.nz = old.px;
      }
    } else if (face === 'R' || face === 'L') {
      if (face === 'R' ? clockwise : !clockwise) {
        this.faceColors.py = old.nz;
        this.faceColors.pz = old.py;
        this.faceColors.ny = old.pz;
        this.faceColors.nz = old.ny;
      } else {
        this.faceColors.py = old.pz;
        this.faceColors.pz = old.ny;
        this.faceColors.ny = old.nz;
        this.faceColors.nz = old.py;
      }
    } else if (face === 'F' || face === 'B') {
      if (face === 'F' ? clockwise : !clockwise) {
        this.faceColors.px = old.ny;
        this.faceColors.py = old.px;
        this.faceColors.nx = old.py;
        this.faceColors.ny = old.nx;
      } else {
        this.faceColors.px = old.py;
        this.faceColors.py = old.nx;
        this.faceColors.nx = old.ny;
        this.faceColors.ny = old.px;
      }
    }
  }
}

export class Cube {
  constructor(n = 3) {
    this.n = n;
    this.cubies = [];
    this.moveLog = [];
    this.init();
  }

  init() {
    this.cubies = [];
    for (let x = 0; x < this.n; x++) {
      for (let y = 0; y < this.n; y++) {
        for (let z = 0; z < this.n; z++) {
          this.cubies.push(new Cubie(x, y, z, this.n));
        }
      }
    }
    this.moveLog = [];
  }

  getCubiesInLayer(axis, layer) {
    return this.cubies.filter(c => c.pos[axis] === layer);
  }

  getLayerValue(face) {
    const info = FACE_AXIS[face];
    return info.layer === 'max' ? this.n - 1 : 0;
  }

  rotateFace(face, clockwise) {
    const info = FACE_AXIS[face];
    const layer = this.getLayerValue(face);
    const cubies = this.getCubiesInLayer(info.axis, layer);
    
    cubies.forEach(cubie => {
      const { x, y, z } = cubie.pos;
      
      if (info.axis === 'y') {
        if (clockwise) {
          cubie.pos.x = this.n - 1 - z;
          cubie.pos.z = x;
        } else {
          cubie.pos.x = z;
          cubie.pos.z = this.n - 1 - x;
        }
      } else if (info.axis === 'x') {
        if (clockwise) {
          cubie.pos.y = z;
          cubie.pos.z = this.n - 1 - y;
        } else {
          cubie.pos.y = this.n - 1 - z;
          cubie.pos.z = y;
        }
      } else if (info.axis === 'z') {
        if (clockwise) {
          cubie.pos.x = this.n - 1 - y;
          cubie.pos.y = x;
        } else {
          cubie.pos.x = y;
          cubie.pos.y = this.n - 1 - x;
        }
      }
      
      cubie.rotateFaceColors(face, clockwise);
    });
  }

  move(face, record = true) {
    const actualFace = face.replace("'", '');
    const isPrime = face.includes("'");

    if (isPrime) {
      this.rotateFace(actualFace, false);
    } else {
      this.rotateFace(actualFace, true);
    }

    if (record) {
      this.moveLog.push(face);
    }
  }

  inverseMove(face) {
    const actualFace = face.replace("'", '');
    const isPrime = face.includes("'");
    this.move(isPrime ? actualFace : actualFace + "'", true);
  }

  isSolved() {
    for (const face of FACES) {
      const cubiesWithFace = this.cubies.filter(c => c.hasColor && c.hasColor(face));
      if (cubiesWithFace.length === 0) continue;
      
      const expectedColor = COLORS[face];
      if (cubiesWithFace.some(c => c.getColor(face) !== expectedColor)) {
        return false;
      }
    }
    return true;
  }

  generateScramble(length = null) {
    const moveCount = length || Math.floor(20 + Math.random() * 10);
    const moves = [];
    let lastFace = null;

    for (let i = 0; i < moveCount; i++) {
      let face;
      do {
        face = BASE_MOVES[Math.floor(Math.random() * BASE_MOVES.length)];
      } while (face === lastFace);

      const isPrime = Math.random() > 0.5;
      moves.push(isPrime ? face + "'" : face);
      lastFace = face;
    }

    return moves;
  }

  applyScramble(scrambleMoves) {
    for (const move of scrambleMoves) {
      this.move(move, false);
    }
  }

  clone() {
    const newCube = new Cube(this.n);
    newCube.cubies = this.cubies.map(c => {
      const newCubie = new Cubie(c.pos.x, c.pos.y, c.pos.z, c.n);
      newCubie.faceColors = { ...c.faceColors };
      return newCubie;
    });
    newCube.moveLog = [...this.moveLog];
    return newCube;
  }
}

export { FACES, COLORS, BASE_MOVES };