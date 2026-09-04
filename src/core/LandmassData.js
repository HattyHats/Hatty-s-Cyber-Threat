/**
 * ThreatSphere 3D - Procedural Continental Landmass Sampler
 * Generates an accurate, high-density point cloud representing the Earth's continents
 * with zero external texture or network dependencies.
 */

// Geographic bounding polygons/boxes for the world's major landmasses
const LAND_REGIONS = [
  // North America
  { latMin: 24, latMax: 50, lonMin: -125, lonMax: -66 }, // Contiguous US
  { latMin: 50, latMax: 70, lonMin: -140, lonMax: -55 }, // Canada
  { latMin: 55, latMax: 72, lonMin: -170, lonMax: -140 }, // Alaska
  { latMin: 14, latMax: 33, lonMin: -118, lonMax: -86 }, // Mexico
  { latMin: 8, latMax: 18, lonMin: -90, lonMax: -77 },  // Central America
  { latMin: 60, latMax: 83, lonMin: -73, lonMax: -15 },  // Greenland
  { latMin: 18, latMax: 27, lonMin: -85, lonMax: -65 },  // Caribbean / Cuba

  // South America
  { latMin: -5, latMax: 12, lonMin: -80, lonMax: -50 },  // Northern South America (Col, Ven, Guyanas)
  { latMin: -20, latMax: -5, lonMin: -81, lonMax: -35 }, // Brazil North & Central / Peru
  { latMin: -35, latMax: -20, lonMin: -70, lonMax: -40 },// Brazil South / Bolivia / Paraguay
  { latMin: -56, latMax: -35, lonMin: -75, lonMax: -55 },// Argentina & Chile (Patagonia)

  // Europe
  { latMin: 50, latMax: 59, lonMin: -11, lonMax: 2 },   // United Kingdom & Ireland
  { latMin: 55, latMax: 71, lonMin: 4, lonMax: 32 },    // Scandinavia (Norway, Sweden, Finland)
  { latMin: 36, latMax: 44, lonMin: -10, lonMax: 4 },   // Iberian Peninsula (Spain, Portugal)
  { latMin: 42, latMax: 55, lonMin: -5, lonMax: 16 },   // Western & Central Europe (France, DE, Benelux)
  { latMin: 36, latMax: 46, lonMin: 8, lonMax: 19 },    // Italy & Adriatic
  { latMin: 35, latMax: 42, lonMin: 19, lonMax: 29 },   // Greece & Balkans
  { latMin: 44, latMax: 60, lonMin: 16, lonMax: 40 },   // Eastern Europe & Poland / Ukraine

  // Russia & Northern Asia
  { latMin: 50, latMax: 76, lonMin: 30, lonMax: 180 },  // Russia / Siberia wide

  // Asia
  { latMin: 20, latMax: 45, lonMin: 75, lonMax: 130 },  // China / Mongolia / Central Asia
  { latMin: 8, latMax: 35, lonMin: 68, lonMax: 90 },    // Indian Subcontinent
  { latMin: 30, latMax: 45, lonMin: 128, lonMax: 146 }, // Japan Archipelago
  { latMin: 33, latMax: 43, lonMin: 124, lonMax: 131 }, // Korean Peninsula
  { latMin: 21, latMax: 26, lonMin: 119, lonMax: 123 }, // Taiwan
  { latMin: 10, latMax: 25, lonMin: 98, lonMax: 110 },  // Indochina (Vietnam, Thailand, Cambodia)
  { latMin: -11, latMax: 8, lonMin: 95, lonMax: 141 },  // Indonesia & Malaysia
  { latMin: 5, latMax: 19, lonMin: 117, lonMax: 127 },  // Philippines

  // Middle East
  { latMin: 25, latMax: 42, lonMin: 35, lonMax: 65 },   // Turkey, Iran, Levant, Iraq
  { latMin: 12, latMax: 32, lonMin: 35, lonMax: 60 },   // Arabian Peninsula (Saudi, UAE, Oman, Yemen)

  // Africa
  { latMin: 18, latMax: 37, lonMin: -17, lonMax: 35 },  // North Africa & Sahara (Morocco to Egypt)
  { latMin: 4, latMax: 18, lonMin: -17, lonMax: 15 },   // West Africa
  { latMin: -5, latMax: 15, lonMin: 15, lonMax: 52 },   // Central & East Africa / Horn of Africa
  { latMin: -35, latMax: -5, lonMin: 12, lonMax: 40 },  // Southern Africa
  { latMin: -26, latMax: -12, lonMin: 43, lonMax: 51 }, // Madagascar

  // Australia & Oceania
  { latMin: -39, latMax: -11, lonMin: 113, lonMax: 154 }, // Australia
  { latMin: -47, latMax: -34, lonMin: 166, lonMax: 179 }, // New Zealand
  { latMin: -10, latMax: 0, lonMin: 130, lonMax: 152 }    // Papua New Guinea
];

// Major exclusions (oceans, gulfs, large inland bodies inside bounding boxes)
const WATER_EXCLUSIONS = [
  { latMin: 20, latMax: 30, lonMin: -97, lonMax: -83 }, // Gulf of Mexico central
  { latMin: 50, latMax: 65, lonMin: -95, lonMax: -75 }, // Hudson Bay
  { latMin: 30, latMax: 42, lonMin: -40, lonMax: -15 }, // Mid Atlantic
  { latMin: 30, latMax: 40, lonMin: 15, lonMax: 25 },   // Mediterranean center
  { latMin: 15, latMax: 25, lonMin: 60, lonMax: 70 }    // Arabian Sea center
];

/**
 * Checks if a given lat/lon coordinate falls on a terrestrial landmass
 * @param {number} lat
 * @param {number} lon
 * @returns {boolean}
 */
export function isLandCoordinate(lat, lon) {
  // Check exclusions first
  for (let i = 0; i < WATER_EXCLUSIONS.length; i++) {
    const w = WATER_EXCLUSIONS[i];
    if (lat >= w.latMin && lat <= w.latMax && lon >= w.lonMin && lon <= w.lonMax) {
      return false;
    }
  }

  // Check land regions
  for (let i = 0; i < LAND_REGIONS.length; i++) {
    const r = LAND_REGIONS[i];
    if (lat >= r.latMin && lat <= r.latMax && lon >= r.lonMin && lon <= r.lonMax) {
      return true;
    }
  }

  return false;
}

/**
 * Generates an array of evenly spaced terrestrial coordinates across the globe
 * @param {number} step - Angular step in degrees (default 2.2 deg)
 * @returns {Array<{lat: number, lon: number}>}
 */
export function generateLandmassPoints(step = 2.4) {
  const points = [];

  for (let lat = -65; lat <= 75; lat += step) {
    // Adjust longitude step according to latitude to maintain uniform surface density
    const cosLat = Math.cos(lat * Math.PI / 180);
    const lonStep = cosLat > 0.05 ? step / cosLat : step * 5;

    for (let lon = -180; lon <= 180; lon += lonStep) {
      // Add subtle deterministic jitter for natural organic coastline distribution
      const jitterLat = lat + (Math.sin(lat * 12.3 + lon * 7.7) * 0.3);
      const jitterLon = lon + (Math.cos(lat * 8.9 + lon * 14.1) * 0.3);

      if (isLandCoordinate(jitterLat, jitterLon)) {
        points.push({ lat: jitterLat, lon: jitterLon });
      }
    }
  }

  return points;
}
