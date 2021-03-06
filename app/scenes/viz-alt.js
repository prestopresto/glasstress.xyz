
import THREE from 'three'
import TWEEN from 'tween'

import * as particles from '../objects/particles'
import fft from '../lib/fft'

window.THREE = THREE

// threejs effects & plugins
require('../vendor') 

var chromaticAbberationPass, FXAAPass, bloomPass, invertPass, boxBlurPass, fullBoxBlurPass, zoomBlurPass, multiPassBloomPass, denoisePass, 
  sepiaPass, noisePass, vignettePass, vignette2Pass, CGAPass, sobelEdgeDetectionPass,
  dirtPass, blendPass, guidedFullBoxBlurPass, SSAOPass, pixelatePass, rgbSplitPass,
  artPass, chromaticAberrationPass, barrelBlurPass, oldVideoPass, dotScreenPass,
  circularBlur, poissonDiscBlur, cannyEdgeDetectionPass, freiChenEdgeDetectionPass,
  toonPass, fxaaPass, highPassPass, grayscalePass, asciiPass, guidedBoxPass,
  ledPass, halftonePass, halftoneCMYKPass;

var screenX = window.innerWidth
var screenY = window.innerHeight
var windowHalfX = screenX/2
var windowHalfY = screenY/2
var scene;
var camera;
var renderer;
var plane;
var particleSystem;
var particleSystem1;
var renderer;
var mesh;
var mesh1;
var composer;
var hblur;
var vblur;
var targetRotationX = 0;
var targetRotationY = 0;
var mouseX = 0;
var mouseY = 0;
var stereo;
var tweening = false
var tween;
var controls;
var videoTexture;
var spotLight;
var light;
var object3d;
var lastSegment = { start:0 };
var { audio, analyser, source, biquadFilter } = fft()
var cameraZ = 0
var sunlight;
var camControls;
var sky;
var terrainMesh;
var sphereMesh;
var sphereMaterial;
var center;
var dirtPass;
var blendPass;
var playing = false
var textObject;
var tethraGeometry = new THREE.TetrahedronGeometry(1120, 4);
const objects = []
var bufferLength = analyser.frequencyBinCount;
var frequencyData = new Uint8Array(bufferLength)
var amplitudeData = new Uint8Array(bufferLength)
var currentBeat;
var lastBeat = {};
var spacePressed = false;
var remixMode = false;
var dotting = false;

import { setupData, audioData, getBeatsByTime, getSegmentsByTime, getBarsByTime, getTatumsByTime, getScenesByTime } from '../lib/audio-data'
import { TextMesh } from '../objects/Text'

var beatsByTime;
var segmentsByTime;
var barsByTime;
var tatumsByTime;
var scenesByTime;

export function setupAudioData(trackData) {
  setupData(trackData)
  console.log('trackData', trackData)
  beatsByTime = getBeatsByTime()
  segmentsByTime = getSegmentsByTime()
  barsByTime = getBarsByTime()
  tatumsByTime = getTatumsByTime()
  scenesByTime = getScenesByTime()
}



// UTILS

/* convert loudness scale from [-100,0] to [0,1] */
function getLoudness(loudness) {
  return ((-100 - loudness) * -1) / 100
}

function deg2rad() {

}

function logScale(domain=[0,100], values=[100,1000], value=1) {
  // position will be between 0 and 100
  var minp = domain[0];
  var maxp = domain[1];

  var minv = Math.log(values[0]);
  var maxv = Math.log(values[1]);

  // calculate adjustment factor
  var scale = (maxv-minv) / (maxp-minp);

  return Math.exp(minv + scale*(value-minp));
}


var sphereUniforms;

