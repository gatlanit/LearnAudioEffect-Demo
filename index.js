import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
const fov = 90;
const aspect = w / h;
const near = 0.1;
const far = 10;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;
const scene = new THREE.Scene();

function createGradientCanvas(topColor, bottomColor) {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
  
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);
  
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  
    return canvas;
  }
  
  function createGradientCubeTexture() {
    const faces = [
      ['#ffffff', '#dbfff1'], // px (side)
      ['#ffffff', '#dbfff1'], // nx
      ['#ffffff', '#ffffff'], // py (top)
      ['#dbfff1', '#dbfff1'], // ny (bottom)
      ['#ffffff', '#dbfff1'], // pz
      ['#ffffff', '#dbfff1'], // nz
    ];
  
    const canvases = faces.map(([top, bottom]) =>
      new THREE.CanvasTexture(createGradientCanvas(top, bottom))
    );
  
    const cubeTexture = new THREE.CubeTexture(canvases.map(tex => tex.image));
    cubeTexture.needsUpdate = true;
  
    return cubeTexture;
  }
  
  scene.background = createGradientCubeTexture();
  

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

const geo = new THREE.IcosahedronGeometry(1.0, 1.0);
const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    flatShading: true,
    transparent: true,
    opacity: 1.0
});
const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
})

const wireMesh = new THREE.Mesh(geo, wireMat);
wireMesh.scale.setScalar(1.001);
const mesh = new THREE.Mesh(geo, mat);
mesh.add(wireMesh);
scene.add(mesh);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xff0062);
scene.add(hemiLight);

const ambientLight = new THREE.AmbientLight(0x42ecf5, 1);
scene.add(ambientLight);

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
}
animate();