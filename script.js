const package = document.querySelector('.package');
const modal = document.querySelector('.modal');
const nameInput = document.getElementById('name');
const birthday = document.getElementById('birthday');
const confirmBtn = document.getElementById('confirmBtn');

const fire = document.querySelector('.fire');
let audioContext;
let microphone;
let analyser;

let formSubmitted = false;
let blownOut = false;

const packageClickHandler = () => {
    if (!formSubmitted){
        modal.style.display = 'flex';
    } else {
        // change title and favicon
        document.title = `Happy Birthday ${nameInput.value}!`;
        const favicon = document.getElementById('favicon');
        
        package.innerHTML= `
            <div class='birthday-message'>
                <p>Happy Birthday ${nameInput.value}!</p>
                
                🎂

            </div>
        `;
        package.style.cursor = 'default';
        package.removeEventListener('click', packageClickHandler);
    }
};

package.addEventListener('click', packageClickHandler);

nameInput.addEventListener('input', () => {
    checkInputs();
});

birthday.addEventListener('input', () => {
    checkInputs();
});

function checkInputs() {
    if (nameInput.value && birthday.value) {
        confirmBtn.disabled = false;
    } else {
        confirmBtn.disabled = true;
    }
}


confirmBtn.addEventListener('click', () => {
    package.textContent = '🎁'
    formSubmitted = true;
    modal.style.display = 'none';
    confirmBtn.disabled = true;

});



async function setupMicrophone() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        microphone = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        microphone.connect(analyser);
        analyser.fftSize = 256;
        detectBlow();
    } catch (error) {
        console.error('Error accessing microphone:', error);
    }
}

function detectBlow() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function checkBlow() {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        // higher threshhol for blow detection

        // check if candle is already blown out
        if (average > 80 && !blownOut) { 
            blownOut = true;
            fire.classList.add('blown-out');
            
            // show smoke after a short delay
            setTimeout(() => {
                fire.style.display = 'none';
                smoke.classList.add('active');
            }, 500);
            
            // remove smoke after animation completes
            setTimeout(() => {
                smoke.classList.remove('active');
            }, 2500);
        }
        
        if (!blownOut) {
            requestAnimationFrame(checkBlow);
        }
    }
    
    checkBlow();
}

setupMicrophone();