export function init() {

  // SCENE
  scene = new THREE.Scene()
  
  scene.fog = new THREE.Fog( 0x121212, 0.6, 12000 )
  scene.add( new THREE.AmbientLight( 0x47E4E0) );


  // CAMERA
  camera = new THREE.PerspectiveCamera( 120, screenX / screenY, 1, 20000)
  
  camera.position.z = 1850
  camera.position.y = 10

  camera.lookAt( scene.position );
  
  //camera.rotation.x = -1
  
  light = new THREE.DirectionalLight( 0xF67FF5, 0.8 );
  light.castShadow = true;
  light.position.set(-800, -1200, 1000)
  scene.add(light)

  light = new THREE.DirectionalLight( 0xB5421E, 0.8 );
  light.castShadow = true;
  light.position.set(800, 1200, 1000)
  scene.add(light)

  // var light1 = new THREE.DirectionalLight( 0xF64662, 0.1 );
  // light1.position.set(80, 120, 4000)
  // scene.add(light1)

  // var light2 = new THREE.DirectionalLight( 0x92E0A9, 0.1 );
  // light2.position.set(80, -120, 4000)
  // scene.add(light2)
  // //scene.add(new THREE.CameraHelper( light.shadow.camera ))


  // INTRO TEXT
  textObject = new THREE.Object3D()
  //scene.add(textObject)

  const text1 = TextMesh('without')
  const text2 = TextMesh('a glass palace')
  const text3 = TextMesh('life')
  const text4 = TextMesh('would be')
  const text5 = TextMesh('a conviction')

  text2.position.y = 400
  text3.position.y = 800
  text4.position.y = 2000
  text5.position.y = 2800

  textObject.add(text1)
  textObject.add(text2)
  textObject.add(text3)
  textObject.add(text4)
  textObject.add(text5)

  // MAIN OBJECT3D
  object3d = new THREE.Object3D()
  object3d.position.z = 1200
  scene.add(object3d)
  
  // PARTICLES
  particleSystem = particles.setup()
  particleSystem.position.y = -450
  scene.add(particleSystem)

  // SPHERE
  sphereUniforms = {
      scale: { type: "f", value: 10.0 },
      displacement: { type: "f", value: 20.0}
  };
  var vertexShader = document.getElementById('vertexShader').text;
  var fragmentShader = document.getElementById('fragmentShader').text;
  var material = new THREE.ShaderMaterial(
      {
        uniforms : sphereUniforms,
        vertexShader : vertexShader,
        fragmentShader : fragmentShader,
        transparent: true,
        opacity: .25,
        depthWrite: false,
        side: THREE.DoubleSide,
        wireframe: true,
        wireframeLinewidth: 2,
        //shading: THREE.FlatShading
      });
  
  var mat = new THREE.MeshPhongMaterial({
    //shading: THREE.FlatShading,
    transparent: true,
    opacity: .15,
    wireframe: true,
    wireframeLinewidth: 2,
  });

  var geometry = new THREE.SphereGeometry( 1200, 8, 8 )
  //var geometry = new THREE.Geometry()
  // material = new THREE.MeshBasicMaterial();
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  //sphereMesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [material, mat])
  sphereMesh = new THREE.Mesh(geometry, material);
  sphereMesh.position.z = 1000
  
  // RENDERER
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    //alpha: true
  });

  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( screenX, screenY );
  renderer.setClearColor(0x121212);

  // RENDERER SHADOW
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.autoClear = false;

  // append canvas
  document.getElementById('visualization').appendChild( renderer.domElement );

  composer = new WAGNER.Composer( renderer, { useRGBA: true } );
  composer.setSize( window.innerWidth, window.innerHeight ); // or whatever resolution
  
  rgbSplitPass = new WAGNER.RGBSplitPass()
  rgbSplitPass.params.delta.x = 2.0
  rgbSplitPass.params.delta.y = -2.0
  dirtPass = new WAGNER.DirtPass();
  blendPass = new WAGNER.BlendPass();
  bloomPass = new WAGNER.MultiPassBloomPass();
  bloomPass.params.blurAmount = 1;
  FXAAPass = new WAGNER.FXAAPass();
  CGAPass = new WAGNER.CGAPass();
  vignettePass = new WAGNER.Vignette2Pass();
  vignettePass.params.boost = 2;
  vignettePass.params.reduction = 3;
  noisePass = new WAGNER.NoisePass();
  noisePass.params.amount = .015;
  chromaticAbberationPass = new WAGNER.ChromaticAberrationPass();
  chromaticAbberationPass.params.amount = 100
  oldVideoPass = new WAGNER.OldVideoPass()
  dotScreenPass = new WAGNER.DotScreenPass()
  //halftoneCMYKPass = new WAGNER.HalftoneCMYKPass()
  barrelBlurPass = new WAGNER.PoissonDiscBlurPass()

  document.getElementById('visualization').addEventListener( 'mousedown', onDocumentMouseDown, false )
  document.getElementById('visualization').addEventListener( 'mouseup', onDocumentMouseUp, false )
  document.getElementById('visualization').addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.getElementById('visualization').addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.getElementById('visualization').addEventListener( 'touchmove', onDocumentTouchMove, false );
  document.addEventListener( 'keydown', onDocumentKeyDown, false);
  document.addEventListener( 'keyup', onDocumentKeyUp, false);
  //
  window.addEventListener( 'resize', onWindowResize, false );
}

export function setVolumeLevel(level) {
  audio.volume=level/100
}

