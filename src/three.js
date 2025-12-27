import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import cakeUrl from './assets/cake.glb?url';

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
loader.load(cakeUrl,
    function (gltf) {
        cake = gltf.scene;
        cakeGroup.add(cake);
        cake.position.set(0, -0.5, 0);
        cake.scale.set(size, size, size);
        console.log('Cake loaded successfully', cake.position);
    },
    undefined,
    (error) => console.error(error)
);

camera.position.set(0, 2.5, 5);
camera.lookAt(0, 0, 0); 

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
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
        }
    }
    if (cake && isLoaded) {
        cakeGroup.rotation.y += 0.001;
    }
    renderer.render(scene, camera);
}
animate();