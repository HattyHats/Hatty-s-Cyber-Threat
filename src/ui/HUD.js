/**
 * ThreatSphere 3D - Tactical HUD & Real-Time Metrics Controller
 * Live sparkline charts, DEFCON status, sector distribution metrics, and feed mode controls.
 */

export class HUDController {
  /**
   * @param {object} elements
   * @param {object} callbacks
   */
  constructor(elements, callbacks = {}) {
    this.elements = elements;
    this.onSurge = callbacks.onSurge || (() => {});
    this.onToggleAudio = callbacks.onToggleAudio || (() => {});
    this.onToggleRotate = callbacks.onToggleRotate || (() => {});
    this.onResetView = callbacks.onResetView || (() => {});
    this.onChangeFeedMode = callbacks.onChangeFeedMode || (() => {});
    this.onSoundClick = callbacks.onSoundClick || (() => {});

    // Metrics tracking
    this.totalIncidents = 0;
    this.criticalCount = 0;
    this.realWorldCount = 0;
    this.sectorCounts = {};
    this.countryCounts = {};

    // Sparkline history (attacks per second)
    this.sparklineCanvas = elements.sparklineCanvas;
    this.sparklineCtx = this.sparklineCanvas ? this.sparklineCanvas.getContext('2d') : null;
    this.historyBuckets = new Array(30).fill(0);
    this.currentSecondBucket = 0;

    this._initControls();
    this._startClock();
    this._startSparklineLoop();
  }