export function playScene(playVisualization=true) {
  // PLAY AUDIO
  if(playVisualization) {
    scene.add(sphereMesh);
    noisePass.params.speed = 1;
  }
  playing = true
  audio.play()
}


export function pause() {
  audio.pause()
}

export function play() {
  audio.play()
}

let beats=[]

function addBeat(beat, num) {
  const radius = 12
  const geometry = new THREE.TorusGeometry( radius, 0.5, 16, num % 4 == 0 ? 8 : 3)//(radius, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    color: Math.random()*0xffffff, 
    transparent: true,
    specular: Math.random() * 0xffffff,
    wireframe: true,
    wireframeLinewidth: 4,
    opacity: 1.0
  })
  const _mesh = new THREE.Mesh(geometry, material)
  _mesh.scale.set(1,1,1)
  //_mesh.position.set(Math.random()*1.0-0.5, Math.random()*1.0-0.5, Math.random()*-100)
  //_mesh.position.multiplyScalar(4000)
  _mesh.rotation.z = Math.random()
  scene.add(_mesh)
  //beats.push[_mesh]

  new TWEEN
    .Tween({scale: 1})
    .to({scale: beat.confidence*1000}, beat.duration*1000*2)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(function(t) {
      _mesh.scale.set(this.scale, this.scale, this.scale)
      //_mesh.position.setY(this.y)
      //_mesh.rotation.y += 0.1
      _mesh.material.opacity=1-t
    })
    .onComplete(function() {
      //scene.remove(_mesh)
      // new TWEEN
      //   .Tween(_mesh.scale)
      //   .delay(num*10)
      //   .to({x: 1, y: 1, z: 1}, beat.duration*1000)
      //   .onUpdate(function(t) {
      //     _mesh.material.opacity=1-t
      //     _mesh.rotation.y -= 0.1
      //   })
      //   .start()
      scene.remove(_mesh)
    })
    .start()

}

function addBar(bar) {
  const radius = 320
  const geometry = new THREE.SphereGeometry( radius, 4, 4 )//(radius, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    color: Math.random()*0xffffff, 
    transparent: true,
    specular: Math.random() * 0xffffff,
    //shading: THREE.FlatShading
    wireframe: true,
    wireframeLinewidth: 2,
  })
  const _mesh = new THREE.Mesh(geometry, material)
  _mesh.scale.set(0,0,0)
  scene.add(_mesh)

  new TWEEN
    .Tween({x: _mesh.position.x, scale: 0})
    .to({x: -screenX*2, scale: 5}, bar.duration*1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(function(t) {
      _mesh.scale.set(this.scale, this.scale, this.scale)
      _mesh.rotation.x += 0.1
      _mesh.material.opacity=1-t
    })
    .onComplete(function() {
      scene.remove(_mesh)
    })
    .start()
}

function addSegment(segment, radius=10, multiplyScalar=10) {
  
  // loudness 0-1
  const loudnessMin = getLoudness(segment.loudnessStart)
  const loudnessMax = getLoudness(segment.loudnessMax)

  const isLoud = loudnessMax >= 0.95
  const segmentLength = isLoud ? 4 : (remixMode ? 4 : 1)

  for(var i = 0; i < segmentLength; i++) {
    const radius = logScale([0.7, 0.99], [1, 32], loudnessMax)
    const geometry = new THREE.SphereGeometry( radius, 1, 1 )//(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: Math.random()*0xffffff, 
      //color: 0xffffff, 
      transparent: true,
      //specular: Math.random() * 0xffffff,
      wireframe: !isLoud,
      wireframeLinewidth: 2,
      shading: isLoud ? THREE.FlatShading : THREE.SmoothShading
    })

    const _mesh = new THREE.Mesh(geometry, material)

    _mesh.rotation.set(Math.random() * 1, Math.random() * 1, Math.random() * 1)
    _mesh.scale.set(1,1,1)
    

    if(remixMode) {
      _mesh.position.x = mouseX*2+(i*50)
      _mesh.position.y = -mouseY*2+(Math.sin(i)*100)
      _mesh.position.z = camera.position.z-3750
    } else {
      _mesh.position.set(Math.random() * 1.0 - 0.5, 0, -1)
      _mesh.position.multiplyScalar(loudnessMax * 1250)
    }

    _mesh.castShadow = true
    _mesh.receiveShadow = false
  
    object3d.add(_mesh)
    tweenSegment(_mesh, loudnessMax, segment.duration, i*(segment.duration/segmentLength)*1000)
    tweenSegmentOut(_mesh, segment.duration*8000, loudnessMax*500, true)
  }
}


