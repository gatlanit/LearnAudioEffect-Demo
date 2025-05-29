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

// Audio CTX
const listener = new THREE.AudioListener();
camera.add( listener );

const sound = new THREE.Audio( listener );

const audioLoader = new THREE.AudioLoader();
// TODO: Make it allow for other audios
audioLoader.load('./assets/audio/Demo.wav', function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);

    // === GAIN CONTROL ===
    const gainNode = sound.getOutput();
    gainNode.gain.value = gainFader.value / 127;

    gainFader.addEventListener('input', () => {
        const value = gainFader.value;
        const normalized = value / 127;
        gainNode.gain.setValueAtTime(normalized, sound.context.currentTime);
    });
});


// Lights
const highlight = 0xff0062 // Color of highlights
const hemiLight = new THREE.HemisphereLight(0xffffff, highlight);
scene.add(hemiLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

// Model
const model = new THREE.IcosahedronGeometry(0.5 , 2);
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

// Inputs DOM ELEMENTS
const gainToggle = document.getElementById('gain-toggle');
const gainFader = document.getElementById('gain');

// First time play (Toggle)
window.addEventListener('click', () => {
    if (gainToggle.checked && !sound.isPlaying) {
        sound.play();
    }
});

gainToggle.addEventListener('change', () => {
    spinning = gainToggle.checked;

    if (gainToggle.checked) {
        if (!sound.isPlaying) {
            sound.play();
        }
    } else {
        if (sound.isPlaying) {
            sound.stop();
        }
    }
});

// Connect gain fader to gain node
gainFader.addEventListener('input', () => {
    const value = gainFader.value;
    const normalized = value / 127;
    gainNode.gain.setValueAtTime(normalized, sound.context.currentTime);
});

// ThreeJS clock (Delta Time)
var clock = new THREE.Clock();
var delta = 0

// Variables
let spinning = gainToggle.checked;
var speed = 0;
var max_speed = 0.5
var acceleration = 3;

// Rendering Loop
function animate(t = 0) {
    requestAnimationFrame(animate);
    delta = clock.getDelta();

    // Scene actions

    // Spin ball with acceleration when plugin turned on
    if (spinning && speed <= max_speed) {
        speed += delta * acceleration;
    } else if (!spinning) {
        if (speed > 0) {
            speed -= delta * acceleration;
        }
        else {
            speed = 0;
        }
    }

    mesh.rotation.x += delta * speed;
    mesh.rotation.y += delta * speed * 2;

    controller.update();
    renderer.render(scene, camera);
}
animate();

// Resize window
window.addEventListener('resize', onWindowResize);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}