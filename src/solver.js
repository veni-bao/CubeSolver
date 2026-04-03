import { Cube, FACES, BASE_MOVES } from './cube.js';

export class Solver {
  constructor() {
    this.phase1Algorithms = this.initPhase1Algorithms();
    this.phase2Algorithms = this.initPhase2Algorithms();
  }

  solve(cube) {
    if (cube.n <= 3) {
      return this.solveSmallCube(cube);
    } else {
      return this.solveLargeCube(cube);
    }
  }

  solveSmallCube(cube) {
    const solution = [];
    const testCube = cube.clone();
    const maxIterations = 500;
    let iterations = 0;

    while (!testCube.isSolved() && iterations < maxIterations) {
      const move = this.findNextMove(testCube);
      if (move) {
        testCube.move(move, true);
        solution.push(move);
      }
      iterations++;
    }

    return this.optimizeSolution(solution);
  }

  findNextMove(cube) {
    if (this.isWhiteCrossSolved(cube)) {
      return this.findF2LMove(cube);
    } else {
      return this.findCrossMove(cube);
    }
  }

  isWhiteCrossSolved(cube) {
    const upFaceCubies = cube.cubies.filter(c => c.pos.y === cube.n - 1);
    const whiteEdges = upFaceCubies.filter(c => {
      const hasWhite = c.hasColor('U');
      const isEdge = Object.keys(c.colors).length === 2;
      return hasWhite && isEdge;
    });

    if (whiteEdges.length < 4) return false;

    for (const cubie of whiteEdges) {
      const expectedColors = this.getExpectedCrossColors(cubie);
      const hasCorrectColor = expectedColors.every(color => cubie.hasColor(color));
      if (!hasCorrectColor) return false;
    }

    return true;
  }

  getExpectedCrossColors(cubie) {
    const { x, z } = cubie.pos;
    const mid = Math.floor(this.cube.n / 2);
    
    if (cubie.pos.y === cube.n - 1) {
      if (z === mid) return ['U', 'F'];
      if (x === mid) return ['U', 'R'];
      if (z === mid && x === mid) return ['U'];
    }
    return ['U'];
  }

  getCrossColors(cubie) {
    const colors = [];
    if (cubie.hasColor('U')) colors.push('U');
    if (cubie.hasColor('F')) colors.push('F');
    if (cubie.hasColor('R')) colors.push('R');
    if (cubie.hasColor('D')) colors.push('D');
    if (cubie.hasColor('L')) colors.push('L');
    if (cubie.hasColor('B')) colors.push('B');
    return colors;
  }

  findCrossMove(cube) {
    const upFaceCubies = cube.cubies.filter(c => c.pos.y === cube.n - 1);
    const whiteEdges = upFaceCubies.filter(c => {
      return c.hasColor('U') && Object.keys(c.colors).length === 2;
    });

    const unsolvedEdges = whiteEdges.filter(c => {
      const expectedFace = this.getCrossDirection(c);
      return !c.hasColor(expectedFace);
    });

    if (unsolvedEdges.length > 0) {
      return 'F';
    }

    return 'U';
  }

  getCrossDirection(cubie) {
    const { x, z } = cubie.pos;
    const mid = Math.floor(cube.n / 2);
    
    if (x === mid && z === mid + 1) return 'F';
    if (x === mid + 1 && z === mid) return 'R';
    if (x === mid && z === mid - 1) return 'B';
    if (x === mid - 1 && z === mid) return 'L';
    return 'U';
  }

  findF2LMove(cube) {
    return 'R U R\' U\'';
  }

  initPhase1Algorithms() {
    return {
      'U': ['R U R\' U\'', 'R U\' R\' U'],
      'R': ['R\' U\' R U', 'R\' U R U\''],
      'F': ['F R\' F\' R', 'F\' R F R\''],
    };
  }

  initPhase2Algorithms() {
    return {
      'cross': ['F R U R\' U\' F\''],
      'oll': ['U R U R\' U\' R\' F R F\''],
      'pll': ['R U R\' U\' R\' F R2 U\' R\' U\' R U R\' F\''],
    };
  }

  solveLargeCube(cube) {
    const solution = [];
    const testCube = cube.clone();

    solution.push(...this.solveCenters(testCube));
    solution.push(...this.solveEdges(testCube));
    solution.push(...this.solveAs3x3(testCube));

    return this.optimizeSolution(solution);
  }

  solveCenters(cube) {
    const moves = [];
    const faceCenters = ['U', 'D', 'L', 'R', 'F', 'B'];

    for (const face of faceCenters) {
      const layer = face === 'U' ? cube.n - 1 : face === 'D' ? 0 : 
                    face === 'L' ? 0 : face === 'R' ? cube.n - 1 :
                    face === 'F' ? cube.n - 1 : 0;
      const axis = face === 'U' || face === 'D' ? 'y' : face === 'L' || face === 'R' ? 'x' : 'z';

      for (let i = 0; i < 4; i++) {
        if (!this.isCenterSolved(cube, face)) {
          moves.push(face);
          cube.move(face, true);
        }
      }
    }

    return moves;
  }

  isCenterSolved(cube, face) {
    const layer = face === 'U' ? cube.n - 1 : face === 'D' ? 0 : 
                  face === 'L' ? 0 : face === 'R' ? cube.n - 1 :
                  face === 'F' ? cube.n - 1 : 0;
    const axis = face === 'U' || face === 'D' ? 'y' : face === 'L' || face === 'R' ? 'x' : 'z';

    const centerCubies = cube.cubies.filter(c => c.pos[axis] === layer);
    const mid = Math.floor(cube.n / 2);
    const centerCubie = centerCubies.find(c => 
      c.pos.x === mid && c.pos.y === mid && c.pos.z === mid
    );

    if (!centerCubie) return true;
    
    const centerColor = centerCubie.getColor(face);
    return centerCubies.every(c => c.getColor(face) === centerColor);
  }

  solveEdges(cube) {
    return [];
  }

  solveAs3x3(cube) {
    return this.solveSmallCube(cube);
  }

  optimizeSolution(solution) {
    const optimized = [];
    const moveHistory = [];

    for (const move of solution) {
      if (moveHistory.length === 0) {
        optimized.push(move);
        moveHistory.push(move);
        continue;
      }

      const lastMove = moveHistory[moveHistory.length - 1];
      const baseMove = move.replace("'", "");
      const lastBaseMove = lastMove.replace("'", "");

      if (baseMove === lastBaseMove) {
        const lastIsPrime = lastMove.includes("'");
        const currentIsPrime = move.includes("'");
        
        if (lastIsPrime && !currentIsPrime) {
          moveHistory.pop();
          const newMove = baseMove + "'";
          if (moveHistory.length > 0 && moveHistory[moveHistory.length - 1].replace("'", "") === baseMove) {
            moveHistory.pop();
          } else {
            moveHistory.push(newMove);
            optimized.pop();
            optimized.push(newMove);
          }
        } else if (!lastIsPrime && currentIsPrime) {
          moveHistory.pop();
          optimized.pop();
        } else if (lastIsPrime && currentIsPrime) {
          moveHistory.pop();
          optimized.pop();
          optimized.push(baseMove);
        } else {
          moveHistory.push(move);
          optimized.push(move);
        }
      } else {
        moveHistory.push(move);
        optimized.push(move);
      }
    }

    return optimized;
  }
}