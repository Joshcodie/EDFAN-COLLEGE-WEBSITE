const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const navToggle = document.querySelector('.nav-toggle');
const primaryNavigation = document.querySelector('#primary-navigation');
let current = 0;
let timer;

function showSlide(index) {
    slides[current].classList.remove('active');
    current = (index + slides.length) % slides.length;   // wraps around at the ends
    slides[current].classList.add('active');
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => showSlide(current + 1), 7000);   // 7 seconds
}

nextBtn.addEventListener('click', () => {
    showSlide(current + 1);
    startTimer();   // restart the 7-second wait after a manual change
});

prevBtn.addEventListener('click', () => {
    showSlide(current - 1);
    startTimer();
});

['hero-start', 'hero-discover'].forEach((id) => {
    const button = document.getElementById(id);

    if (button) {
        button.addEventListener('click', () => {
            button.getAnimations().forEach((animation) => animation.cancel());
            button.animate([
                { transform: 'translateY(0)' },
                { transform: 'translateY(-12px)', offset: 0.3 },
                { transform: 'translateY(0)', offset: 0.5 },
                { transform: 'translateY(-6px)', offset: 0.7 },
                { transform: 'translateY(0)' }
            ], { duration: 450, easing: 'ease' });
        });
    }
});

if (navToggle && primaryNavigation) {
    navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!isExpanded));
        navToggle.setAttribute('aria-label', isExpanded ? 'Open navigation menu' : 'Close navigation menu');
        primaryNavigation.classList.toggle('is-open', !isExpanded);
    });

    primaryNavigation.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Open navigation menu');
            primaryNavigation.classList.remove('is-open');
        });
    });
}

// Show the first slide and start the automatic timer
slides[0].classList.add('active');
startTimer();

const statisticNumbers = document.querySelectorAll('.statistics h2');
const countDuration = 2000;
const counters = Array.from(statisticNumbers, (element) => {
    const match = element.textContent.trim().match(/^(\d+)(\+?)$/);

    if (!match) {
        throw new Error(`Invalid statistic number: "${element.textContent.trim()}"`);
    }

    const [, value, suffix] = match;
    element.textContent = `0${suffix}`;

    return {
        element,
        target: Number(value),
        suffix
    };
});

function animateCounters() {
    const startTime = performance.now();

    function updateCounters(currentTime) {
        const progress = Math.min((currentTime - startTime) / countDuration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        counters.forEach(({ element, target, suffix }) => {
            element.textContent = `${Math.floor(target * easedProgress)}${suffix}`;
        });

        if (progress < 1) {
            requestAnimationFrame(updateCounters);
        }
    }

    requestAnimationFrame(updateCounters);
}

if ('IntersectionObserver' in window) {
    const statisticsObserver = new IntersectionObserver((entries, observer) => {
        if (entries.some((entry) => entry.isIntersecting)) {
            animateCounters();
            observer.disconnect();
        }
    }, { threshold: 0.25 });

    const statisticsSection = document.querySelector('.statistics');
    if (statisticsSection) {
        statisticsObserver.observe(statisticsSection);
    }
} else {
    animateCounters();
}