/**
 * ThreatSphere 3D - Autonomous Threat Telemetry Generator
 * Simulates real-time global cyber warfare, state-sponsored APT campaigns,
 * and high-volume tactical network attacks.
 */

import {
  CITIES,
  THREAT_ACTORS,
  ATTACK_VECTORS,
  CVES,
  TARGET_SECTORS,
  SAMPLE_HEX_PAYLOADS,
  SEVERITY_LEVELS
} from '../config.js';
import { haversineDistance } from '../core/Coordinates.js';

export class TelemetryGenerator {
  constructor(options = {}) {
    this.seed = options.seed || Math.floor(Math.random() * 1000000);
    this.counter = 1000;
  }

  /**
   * Generates a realistic simulated IPv4 address
   */
  _generateIPv4() {
    const octets = [
      Math.floor(Math.random() * 220) + 1,
      Math.floor(Math.random() * 254) + 1,
      Math.floor(Math.random() * 254) + 1,
      Math.floor(Math.random() * 254) + 1
    ];
    return octets.join('.');
  }

  /**
   * Generates an incident dossier
   * @param {string} [forceSeverity] - Optional severity override
   * @returns {object} Full incident telemetry object
   */
  generateAttack(forceSeverity = null) {
    this.counter++;

    // Pick Attack Vector
    const vector = ATTACK_VECTORS[Math.floor(Math.random() * ATTACK_VECTORS.length)];
    const severity = forceSeverity || vector.severity;
    const severityConfig = SEVERITY_LEVELS[severity] || SEVERITY_LEVELS.LOW;

    // Pick Threat Actor
    // If actor has preferred vectors matching this vector, increase probability
    let actor = null;
    const matchingActors = THREAT_ACTORS.filter(a => a.preferredVectors.includes(vector.name));
    if (matchingActors.length > 0 && Math.random() < 0.7) {
      actor = matchingActors[Math.floor(Math.random() * matchingActors.length)];
    } else {
      actor = THREAT_ACTORS[Math.floor(Math.random() * THREAT_ACTORS.length)];
    }

    // Origin: Match actor's preferred city or pick any city
    let origin = CITIES.find(c => c.name === actor.city || c.country === actor.country);
    if (!origin || Math.random() < 0.35) {
      origin = CITIES[Math.floor(Math.random() * CITIES.length)];
    }

    // Target: Pick a different city
    let target;
    do {
      target = CITIES[Math.floor(Math.random() * CITIES.length)];
    } while (target.name === origin.name);

    // Geodesic distance
    const distanceKm = haversineDistance(origin.lat, origin.lon, target.lat, target.lon);

    // Pick Target Sector & Org
    const sector = TARGET_SECTORS[Math.floor(Math.random() * TARGET_SECTORS.length)];
    const targetOrg = `${target.name.split(',')[0]} Regional ${sector.split(' ')[0]} Facility`;

    // CVE matching
    const cve = CVES[Math.floor(Math.random() * CVES.length)];

    // Hex payload sample
    const payloadSample = SAMPLE_HEX_PAYLOADS[Math.floor(Math.random() * SAMPLE_HEX_PAYLOADS.length)];

    // Generate Incident ID
    const catCode = vector.category.substring(0, 3).toUpperCase();
    const id = `TS-${this.counter}-${catCode}`;

    // Timestamps
    const now = new Date();
    const timeFormatted = now.toTimeString().split(' ')[0];

    // Status
    const statuses = ['ACTIVE // PROPAGATING', 'INTERCEPTED // QUARANTINED', 'ISOLATING TARGET GATEWAY'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    // Mitigations
    const mitigations = [
      `Deploy Border BGP Flowspec route filter targeting ${origin.asns[0] || 'origin ASN'}.`,
      `Enforce automated Layer-7 Web Application Firewall signature rule for ${cve.id}.`,
      `Isolate internal subnet segment VLAN-402 and revoke compromised Kerberos TGS tickets.`,
      `Activate cloud Scrubbing Center diverting all ingress traffic from target IP.`,
      `Deploy memory zeroing patch advisory corresponding to ${cve.id} (${cve.product}).`
    ];
    const mitigation = mitigations[Math.floor(Math.random() * mitigations.length)];

    return {
      id,
      timestamp: now.toISOString(),
      timeFormatted,
      severity,
      severityInfo: severityConfig,
      status,

      origin: {
        ...origin,
        ip: this._generateIPv4(),
        asn: origin.asns[Math.floor(Math.random() * origin.asns.length)]
      },

      target: {
        ...target,
        ip: this._generateIPv4(),
        asn: target.asns[Math.floor(Math.random() * target.asns.length)],
        sector,
        organization: targetOrg
      },

      actor,
      vector,
      cve,
      distanceKm,
      mitigation,

      payload: {
        title: payloadSample.name,
        hexBytes: payloadSample.bytes,
        packetRate: `${(Math.random() * 450 + 20).toFixed(1)} Kpps`,
        bandwidth: `${(Math.random() * 850 + 50).toFixed(1)} Gbps`
      }
    };
  }
}
