/**
 * ThreatSphere 3D - Cinematic Splash Screen & Boot Sequence Controller
 */

export class SplashScreen {
  constructor(containerEl, onComplete = () => {}) {
    this.container = containerEl;
    this.onComplete = onComplete;

    this.consoleEl = containerEl.querySelector('.splash-console');
    this.progressFill = containerEl.querySelector('.splash-progress-fill');
    this.progressPct = containerEl.querySelector('.progress-pct');
    this.enterBtn = containerEl.querySelector('.btn-enter-terminal');
    this.statusNotice = containerEl.querySelector('.splash-status-notice');

    this.isDone = false;
    this.bootLogs = [
      { sec: '0.012s', text: 'Initializing Three.js WebGL 2.0 orbital rendering pipeline...' },
      { sec: '0.240s', text: 'Calibrating geodetic coordinate matrices for 60+ global capitals...' },
      { sec: '0.510s', text: 'Establishing secure handshake with SANS ISC DShield sensor grid...' },
      { sec: '0.820s', text: 'Synchronizing IPsum 30-feed consensus grid (133,000+ malicious nodes)...' },
      { sec: '1.240s', text: 'Surveillance satellite orbital constellation synchronized...' },
      { sec: '1.650s', text: 'Web Audio procedural acoustic synthesizer online...' },
      { sec: '2.100s', text: 'SYSTEM OPERATIONAL // DEFCON 2 GLOBAL TELEMETRY ONLINE' }
    ];

    this._initListeners();
    this.startBootSequence();
  }

  _initListeners() {
    if (this.enterBtn) {
      this.enterBtn.addEventListener('click', () => {
        this.finish();
      });
    }

    // Enter key can also bypass
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !this.isDone) {
        this.finish();
      }
    }, { once: true });
  }

  startBootSequence() {
    let logIndex = 0;
    const totalDuration = 2400; // 2.4 seconds
    const startTime = performance.now();

    const addNextLog = () => {
      if (logIndex < this.bootLogs.length && this.consoleEl) {
        const item = this.bootLogs[logIndex];
        const line = document.createElement('div');
        line.className = 'console-line';
        line.innerHTML = `
          <span class="tag-ok">[OK]</span>
          <span class="tag-sec">${item.sec}</span>
          <span class="log-text">${item.text}</span>
        `;
        this.consoleEl.appendChild(line);
        this.consoleEl.scrollTop = this.consoleEl.scrollHeight;
        logIndex++;
      }
    };

    // Stagger log additions
    const logInterval = setInterval(() => {
      addNextLog();
      if (logIndex >= this.bootLogs.length) {
        clearInterval(logInterval);
      }
    }, 320);

    // Smooth progress bar loop
    const updateProgress = (now) => {
      if (this.isDone) return;

      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / totalDuration);
      const pct = Math.round(progress * 100);

      if (this.progressFill) this.progressFill.style.width = `${pct}%`;
      if (this.progressPct) this.progressPct.textContent = `${pct}%`;

      if (progress < 1.0) {
        requestAnimationFrame(updateProgress);
      } else {
        if (this.statusNotice) this.statusNotice.textContent = 'ALL SYSTEMS NOMINAL // AUTO-ENTERING...';
        if (this.enterBtn) this.enterBtn.innerHTML = 'INITIALIZED ➔';
        setTimeout(() => {
          this.finish();
        }, 350);
      }
    };

    requestAnimationFrame(updateProgress);
  }

  finish() {
    if (this.isDone) return;
    this.isDone = true;

    if (this.container) {
      this.container.classList.add('fade-out');
      setTimeout(() => {
        this.container.remove();
      }, 850);
    }

    this.onComplete();
  }
}
