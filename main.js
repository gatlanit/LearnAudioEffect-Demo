import * as THREE from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
// import { createGradientCubeTexture } from './skybox.js';

/*
TODO: (By Priority)
  - Refactor UI to be modular (Allow for switching and Effect Bypass)
  - Work on other effects
    - Reverb (Fog)
    - Filters (Fade top to bottom depending on frequency bad affected)
    - Delays (Duplications that fade)
    - Compressors (Change Focal length of camera to add or remove depth depending on compression settings)
    - Stereo (Bundle with Utility)  (Toggle between orthographic and perspective with focal length shift that moves closer and closer to Orthographic)
*/

// ------------------- SETUP ------------------ 

const w = window.innerWidth;
const h = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(w, h);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(90, w / h, 0.1, 10);
camera.position.z = 2;

const scene = new THREE.Scene();
// scene.background = createGradientCubeTexture(); // Skybox

// ------------------- CONTROLS ------------------ 

const controller = new OrbitControls(camera, renderer.domElement);
controller.enableDamping = true;
controller.dampingFactor = 0.03;

// ------------------- AUDIO SETUP ------------------

// Create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add(listener); // Not gonna need it but why not lol

// Create a global audio source and analyser
const sound = new THREE.Audio(listener);
const analyser = new THREE.AudioAnalyser(sound, 128); // 128 frequency bins

// Load audio file asynchronously
const audioLoader = new THREE.AudioLoader();
let gainNode; // GainNode to control volume dynamically

audioLoader.load('./assets/audio/Demo.wav', (buffer) => {
  sound.setBuffer(buffer);
  sound.setLoop(true);

  // Gain control node for volume adjustment
  gainNode = sound.getOutput();

  // Set initial gain based on fader value
  const gainValue = gainFader.value / 127;
  gainNode.gain.value = gainValue;
});

// ----------------- DOM ELEMENTS & EVENT LISTENERS ------------------ 

const gainToggle = document.getElementById('gain-toggle');
const gainFader = document.getElementById('gain');

let spinning = gainToggle.checked; // Controls whether mesh spins & audio plays

// Play audio when user clicks, but only if toggle is on and sound not playing
window.addEventListener('click', () => {
  if (gainToggle.checked && !sound.isPlaying) {
    sound.play();
  }
});

// Toggle spinning and audio playback when gainToggle changes
gainToggle.addEventListener('change', () => {
  spinning = gainToggle.checked;
  if (spinning && !sound.isPlaying) {
    sound.play();
  } else if (!spinning && sound.isPlaying) {
    sound.stop();
  }
});

// Adjust gain in real time based on fader input
gainFader.addEventListener('input', () => {
  const normalized = gainFader.value / 127;
  if (gainNode) {
    // Smoothly set gain to avoid clicks
    gainNode.gain.setValueAtTime(normalized, sound.context.currentTime);
  }
});

// ------------------ LIGHTS ------------------ 

const highlight = 0xff0062; // Highlight color
const hemiLight = new THREE.HemisphereLight(0xffffff, highlight);
scene.add(hemiLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

// ------------------ MODEL & MATERIALS ------------------ 

const geometry = new THREE.IcosahedronGeometry(0.5, 2);

const material = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  flatShading: true,
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Wireframe overlay to give model some edge details
const wireMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
  wireframe: true,
});
const wireMesh = new THREE.Mesh(geometry, wireMaterial);
wireMesh.scale.setScalar(1.001); // Slightly bigger to prevent z-fighting
mesh.add(wireMesh);

// ------------------ ANIMATION & AUDIO VISUALIZATION ------------------ 

const clock = new THREE.Clock();
let delta = 0;

let speed = 0;
const maxSpeed = 0.5;
const acceleration = 3;

let smoothedScale = 0;

function animate() {
  requestAnimationFrame(animate);

  delta = clock.getDelta();

  // Spin the mesh with acceleration/deceleration based on toggle state
  if (spinning && speed < maxSpeed) {
    speed += delta * acceleration;
  } else if (!spinning && speed > 0) {
    speed -= delta * acceleration;
  }
  speed = THREE.MathUtils.clamp(speed, 0, maxSpeed);

  mesh.rotation.x += delta * speed;
  mesh.rotation.y += delta * speed * 2;

  // Audio visualization: scale mesh based on bass frequencies
  if (analyser) {
    const freqData = analyser.getFrequencyData();

    // Sum bass frequencies (bins 0-9)
    let bassSum = 0;
    for (let i = 0; i < 10; i++) {
      bassSum += freqData[i];
    }
    const bassAvg = bassSum / 10;

    // Map bass amplitude to scale factor
    const audioFactor = bassAvg / 64; // Normalize roughly to [0,2]
    const baseScale = 1;
    const dynamicRange = 0.1;
    const targetScale = baseScale + audioFactor * dynamicRange;

    // Smooth scaling to avoid jitter
    smoothedScale = THREE.MathUtils.lerp(smoothedScale, targetScale, 0.1);
    mesh.scale.set(smoothedScale, smoothedScale, smoothedScale);
  }

  controller.update();
  renderer.render(scene, camera);
}

animate();

// ------------------ HANDLE WINDOW RESIZE ------------------

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});