  _initControls() {
    // Surge attack button
    if (this.elements.surgeBtn) {
      this.elements.surgeBtn.addEventListener('click', () => {
        this.onSoundClick();
        this.elements.surgeBtn.classList.add('active');
        this.onSurge();
        setTimeout(() => {
          this.elements.surgeBtn.classList.remove('active');
        }, 1500);
      });
    }

    // Audio toggle button
    if (this.elements.audioBtn) {
      this.elements.audioBtn.addEventListener('click', () => {
        const isMuted = this.onToggleAudio();
        this.updateAudioButton(isMuted);
      });
    }

    // Auto rotate toggle
    if (this.elements.rotateBtn) {
      this.elements.rotateBtn.addEventListener('click', () => {
        this.onSoundClick();
        const isRotating = this.onToggleRotate();
        this.elements.rotateBtn.classList.toggle('active', isRotating);
        this.elements.rotateBtn.title = isRotating ? 'Auto-Rotate: ON' : 'Auto-Rotate: OFF';
      });
    }

    // Reset view
    if (this.elements.resetBtn) {
      this.elements.resetBtn.addEventListener('click', () => {
        this.onSoundClick();
        this.onResetView();
      });
    }

    // Feed Mode Selector (LIVE / HYBRID / SIMULATION)
    if (this.elements.feedSelectorGroup) {
      this.elements.feedSelectorGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.feed-mode-btn');
        if (!btn) return;

        this.onSoundClick();
        this.elements.feedSelectorGroup.querySelectorAll('.feed-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const mode = btn.dataset.mode || 'LIVE';
        this.onChangeFeedMode(mode);
        this.updateFeedModeIndicator(mode);
      });
    }
  }

  updateFeedModeIndicator(mode) {
    if (!this.elements.feedIndicatorEl) return;

    if (mode === 'LIVE') {
      this.elements.feedIndicatorEl.innerHTML = `
        <span class="live-dot red"></span>
        <span>LIVE REAL-WORLD: SANS ISC & IPSUM GLOBAL SENSORS</span>
      `;
      this.elements.feedIndicatorEl.className = 'feed-indicator mode-live';
    } else if (mode === 'HYBRID') {
      this.elements.feedIndicatorEl.innerHTML = `
        <span class="live-dot purple"></span>
        <span>HYBRID STREAM: REAL TELEMETRY + APT DOSSIERS</span>
      `;
      this.elements.feedIndicatorEl.className = 'feed-indicator mode-hybrid';
    } else {
      this.elements.feedIndicatorEl.innerHTML = `
        <span class="live-dot cyan"></span>
        <span>AUTONOMOUS SIMULATION: DETERMINISTIC WARFARE</span>
      `;
      this.elements.feedIndicatorEl.className = 'feed-indicator mode-sim';
    }
  }

  updateAudioButton(isMuted) {
    if (!this.elements.audioBtn) return;
    this.elements.audioBtn.innerHTML = isMuted
      ? '<span class="icon">🔇</span> AUDIO OFF'
      : '<span class="icon">🔊</span> AUDIO ON';
    this.elements.audioBtn.classList.toggle('muted', isMuted);
  }

  _startClock() {
    const updateTime = () => {
      const now = new Date();
      if (this.elements.clockEl) {
        this.elements.clockEl.textContent = `${now.toTimeString().split(' ')[0]} UTC`;
      }
    };
    setInterval(updateTime, 1000);
    updateTime();
  }

  /**
   * Records a new attack into the HUD statistics
   * @param {object} attack
   */
  recordAttack(attack) {
    this.totalIncidents++;
    this.currentSecondBucket++;

    if (attack.severity === 'CRITICAL') {
      this.criticalCount++;
    }

    if (attack.isRealData) {
      this.realWorldCount++;
    }

    // Sectors
    const sec = attack.target.sector.split(' ')[0];
    this.sectorCounts[sec] = (this.sectorCounts[sec] || 0) + 1;

    // Countries
    const origCode = attack.origin.code;
    this.countryCounts[origCode] = (this.countryCounts[origCode] || 0) + 1;

    this._updateMetricsUI();
  }

  _updateMetricsUI() {
    if (this.elements.totalIncidentsEl) {
      this.elements.totalIncidentsEl.textContent = this.totalIncidents.toLocaleString();
    }

    if (this.elements.criticalRatioEl) {
      const ratio = this.totalIncidents > 0 ? ((this.criticalCount / this.totalIncidents) * 100).toFixed(1) : 0;
      this.elements.criticalRatioEl.textContent = `${ratio}%`;
    }

    if (this.elements.realCountEl) {
      this.elements.realCountEl.textContent = `${this.realWorldCount.toLocaleString()} VERIFIED`;
    }

    // Top sectors bar
    if (this.elements.sectorsContainer) {
      const sortedSectors = Object.entries(this.sectorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      const total = Object.values(this.sectorCounts).reduce((acc, v) => acc + v, 0) || 1;

      this.elements.sectorsContainer.innerHTML = sortedSectors
        .map(([name, count]) => {
          const pct = Math.round((count / total) * 100);
          return `
            <div class="stat-progress-row">
              <span class="stat-name">${name}</span>
              <div class="stat-bar-track">
                <div class="stat-bar-fill" style="width: ${pct}%"></div>
              </div>
              <span class="stat-pct">${pct}%</span>
            </div>
          `;
        })
        .join('');
    }
  }

  _startSparklineLoop() {
    setInterval(() => {
      this.historyBuckets.push(this.currentSecondBucket);
      this.historyBuckets.shift();
      this.currentSecondBucket = 0;
      this._renderSparkline();
    }, 1000);
  }

  _renderSparkline() {
    if (!this.sparklineCtx || !this.sparklineCanvas) return;

    const ctx = this.sparklineCtx;
    const w = this.sparklineCanvas.width;
    const h = this.sparklineCanvas.height;

    ctx.clearRect(0, 0, w, h);

    const maxVal = Math.max(8, ...this.historyBuckets);
    const stepX = w / (this.historyBuckets.length - 1);

    // Background gradient fill
    ctx.beginPath();
    ctx.moveTo(0, h);

    for (let i = 0; i < this.historyBuckets.length; i++) {
      const x = i * stepX;
      const y = h - (this.historyBuckets[i] / maxVal) * (h - 8);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(w, h);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0.02)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Foreground line
    ctx.beginPath();
    for (let i = 0; i < this.historyBuckets.length; i++) {
      const x = i * stepX;
      const y = h - (this.historyBuckets[i] / maxVal) * (h - 8);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pulse point at latest
    const lastX = w;
    const lastY = h - (this.historyBuckets[this.historyBuckets.length - 1] / maxVal) * (h - 8);
    ctx.beginPath();
    ctx.arc(lastX - 2, lastY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }
}
