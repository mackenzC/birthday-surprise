import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import cakeUrl from './assets/cake.glb?url';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000,0);
document.body.appendChild(renderer.domElement);

const color = 0xffffff;
const intensity = 3;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);

const size = 2.0;
let cake;
const loader = new GLTFLoader();
loader.load(cakeUrl,
    function (gltf) {
        cake = gltf.scene;
        scene.add(cake);
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
    if (cake) {
        cake.rotation.y += 0.001;
    }
    renderer.render(scene, camera);
}
animate();