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
    ['#ffffff', '#ffffff'], // px (side) *
    ['#ffffff', '#ffffff'], // nx *
    ['#ffffff', '#ffffff'], // py (top) *
    ['#ffffff', '#ffffff'], // ny (bottom) *
    ['#ffffff', '#ffffff'], // pz *
    ['#ffffff', '#ffffff'], // nz *
  ];

  /*
    ['#dbfff1', '#fce6f1'], // px (side) *
    ['#dbfff1', '#fce6f1'], // nx *
    ['#dbfff1', '#dbfff1'], // py (top) *
    ['#fce6f1', '#fce6f1'], // ny (bottom) *
    ['#dbfff1', '#fce6f1'], // pz *
    ['#dbfff1', '#fce6f1'], // nz *
  */

  const canvases = faces.map(([top, bottom]) =>
    new THREE.CanvasTexture(createGradientCanvas(top, bottom))
  );

  const cubeTexture = new THREE.CubeTexture(canvases.map(tex => tex.image));
  cubeTexture.needsUpdate = true;

  return cubeTexture;
}
