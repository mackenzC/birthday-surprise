let audioContext;
let analyser;
let microphone;
let dataArray;
let isListening = false;

async function startMicrophoneDetection() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        isListening = true;

        checkBlowing();
    } catch (error) {
        alert('Microphone access is required to blow out the candles.');
        console.error('Microphone access denied or error:', error);
    }
}

function checkBlowing() {
    if (!isListening) return;

    requestAnimationFrame(checkBlowing);
    analyser.getByteFrequencyData(dataArray);
    
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    const average = sum / dataArray.length;

    if (average > 80) {
        // isListening = false;
        window.dispatchEvent(new Event('blowDetected'));
        // console.log('fire out')
    }

}

window.addEventListener('blownOut', () => {
    isListening = false;
});

export { startMicrophoneDetection};
