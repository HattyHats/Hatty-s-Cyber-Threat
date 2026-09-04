# ThreatSphere 3D // Real-World Global Cyber Attack Terminal

ThreatSphere 3D is a client-side, zero-bloat, real-time 3D global cyber warfare and threat intelligence terminal built with modern Vanilla JavaScript (ES6+ Modules), Three.js, and WebGL.

It ingests **genuine real-world cyber attack telemetry** happening right now across global internet sensor networks, alongside deep APT threat intelligence dossiers.

---

## 🌐 Real-World Live Data Sources

ThreatSphere 3D connects directly to live global cyber threat sensor feeds:

1. **SANS Internet Storm Center (DShield)**:
   - Real-time global firewall drop logs, attacking IPs, packet counts, and sensor targets.
   - Endpoints: `https://isc.sans.edu/api/sources/attacks/50?json`, `topips/records/40?json`, `dailysummary?json`.
   - Records over **6.4 million real cyber attacks today** across **116,000+ attacking IP sources**.

2. **IPsum Multi-Source Consensus Feed**:
   - Aggregates over 30 global threat intelligence lists into active attacking IPs scored by the number of independent blacklists flagging them.
   - Endpoint: `https://raw.githubusercontent.com/stamparm/ipsum/master/ipsum.txt`.

3. **Real-Time IP Geolocation Engine**:
   - Every attacking IP is geolocated in real time to its exact City, Country, Latitude, Longitude, and ASN via `ipwho.is` with high-performance in-memory caching.

---

## 🎛️ Three Operating Modes (HUD Switcher)

Switch between three modes in the top header:

- 🔴 **LIVE REAL-WORLD** *(Default)*:
  100% genuine real-world attacking IPs captured live by SANS ISC DShield sensors and the IPsum global grid. Displays verified attacking IPs, observed packet volumes, and authentic geolocated origin points.
- 🟣 **HYBRID STREAM**:
  Interleaves live real-world attack captures with enriched APT campaign dossiers (MITRE ATT&CK techniques, CVEs, and simulated hex dumps).
- 🔵 **SIMULATED**:
  Autonomous deterministic threat generator running 24/7 scenarios without external network requests.

---

## 🛠️ Architecture & Delivered Components

```
3D Cyber Threat/
├── index.html                  # Semantic military HUD layout & WebGL container
├── css/
│   ├── hud.css                 # Military-grade HUD styles, typography, reticles, scanlines
│   └── dossier.css             # Threat dossier drawer, hex viewer, telemetry feed styling
├── src/
│   ├── main.js                 # App initialization, event coordinator & cross-filtering
│   ├── config.js               # Geolocation coordinates (60+ cities), APT groups, vectors, CVEs
│   ├── core/
│   │   ├── Coordinates.js      # Lat/Lon to Vector3 conversion, geodesic distance, Bezier math
│   │   ├── LandmassData.js     # Procedural continental coordinate sampler (3,200+ points)
│   │   ├── Globe.js            # Three.js globe, procedural dot-matrix, atmospheric halo
│   │   └── TrajectoryManager.js# 3D Cubic Bezier arcs, traveling pulses, shockwaves, raycasting
│   ├── telemetry/
│   │   ├── RealThreatEngine.js # Live SANS ISC DShield, IPsum & Geolocation ingestion
│   │   ├── Generator.js        # Autonomous deterministic threat simulation engine
│   │   └── Adapters.js         # LiveRealWorld, Hybrid, Simulated, and WebSocket adapters
│   ├── audio/
│   │   └── SoundFX.js          # Web Audio API procedural cyber SFX (zero external files)
│   └── ui/
│       ├── HUD.js              # Real-time metrics, attack sparklines, live source selector
│       ├── TelemetryFeed.js    # Live auto-scrolling telemetry feed with severity badges
│       └── DossierDrawer.js    # Structured threat dossier, hex viewer, IOC exporter
└── README.md                   # Full system documentation
```

---

## 🚀 Running the Terminal

ThreatSphere 3D requires zero build tools, bundlers, or npm installs. Simply serve with any HTTP server:

```bash
cd ~/Desktop/Antigravity/"3D Cyber Threat"
python3 -m http.server 8090
```

Open **`http://localhost:8090`** in Chrome, Safari, Firefox, or Edge.
