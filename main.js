import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Init
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#app'), alpha: true });
const controls = new OrbitControls(camera, renderer.domElement);
const clock = new THREE.Clock();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(3);
camera.position.setX(6);
camera.position.setY(2);
renderer.render(scene, camera);

controls.enablePan = false;

const loadingManager = new THREE.LoadingManager(() => {
  const loadingScreen = document.querySelector('.progress-bar-container');
  loadingScreen.classList.add('fade-out');
  // optional: remove loader from DOM via event listener
  loadingScreen.addEventListener('transitionend', onTransitionEnd);
});
const progressBar = document.getElementById('progress-bar');
loadingManager.onProgress = function (url, loaded, total) {
  progressBar.value = (loaded / total) * 100;
};

function onTransitionEnd(event) {
  event.target.remove();
}

// Model
const loader = new GLTFLoader(loadingManager);
let model, mixer, idle, actions;

loader.load('yamato/scene.gltf', function (gltf) {
  model = gltf.scene;
  model.position.z = -1;
  model.traverse(function (object) {
    if (object.isMesh) object.castShadow = true;
  });
  scene.add(model);
  const animations = gltf.animations;
  if (animations && animations.length > 0) {
    mixer = new THREE.AnimationMixer(model);
    idle = mixer.clipAction(animations[0]);
    actions = [idle];
    animate();
    actions.forEach(function (action) {
      action.play();
    });
  }
});

// Lights
const topLight = new THREE.DirectionalLight(0xffffff, 3);
topLight.position.set(500, 500, 0);
topLight.castShadow = true;
const ambientLight = new THREE.AmbientLight(0x333333, 100);
scene.add(topLight, ambientLight);

// Animation loop
function animate() {
  let mixerUpdateDelta = clock.getDelta();
  if (mixer) {
    mixer.update(mixerUpdateDelta);
  }
  requestAnimationFrame(animate);
  if (model) {
    model.rotation.y = Math.sin(Date.now() * 0.001) * Math.PI * 0.005;
    model.rotation.x = Math.sin(Date.now() * 0.001) * Math.PI * 0.005;
  }
  controls.update();
  renderer.render(scene, camera);
}

// Reisze
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Start
animate();
