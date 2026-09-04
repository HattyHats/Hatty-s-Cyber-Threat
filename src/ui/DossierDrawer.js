/**
 * ThreatSphere 3D - Structured Threat Intelligence Dossier Drawer
 * Detailed technical breakdown of threat actors, trajectories, MITRE vectors,
 * CVEs, raw hex payloads, and tactical mitigation actions.
 */

export class DossierDrawer {
  /**
   * @param {HTMLElement} drawerElement
   * @param {object} callbacks
   */
  constructor(drawerElement, callbacks = {}) {
    this.drawer = drawerElement;
    this.onFocusGlobe = callbacks.onFocusGlobe || (() => {});
    this.onSoundClick = callbacks.onSoundClick || (() => {});

    this.currentAttack = null;
    this.isOpen = false;

    this._initElements();
    this._initListeners();
  }

  _initElements() {
    this.closeBtn = this.drawer.querySelector('.drawer-close');
    this.contentContainer = this.drawer.querySelector('.dossier-content');
  }

  _initListeners() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.onSoundClick();
        this.close();
      });
    }

    // Keyboard ESC closes drawer
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  /**
   * Opens the drawer and renders the full threat dossier
   * @param {object} attack
   */
  open(attack) {
    this.currentAttack = attack;
    this.isOpen = true;
    this.drawer.classList.add('open');

    this._renderDossier(attack);
  }

  close() {
    this.isOpen = false;
    this.drawer.classList.remove('open');
  }

  _renderDossier(attack) {
    if (!this.contentContainer) return;

    const formattedHex = this._formatHexDump(attack.payload.hexBytes);

    this.contentContainer.innerHTML = `
      <!-- TOP STATUS BANNER -->
      <div class="dossier-banner">
        <div class="banner-top">
          <span class="classification-tag">CLASSIFIED // NOFORN</span>
          <span class="timestamp-tag">${attack.timeFormatted} UTC</span>
        </div>
        <div class="banner-main">
          <h2 class="threat-id">${attack.id}</h2>
          <span class="threat-badge ${attack.severityInfo.badgeClass}">${attack.severity}</span>
        </div>
        <div class="banner-status">
          <span class="status-pulse"></span>
          <span class="status-text">${attack.status}</span>
        </div>
      </div>

      <!-- SECTION: THREAT ACTOR (WHO) -->
      <div class="dossier-section">
        <div class="section-title">
          <span class="section-icon">👤</span>
          <h3>THREAT ACTOR [ATTRIBUTION]</h3>
        </div>
        <div class="actor-card">
          <div class="actor-name">${attack.actor.name}</div>
          <div class="actor-meta-grid">
            <div class="meta-item">
              <span class="label">STATE ALLEGIANCE</span>
              <span class="val">${attack.actor.allegiance}</span>
            </div>
            <div class="meta-item">
              <span class="label">MOTIVATION</span>
              <span class="val">${attack.actor.motivation}</span>
            </div>
            <div class="meta-item">
              <span class="label">ATTRIBUTION CONFIDENCE</span>
              <span class="val confidence-val">${attack.actor.confidence}</span>
            </div>
            <div class="meta-item">
              <span class="label">KNOWN ALIASES</span>
              <span class="val">${attack.actor.aliases.join(', ')}</span>
            </div>
          </div>
          <div class="actor-signature">
            <span class="label">SIGNATURE TOOLS & IMPLANTS</span>
            <div class="sig-val">${attack.actor.signature}</div>
          </div>
        </div>
      </div>

      <!-- SECTION: TRAJECTORY & TELEMETRY (WHERE) -->
      <div class="dossier-section">
        <div class="section-title">
          <span class="section-icon">🌐</span>
          <h3>TELEMETRY & TRAJECTORY</h3>
        </div>
        <div class="trajectory-grid">
          <!-- ORIGIN -->
          <div class="trajectory-card origin">
            <div class="card-header">
              <span class="card-type">INCURSION SOURCE</span>
              <span class="geo-flag">${attack.origin.code}</span>
            </div>
            <div class="city-name">${attack.origin.name}</div>
            <div class="country-name">${attack.origin.country}</div>
            <div class="coord-val">LAT: ${attack.origin.lat.toFixed(4)} | LON: ${attack.origin.lon.toFixed(4)}</div>
            <div class="ip-row">
              <span class="ip-label">IP:</span> <code>${attack.origin.ip}</code>
            </div>
            <div class="asn-row">
              <span class="asn-label">ASN:</span> <code>${attack.origin.asn}</code>
            </div>
          </div>

          <!-- VECTOR ARROW -->
          <div class="trajectory-vector">
            <div class="dist-km">${attack.distanceKm.toLocaleString()} KM</div>
            <div class="vector-line">➜</div>
            <div class="bandwidth-val">${attack.payload.bandwidth}</div>
          </div>

          <!-- TARGET -->
          <div class="trajectory-card target">
            <div class="card-header">
              <span class="card-type">TARGET INFRASTRUCTURE</span>
              <span class="geo-flag">${attack.target.code}</span>
            </div>
            <div class="city-name">${attack.target.name}</div>
            <div class="country-name">${attack.target.country}</div>
            <div class="coord-val">LAT: ${attack.target.lat.toFixed(4)} | LON: ${attack.target.lon.toFixed(4)}</div>
            <div class="ip-row">
              <span class="ip-label">IP:</span> <code>${attack.target.ip}</code>
            </div>
            <div class="asn-row">
              <span class="asn-label">ASN:</span> <code>${attack.target.asn}</code>
            </div>
            <div class="sector-tag">${attack.target.sector}</div>
          </div>
        </div>
      </div>

      <!-- SECTION: ATTACK VECTOR & MITRE ATT&CK (WHAT) -->
      <div class="dossier-section">
        <div class="section-title">
          <span class="section-icon">⚡</span>
          <h3>ATTACK VECTOR & MITRE ATT&CK</h3>
        </div>
        <div class="vector-card">
          <div class="vector-header">
            <span class="vector-name">${attack.vector.name}</span>
            <span class="mitre-tag">${attack.vector.mitreId}</span>
          </div>
          <div class="mitre-tactic">TACTIC: ${attack.vector.mitreTactic}</div>
          <p class="vector-desc">${attack.vector.description}</p>
        </div>
      </div>

      <!-- SECTION: CVE EXPLOITATION (VULNERABILITY) -->
      <div class="dossier-section">
        <div class="section-title">
          <span class="section-icon">🛡️</span>
          <h3>EXPLOITED VULNERABILITY</h3>
        </div>
        <div class="cve-card">
          <div class="cve-header">
            <span class="cve-id">${attack.cve.id}</span>
            <span class="cvss-score">CVSS ${attack.cve.cvss}</span>
          </div>
          <div class="cve-product">${attack.cve.vendor} // ${attack.cve.product}</div>
          <p class="cve-desc">${attack.cve.desc}</p>
        </div>
      </div>

      <!-- SECTION: RAW PACKET HEX DUMP -->
      <div class="dossier-section">
        <div class="section-title">
          <span class="section-icon">🔍</span>
          <h3>PAYLOAD PACKET INSPECTOR</h3>
        </div>
        <div class="hex-viewer">
          <div class="hex-title">${attack.payload.title}</div>
          <div class="hex-meta">PACKET RATE: ${attack.payload.packetRate} | BANDWIDTH: ${attack.payload.bandwidth}</div>
          <pre class="hex-pre"><code>${formattedHex}</code></pre>
        </div>
      </div>

      <!-- SECTION: RECOMMENDED MITIGATION -->
      <div class="dossier-section">
        <div class="section-title">
          <span class="section-icon">🚨</span>
          <h3>AUTOMATED COUNTERMEASURE</h3>
        </div>
        <div class="mitigation-box">
          <div class="mitigation-text">${attack.mitigation}</div>
        </div>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="dossier-actions">
        <button class="btn btn-focus" id="btn-focus-globe">
          <span class="btn-icon">🎯</span> FOCUS 3D GLOBE
        </button>
        <button class="btn btn-copy" id="btn-copy-iocs">
          <span class="btn-icon">📋</span> COPY IOCs
        </button>
        <button class="btn btn-export" id="btn-export-json">
          <span class="btn-icon">💾</span> EXPORT DOSSIER
        </button>
      </div>
    `;

    this._bindActionButtons(attack);
  }

  _bindActionButtons(attack) {
    const focusBtn = this.drawer.querySelector('#btn-focus-globe');
    if (focusBtn) {
      focusBtn.addEventListener('click', () => {
        this.onSoundClick();
        this.onFocusGlobe(attack.target.lat, attack.target.lon);
      });
    }

    const copyBtn = this.drawer.querySelector('#btn-copy-iocs');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        this.onSoundClick();
        const iocData = `THREATSPHERE IOC REPORT:
Incident ID: ${attack.id}
Actor: ${attack.actor.name} (${attack.actor.allegiance})
Origin IP: ${attack.origin.ip} (ASN: ${attack.origin.asn}, ${attack.origin.name})
Target IP: ${attack.target.ip} (ASN: ${attack.target.asn}, ${attack.target.name})
CVE: ${attack.cve.id} (CVSS: ${attack.cve.cvss})
Vector: ${attack.vector.name} (${attack.vector.mitreId})
Timestamp: ${attack.timestamp}`;

        navigator.clipboard.writeText(iocData).then(() => {
          copyBtn.innerHTML = '<span class="btn-icon">✓</span> COPIED!';
          setTimeout(() => {
            copyBtn.innerHTML = '<span class="btn-icon">📋</span> COPY IOCs';
          }, 2000);
        });
      });
    }

    const exportBtn = this.drawer.querySelector('#btn-export-json');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.onSoundClick();
        const jsonStr = JSON.stringify(attack, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ThreatSphere_${attack.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  }

  _formatHexDump(hexBytes) {
    // Format into standard Wireshark/tcpdump hex view:
    // 0000  50 4f 53 54 20 2f 73 73  6c 2d 76 70 6e 2f 68 69  |POST /ssl-vpn/hi|
    const clean = hexBytes.replace(/\\s+/g, '');
    let result = '';

    for (let i = 0; i < clean.length; i += 32) {
      const offset = (i / 2).toString(16).padStart(4, '0');
      const chunk = clean.substring(i, i + 32);

      let hexPart = '';
      let asciiPart = '';

      for (let j = 0; j < chunk.length; j += 2) {
        const byteHex = chunk.substring(j, j + 2);
        hexPart += byteHex + ' ';
        if (j === 14) hexPart += ' '; // middle separator

        const charCode = parseInt(byteHex, 16);
        asciiPart += (charCode >= 32 && charCode <= 126) ? String.fromCharCode(charCode) : '.';
      }

      hexPart = hexPart.padEnd(50, ' ');
      result += `${offset}  ${hexPart} |${asciiPart}|\n`;
    }

    return result.trim();
  }
}
