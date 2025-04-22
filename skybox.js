import * as THREE from "three";

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

export function createGradientCubeTexture() {
  const faces = [
    ['#fce6f1', '#dbfff1'], // px (side)
    ['#fce6f1', '#dbfff1'], // nx
    ['#fce6f1', '#fce6f1'], // py (top)
    ['#dbfff1', '#dbfff1'], // ny (bottom)
    ['#fce6f1', '#dbfff1'], // pz
    ['#fce6f1', '#dbfff1'], // nz
  ];

  const canvases = faces.map(([top, bottom]) =>
    new THREE.CanvasTexture(createGradientCanvas(top, bottom))
  );

  const cubeTexture = new THREE.CubeTexture(canvases.map(tex => tex.image));
  cubeTexture.needsUpdate = true;

  return cubeTexture;
}
