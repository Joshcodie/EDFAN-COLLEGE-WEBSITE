const valueCardButtons = Array.from(document.querySelectorAll('.value-card-button'));
const boardImage = document.querySelector('.board-image');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const touchGuide = window.matchMedia('(max-width: 900px), (hover: none), (pointer: coarse)');
let guideCardIndex = 0;
let cursor;

if (finePointer.matches || touchGuide.matches) {
    cursor = document.createElement('div');
    cursor.className = 'value-card-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = `
        <svg viewBox="0 0 38 46" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="value-cursor-clay" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#fff" />
                    <stop offset="1" stop-color="#dfe8f0" />
                </linearGradient>
            </defs>
            <path d="M14 25V8a4.5 4.5 0 0 1 9 0v16h1v-5a3.5 3.5 0 0 1 7 0v7h1v-3a3.5 3.5 0 0 1 7 0v9c0 8-5 13-13 13h-3c-4 0-7-2-9-6L6 29a3.5 3.5 0 0 1 5-4l3 3v-3Z"
                fill="url(#value-cursor-clay)" stroke="#b8c5d0" stroke-linejoin="round"
                stroke-width="1.5" />
            <path d="M16.5 9v12" fill="none" stroke="#fff" stroke-linecap="round"
                stroke-width="1.5" opacity=".9" />
        </svg>`;
    document.body.append(cursor);
}

function positionGuideCursor() {
    if (!cursor || !valueCardButtons.length || !touchGuide.matches) {
        return;
    }

    const boardBounds = boardImage?.getBoundingClientRect();
    const boardIsVisible = boardBounds
        && boardBounds.bottom > 0
        && boardBounds.top < window.innerHeight;
    const targetBounds = boardIsVisible
        ? boardBounds
        : valueCardButtons[guideCardIndex].getBoundingClientRect();

    cursor.style.left = `${targetBounds.left + targetBounds.width / 2}px`;
    cursor.style.top = `${targetBounds.top + targetBounds.height / 2}px`;
}

function updateCursorMode() {
    if (!cursor) {
        return;
    }

    if (touchGuide.matches && valueCardButtons.length) {
        cursor.classList.add('is-guide');
        positionGuideCursor();
        return;
    }

    cursor.classList.remove('is-guide', 'is-visible');
}

if (cursor) {
    window.addEventListener('resize', positionGuideCursor);
    window.addEventListener('scroll', positionGuideCursor, { passive: true, capture: true });
    touchGuide.addEventListener('change', updateCursorMode);
    finePointer.addEventListener('change', updateCursorMode);
    updateCursorMode();
    window.requestAnimationFrame(positionGuideCursor);

    document.querySelectorAll('.value-card-button, .board-image').forEach((button) => {
        button.addEventListener('pointerenter', () => {
            if (finePointer.matches && !touchGuide.matches) {
                cursor.classList.add('is-visible');
            }
        });
        button.addEventListener('pointermove', (event) => {
            if (finePointer.matches && !touchGuide.matches) {
                cursor.style.left = `${event.clientX}px`;
                cursor.style.top = `${event.clientY}px`;
            }
        });
        button.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
    });
}

function setValueCardFlipped(button, isFlipped) {
    const card = button.closest('.value-card');

    card.classList.toggle('is-flipped', isFlipped);
    button.setAttribute('aria-pressed', String(isFlipped));
    button.setAttribute(
        'aria-label',
        `${isFlipped ? 'Hide' : 'Reveal'} value: ${button.dataset.value}`
    );
    card.querySelector('.value-card-front').setAttribute('aria-hidden', String(isFlipped));
    card.querySelector('.value-card-back').setAttribute('aria-hidden', String(!isFlipped));
}

valueCardButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const isFlipped = button.getAttribute('aria-pressed') === 'true';

        if (!isFlipped) {
            valueCardButtons.forEach((otherButton) => {
                if (otherButton !== button) {
                    setValueCardFlipped(otherButton, false);
                }
            });
        }

        setValueCardFlipped(button, !isFlipped);

        if (cursor && touchGuide.matches) {
            guideCardIndex = (valueCardButtons.indexOf(button) + 1) % valueCardButtons.length;
            positionGuideCursor();
        }
    });
});

if (boardImage) {
    boardImage.addEventListener('click', () => {
        const isFlipped = boardImage.getAttribute('aria-pressed') === 'true';

        boardImage.classList.toggle('is-flipped', !isFlipped);
        boardImage.setAttribute('aria-pressed', String(!isFlipped));
        boardImage.setAttribute(
            'aria-label',
            `Show ${isFlipped ? 'school assembly' : 'students together'}`
        );
        boardImage.querySelector('.board-image-front').setAttribute('aria-hidden', String(!isFlipped));
        boardImage.querySelector('.board-image-back').setAttribute('aria-hidden', String(isFlipped));

        if (cursor && touchGuide.matches) {
            positionGuideCursor();
        }
    });
}
