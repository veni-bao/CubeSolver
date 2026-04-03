const FACES = ['U', 'D', 'L', 'R', 'F', 'B'];
const COLORS = {
  U: 0xffffff,
  D: 0xffff00,
  L: 0x00ff00,
  R: 0x0000ff,
  F: 0xff0000,
  B: 0xff8800
};
const INVERSE = { U: 'U\'', D: 'D\'', L: 'L\'', R: 'R\'', F: 'F\'', B: 'B\'' };
const BASE_MOVES = ['U', 'D', 'L', 'R', 'F', 'B'];

class Cubie {
  constructor(x, y, z, n) {
    this.pos = { x, y, z };
    this.originalPos = { x, y, z };
    this.n = n;
    this.colors = this.initColors();
  }

  initColors() {
    const colors = {};
    const { x, y, z } = this.pos;
    const mid = Math.floor(this.n / 2);

    if (y === this.n - 1) colors.U = COLORS.U;
    if (y === 0) colors.D = COLORS.D;
    if (x === 0) colors.L = COLORS.L;
    if (x === this.n - 1) colors.R = COLORS.R;
    if (z === this.n - 1) colors.F = COLORS.F;
    if (z === 0) colors.B = COLORS.B;

    return colors;
  }

  getColor(face) {
    return this.colors[face] || 0x333333;
  }

  hasColor(face) {
    return face in this.colors;
  }

  removeColor(face) {
    delete this.colors[face];
  }

