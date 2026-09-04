/**
 * ThreatSphere 3D - Three.js WebGL Interactive Cyber Globe
 * High-performance rendering, orbital controls, procedural dot-matrix continents,
 * atmospheric Fresnel glow, satellite surveillance constellation, and camera targeting.
 */

import * as THREE from 'https://esm.sh/three@0.162.0';
import { OrbitControls } from 'https://esm.sh/three@0.162.0/addons/controls/OrbitControls.js';
import { GLOBE_RADIUS, latLonToVector3 } from './Coordinates.js';
import { generateLandmassPoints } from './LandmassData.js';

export class CyberGlobe {
  /**
   * @param {HTMLElement} container - The DOM container element for WebGL canvas
   */
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;

    this.globeGroup = null;
    this.baseSphere = null;
    this.landPoints = null;
    this.atmosphereMesh = null;
    this.graticuleGroup = null;
    this.satellitesGroup = null;
    this.shieldsGroup = null;
    this.stars = null;

    // State & Animation
    this.autoRotate = true;
    this.autoRotateSpeed = 0.45;
    this.isTransitioningCamera = false;
    this.cameraTween = null;
    this.satellites = [];
    this.activeShields = [];

    this.clock = new THREE.Clock();
    this.animationCallbacks = [];

    this._init();
  }

  _init() {
    this._initScene();
    this._initCamera();
    this._initRenderer();
    this._initControls();
    this._initLights();
    this._initStarfield();
    this._initGlobe();
    this._initProceduralLandmass();
    this._initAtmosphereGlow();
    this._initGraticuleGrid();
    this._initSatellites();
    this._initShieldsGroup();
    this._initResizeHandler();

    this._animate();
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x040711, 0.0012);

    this.globeGroup = new THREE.Group();
    this.scene.add(this.globeGroup);
  }

  _initCamera() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
    this.camera.position.set(0, 70, 290);
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.container.appendChild(this.renderer.domElement);
  }

  _initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.75;
    this.controls.zoomSpeed = 0.85;
    this.controls.minDistance = 125;
    this.controls.maxDistance = 650;
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = this.autoRotateSpeed;

    this.controls.addEventListener('start', () => {
      if (this.isTransitioningCamera) {
        this.isTransitioningCamera = false;
        this.cameraTween = null;
      }
    });
  }

  _initLights() {
    const ambientLight = new THREE.AmbientLight(0x1a2e4a, 1.4);
    this.scene.add(ambientLight);

    const mainDirLight = new THREE.DirectionalLight(0xa5d8ff, 1.8);
    mainDirLight.position.set(300, 200, 200);
    this.scene.add(mainDirLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 1.0);
    rimLight.position.set(-300, -100, -200);
    this.scene.add(rimLight);
  }

  _initStarfield() {
    const starCount = 1600;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const color1 = new THREE.Color(0x99ccff);
    const color2 = new THREE.Color(0x00f0ff);
    const color3 = new THREE.Color(0xffffff);

    for (let i = 0; i < starCount; i++) {
      const radius = 1000 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const chosenColor = Math.random() < 0.6 ? color3 : (Math.random() < 0.5 ? color1 : color2);
      starColors[i * 3] = chosenColor.r;
      starColors[i * 3 + 1] = chosenColor.g;
      starColors[i * 3 + 2] = chosenColor.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    this.stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.stars);
  }

  _initGlobe() {
    const sphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const canvasTexture = this._createProceduralGlobeTexture();

    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x050a16,
      roughness: 0.85,
      metalness: 0.15,
      map: canvasTexture,
      emissive: 0x020610,
      emissiveIntensity: 0.4
    });

    this.baseSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.globeGroup.add(this.baseSphere);
  }

  _createProceduralGlobeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#050914';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.07)';
    ctx.lineWidth = 1;

    for (let y = 0; y <= canvas.height; y += canvas.height / 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    for (let x = 0; x <= canvas.width; x += canvas.width / 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  _initProceduralLandmass() {
    const landCoords = generateLandmassPoints(2.2);
    const count = landCoords.length;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const baseColor = new THREE.Color(0x00f0ff);
    const highlightColor = new THREE.Color(0x7df9ff);

    for (let i = 0; i < count; i++) {
      const { lat, lon } = landCoords[i];
      const pos = latLonToVector3(lat, lon, GLOBE_RADIUS + 0.5);
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      const dotColor = Math.random() < 0.2 ? highlightColor : baseColor;
      colors[i * 3] = dotColor.r;
      colors[i * 3 + 1] = dotColor.g;
      colors[i * 3 + 2] = dotColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const dotCanvas = document.createElement('canvas');
    dotCanvas.width = 64;
    dotCanvas.height = 64;
    const ctx = dotCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.4, 'rgba(0, 240, 255, 0.9)');
    grad.addColorStop(0.8, 'rgba(0, 240, 255, 0.3)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();

    const dotTexture = new THREE.CanvasTexture(dotCanvas);

    const material = new THREE.PointsMaterial({
      size: 2.2,
      map: dotTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.landPoints = new THREE.Points(geometry, material);
    this.globeGroup.add(this.landPoints);
  }

  _initAtmosphereGlow() {
    const atmosphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.14, 64, 64);

    const customShader = {
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
          gl_FragColor = vec4(0.0, 0.85, 1.0, 1.0) * intensity * 0.95;
        }
      `
    };

    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: customShader.vertexShader,
      fragmentShader: customShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });

    this.atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    this.globeGroup.add(this.atmosphereMesh);
  }

  _initGraticuleGrid() {
    this.graticuleGroup = new THREE.Group();

    const equatorGeo = new THREE.RingGeometry(GLOBE_RADIUS + 0.2, GLOBE_RADIUS + 0.8, 128);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });
    const equator = new THREE.Mesh(equatorGeo, ringMat);
    equator.rotation.x = Math.PI / 2;
    this.graticuleGroup.add(equator);

    const polarGeo = new THREE.RingGeometry(GLOBE_RADIUS + 0.2, GLOBE_RADIUS + 0.8, 128);
    const polarMat = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });
    const polarRing = new THREE.Mesh(polarGeo, polarMat);
    this.graticuleGroup.add(polarRing);

    this.globeGroup.add(this.graticuleGroup);
  }

  /**
   * Initializes orbital reconnaissance satellite constellation
   */
  _initSatellites() {
    this.satellitesGroup = new THREE.Group();
    this.scene.add(this.satellitesGroup);

    const satelliteConfigs = [
      { radius: 142, speed: 0.35, inclination: 0.45, angle: 0 },
      { radius: 150, speed: -0.28, inclination: 0.85, angle: 1.2 },
      { radius: 158, speed: 0.42, inclination: 0.30, angle: 2.4 },
      { radius: 165, speed: -0.32, inclination: 1.10, angle: 3.6 },
      { radius: 146, speed: 0.38, inclination: 0.65, angle: 4.8 },
      { radius: 172, speed: -0.25, inclination: 0.95, angle: 5.5 }
    ];

    for (let i = 0; i < satelliteConfigs.length; i++) {
      const cfg = satelliteConfigs[i];

      // Orbit Path Ring
      const orbitGeo = new THREE.RingGeometry(cfg.radius - 0.2, cfg.radius + 0.2, 96);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending
      });
      const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
      orbitRing.rotation.x = Math.PI / 2 + cfg.inclination;
      orbitRing.rotation.y = (i * Math.PI) / 3;
      this.satellitesGroup.add(orbitRing);

      // Satellite Unit Model
      const satGroup = new THREE.Group();

      // Core
      const coreGeo = new THREE.BoxGeometry(1.2, 1.2, 1.8);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const core = new THREE.Mesh(coreGeo, coreMat);
      satGroup.add(core);

      // Solar Panels
      const panelGeo = new THREE.BoxGeometry(4.2, 0.1, 1.0);
      const panelMat = new THREE.MeshBasicMaterial({
        color: 0x0088ff,
        transparent: true,
        opacity: 0.9
      });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      satGroup.add(panel);

      this.satellitesGroup.add(satGroup);

      this.satellites.push({
        group: satGroup,
        radius: cfg.radius,
        speed: cfg.speed,
        inclination: cfg.inclination,
        yRotation: (i * Math.PI) / 3,
        angle: cfg.angle
      });
    }
  }

  _initShieldsGroup() {
    this.shieldsGroup = new THREE.Group();
    this.scene.add(this.shieldsGroup);
  }

  /**
   * Deploys an animated holographic defense shield over a city
   * @param {number} lat
   * @param {number} lon
   */
  deployShield(lat, lon) {
    const pos = latLonToVector3(lat, lon, GLOBE_RADIUS + 0.6);
    const normal = pos.clone().normalize();

    // Geodesic force dome
    const domeGeo = new THREE.SphereGeometry(7, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshBasicMaterial({
      color: 0x00ff9d,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const shieldMesh = new THREE.Mesh(domeGeo, domeMat);
    shieldMesh.position.copy(pos);
    shieldMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

    this.shieldsGroup.add(shieldMesh);

    this.activeShields.push({
      mesh: shieldMesh,
      material: domeMat,
      geometry: domeGeo,
      scale: 0.2,
      maxScale: 1.4,
      elapsed: 0,
      duration: 8.0 // seconds
    });
  }

  _initResizeHandler() {
    window.addEventListener('resize', () => {
      const width = this.container.clientWidth || window.innerWidth;
      const height = this.container.clientHeight || window.innerHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  /**
   * Smoothly pans and rotates the camera to center on a specific latitude/longitude
   */
  focusOn(lat, lon, distance = 240, durationMs = 1200) {
    const targetVec = latLonToVector3(lat, lon, distance);
    const startPos = this.camera.position.clone();
    const startTime = performance.now();

    this.isTransitioningCamera = true;
    this.controls.autoRotate = false;

    this.cameraTween = {
      update: (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1.0, elapsed / durationMs);
        const ease = 1 - Math.pow(1 - progress, 3);

        this.camera.position.lerpVectors(startPos, targetVec, ease);
        this.controls.target.set(0, 0, 0);
        this.controls.update();

        if (progress >= 1.0) {
          this.isTransitioningCamera = false;
          this.cameraTween = null;
        }
      }
    };
  }

  toggleAutoRotate(enable) {
    this.autoRotate = enable !== undefined ? enable : !this.autoRotate;
    this.controls.autoRotate = this.autoRotate;
    return this.autoRotate;
  }

  registerAnimation(cb) {
    this.animationCallbacks.push(cb);
  }

  _animate() {
    requestAnimationFrame(() => this._animate());

    const delta = this.clock.getDelta();
    const now = performance.now();

    if (this.isTransitioningCamera && this.cameraTween) {
      this.cameraTween.update(now);
    } else {
      this.controls.update();
    }

    if (this.stars) {
      this.stars.rotation.y += delta * 0.008;
    }

    // Update Satellites along orbits
    for (let i = 0; i < this.satellites.length; i++) {
      const s = this.satellites[i];
      s.angle += s.speed * delta;

      // Position along inclined circle
      const x = Math.cos(s.angle) * s.radius;
      const z = Math.sin(s.angle) * s.radius;
      const vec = new THREE.Vector3(x, 0, z);

      // Apply inclination and y-rotation
      vec.applyAxisAngle(new THREE.Vector3(1, 0, 0), s.inclination);
      vec.applyAxisAngle(new THREE.Vector3(0, 1, 0), s.yRotation);

      s.group.position.copy(vec);
      s.group.lookAt(0, 0, 0);
    }

    // Update Active Holographic Defense Shields
    for (let i = this.activeShields.length - 1; i >= 0; i--) {
      const sh = this.activeShields[i];
      sh.elapsed += delta;
      const progress = sh.elapsed / sh.duration;

      if (progress < 0.2) {
        // Expand
        const sc = 0.2 + (progress / 0.2) * (sh.maxScale - 0.2);
        sh.mesh.scale.set(sc, sc, sc);
      } else {
        // Pulse and fade
        const pulse = sh.maxScale + Math.sin(sh.elapsed * 10) * 0.1;
        sh.mesh.scale.set(pulse, pulse, pulse);
        sh.material.opacity = Math.max(0, 0.9 * (1.0 - (sh.elapsed - 1.6) / (sh.duration - 1.6)));
      }

      if (progress >= 1.0) {
        this.shieldsGroup.remove(sh.mesh);
        sh.geometry.dispose();
        sh.material.dispose();
        this.activeShields.splice(i, 1);
      }
    }

    for (let i = 0; i < this.animationCallbacks.length; i++) {
      this.animationCallbacks[i](delta);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
