const params = new URLSearchParams(window.location.search);
const nameInput = params.get('name')?.toUpperCase();
const ageInput = params.get('age');

const titleText = nameInput ? `Happy Birthday, ${nameInput}!`:'Happy Birthday!';
document.title = titleText;

const messageElement = document.getElementById('birthday-message');
const ageLastDigit = ageInput ? ageInput.match(/\d(?=[^\d]*$)/)?.[0] : null;

if (nameInput && ageInput) {
    if (ageLastDigit == "1") {
    messageElement.innerHTML = `Happy <span>${ageInput}st </span> Birthday, <span>${nameInput}!</span>`;
    } else if (ageLastDigit == "2") {
    messageElement.innerHTML = `Happy <span>${ageInput}nd </span> Birthday, <span>${nameInput}!</span>`;
    } else if (ageLastDigit == "3") {
    messageElement.innerHTML = `Happy <span>${ageInput}rd </span> Birthday, <span>${nameInput}!</span>`;
    } else {
    messageElement.innerHTML = `Happy <span>${ageInput}th </span> Birthday, <span>${nameInput}!</span>`;
    }
} else if (nameInput) {
    messageElement.innerHTML = `Happy Birthday, <span>${nameInput}!</span>`;
} else {
    messageElement.textContent = 'Happy Birthday!';
}   


// Confetti effect
const confettiBtn = document.getElementById('confetti-btn');

function fireConfetti() {
    var count = 200;
    var defaults = {
        origin: { y: 0.7 }
    };
    function fire(particleRatio, opts) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
        });
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });
    fire(0.2, {
        spread: 60,
    });
    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
}

fireConfetti();

if (confettiBtn) {
    confettiBtn.addEventListener('click', fireConfetti);
}
