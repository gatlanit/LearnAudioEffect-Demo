import * as THREE from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
// import { createGradientCubeTexture } from './skybox.js';

// Renderer
const w = window.innerWidth;
const h = window.innerHeight;

const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true });
renderer.setSize(w, h);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Camera
const camera = new THREE.PerspectiveCamera(90, w / h, 0.1, 10);
camera.position.z = 2;

// Scene
const scene = new THREE.Scene(); 
//scene.background = createGradientCubeTexture(); // Skybox

// Controller
const controller = new OrbitControls(camera, renderer.domElement);
controller.enableDamping = true;
controller.dampingFactor = 0.03;

// Lights
const highlight = 0xff0062 // Color of highlights
const hemiLight = new THREE.HemisphereLight(0xffffff, highlight);
scene.add(hemiLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

// Model
const model = new THREE.IcosahedronGeometry(1.0, 2);
const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    flatShading: true
});
const mesh = new THREE.Mesh(model, material);
scene.add(mesh);

// Wireframe
const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true
});
const wireMesh = new THREE.Mesh(model, wireMaterial);
wireMesh.scale.setScalar(1.001); // Scale up wiremesh slightly so that it doesn't cause z fighting in mesh
mesh.add(wireMesh);

// Rendering Loop
function animate(t = 0) {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controller.update();
}
animate();

// Resize window
window.addEventListener('resize', onWindowResize);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}