import THREE from 'three'

// TEXT
// canvas contents will be used for a texture
// textObject = new THREE.Object3D();
// scene.add(textObject)




function draw(text) {
  // create canvas
  var canvas = document.createElement('canvas');

  // the larger these numbers, the larger the canvas, and
  // the smoother your final image can be. If your final
  // texture is blurry or pixelated, try increasing these
  // numbers, and drawing on the canvas in a larger font.
  canvas.width = 2400;
  canvas.height = 150;

  // draw the score of "50" to the canvas
  var context = canvas.getContext('2d');
  context.font = "Bold 128px Helvetica";
  context.fillStyle = "rgba(255,255,255,0.25)";
  context.fillText(text, 0, 128);
  return canvas
}

export function TextMesh(text) {
  var textTexture = new THREE.Texture(draw(text))
  textTexture.needsUpdate = true;

  var textMaterial = new THREE.MeshBasicMaterial({
    map: textTexture, 
    side:THREE.FrontSide 
  });
  textMaterial.transparent = true;

  var textMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1200*8, 100*8),
    textMaterial
  );

  textMesh.rotation.x = Math.PI
  textMesh.rotation.y = Math.PI

  return textMesh;
}