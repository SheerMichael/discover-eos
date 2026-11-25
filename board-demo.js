{
  const demo = document.querySelector('[data-board-demo]');
  const origin = demo.querySelector('[data-demo-origin]');
  const piece = demo.querySelector('[data-demo-piece]');
  const actions = demo.querySelector('[data-demo-actions]');
  const status = demo.querySelector('[data-demo-status]');
  const reset = demo.querySelector('[data-demo-reset]');
  const destinations = Array.from(demo.querySelectorAll('[data-destination]'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected = origin;
  let moveAnimation;

  function placePiece(spot) {
    const start = spot === origin ? selected : origin;
    const from = start.getBoundingClientRect();
    const to = spot.getBoundingClientRect();
    moveAnimation?.cancel();

    for (const coordinate of ['--col', '--row']) {
      piece.style.setProperty(coordinate, spot.style.getPropertyValue(coordinate));
    }

    if (!reducedMotion.matches && typeof piece.animate === 'function') {
      const x = from.x + from.width / 2 - to.x - to.width / 2;
      const y = from.y + from.height / 2 - to.y - to.height / 2;
      moveAnimation = piece.animate(
        [{ transform: `translate(${x}px, ${y}px)` }, { transform: 'translate(0, 0)' }],
        { duration: 270, easing: 'ease-out' },
      );
    }

    selected = spot;
    for (const destination of destinations) {
      destination.setAttribute('aria-pressed', String(destination === selected));
    }
    reset.disabled = selected === origin;
    status.textContent = selected === origin
      ? 'Back at I7. Choose a gold ring to trace a move.'
      : `The Steward moved from I7 to ${selected.dataset.destination}.`;
  }

  for (const destination of destinations) {
    destination.addEventListener('click', () => placePiece(destination));
    destination.disabled = false;
  }
  reset.addEventListener('click', () => {
    const lastDestination = selected;
    placePiece(origin);
    lastDestination.focus();
  });
  actions.hidden = false;
}
