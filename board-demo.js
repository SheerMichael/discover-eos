{
  // Distances from the official EOS guide. Each scene illustrates straight diagonals on an open board.
  const rules = {
    supremo: { name: 'Supremo', move: [1, 2], attack: 1 },
    archer: { name: 'Archer', move: [1], attack: 3 },
    deacon: { name: 'Deacon', move: [1], attack: 2 },
    'vice-roy': { name: 'Vice Roy', move: [2], attack: 2 },
    chancellor: { name: 'Chancellor', move: [2], attack: 3 },
    minister: { name: 'Minister', move: [2], attack: 1 },
    steward: { name: 'Steward', move: [1], attack: 1 },
  };

  const demo = document.querySelector('[data-board-demo]');
  const grid = demo.querySelector('[data-demo-grid]');
  const piece = demo.querySelector('[data-demo-piece]');
  const opponent = demo.querySelector('[data-demo-opponent]');
  const caption = demo.querySelector('[data-demo-caption]');
  const title = demo.querySelector('[data-demo-title]');
  const rule = demo.querySelector('[data-demo-rule]');
  const status = demo.querySelector('[data-demo-status]');
  const stepButton = demo.querySelector('[data-demo-step]');
  const resetButton = demo.querySelector('[data-demo-reset]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const columns = 'FGHIJKL';
  const origin = { column: 4, row: 4 };
  const directions = [[1, -1], [-1, -1], [1, 1], [-1, 1]];
  const cells = [];
  let profile;
  let isAttack;
  let opponentSpot;
  let moveChoices;
  let activeChoices;
  let position = origin;
  let phase = 0;
  let movementAnimation;

  function squareName(spot) {
    return `${columns[spot.column - 1]}${11 - spot.row}`;
  }

  function diagonal(distance, [across, down]) {
    return { column: origin.column + distance * across, row: origin.row + distance * down };
  }

  function place(element, spot) {
    element.style.setProperty('--col', spot.column);
    element.style.setProperty('--row', spot.row);
  }

  function describeSteps(distances) {
    return `${distances.join(' or ')} diagonal ${distances.length === 1 && distances[0] === 1 ? 'step' : 'steps'}`;
  }

  function render(fromPosition) {
    const moving = phase === (isAttack ? 1 : 0);
    const capturing = isAttack && phase === 0;
    activeChoices = moving ? moveChoices : capturing ? [opponentSpot] : [];
    const highlighted = new Set(activeChoices.map(squareName));

    movementAnimation?.cancel();
    place(piece, position);
    place(opponent, opponentSpot);
    opponent.hidden = !capturing;
    for (const cell of cells) {
      cell.button.hidden = !highlighted.has(cell.name);
      cell.button.classList.toggle('is-capture', capturing);
      cell.button.setAttribute('aria-label', capturing ? `Capture the piece on ${cell.name}` : `Move to ${cell.name}`);
    }

    if (fromPosition && fromPosition !== position && !reducedMotion.matches && typeof piece.animate === 'function') {
      const from = cells.find(cell => cell.name === squareName(fromPosition)).space.getBoundingClientRect();
      const to = cells.find(cell => cell.name === squareName(position)).space.getBoundingClientRect();
      movementAnimation = piece.animate(
        [{ transform: `translate(${from.x - to.x}px, ${from.y - to.y}px)` }, { transform: 'translate(0, 0)' }],
        { duration: 270, easing: 'ease-out' },
      );
    }

    caption.textContent = `${profile.name} on ${squareName(position)}`;
    resetButton.disabled = phase === 0;
    if (capturing) {
      status.textContent = `Capture the blue Steward on ${squareName(opponentSpot)}.`;
      stepButton.textContent = 'Show capture';
    } else if (moving && isAttack) {
      status.textContent = 'The blue piece is captured. Choose a gold ring to complete the turn.';
      stepButton.textContent = 'Show follow-through';
    } else if (moving) {
      status.textContent = 'Choose a gold ring to try one of the illustrated moves.';
      stepButton.textContent = 'Show move';
    } else {
      status.textContent = `${profile.name} finished the ${isAttack ? 'capture and follow-through' : 'move'} on ${squareName(position)}.`;
      stepButton.textContent = 'Replay example';
    }
  }

  function playStep(spot) {
    const fromPosition = position;
    if (!isAttack || phase !== 0) position = spot;
    phase += 1;
    render(fromPosition);
  }

  function reset() {
    position = origin;
    phase = 0;
    render();
  }

  function loadExample() {
    const selectedPiece = demo.querySelector('input[name="eos-piece"]:checked').value;
    profile = rules[selectedPiece];
    isAttack = demo.querySelector('input[name="eos-lesson"]:checked').value === 'attack';
    moveChoices = profile.move.flatMap(distance => directions.map(direction => diagonal(distance, direction)));
    opponentSpot = diagonal(profile.attack, directions[0]);
    piece.src = `./assets/eos-${selectedPiece}.webp`;
    title.textContent = `${profile.name} · ${isAttack ? 'Attack' : 'Movement'}`;
    rule.textContent = isAttack
      ? `With a clear path, the ${profile.name} can capture from ${describeSteps([profile.attack])} away. When it captures first, it follows with a move of ${describeSteps(profile.move)}.`
      : `The ${profile.name} can move ${describeSteps(profile.move)}. The rings show straight paths from I7.`;
    reset();
  }

  const board = document.createDocumentFragment();
  for (let row = 1; row <= 7; row += 1) {
    for (let column = row % 2 === 0 ? 2 : 1; column <= 7; column += 2) {
      const spot = { column, row };
      const space = document.createElement('span');
      space.className = 'board-demo-cell';
      space.setAttribute('aria-hidden', 'true');
      if (column === origin.column && row === origin.row) space.classList.add('board-demo-origin');
      place(space, spot);

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'board-demo-target';
      place(button, spot);
      button.addEventListener('click', () => {
        playStep(spot);
        stepButton.focus();
      });
      cells.push({ name: squareName(spot), space, button });
      board.append(space, button);
    }
  }
  grid.prepend(board);

  demo.addEventListener('change', loadExample);
  stepButton.addEventListener('click', () => {
    if (activeChoices.length) playStep(activeChoices[0]);
    else reset();
  });
  resetButton.addEventListener('click', () => {
    reset();
    stepButton.focus();
  });
  loadExample();
  demo.hidden = false;
}
