/**
 * ThreatSphere 3D - Dynamic Attack Trajectories & Particle Pulse FX
 * Cubic Bezier 3D Arcs, Animated Traveling Energy Packets, Expanding Shockwaves,
 * Interactive Raycast Target Picking.
 */

import * as THREE from 'https://esm.sh/three@0.162.0';
import { GLOBE_RADIUS, latLonToVector3, calculateBezierControlPoints } from './Coordinates.js';
import { SEVERITY_LEVELS } from '../config.js';

export class TrajectoryManager {
  /**
   * @param {CyberGlobe} globe
   * @param {object} options
   */
  constructor(globe, options = {}) {
    this.globe = globe;
    this.scene = globe.scene;
    this.camera = globe.camera;
    this.container = globe.container;

    this.onImpact = options.onImpact || (() => {});
    this.onSelectAttack = options.onSelectAttack || (() => {});

    // Container 3D groups
    this.arcsGroup = new THREE.Group();
    this.pulsesGroup = new THREE.Group();
    this.impactsGroup = new THREE.Group();
    this.targetsGroup = new THREE.Group();

    this.scene.add(this.arcsGroup);
    this.scene.add(this.pulsesGroup);
    this.scene.add(this.impactsGroup);
    this.scene.add(this.targetsGroup);

    // Active state
    this.activeTrajectories = new Map(); // id -> trajectory data
    this.activeShockwaves = [];
    this.selectedAttackId = null;

    // Raycasting for interactive clicking on the globe
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredTarget = null;

    this._initTooltip();
    this._initRaycasting();

    // Register with globe's animation loop
    this.globe.registerAnimation((delta) => this.update(delta));
  }

