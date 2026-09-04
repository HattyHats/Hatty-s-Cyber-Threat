/**
 * ThreatSphere 3D - Geodetic & 3D Spherical Coordinate Math Utilities
 */

import * as THREE from 'https://esm.sh/three@0.162.0';

export const GLOBE_RADIUS = 100;

/**
 * Converts Latitude & Longitude to 3D Cartesian Vector3 on a sphere
 * @param {number} lat - Latitude in degrees (-90 to +90)
 * @param {number} lon - Longitude in degrees (-180 to +180)
 * @param {number} radius - Sphere radius
 * @returns {THREE.Vector3}
 */
export function latLonToVector3(lat, lon, radius = GLOBE_RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Converts a 3D Cartesian Vector3 back to Latitude & Longitude
 * @param {THREE.Vector3} vec
 * @returns {{lat: number, lon: number}}
 */
export function vector3ToLatLon(vec) {
  const normalized = vec.clone().normalize();
  const phi = Math.acos(Math.max(-1, Math.min(1, normalized.y)));
  const theta = Math.atan2(normalized.z, -normalized.x);

  const lat = 90 - (phi * 180 / Math.PI);
  let lon = (theta * 180 / Math.PI) - 180;
  while (lon < -180) lon += 360;
  while (lon > 180) lon -= 360;

  return { lat, lon };
}

/**
 * Spherical Linear Interpolation (slerp) between two 3D points
 * @param {THREE.Vector3} v0
 * @param {THREE.Vector3} v1
 * @param {number} t - Progress between 0 and 1
 * @returns {THREE.Vector3}
 */
export function slerpVectors(v0, v1, t) {
  const p0 = v0.clone().normalize();
  const p1 = v1.clone().normalize();

  let dot = Math.max(-1, Math.min(1, p0.dot(p1)));

  // If points are almost collinear, fall back to linear interpolation
  if (Math.abs(dot) > 0.9995) {
    return new THREE.Vector3().lerpVectors(v0, v1, t);
  }

  const theta = Math.acos(dot);
  const sinTheta = Math.sin(theta);

  const factor0 = Math.sin((1 - t) * theta) / sinTheta;
  const factor1 = Math.sin(t * theta) / sinTheta;

  const result = new THREE.Vector3()
    .addScaledVector(p0, factor0)
    .addScaledVector(p1, factor1);

  const targetLength = v0.length() * (1 - t) + v1.length() * t;
  return result.normalize().multiplyScalar(targetLength);
}

/**
 * Great-circle distance between two coordinates in kilometers (Haversine formula)
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distance in km
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Calculates intermediate elevated control points for a 3D cubic Bezier attack trajectory
 * @param {THREE.Vector3} p0 - Origin coordinate on globe
 * @param {THREE.Vector3} p3 - Target coordinate on globe
 * @param {number} radius - Sphere radius
 * @returns {{p1: THREE.Vector3, p2: THREE.Vector3, apexHeight: number}}
 */
export function calculateBezierControlPoints(p0, p3, radius = GLOBE_RADIUS) {
  const norm0 = p0.clone().normalize();
  const norm3 = p3.clone().normalize();

  // Angular distance in radians
  const dot = Math.max(-1, Math.min(1, norm0.dot(norm3)));
  const angle = Math.acos(dot);

  // Height formula: minimum clearance of 12 units, scaling up to ~65 units for antipodal arcs
  const baseArcHeight = Math.sin(angle / 2) * radius * 0.75;
  const apexHeight = Math.max(12, baseArcHeight);

  // Intermediate slerp points at 28% and 72%
  const mid1 = slerpVectors(norm0, norm3, 0.28).normalize();
  const mid2 = slerpVectors(norm0, norm3, 0.72).normalize();

  // Control points elevated radially outwards
  const p1 = mid1.multiplyScalar(radius + apexHeight * 0.95);
  const p2 = mid2.multiplyScalar(radius + apexHeight * 0.95);

  return { p1, p2, apexHeight };
}