function tweenSegment(m, loudness, duration, delay=1, remove=true) {
  var scale = 7*loudness
  var opacity = 1
  var easing = TWEEN.Easing.Quadratic.Out

  var tween = new TWEEN
    .Tween({ scale: 0 })
    .delay(delay)
    .to({ scale: scale }, duration*1000)
    .easing(TWEEN.Easing.Elastic.Out)
    .onUpdate(function(t) {
      m.scale.set(this.scale, this.scale, this.scale)
    })
    .onComplete(function() {
      
    })
    .start()
    

  // var tween = new TWEEN
  //   .Tween({ scale: scale*10, x: m.position.x, y: m.position.y, z: m.position.z })
  //   .delay(delay)
  //   .to({ x: Math.random()*20-20, y: Math.random()*20-20, z: Math.random()*20-20 }, (duration*10)*1000)
  //   .easing(TWEEN.Easing.Quadratic.Out)
  //   .onUpdate(function(t) {
  //     m.position.set(this.x, this.y, this.z)
  //   })
  //   .start()
}

function tweenSegmentOut(mesh, duration=100, scalarValue=100, remove=false) {
  const position = mesh.position.clone()
  const newPosition = position.multiplyScalar(10)
  newPosition.z = Math.random()*10

  var tween = new TWEEN
    .Tween(mesh.position)
    .delay(100)
    .to({x: newPosition.x, y: newPosition.y, z: newPosition.z}, duration)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(function(t) {
      mesh.material.opacity = 1-t
      //mesh.position.set(this.x, this.y, this.z)
      mesh.position.y += Math.sin(t*10)*300
      mesh.position.x = this.x
      //mesh.rotation.set(t, t, t)
      //mesh.scale.set(this.scale, this.scale, this.scale)
      //mesh.material.uniforms.displacement.value = Math.random() * 10
    })
    .onComplete(function() {
      if(remove) object3d.remove(mesh)
    })
    .start()
}

function bump(duration=250, scalarValue=10, remove=false) {
  var currentObj;
  for(var i = 0; i < object3d.children.length; i++) {
    currentObj = object3d.children[i]
    if(currentObj) tweenSegmentOut(currentObj, duration, scalarValue, remove)
  }
}

function bumpSegment(loudness, duration) {
  new TWEEN
    .Tween({ 
      scaleMesh: 1, 
      displacement: sphereUniforms.displacement.value, 
      scale: sphereUniforms.scale.value 
    })
    .to({ 
      scaleMesh: loudness, 
      displacement: loudness*500, 
      scale: loudness*4
    }, duration)
    .easing(TWEEN.Easing.Quintic.InOut)
    .onUpdate(function() {
      sphereUniforms.displacement.value = this.displacement
      sphereUniforms.scale.value = this.scale
    })
    .start()
}

function bumpScene(currentScene) {
  const loudness = (-100-currentScene.loudness)*-1

  new TWEEN
    .Tween({ scaleMesh: 1 })
    .to({ scaleMesh: loudness*0.07 }, currentScene.duration*1000)
    .easing(TWEEN.Easing.Quintic.InOut)
    .onUpdate(function() {
      sphereMesh.scale.set(this.scaleMesh, this.scaleMesh, this.scaleMesh)
    })
    .start()
}


var barDuration;

var lastTime = 0
var currentScene;
var sceneCount=0;
var currentSegment;
var lastSegment = {};
var lastScene = {};
var currentBar = {};
var lastBar = {}
var start = Date.now()
var segmentLoudness = 0
var targetRotation = 0
var targetRotationX = 0
var targetRotationY = 0
var targetRotationZ = 0
var posX = 0, posY = 0, posZ = 0

//var socket = io('http://localhost:5000');

var distanceX = 0, velocityX = 0
var distanceY = 0, velocityY = 0

// socket.on('motion', function(position) {
  
//   velocityX = position.orientation._x
//   velocityY = position.orientation._y

//   //distanceX = distanceX+velocityX
// })

// socket.on('geolocation', function(coords) {
//   posX = coords.x
//   posY = coords.y
//   posZ = coords.z

//   console.log('x', posX)
//   console.log('y', posY)
//   console.log('z', posZ)
// })

//audio.currentTime = 60
function getDistance(time) {
  var t = time/1000
  var distX = 1*(t)+(velocityX*Math.pow(t, 2))/2
  var distY = 1*(t)+(velocityY*Math.pow(t, 2))/2
  velocityX = 0
  velocityY = 0
  return {x: distX/10, y: distY/10 }
}
var beatsCount = 0

