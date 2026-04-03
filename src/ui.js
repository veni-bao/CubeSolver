export class UI {
  constructor(elements) {
    this.nSlider = elements.nSlider;
    this.nValue = elements.nValue;
    this.speedSlider = elements.speedSlider;
    this.speedValue = elements.speedValue;
    this.scrambleBtn = elements.scrambleBtn;
    this.solveBtn = elements.solveBtn;
    this.moveCount = elements.moveCount;
    this.status = elements.status;

    this.onNChange = null;
    this.onSpeedChange = null;
    this.onScramble = null;
    this.onSolve = null;

    this.init();
  }

  init() {
    this.nSlider.addEventListener('input', (e) => {
      const n = parseInt(e.target.value);
      this.nValue.textContent = n;
      if (this.onNChange) this.onNChange(n);
    });

    this.speedSlider.addEventListener('input', (e) => {
      const speed = parseFloat(e.target.value);
      this.speedValue.textContent = speed.toFixed(1) + 'x';
      if (this.onSpeedChange) this.onSpeedChange(speed);
    });

    this.scrambleBtn.addEventListener('click', () => {
      if (this.onScramble) this.onScramble();
    });

    this.solveBtn.addEventListener('click', () => {
      if (this.onSolve) this.onSolve();
    });
  }

  setStatus(status) {
    this.status.textContent = status;
  }

  setMoveCount(count) {
    this.moveCount.textContent = count;
  }

  setSolveEnabled(enabled) {
    this.solveBtn.disabled = !enabled;
  }

  setScrambleEnabled(enabled) {
    this.scrambleBtn.disabled = !enabled;
  }
}