/**
 * ThreatSphere 3D - Main Application Bootstrap & System Coordinator
 * Orchestrates 3D Globe, Real-World Cyber Ingestion, Attack Trajectories,
 * Dossier Drawer, and Web Audio Synthesizer.
 */

import { CyberGlobe } from './core/Globe.js';
import { TrajectoryManager } from './core/TrajectoryManager.js';
import { SoundFX } from './audio/SoundFX.js';
import { LiveRealWorldFeedAdapter, HybridFeedAdapter, SimulatedFeedAdapter } from './telemetry/Adapters.js';
import { TelemetryFeed } from './ui/TelemetryFeed.js';
import { DossierDrawer } from './ui/DossierDrawer.js';
import { HUDController } from './ui/HUD.js';

class ThreatSphereApp {
  constructor() {
    this.globe = null;
    this.trajectories = null;
    this.sound = null;
    this.activeFeedAdapter = null;
    this.adapters = {};
    this.telemetryFeed = null;
    this.dossierDrawer = null;
    this.hud = null;

    this._bootstrap();
  }

  _bootstrap() {
    console.log('[ThreatSphere 3D] Initializing Global Intelligence Terminal...');

    // 1. Audio Synthesizer
    this.sound = new SoundFX();

    // 2. 3D WebGL Globe
    const globeContainer = document.getElementById('globe-canvas-container');
    this.globe = new CyberGlobe(globeContainer);

    // 3. Dynamic Trajectory & Particle FX Manager
    this.trajectories = new TrajectoryManager(this.globe, {
      onImpact: (attack) => {
        this.sound.playImpact(attack.severity);
      },
      onSelectAttack: (attack) => {
        this.selectIncident(attack);
      }
    });

    // 4. Dossier Drawer
    const drawerEl = document.getElementById('dossier-drawer');
    this.dossierDrawer = new DossierDrawer(drawerEl, {
      onFocusGlobe: (lat, lon) => {
        this.globe.focusOn(lat, lon, 240, 1400);
      },
      onSoundClick: () => {
        this.sound.playClick();
      }
    });

    // 5. Live Telemetry Feed
    const feedEl = document.getElementById('telemetry-panel');
    this.telemetryFeed = new TelemetryFeed(feedEl, {
      onSelectAttack: (attack) => {
        this.selectIncident(attack);
      },
      onSoundClick: () => {
        this.sound.playClick();
      }
    });

    // 6. Tactical HUD Controller
    this.hud = new HUDController(
      {
        totalIncidentsEl: document.getElementById('metric-total-incidents'),
        criticalRatioEl: document.getElementById('metric-critical-ratio'),
        realCountEl: document.getElementById('metric-real-count'),
        sectorsContainer: document.getElementById('sectors-breakdown'),
        sparklineCanvas: document.getElementById('sparkline-canvas'),
        clockEl: document.getElementById('hud-clock'),
        surgeBtn: document.getElementById('btn-surge'),
        audioBtn: document.getElementById('btn-audio'),
        rotateBtn: document.getElementById('btn-rotate'),
        resetBtn: document.getElementById('btn-reset-view'),
        feedSelectorGroup: document.getElementById('feed-mode-selector'),
        feedIndicatorEl: document.getElementById('feed-status-indicator')
      },
      {
        onSurge: () => {
          this.sound.playAlert();
          if (this.activeFeedAdapter) {
            this.activeFeedAdapter.triggerSurge(10);
          }
        },
        onToggleAudio: () => {
          return this.sound.toggleMute();
        },
        onToggleRotate: () => {
          return this.globe.toggleAutoRotate();
        },
        onResetView: () => {
          this.globe.camera.position.set(0, 70, 290);
          this.globe.controls.target.set(0, 0, 0);
          this.globe.controls.update();
        },
        onChangeFeedMode: (mode) => {
          this.setFeedMode(mode);
        },
        onSoundClick: () => {
          this.sound.playClick();
        }
      }
    );

    // Sync initial audio button UI
    this.hud.updateAudioButton(this.sound.isMuted);

    // 7. Initialize Ingestion Adapters
    this.adapters = {
      LIVE: new LiveRealWorldFeedAdapter({ intervalMs: 1500 }),
      HYBRID: new HybridFeedAdapter({ intervalMs: 1400 }),
      SIM: new SimulatedFeedAdapter({ intervalMs: 1400 })
    };

    // Attack listener handler
    const onIncidentReceived = (attack) => {
      this.sound.playLaunch();
      this.trajectories.spawnTrajectory(attack);
      this.telemetryFeed.pushAttack(attack);
      this.hud.recordAttack(attack);
    };

    Object.values(this.adapters).forEach(adapter => {
      adapter.onAttack(onIncidentReceived);
    });

    // Start with LIVE REAL-WORLD Feed by default!
    this.setFeedMode('LIVE');

    // User gesture listener to unlock Web Audio context
    const unlockAudio = () => {
      this.sound.initContext();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    console.log('[ThreatSphere 3D] Operational. Real-world telemetry active.');
  }

  /**
   * Switches the active telemetry stream
   * @param {'LIVE'|'HYBRID'|'SIM'} mode
   */
  setFeedMode(mode) {
    if (this.activeFeedAdapter) {
      this.activeFeedAdapter.stop();
    }

    const adapter = this.adapters[mode] || this.adapters.LIVE;
    this.activeFeedAdapter = adapter;
    adapter.start();

    if (this.hud) {
      this.hud.updateFeedModeIndicator(mode);
    }
  }

  /**
   * Bidirectional Cross-filtering: focus globe, highlight 3D trajectory, open dossier
   * @param {object} attack
   */
  selectIncident(attack) {
    this.sound.playClick();

    // 1. Highlight in Telemetry Feed
    this.telemetryFeed.highlightItem(attack.id);

    // 2. Highlight trajectory in 3D
    this.trajectories.selectAttack(attack.id);

    // 3. Smooth camera focus onto target coordinates
    this.globe.focusOn(attack.target.lat, attack.target.lon, 230, 1300);

    // 4. Open structured Threat Dossier
    this.dossierDrawer.open(attack);
  }
}

// Instantiate on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.threatSphere = new ThreatSphereApp();
});
