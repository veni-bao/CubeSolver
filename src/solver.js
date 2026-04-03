import { Cube, BASE_MOVES } from './cube.js';

export class Solver {
  constructor() {
    this.phase1Moves = [];
    this.initMoveTables();
  }

  initMoveTables() {
    for (let i = 0; i < 6; i++) {
      this.phase1Moves[i] = [];
      for (let j = 0; j < 3; j++) {
        const cube = new Cube(3);
        const face = BASE_MOVES[i];
        for (let k = 0; k <= j; k++) {
          cube.move(face, false);
        }
        this.phase1Moves[i][j] = cube;
      }
    }
  }

  solve(cube) {
    if (cube.n <= 3) {
      return this.solve3x3(cube);
    } else {
      return this.solveNxN(cube);
    }
  }

  solve3x3(cube) {
    const solution = [];
    const testCube = cube.clone();
    const maxIterations = 1000;
    let iterations = 0;

    while (!testCube.isSolved() && iterations < maxIterations) {
      const move = this.findBestMove(testCube);
      if (move) {
        testCube.move(move, true);
        solution.push(move);
      }
      iterations++;
    }

    return this.optimizeSolution(solution);
  }

  findBestMove(cube) {
    const moves = this.getAvailableMoves(cube);
    let bestMove = null;
    let bestScore = -1;

    for (const move of moves) {
      const testCube = cube.clone();
      testCube.move(move, false);
      const score = this.evaluateCube(testCube);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  getAvailableMoves(cube) {
    const lastMove = cube.moveLog[cube.moveLog.length - 1];
    const lastFace = lastMove ? lastMove.replace("'", "") : null;
    const moves = [];

    for (const face of BASE_MOVES) {
      if (face === lastFace) continue;
      moves.push(face);
      moves.push(face + "'");
    }

    return moves;
  }

  evaluateCube(cube) {
    let score = 0;

    score += this.evaluateCross(cube) * 10;
    score += this.evaluateF2L(cube) * 5;
    score += this.evaluateCenters(cube) * 3;

    return score;
  }

  evaluateCross(cube) {
    const crossEdges = [
      { x: 1, y: 2, z: 2, faces: ['U', 'F'] },
      { x: 2, y: 2, z: 1, faces: ['U', 'R'] },
      { x: 1, y: 2, z: 0, faces: ['U', 'B'] },
      { x: 0, y: 2, z: 1, faces: ['U', 'L'] }
    ];

    let solved = 0;
    for (const edge of crossEdges) {
      const cubie = cube.getCubie(edge.x, edge.y, edge.z);
      if (cubie && cubie.faceColors.py === 0xffffff && cubie.faceColors.pz === 0xff0000) {
        solved++;
      }
    }
    return solved;
  }

  evaluateF2L(cube) {
    return 0;
  }

  evaluateCenters(cube) {
    const centerColors = {
      U: cube.getCubie(1, 2, 1)?.faceColors.py,
      D: cube.getCubie(1, 0, 1)?.faceColors.ny,
      F: cube.getCubie(1, 1, 2)?.faceColors.pz,
      B: cube.getCubie(1, 1, 0)?.faceColors.nz,
      L: cube.getCubie(0, 1, 1)?.faceColors.nx,
      R: cube.getCubie(2, 1, 1)?.faceColors.px
    };

    let matches = 0;
    const expected = { U: 0xffffff, D: 0xffff00, F: 0xff0000, B: 0xff8800, L: 0x00ff00, R: 0x0000ff };

    for (const face of Object.keys(expected)) {
      if (centerColors[face] === expected[face]) matches++;
    }
    return matches;
  }

  solveNxN(cube) {
    const solution = [];
    const testCube = cube.clone();

    for (let i = 0; i < 6; i++) {
      const face = BASE_MOVES[i];
      for (let j = 0; j < 4; j++) {
        if (!this.isFaceSolved(testCube, face)) {
          testCube.move(face, true);
          solution.push(face);
        }
      }
    }

    return solution;
  }

  isFaceSolved(cube, face) {
    const layer = face === 'U' ? 2 : face === 'D' ? 0 : 
                  face === 'L' ? 0 : face === 'R' ? 2 :
                  face === 'F' ? 2 : 0;
    const axis = face === 'U' || face === 'D' ? 'y' : face === 'L' || face === 'R' ? 'x' : 'z';
    const cubies = cube.getCubiesInLayer(axis, layer);
    
    const expectedColor = { U: 0xffffff, D: 0xffff00, F: 0xff0000, B: 0xff8800, L: 0x00ff00, R: 0x0000ff }[face];
    const faceKey = { U: 'py', D: 'ny', L: 'nx', R: 'px', F: 'pz', B: 'nz' }[face];

    return cubies.every(c => c.faceColors[faceKey] === expectedColor);
  }

  optimizeSolution(solution) {
    const optimized = [];

    for (const move of solution) {
      if (optimized.length === 0) {
        optimized.push(move);
        continue;
      }

      const last = optimized[optimized.length - 1];
      const lastBase = last.replace("'", "");
      const currBase = move.replace("'", "");
      const lastIsPrime = last.includes("'");
      const currIsPrime = move.includes("'");

      if (lastBase === currBase) {
        optimized.pop();
        if (lastIsPrime === currIsPrime) {
          if (lastIsPrime) {
            optimized.push(currBase);
          } else {
            optimized.push(currBase + "'");
          }
        }
      } else {
        optimized.push(move);
      }
    }

    return optimized;
  }
}