/**
 * ThreatSphere 3D - Live Real-Time Telemetry Feed Controller
 * Auto-scrolling feed, cross-filtering triggers, severity badges, and search filtering.
 */

export class TelemetryFeed {
  /**
   * @param {HTMLElement} feedContainer
   * @param {object} callbacks
   */
  constructor(feedContainer, callbacks = {}) {
    this.container = feedContainer;
    this.listElement = feedContainer.querySelector('.feed-list');
    this.searchInput = feedContainer.querySelector('.feed-search-input');
    this.severityFilterGroup = feedContainer.querySelector('.filter-group');
    this.pauseBtn = feedContainer.querySelector('.feed-pause-btn');

    this.onSelectAttack = callbacks.onSelectAttack || (() => {});
    this.onSoundClick = callbacks.onSoundClick || (() => {});

    this.attacks = [];
    this.selectedAttackId = null;
    this.activeFilter = 'ALL';
    this.searchQuery = '';
    this.isPaused = false;
    this.autoScroll = true;

    this._initListeners();
  }

  _initListeners() {
    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this._renderFilteredList();
      });
    }

    // Severity filter buttons
    if (this.severityFilterGroup) {
      this.severityFilterGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-chip');
        if (!btn) return;

        this.onSoundClick();
        this.severityFilterGroup.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.activeFilter = btn.dataset.severity || 'ALL';
        this._renderFilteredList();
      });
    }

    // Pause button
    if (this.pauseBtn) {
      this.pauseBtn.addEventListener('click', () => {
        this.onSoundClick();
        this.isPaused = !this.isPaused;
        this.pauseBtn.innerHTML = this.isPaused
          ? '<span class="icon">▶</span> RESUME FEED'
          : '<span class="icon">⏸</span> PAUSE FEED';
        this.pauseBtn.classList.toggle('paused', this.isPaused);
      });
    }

    // Detect user manual scroll to disable/enable autoscroll
    if (this.listElement) {
      this.listElement.addEventListener('scroll', () => {
        const isNearTop = this.listElement.scrollTop < 60;
        this.autoScroll = isNearTop;
      });
    }
  }

  /**
   * Appends a new attack incident to the feed
   * @param {object} attack
   */
  pushAttack(attack) {
    if (this.isPaused) return;

    this.attacks.unshift(attack);
    if (this.attacks.length > 120) {
      this.attacks.pop();
    }

    // Only render if it matches current filters
    if (this._matchesFilter(attack)) {
      const itemEl = this._createItemElement(attack);

      if (this.listElement.firstChild) {
        this.listElement.insertBefore(itemEl, this.listElement.firstChild);
      } else {
        this.listElement.appendChild(itemEl);
      }

      // Keep DOM clean
      while (this.listElement.children.length > 80) {
        this.listElement.removeChild(this.listElement.lastChild);
      }

      if (this.autoScroll) {
        this.listElement.scrollTop = 0;
      }
    }
  }

  _matchesFilter(attack) {
    // Severity check
    if (this.activeFilter !== 'ALL' && attack.severity !== this.activeFilter) {
      return false;
    }

    // Search query check
    if (this.searchQuery) {
      const q = this.searchQuery;
      const match =
        attack.id.toLowerCase().includes(q) ||
        attack.actor.name.toLowerCase().includes(q) ||
        attack.origin.name.toLowerCase().includes(q) ||
        attack.target.name.toLowerCase().includes(q) ||
        attack.vector.name.toLowerCase().includes(q) ||
        attack.cve.id.toLowerCase().includes(q);

      if (!match) return false;
    }

    return true;
  }

  _createItemElement(attack) {
    const div = document.createElement('div');
    div.className = `feed-item ${attack.severityInfo.badgeClass} ${attack.id === this.selectedAttackId ? 'selected' : ''}`;
    div.dataset.id = attack.id;

    div.innerHTML = `
      <div class="feed-item-top">
        <span class="feed-badge ${attack.severityInfo.badgeClass}">${attack.severity}</span>
        <span class="feed-id">${attack.id}</span>
        <span class="feed-time">${attack.timeFormatted}</span>
      </div>
      <div class="feed-route">
        <span class="feed-origin">${attack.origin.name.split(',')[0]} <span class="flag">[${attack.origin.code}]</span></span>
        <span class="feed-arrow">➔</span>
        <span class="feed-target">${attack.target.name.split(',')[0]} <span class="flag">[${attack.target.code}]</span></span>
      </div>
      <div class="feed-meta">
        <span class="feed-actor">${attack.actor.name}</span>
        <span class="feed-vector">${attack.vector.name}</span>
      </div>
    `;

    div.addEventListener('click', () => {
      this.onSoundClick();
      this.highlightItem(attack.id);
      this.onSelectAttack(attack);
    });

    return div;
  }

  _renderFilteredList() {
    if (!this.listElement) return;

    this.listElement.innerHTML = '';
    const filtered = this.attacks.filter(a => this._matchesFilter(a));

    if (filtered.length === 0) {
      this.listElement.innerHTML = `<div class="feed-empty">NO INCIDENTS MATCHING CRITERIA</div>`;
      return;
    }

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < Math.min(filtered.length, 60); i++) {
      fragment.appendChild(this._createItemElement(filtered[i]));
    }
    this.listElement.appendChild(fragment);
  }

  /**
   * Highlights a specific attack row
   * @param {string} attackId
   */
  highlightItem(attackId) {
    this.selectedAttackId = attackId;

    const items = this.listElement.querySelectorAll('.feed-item');
    items.forEach(el => {
      if (el.dataset.id === attackId) {
        el.classList.add('selected');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        el.classList.remove('selected');
      }
    });
  }
}