  setColor(face, color) {
    this.colors[face] = color;
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

  getCubie(x, y, z) {
    return this.cubies.find(c => c.pos.x === x && c.pos.y === y && c.pos.z === z);
  }

  getLayer(axis, layer) {
    const mid = Math.floor(this.n / 2);
    if (layer === 'top' || layer === 'right' || layer === 'front') {
      return this.n - 1;
    }
    if (layer === 'bottom' || layer === 'left' || layer === 'back') {
      return 0;
    }
    return mid;
  }

  getCubiesInLayer(axis, layer) {
    return this.cubies.filter(c => c.pos[axis] === layer);
  }

  rotateFace(face) {
    const axis = { U: 'y', D: 'y', L: 'x', R: 'x', F: 'z', B: 'z' }[face];
    const layer = { U: this.n - 1, D: 0, L: 0, R: this.n - 1, F: this.n - 1, B: 0 }[face];
    const cubies = this.getCubiesInLayer(axis, layer);
    const clockwise = face === 'U' || face === 'R' || face === 'F';

    cubies.forEach(cubie => {
      const { x, y, z } = cubie.pos;
      if (axis === 'y') {
        if (clockwise) {
          cubie.pos.x = this.n - 1 - z;
          cubie.pos.z = x;
        } else {
          cubie.pos.x = z;
          cubie.pos.z = this.n - 1 - x;
        }
      } else if (axis === 'x') {
        if (clockwise) {
          cubie.pos.y = z;
          cubie.pos.z = this.n - 1 - y;
        } else {
          cubie.pos.y = this.n - 1 - z;
          cubie.pos.z = y;
        }
      } else if (axis === 'z') {
        if (clockwise) {
          cubie.pos.x = this.n - 1 - y;
          cubie.pos.y = x;
        } else {
          cubie.pos.x = y;
          cubie.pos.y = this.n - 1 - x;
        }
      }

      const oldColors = { ...cubie.colors };
      cubie.colors = {};
      if (oldColors.U) cubie.colors.U = oldColors.U;
      if (oldColors.D) cubie.colors.D = oldColors.D;
      if (oldColors.L) cubie.colors.L = oldColors.L;
      if (oldColors.R) cubie.colors.R = oldColors.R;
      if (oldColors.F) cubie.colors.F = oldColors.F;
      if (oldColors.B) cubie.colors.B = oldColors.B;
    });

    this.rotateFaceColors(cubies, face, clockwise);
  }

  rotateFaceColors(cubies, face, clockwise) {
    cubies.forEach(cubie => {
      const oldColors = { ...cubie.colors };
      cubie.colors = {};

      if (face === 'U') {
        if (clockwise) {
          if (oldColors.R) cubie.colors.F = oldColors.R;
          if (oldColors.B) cubie.colors.R = oldColors.B;
          if (oldColors.L) cubie.colors.B = oldColors.L;
          if (oldColors.F) cubie.colors.L = oldColors.F;
          if (oldColors.U) cubie.colors.U = oldColors.U;
          if (oldColors.D) cubie.colors.D = oldColors.D;
        } else {
          if (oldColors.L) cubie.colors.F = oldColors.L;
          if (oldColors.F) cubie.colors.R = oldColors.F;
          if (oldColors.R) cubie.colors.B = oldColors.R;
          if (oldColors.B) cubie.colors.L = oldColors.B;
          if (oldColors.U) cubie.colors.U = oldColors.U;
          if (oldColors.D) cubie.colors.D = oldColors.D;
        }
      } else if (face === 'D') {
        if (clockwise) {
          if (oldColors.F) cubie.colors.R = oldColors.F;
          if (oldColors.L) cubie.colors.F = oldColors.L;
          if (oldColors.B) cubie.colors.L = oldColors.B;
          if (oldColors.R) cubie.colors.B = oldColors.R;
          if (oldColors.U) cubie.colors.U = oldColors.U;
          if (oldColors.D) cubie.colors.D = oldColors.D;
        } else {
          if (oldColors.R) cubie.colors.F = oldColors.R;
          if (oldColors.F) cubie.colors.L = oldColors.F;
          if (oldColors.L) cubie.colors.B = oldColors.L;
          if (oldColors.B) cubie.colors.R = oldColors.B;
          if (oldColors.U) cubie.colors.U = oldColors.U;
          if (oldColors.D) cubie.colors.D = oldColors.D;
        }
      } else if (face === 'R') {
        if (clockwise) {
          if (oldColors.U) cubie.colors.F = oldColors.U;
          if (oldColors.B) cubie.colors.U = oldColors.B;
          if (oldColors.D) cubie.colors.B = oldColors.D;
          if (oldColors.F) cubie.colors.D = oldColors.F;
          if (oldColors.L) cubie.colors.L = oldColors.L;
          if (oldColors.R) cubie.colors.R = oldColors.R;
        } else {
          if (oldColors.F) cubie.colors.U = oldColors.F;
          if (oldColors.U) cubie.colors.B = oldColors.U;
          if (oldColors.B) cubie.colors.D = oldColors.B;
          if (oldColors.D) cubie.colors.F = oldColors.D;
          if (oldColors.L) cubie.colors.L = oldColors.L;
          if (oldColors.R) cubie.colors.R = oldColors.R;
        }
      } else if (face === 'L') {
        if (clockwise) {
          if (oldColors.B) cubie.colors.U = oldColors.B;
          if (oldColors.U) cubie.colors.F = oldColors.U;
          if (oldColors.F) cubie.colors.D = oldColors.F;
          if (oldColors.D) cubie.colors.B = oldColors.D;
          if (oldColors.L) cubie.colors.L = oldColors.L;
          if (oldColors.R) cubie.colors.R = oldColors.R;
        } else {
          if (oldColors.U) cubie.colors.B = oldColors.U;
          if (oldColors.B) cubie.colors.D = oldColors.B;
          if (oldColors.D) cubie.colors.F = oldColors.D;
          if (oldColors.F) cubie.colors.U = oldColors.F;
          if (oldColors.L) cubie.colors.L = oldColors.L;
          if (oldColors.R) cubie.colors.R = oldColors.R;
        }
      } else if (face === 'F') {
        if (clockwise) {
          if (oldColors.U) cubie.colors.R = oldColors.U;
          if (oldColors.L) cubie.colors.U = oldColors.L;
          if (oldColors.D) cubie.colors.L = oldColors.D;
          if (oldColors.R) cubie.colors.D = oldColors.R;
          if (oldColors.F) cubie.colors.F = oldColors.F;
          if (oldColors.B) cubie.colors.B = oldColors.B;
        } else {
          if (oldColors.U) cubie.colors.L = oldColors.U;
          if (oldColors.R) cubie.colors.U = oldColors.R;
          if (oldColors.D) cubie.colors.R = oldColors.D;
          if (oldColors.L) cubie.colors.D = oldColors.L;
          if (oldColors.F) cubie.colors.F = oldColors.F;
          if (oldColors.B) cubie.colors.B = oldColors.B;
        }
      } else if (face === 'B') {
        if (clockwise) {
          if (oldColors.L) cubie.colors.U = oldColors.L;
          if (oldColors.U) cubie.colors.R = oldColors.U;
          if (oldColors.R) cubie.colors.D = oldColors.R;
          if (oldColors.D) cubie.colors.L = oldColors.D;
          if (oldColors.F) cubie.colors.F = oldColors.F;
          if (oldColors.B) cubie.colors.B = oldColors.B;
        } else {
          if (oldColors.U) cubie.colors.L = oldColors.U;
          if (oldColors.L) cubie.colors.D = oldColors.L;
          if (oldColors.D) cubie.colors.R = oldColors.D;
          if (oldColors.R) cubie.colors.U = oldColors.R;
          if (oldColors.F) cubie.colors.F = oldColors.F;
          if (oldColors.B) cubie.colors.B = oldColors.B;
        }
      }
    });
  }

  move(face, record = true) {
    const actualFace = face.replace("'", '');
    const isPrime = face.includes("'");

    if (isPrime) {
      this.move(actualFace + "'", record);
      return;
    }

    this.rotateFace(actualFace);

    if (record) {
      this.moveLog.push(face);
    }
  }

  inverseMove(face) {
    const actualFace = face.replace("'", '');
    this.move(actualFace + "'", true);
  }

  isSolved() {
    for (const face of FACES) {
      const cubiesWithFace = this.cubies.filter(c => c.hasColor(face));
      if (cubiesWithFace.length === 0) continue;
      
      const color = cubiesWithFace[0].getColor(face);
      if (cubiesWithFace.some(c => c.getColor(face) !== color)) {
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
      newCubie.colors = { ...c.colors };
      return newCubie;
    });
    newCube.moveLog = [...this.moveLog];
    return newCube;
  }
}

export { FACES, COLORS, INVERSE, BASE_MOVES };