  _initTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'globe-tooltip';
    this.tooltip.style.display = 'none';
    this.container.appendChild(this.tooltip);
  }

  _initRaycasting() {
    const dom = this.globe.renderer.domElement;

    dom.addEventListener('pointermove', (e) => {
      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.targetsGroup.children, true);

      if (intersects.length > 0) {
        dom.style.cursor = 'pointer';
        const hitObj = intersects[0].object;
        const attack = hitObj.userData.attack;

        if (attack) {
          this.hoveredTarget = attack;
          this.tooltip.style.display = 'block';
          this.tooltip.style.left = `${e.clientX + 16}px`;
          this.tooltip.style.top = `${e.clientY + 12}px`;
          this.tooltip.innerHTML = `
            <div class="tooltip-header">
              <span class="tooltip-badge ${attack.severityInfo.badgeClass}">${attack.severity}</span>
              <span class="tooltip-id">${attack.id}</span>
            </div>
            <div class="tooltip-target">TARGET: ${attack.target.name} (${attack.target.code})</div>
            <div class="tooltip-actor">ACTOR: ${attack.actor.name}</div>
            <div class="tooltip-vector">${attack.vector.name}</div>
          `;
        }
      } else {
        dom.style.cursor = 'default';
        this.hoveredTarget = null;
        this.tooltip.style.display = 'none';
      }
    });

    dom.addEventListener('pointerdown', (e) => {
      // Primary click
      if (e.button !== 0) return;

      if (this.hoveredTarget) {
        this.selectAttack(this.hoveredTarget.id);
        this.onSelectAttack(this.hoveredTarget);
      }
    });
  }

  /**
   * Spawns a new 3D attack trajectory on the globe
   * @param {object} attack
   */
  spawnTrajectory(attack) {
    const originVec = latLonToVector3(attack.origin.lat, attack.origin.lon, GLOBE_RADIUS + 0.3);
    const targetVec = latLonToVector3(attack.target.lat, attack.target.lon, GLOBE_RADIUS + 0.3);

    const { p1, p2, apexHeight } = calculateBezierControlPoints(originVec, targetVec, GLOBE_RADIUS);
    const curve = new THREE.CubicBezierCurve3(originVec, p1, p2, targetVec);

    const severityConfig = SEVERITY_LEVELS[attack.severity] || SEVERITY_LEVELS.LOW;
    attack.severityInfo = severityConfig;

    // 1. Arc Path Line Geometry
    const points = curve.getPoints(60);
    const arcGeometry = new THREE.BufferGeometry().setFromPoints(points);

    const arcMaterial = new THREE.LineBasicMaterial({
      color: severityConfig.colorHex,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      linewidth: 1
    });

    const arcLine = new THREE.Line(arcGeometry, arcMaterial);
    this.arcsGroup.add(arcLine);

    // 2. Pulse Particle Packet
    const pulseGeometry = new THREE.SphereGeometry(1.2, 16, 16);
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      blending: THREE.AdditiveBlending
    });
    const pulseMesh = new THREE.Mesh(pulseGeometry, pulseMaterial);
    pulseMesh.position.copy(originVec);
    this.pulsesGroup.add(pulseMesh);

    // Secondary pulse glow aura
    const glowGeo = new THREE.SphereGeometry(2.4, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: severityConfig.colorHex,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    pulseMesh.add(glowMesh);

    // 3. Target Hit Anchor on Globe Surface (for raycasting & visual beacon)
    const targetAnchor = this._createTargetAnchor(targetVec, severityConfig, attack);
    this.targetsGroup.add(targetAnchor);

    // 4. Origin Beacon Ring
    const originBeacon = this._createOriginBeacon(originVec, severityConfig);
    this.targetsGroup.add(originBeacon);

    // Store state
    const duration = Math.max(1.4, Math.min(3.2, (apexHeight / 18) * 1.6));

    const trajectoryData = {
      attack,
      curve,
      arcLine,
      arcMaterial,
      pulseMesh,
      targetAnchor,
      originBeacon,
      progress: 0.0,
      duration,
      speed: 1.0 / duration,
      hasImpacted: false,
      age: 0,
      maxAge: 12.0 // total lifetime in seconds
    };

    this.activeTrajectories.set(attack.id, trajectoryData);

    // Limit max concurrent trajectories to prevent frame drops
    if (this.activeTrajectories.size > 40) {
      const oldestKey = this.activeTrajectories.keys().next().value;
      this._removeTrajectory(oldestKey);
    }
  }

  _createTargetAnchor(pos, severityConfig, attack) {
    const group = new THREE.Group();
    group.position.copy(pos);

    // Orient perpendicular to sphere surface
    const normal = pos.clone().normalize();
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

    // Outer reticle ring
    const ringGeo = new THREE.RingGeometry(1.4, 2.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: severityConfig.colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    // Center hit core
    const coreGeo = new THREE.CircleGeometry(0.9, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.userData.attack = attack;
    group.add(core);

    group.userData.attack = attack;
    return group;
  }

  _createOriginBeacon(pos, severityConfig) {
    const group = new THREE.Group();
    group.position.copy(pos);

    const normal = pos.clone().normalize();
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

    const ringGeo = new THREE.RingGeometry(0.8, 1.4, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: severityConfig.colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    return group;
  }

  _triggerImpact(trajectoryData) {
    const { attack, curve } = trajectoryData;
    const targetVec = curve.v3; // end point

    // Spawn 2 staggered expanding shockwaves
    this._spawnShockwave(targetVec, attack.severityInfo.colorHex, 0);
    this._spawnShockwave(targetVec, 0xffffff, 0.15);

    // Trigger audio & UI callbacks
    this.onImpact(attack);
  }

  _spawnShockwave(pos, colorHex, delay = 0) {
    const normal = pos.clone().normalize();
    const ringGeo = new THREE.RingGeometry(0.6, 1.5, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(ringGeo, ringMat);
    mesh.position.copy(pos.clone().addScaledVector(normal, 0.4));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

    this.impactsGroup.add(mesh);

    this.activeShockwaves.push({
      mesh,
      material: ringMat,
      geometry: ringGeo,
      scale: 1.0,
      opacity: 0.95,
      delay,
      elapsed: 0,
      duration: 1.1
    });
  }

  /**
   * Highlights a specific attack trajectory and marks it with an elevated reticle
   * @param {string} attackId
   */
  selectAttack(attackId) {
    this.selectedAttackId = attackId;

    this.activeTrajectories.forEach((data, id) => {
      if (id === attackId) {
        data.arcMaterial.opacity = 1.0;
        data.arcMaterial.color.setHex(0xffffff);
        if (data.targetAnchor) {
          data.targetAnchor.scale.set(1.8, 1.8, 1.8);
        }
      } else {
        data.arcMaterial.opacity = 0.35;
        data.arcMaterial.color.setHex(data.attack.severityInfo.colorHex);
        if (data.targetAnchor) {
          data.targetAnchor.scale.set(1.0, 1.0, 1.0);
        }
      }
    });
  }

  update(delta) {
    // 1. Update Active Trajectories & Traveling Pulses
    const toRemove = [];

    this.activeTrajectories.forEach((data, id) => {
      data.age += delta;

      // Pulse traversal
      if (data.progress < 1.0) {
        data.progress += data.speed * delta;

        if (data.progress >= 1.0) {
          data.progress = 1.0;
          if (!data.hasImpacted) {
            data.hasImpacted = true;
            this._triggerImpact(data);
          }
          // Hide pulse particle once impact occurs
          data.pulseMesh.visible = false;
        } else {
          // Position particle along the 3D Bezier curve
          const pt = data.curve.getPoint(data.progress);
          data.pulseMesh.position.copy(pt);
        }
      }

      // Target reticle subtle pulsating animation
      if (data.targetAnchor) {
        const pulseScale = 1.0 + Math.sin(data.age * 8) * 0.15;
        if (id !== this.selectedAttackId) {
          data.targetAnchor.scale.set(pulseScale, pulseScale, pulseScale);
        }
      }

      // Arc fade-out after impact
      if (data.age > 4.0 && id !== this.selectedAttackId) {
        const fadeProgress = (data.age - 4.0) / (data.maxAge - 4.0);
        data.arcMaterial.opacity = Math.max(0.1, 0.75 * (1.0 - fadeProgress));
      }

      // Expire old trajectories
      if (data.age >= data.maxAge && id !== this.selectedAttackId) {
        toRemove.push(id);
      }
    });

    for (let i = 0; i < toRemove.length; i++) {
      this._removeTrajectory(toRemove[i]);
    }

    // 2. Update Expanding Shockwaves
    for (let i = this.activeShockwaves.length - 1; i >= 0; i--) {
      const shock = this.activeShockwaves[i];
      shock.elapsed += delta;

      if (shock.elapsed < shock.delay) continue;

      const activeTime = shock.elapsed - shock.delay;
      const progress = Math.min(1.0, activeTime / shock.duration);

      // Expansion
      const currentScale = 1.0 + progress * 4.2;
      shock.mesh.scale.set(currentScale, currentScale, currentScale);

      // Fade out
      shock.material.opacity = Math.max(0.0, 0.95 * (1.0 - progress));

      if (progress >= 1.0) {
        this.impactsGroup.remove(shock.mesh);
        shock.geometry.dispose();
        shock.material.dispose();
        this.activeShockwaves.splice(i, 1);
      }
    }
  }

  _removeTrajectory(id) {
    const data = this.activeTrajectories.get(id);
    if (!data) return;

    this.arcsGroup.remove(data.arcLine);
    this.pulsesGroup.remove(data.pulseMesh);
    if (data.targetAnchor) this.targetsGroup.remove(data.targetAnchor);
    if (data.originBeacon) this.targetsGroup.remove(data.originBeacon);

    data.arcLine.geometry.dispose();
    data.arcMaterial.dispose();
    data.pulseMesh.geometry.dispose();
    data.pulseMesh.material.dispose();

    this.activeTrajectories.delete(id);
  }

  clear() {
    this.activeTrajectories.forEach((_, id) => this._removeTrajectory(id));
  }
}
