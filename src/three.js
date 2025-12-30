import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import cakeUrl from './assets/cake.glb?url';
import { startMicrophoneDetection } from './audio';

const params = new URLSearchParams(window.location.search);
const numCandles = params.get('age') ? parseInt(params.get('age')) : 5;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000,0);
document.body.appendChild(renderer.domElement);

// group stuff together
const cakeGroup = new THREE.Group();
scene.add(cakeGroup);

// lighting
const color = 0xffffff;
const intensity = 3;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);

// candles ------
const candleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 32);
const candleMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });
const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });

const colorPalette = [
    0xFF7F6E, // coral
    0xFF9A3C, // tangerine
    0xFFD166, // sunflower
    0x5ED3A4, // mint
    0x41C6C4, // turquoise
    0x6FB6FF, // sky blue
    0x7C88FF, // periwinkle
    0xC084F5, // orchid
    0xFF76A8  // bubblegum
];

// wicks
const wicksGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.06, 32);
const wickMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

// flames ------
function makeFlameTexture() {
    const pixleSize = 8;
    const canvas = document.createElement('canvas');
    canvas.width = pixleSize;
    canvas.height = pixleSize;
    const ctx = canvas.getContext('2d'); // get 2d context for drawing
    ctx.clearRect(0, 0, pixleSize, pixleSize); // clear canvas

    // draw simple flame
    ctx.fillStyle = 'rgba(255,220,120,0.9)';
    ctx.fillRect(3, 5, 2, 2); // read as position (3,5), draw 2x2 rect
    ctx.fillStyle = 'rgba(255,180,80,0.8)';
    ctx.fillRect(2, 3, 4, 2);
    ctx.fillStyle = 'rgba(255,130,60,0.7)';
    ctx.fillRect(2, 1, 4, 2);
    ctx.fillStyle = 'rgba(255,255,200,0.9)';
    ctx.fillRect(3, 4, 2, 1);
    ctx.fillStyle = 'rgba(120,60,20,0.5)'; 
    ctx.fillRect(3, 0, 2, 1);

    const tex = new THREE.CanvasTexture(canvas); // convert canvas to 3js texture
    
    // ensures sharp edges when scaled, no blur
    tex.minFilter = THREE.NearestFilter; 
    tex.magFilter = THREE.NearestFilter;
    return tex;
}
const flameTexture = makeFlameTexture();

const material = new THREE.PointsMaterial({
    size: 0.17, //particle size
    map: flameTexture,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});
const flames = [];


for (let i = 0; i < numCandles; i++) {
    const mat = candleMaterial.clone();
    mat.color = new THREE.Color(colorPalette[i % colorPalette.length]);

    const candle = new THREE.Mesh(candleGeometry, mat);
    const angle = (i / numCandles) * Math.PI * 2;
    const radius = 0.7;
    candle.position.set(Math.cos(angle) * radius, 0.25, Math.sin(angle) * radius);
    cakeGroup.add(candle);

    const outline = new THREE.Mesh(candleGeometry, outlineMaterial);
    outline.scale.multiplyScalar(1.1);
    outline.position.copy(candle.position);
    cakeGroup.add(outline);

    const wick = new THREE.Mesh(wicksGeometry, wickMaterial);
    wick.position.set(candle.position.x, candle.position.y + 0.6, candle.position.z);
    cakeGroup.add(wick);

    // fire particle
    const particleCount = 10;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);

    for (let p = 0; p < particleCount; p++) {
      positions[p*3] = (Math.random() - 0.5) * 0.06;     // x
      positions[p*3 + 1] = Math.random() * 0.4;          // y
      positions[p*3 + 2] = (Math.random() - 0.5) * 0.06; // z
      velocities[p] = 0.001 + Math.random() * 0.001;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); // sets the positions of the particle

    const flameMat = material.clone(); // unique material per flame
    const flame = new THREE.Points(geometry, flameMat);
    flame.position.copy(wick.position);
    flame.position.y += 0.05;
    flame.visible = false; // hide until cake loads
    cakeGroup.add(flame);

    flame.userData.velocities = velocities;
    flame.userData.originalPosition = flame.position.clone(); // store original position
    flames.push(flame);
}