export function animate(time) {
  barDuration = 1 / (audioData.info.bpm / 60)
  //object3d.rotation.y += 0.01
  textObject.position.y -= 4
  //particleSystem.rotation.y -= 0.001
  sphereMesh.rotation.x += 0.01
  sphereMesh.rotation.y += 0.01

  currentScene = scenesByTime[audio.currentTime.toFixed(0)]
  currentSegment = segmentsByTime[audio.currentTime.toFixed(1)]
  currentBar = barsByTime[audio.currentTime.toFixed(1)]
  currentBeat = beatsByTime[audio.currentTime.toFixed(1)]
  
  if(currentBar && currentBar.start != lastBar.start) {
    addBar(currentBar)
    lastBar = currentBar
  }

  if(currentBeat && currentBeat.start != lastBeat.start) {
  

    if(sceneCount >= 5 && sceneCount <= 6 && beatsCount % 1 == 0) {
      addBeat(currentBeat, beatsCount)
    }

    if(beatsCount % 8 == 0) {
      addBeat(currentBeat, beatsCount)
    }

    beatsCount+=1
    lastBeat = currentBeat
    
  }


  if(currentSegment) {
    segmentLoudness = ((-100 - currentSegment.loudnessMax) * -1) / 100

    if(segmentLoudness >= 0.95) {
      dotting = true
    } else {
      dotting = false
    }

    if(currentSegment && currentSegment.start != lastSegment.start) {
      noisePass.params.amount = (segmentLoudness/100)*5
      addSegment(currentSegment)
      bumpSegment(segmentLoudness, currentSegment.duration*1000)
      lastSegment = currentSegment 
    }
  }


  if(currentScene && currentScene.start != lastScene.start) {
    lastScene = currentScene  
    sceneCount += 1
  }
    
  TWEEN.update()
  
  render()
  requestAnimationFrame(animate)
  
  if(playing) {
    analyser.getByteFrequencyData(frequencyData)
    //analyser.getByteTimeDomainData(amplitudeData)
    
  }


  
}


var closk = new THREE.Clock()

export function render() {

  //camera.position.y +=(Math.cos(audio.currentTime))*10//( mouseX ) * 0.005;
  //camera.rotation.y += (Math.sin(audio.currentTime))/100
  
  if(remixMode) {
    camera.position.z -= 1
  } else {
    camera.position.z = 1850
  }
  //camera.lookAt( scene.position );

  particles.update(frequencyData, audio.currentTime)
  renderer.autoClearColor = true;
  
  composer.reset();
  composer.render( scene, camera );

  //renderer.render(scene, camera)
  
  //
  //composer.pass( vignettePass );
  composer.pass( FXAAPass );
  composer.pass( rgbSplitPass );
  composer.pass( noisePass );
  composer.pass( vignettePass )

  
  if(spacePressed) {
    composer.pass( dotScreenPass)
    composer.pass( bloomPass );
    //composer.pass( barrelBlurPass )
  }

  bloomPass.params.blurAmount = 1.0

  if(dotting) {
    bloomPass.params.blurAmount = 3.0
    composer.pass( bloomPass );
  }

  //map mouse x/y to biquadfilter
  if(remixMode) {
    biquadFilter.frequency.value = mouseX + windowHalfX;
    biquadFilter.gain.value = (((mouseY+windowHalfY)/screenY)*25);  
  } else {
    biquadFilter.frequency.value = 0
    biquadFilter.gain.value = 0
  }
  

  console.log(biquadFilter.frequency.value, biquadFilter.gain.value)

  composer.pass( bloomPass );
  //composer.pass( oldVideoPass );
  composer.toScreen();
}


//EVENTS

function onWindowResize() {
  screenX = window.innerWidth
  screenY = window.innerHeight
  windowHalfX = screenX / 2;
  windowHalfY = screenY / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentMouseMove( event ) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function onDocumentTouchStart( event ) {
  if ( event.touches.length === 1 ) {
    //event.preventDefault();
    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;
  }
}

function onDocumentTouchMove( event ) {
  if ( event.touches.length === 1 ) {
    event.preventDefault();
    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;
  }
}

function onDocumentKeyDown(evt) {
  // SPACEBAR
  if(evt.keyCode==32) {
    spacePressed=true
  }
}

function onDocumentKeyUp(evt) {
  // SPACEBAR
  if(evt.keyCode==32) {
    spacePressed=false
  }
}

export function toggleRemixeMode() {
  remixMode=!remixMode
}

function onDocumentMouseDown(evt) {
  remixMode=true
}

function onDocumentMouseUp(evt) {
  remixMode=false
}
