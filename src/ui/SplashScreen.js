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
    // Click anywhere on splash to dismiss immediately
    if (this.container) {
      this.container.addEventListener('click', () => {
        this.finish();
      });
    }

    if (this.enterBtn) {
      this.enterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.finish();
      });
    }

    // Keyboard bypass
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') && !this.isDone) {
        this.finish();
      }
    }, { once: true });
  }

  startBootSequence() {
    let logIndex = 0;
    const totalDuration = 2200; // 2.2 seconds
    const startTime = performance.now();

    // Absolute fail-safe: dismiss after 2.8s no matter what
    setTimeout(() => {
      this.finish();
    }, 2800);

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

    const logInterval = setInterval(() => {
      if (this.isDone) {
        clearInterval(logInterval);
        return;
      }
      addNextLog();
      if (logIndex >= this.bootLogs.length) {
        clearInterval(logInterval);
      }
    }, 280);

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
        }, 250);
      }
    };

    requestAnimationFrame(updateProgress);
  }

  finish() {
    if (this.isDone) return;
    this.isDone = true;

    if (this.container) {
      this.container.classList.add('fade-out');
      this.container.style.pointerEvents = 'none';
      setTimeout(() => {
        if (this.container && this.container.parentNode) {
          this.container.parentNode.removeChild(this.container);
        }
      }, 750);
    }

    this.onComplete();
  }
}
