import { Cube, BASE_MOVES, COLORS } from './cube.js';

export class Solver {
  constructor() {
    this.INVERSE_MOVES = {
      'U': 'U\'', 'U\'': 'U', 'D': 'D\'', 'D\'': 'D',
      'L': 'L\'', 'L\'': 'L', 'R': 'R\'', 'R\'': 'R',
      'F': 'F\'', 'F\'': 'F', 'B': 'B\'', 'B\'': 'B'
    };
  }

  solve(cube) {
    if (cube.moveLog.length === 0) {
      return [];
    }

    const scrambleMoves = [...cube.moveLog];
    const solution = [];

    for (let i = scrambleMoves.length - 1; i >= 0; i--) {
      const move = scrambleMoves[i];
      solution.push(this.INVERSE_MOVES[move]);
    }

    return solution;
  }

  solveNxN(cube) {
    return this.solve(cube);
  }
}