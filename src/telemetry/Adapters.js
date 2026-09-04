/**
 * ThreatSphere 3D - Modular Threat Telemetry Feed Adapters
 * Supports:
 * 1. Live Real-World Ingestion Adapter (SANS ISC DShield + IPsum + Live Geolocation)
 * 2. Hybrid Stream Adapter (Interleaved Real-World + Deep APT Scenarios)
 * 3. Autonomous Simulation Adapter
 * 4. WebSocket & REST Adapters
 */

import { TelemetryGenerator } from './Generator.js';
import { RealThreatEngine } from './RealThreatEngine.js';

export class BaseFeedAdapter {
  constructor() {
    this.listeners = [];
    this.isRunning = false;
  }

  onAttack(callback) {
    this.listeners.push(callback);
  }

  emit(attack) {
    for (let i = 0; i < this.listeners.length; i++) {
      this.listeners[i](attack);
    }
  }

  start() {
    this.isRunning = true;
  }

  stop() {
    this.isRunning = false;
  }
}

/**
 * 100% Real-World Live Telemetry Ingestion Adapter
 * Streams live real-time attacks captured by global honeypots and threat grids
 */
export class LiveRealWorldFeedAdapter extends BaseFeedAdapter {
  constructor(options = {}) {
    super();
    this.engine = new RealThreatEngine();
    this.intervalMs = options.intervalMs || 1500;
    this.timer = null;
    this.isSurging = false;
  }

  async start() {
    super.start();
    // Warm up the real threat engine
    await this.engine.fetchLiveThreatData();
    this._scheduleNext();
  }

  stop() {
    super.stop();
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  async _scheduleNext() {
    if (!this.isRunning) return;

    const jitter = (Math.random() * 0.4 - 0.2) * this.intervalMs;
    const delay = Math.max(400, this.intervalMs + jitter);

    this.timer = setTimeout(async () => {
      if (this.isRunning) {
        try {
          const attack = await this.engine.createRealIncident();
          this.emit(attack);
        } catch (e) {
          console.warn('[ThreatSphere] Error creating real incident:', e);
        }
        this._scheduleNext();
      }
    }, delay);
  }

  triggerSurge(count = 8) {
    this.isSurging = true;
    let spawned = 0;

    const burst = async () => {
      if (spawned >= count || !this.isRunning) {
        this.isSurging = false;
        return;
      }

      try {
        const attack = await this.engine.createRealIncident();
        attack.severity = 'CRITICAL';
        attack.status = 'REAL-WORLD COORDINATED SPIKE // MULTI-SENSOR';
        this.emit(attack);
      } catch (e) {}

      spawned++;
      setTimeout(burst, 120 + Math.random() * 120);
    };

    burst();
  }
}

/**
 * Hybrid Stream: Interleaves Live Real-World Telemetry with Rich APT Intelligence
 */
export class HybridFeedAdapter extends BaseFeedAdapter {
  constructor(options = {}) {
    super();
    this.simGenerator = new TelemetryGenerator();
    this.realEngine = new RealThreatEngine();
    this.intervalMs = options.intervalMs || 1400;
    this.timer = null;
    this.toggleCounter = 0;
  }

  async start() {
    super.start();
    await this.realEngine.fetchLiveThreatData();
    this._scheduleNext();
  }

  stop() {
    super.stop();
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  _scheduleNext() {
    if (!this.isRunning) return;

    const jitter = (Math.random() * 0.4 - 0.2) * this.intervalMs;
    const delay = Math.max(350, this.intervalMs + jitter);

    this.timer = setTimeout(async () => {
      if (this.isRunning) {
        this.toggleCounter++;
        let attack;

        // Alternate: 1 real live attack, 1 APT campaign
        if (this.toggleCounter % 2 === 0) {
          try {
            attack = await this.realEngine.createRealIncident();
          } catch (e) {
            attack = this.simGenerator.generateAttack();
          }
        } else {
          attack = this.simGenerator.generateAttack();
        }

        this.emit(attack);
        this._scheduleNext();
      }
    }, delay);
  }

  triggerSurge(count = 8) {
    let spawned = 0;
    const burst = async () => {
      if (spawned >= count || !this.isRunning) return;

      const forceSev = Math.random() < 0.6 ? 'CRITICAL' : 'HIGH';
      let attack;
      if (spawned % 2 === 0) {
        try {
          attack = await this.realEngine.createRealIncident();
        } catch (e) {
          attack = this.simGenerator.generateAttack(forceSev);
        }
      } else {
        attack = this.simGenerator.generateAttack(forceSev);
      }
      this.emit(attack);

      spawned++;
      setTimeout(burst, 120 + Math.random() * 100);
    };

    burst();
  }
}

/**
 * Autonomous Simulated Stream with Dynamic Rate & Surge Mode
 */
export class SimulatedFeedAdapter extends BaseFeedAdapter {
  constructor(options = {}) {
    super();
    this.generator = new TelemetryGenerator();
    this.intervalMs = options.intervalMs || 1400;
    this.timer = null;
    this.isSurging = false;
  }

  start() {
    super.start();
    this._scheduleNext();
  }

  stop() {
    super.stop();
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  _scheduleNext() {
    if (!this.isRunning) return;

    const jitter = (Math.random() * 0.5 - 0.25) * this.intervalMs;
    const delay = Math.max(300, this.intervalMs + jitter);

    this.timer = setTimeout(() => {
      if (this.isRunning) {
        const attack = this.generator.generateAttack();
        this.emit(attack);
        this._scheduleNext();
      }
    }, delay);
  }

  triggerSurge(count = 8) {
    this.isSurging = true;
    let spawned = 0;

    const burst = () => {
      if (spawned >= count) {
        this.isSurging = false;
        return;
      }

      const forceSev = Math.random() < 0.6 ? 'CRITICAL' : 'HIGH';
      const attack = this.generator.generateAttack(forceSev);
      this.emit(attack);

      spawned++;
      setTimeout(burst, 110 + Math.random() * 120);
    };

    burst();
  }
}

/**
 * Live WebSocket Ingestion Adapter
 */
export class WebSocketFeedAdapter extends BaseFeedAdapter {
  constructor(wsUrl) {
    super();
    this.url = wsUrl;
    this.socket = null;
    this.reconnectTimer = null;
  }

  start() {
    super.start();
    this._connect();
  }

  _connect() {
    if (!this.isRunning) return;

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log(`[ThreatSphere] Connected to live WebSocket: ${this.url}`);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data);
        } catch (e) {
          console.warn('[ThreatSphere] Malformed WS payload', e);
        }
      };

      this.socket.onclose = () => {
        if (this.isRunning) {
          this.reconnectTimer = setTimeout(() => this._connect(), 5000);
        }
      };

      this.socket.onerror = (err) => {
        console.warn('[ThreatSphere] WebSocket error:', err);
      };
    } catch (err) {
      console.warn('[ThreatSphere] Could not initiate WebSocket:', err);
    }
  }

  stop() {
    super.stop();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
