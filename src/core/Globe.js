/**
 * ThreatSphere 3D - High-Fidelity 3D Cyber Globe
 * Realistic 4K Night Earth with City Lights, Real-World Country Borders (10,000+ segments),
 * 65+ Permanent City Beacons with Hover Tooltips, Orbiting Satellites, and Atmospheric Halo.
 */

import * as THREE from 'https://esm.sh/three@0.162.0';
import { OrbitControls } from 'https://esm.sh/three@0.162.0/addons/controls/OrbitControls.js';
import { GLOBE_RADIUS, latLonToVector3 } from './Coordinates.js';
import { CITIES } from '../config.js';

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
    this.bordersMesh = null;
    this.cityHubsGroup = null;
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
    this.cityBeacons = new Map();

    // Raycasting for city hover
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredCity = null;

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
    this._initCountryBorders();
    this._initPermanentCityHubs();
    this._initAtmosphereGlow();
    this._initGraticuleGrid();
    this._initSatellites();
    this._initShieldsGroup();
    this._initCityTooltip();
    this._initCityRaycasting();
    this._initResizeHandler();

    this._animate();
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030611, 0.0011);

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
    this.renderer.toneMappingExposure = 1.15;

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

    const mainDirLight = new THREE.DirectionalLight(0xd0e8ff, 1.6);
    mainDirLight.position.set(300, 200, 200);
    this.scene.add(mainDirLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 0.9);
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
    const loader = new THREE.TextureLoader();

    // Load Realistic 4K Night Earth Texture & Relief Topology
    const nightTexture = loader.load(
      './assets/textures/earth-night.jpg',
      () => {
        this.renderer.render(this.scene, this.camera);
      },
      undefined,
      (err) => {
        console.warn('[ThreatSphere 3D] Using procedural fallback texture:', err);
      }
    );

    const bumpTexture = loader.load('./assets/textures/earth-topology.png');

    const sphereMaterial = new THREE.MeshStandardMaterial({
      map: nightTexture,
      bumpMap: bumpTexture,
      bumpScale: 1.5,
      roughness: 0.72,
      metalness: 0.18,
      emissive: 0x0a1628,
      emissiveMap: nightTexture,
      emissiveIntensity: 0.65
    });

    this.baseSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.globeGroup.add(this.baseSphere);
  }

  /**
   * Ingests 10,000+ real country border segments and draws glowing vector boundaries
   */
  _initCountryBorders() {
    fetch('./assets/data/country_borders.json')
      .then(res => res.json())
      .then(data => {
        const positions = [];
        // data format: [lon1, lat1, lon2, lat2, ...]
        for (let i = 0; i < data.length; i += 4) {
          const lon1 = data[i];
          const lat1 = data[i + 1];
          const lon2 = data[i + 2];
          const lat2 = data[i + 3];

          // Project onto sphere slightly above ocean surface (R + 0.35)
          const p1 = latLonToVector3(lat1, lon1, GLOBE_RADIUS + 0.35);
          const p2 = latLonToVector3(lat2, lon2, GLOBE_RADIUS + 0.35);

          positions.push(p1.x, p1.y, p1.z);
          positions.push(p2.x, p2.y, p2.z);
        }

        const borderGeo = new THREE.BufferGeometry();
        borderGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        const borderMat = new THREE.LineBasicMaterial({
          color: 0x00e5ff,
          transparent: true,
          opacity: 0.42,
          blending: THREE.AdditiveBlending
        });

        this.bordersMesh = new THREE.LineSegments(borderGeo, borderMat);
        this.globeGroup.add(this.bordersMesh);
        console.log(`[ThreatSphere 3D] Rendered ${positions.length / 6} real-world country border segments.`);
      })
      .catch(err => {
        console.warn('[ThreatSphere 3D] Could not load country borders:', err);
      });
  }

  /**
   * Permanent tactical city beacons with hover detection
   */
  _initPermanentCityHubs() {
    this.cityHubsGroup = new THREE.Group();
    this.globeGroup.add(this.cityHubsGroup);

    CITIES.forEach(city => {
      const pos = latLonToVector3(city.lat, city.lon, GLOBE_RADIUS + 0.5);
      const normal = pos.clone().normalize();

      const hub = new THREE.Group();
      hub.position.copy(pos);
      hub.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

      // Outer beacon ring
      const ringGeo = new THREE.RingGeometry(0.8, 1.4, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      hub.add(ring);

      // Center core point
      const coreGeo = new THREE.CircleGeometry(0.5, 12);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.userData = { city };
      hub.add(core);

      hub.userData = { city, ring, core };
      this.cityHubsGroup.add(hub);
      this.cityBeacons.set(city.name, hub);
    });
  }

  _initCityTooltip() {
    this.cityTooltip = document.createElement('div');
    this.cityTooltip.className = 'city-hub-tooltip';
    this.cityTooltip.style.display = 'none';
    this.container.appendChild(this.cityTooltip);
  }

  _initCityRaycasting() {
    const dom = this.renderer.domElement;

    dom.addEventListener('pointermove', (e) => {
      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!this.cityHubsGroup) return;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.cityHubsGroup.children, true);

      if (intersects.length > 0) {
        const hitObj = intersects[0].object;
        const city = hitObj.userData.city;

        if (city) {
          this.hoveredCity = city;
          this.cityTooltip.style.display = 'block';
          this.cityTooltip.style.left = `${e.clientX + 14}px`;
          this.cityTooltip.style.top = `${e.clientY - 28}px`;
          this.cityTooltip.innerHTML = `
            <div class="city-tip-header">${city.name} <span class="tip-flag">[${city.code}]</span></div>
            <div class="city-tip-geo">${city.country} // LAT ${city.lat.toFixed(2)} LON ${city.lon.toFixed(2)}</div>
          `;
          return;
        }
      }

      if (this.hoveredCity) {
        this.hoveredCity = null;
        this.cityTooltip.style.display = 'none';
      }
    });
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

      const satGroup = new THREE.Group();

      const coreGeo = new THREE.BoxGeometry(1.2, 1.2, 1.8);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const core = new THREE.Mesh(coreGeo, coreMat);
      satGroup.add(core);

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

  deployShield(lat, lon) {
    const pos = latLonToVector3(lat, lon, GLOBE_RADIUS + 0.6);
    const normal = pos.clone().normalize();

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
      duration: 8.0
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

    // Pulse City Beacons
    if (this.cityHubsGroup) {
      const beaconScale = 1.0 + Math.sin(now * 0.004) * 0.15;
      this.cityBeacons.forEach(hub => {
        if (hub.userData.ring) {
          hub.userData.ring.scale.set(beaconScale, beaconScale, 1.0);
        }
      });
    }

    // Update Satellites along orbits
    for (let i = 0; i < this.satellites.length; i++) {
      const s = this.satellites[i];
      s.angle += s.speed * delta;

      const x = Math.cos(s.angle) * s.radius;
      const z = Math.sin(s.angle) * s.radius;
      const vec = new THREE.Vector3(x, 0, z);

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
        const sc = 0.2 + (progress / 0.2) * (sh.maxScale - 0.2);
        sh.mesh.scale.set(sc, sc, sc);
      } else {
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