// load cake model -----
function getCakeSize() {
    const width = window.innerWidth;
    if (width < 600) return 1.2; // mobile
    if (width < 1024) return 1.8; // tablet
    return 2.0; // desktop
}

const size = getCakeSize();
let cake;
let isLoaded = false;
let loaderProgress = 0;

const loader = new GLTFLoader();
loader.load(
    cakeUrl,
    function (gltf) {
        cake = gltf.scene;
        cakeGroup.add(cake);
        cake.position.set(0, -0.5, 0);
        cake.scale.set(size, size, size);
        // console.log('Cake loaded successfully', cake.position);
    },
    undefined,
    (error) => console.error(error)
);

camera.position.set(0, 2.5, 5);
camera.lookAt(0, 0, 0); 

// updates resizing of cake
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    if (cake) {
        const newSize = getCakeSize();
        cake.scale.set(newSize, newSize, newSize);
    }
});

function animate() {
    requestAnimationFrame(animate);
    if (cake && !isLoaded) {
        const elapsed = performance.now() - loaderProgress;
        const duration = 1000;
        const progress = Math.min(elapsed / duration, 1);
        cakeGroup.rotation.y += 0.05; // fast spin during load
        camera.position.z = 15 - (10 * progress); // zoom in
        
        if (progress === 1) {
            isLoaded = true;

            setTimeout(() => {
                for (const flame of flames) {
                    flame.visible = true;
                    
                }
                startMicrophoneDetection();
            }, 500);
        }
    }
    if (cake && isLoaded) {
        cakeGroup.rotation.y += 0.001;
    }

     // loop through each flame particle system
    for (const flame of flames) {
        const positions = flame.geometry.getAttribute('position');
        const vel = flame.userData.velocities;

        for (let i = 0; i < vel.length; i++) {
        const idx = i * 3;
        positions.array[idx + 1] += vel[i];
        positions.array[idx] += (Math.random() - 0.5) * 0.0005;
        positions.array[idx + 2] += (Math.random() - 0.5) * 0.0005;

        // max height
        if (positions.array[idx + 1] > 0.20) {
            positions.array[idx + 1] = 0;
            positions.array[idx] = (Math.random() - 0.5) * 0.06;
            positions.array[idx + 2] = (Math.random() - 0.5) * 0.06;
        }
        }
        positions.needsUpdate = true;
    }
    renderer.render(scene, camera);
}
animate();


function fadeOutFlames(flares) {
    const fadeMs = 700;
    const start = performance.now();
    function step() {
        const t = Math.min((performance.now() - start) / fadeMs, 1);
        for (const flame of flares) {
        flame.material.opacity = 0.8 * (1 - t);
        const s = 1 - t * 0.5;
        flame.scale.set(s, s, s);
        flame.position.y += 0.002; // slight rise
        if (t === 1) {
            for (const flame of flares) flame.visible = false;
            if (!flames.some(f => f.visible)) {
            window.dispatchEvent(new Event('blownOut'));
            }
    }
        }
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

window.addEventListener('blowDetected', () => {
  // only consider currently visible flames
    const active = flames.filter(f => f.visible);
    if (!active.length) return;

    const howMany = Math.min(2, active.length); // extinguish up to 2 at a time
    const chosen = [];
    for (let i = 0; i < howMany; i++) {
        const idx = Math.floor(Math.random() * active.length);
        chosen.push(active.splice(idx, 1)[0]); // remove from active pool so no duplicates this blow
    }
    fadeOutFlames(chosen);
});


window.addEventListener('relightCandles', () => {
    for (const flame of flames) {
        // reset  properties
        flame.position.copy(flame.userData.originalPosition); // reset to og position
        flame.visible = true;
        flame.material.opacity = 0.8;
        flame.scale.set(1, 1, 1);
    }
    startMicrophoneDetection();
});
