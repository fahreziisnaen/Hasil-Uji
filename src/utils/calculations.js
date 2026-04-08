// IEC/ANSI curve constants
// IEC formula: t = tms * b / ((I/Is)^a - 1)
// ANSI formula uses same structure with different constants
export const CURVE_CONSTANTS = {
  'C SI':  { a: 0.02,   b: 0.14 },    // IEC Standard Inverse
  'C VI':  { a: 1.0,    b: 13.5 },    // IEC Very Inverse
  'C EI':  { a: 2.0,    b: 80.0 },    // IEC Extremely Inverse
  'C LTI': { a: 1.0,    b: 120.0 },   // IEC Long Time Inverse
  'C STI': { a: 0.04,   b: 0.05 },    // IEC Short Time Inverse
  'A MI':  { a: 0.02,   b: 0.0103 },  // ANSI Moderately Inverse
  'A I':   { a: 2.0938, b: 8.9341 },  // ANSI Inverse
  'A VI':  { a: 2.0,    b: 3.922 },   // ANSI Very Inverse
  'A EI':  { a: 2.0,    b: 5.64 },    // ANSI Extremely Inverse
  'DT':    { a: 0,      b: 0 },       // Definite Time
}

/**
 * Calculate OCR operating time using IEC/ANSI inverse time formula
 * t = tms * b / ((I/Is)^a - 1)
 * For DT curve, returns tms directly (tms used as definite time value)
 * @param {number} current   - Injection current (A secondary)
 * @param {number} pickup    - Pickup current Is (A secondary)
 * @param {number} tms       - Time Multiplier Setting
 * @param {string} curve     - Curve name key from CURVE_CONSTANTS
 * @returns {number} Operating time in seconds, or Infinity if at/below pickup
 */
export function calcOCRTime(current, pickup, tms, curve) {
  if (!pickup || pickup <= 0) return NaN
  if (!current || current <= 0) return NaN
  const ratio = current / pickup
  if (ratio <= 1.0) return Infinity // Below or at pickup, won't operate

  if (curve === 'DT') {
    // Definite time: tms is the time in seconds
    return tms
  }

  const c = CURVE_CONSTANTS[curve]
  if (!c) return NaN
  const { a, b } = c
  if (a === 0 && b === 0) return tms // fallback for DT

  const denominator = Math.pow(ratio, a) - 1
  if (denominator <= 0) return Infinity
  return tms * b / denominator
}

/**
 * Calculate impedance error percentage
 * @param {number} measured  - Measured impedance (Ohm)
 * @param {number} setting   - Setting impedance (Ohm)
 * @returns {number} Error percentage
 */
export function impedanceErrorPct(measured, setting) {
  if (!setting || setting === 0) return NaN
  return ((measured - setting) / setting) * 100
}

/**
 * Calculate metering error percentage
 * @param {number} measured   - Measured value from relay
 * @param {number} reference  - Reference/injected value
 * @returns {number} Error percentage
 */
export function meteringErrorPct(measured, reference) {
  if (!reference || reference === 0) return NaN
  return ((measured - reference) / reference) * 100
}

/**
 * Check if distance relay zone test passes (≤5% impedance error)
 */
export function isDistancePass(measured, setting) {
  return Math.abs(impedanceErrorPct(measured, setting)) <= 5
}

/**
 * Check if time measurement passes (within ±30ms)
 */
export function isTimePass(measured, setting) {
  return Math.abs(measured - setting) <= 30
}

/**
 * Check if OCR time test passes (within ±10%)
 */
export function isOCRPass(measured, expected) {
  if (!expected || expected === 0) return false
  return Math.abs((measured - expected) / expected * 100) <= 10
}

/**
 * Check if metering passes (error ≤5%)
 */
export function isMeteringPass(errorPct) {
  return Math.abs(errorPct) <= 5
}

/**
 * Check if fault locator reading passes (within ±5%)
 */
export function isFaultLocatorPass(measured, expected) {
  return Math.abs(meteringErrorPct(measured, expected)) <= 5
}

/**
 * Calculate expected fault locator distance in km
 * @param {number} faultPct   - Fault location as percentage of line (0-100)
 * @param {number} lineLength - Total line length in km
 * @returns {number} Expected distance in km
 */
export function expectedKm(faultPct, lineLength) {
  return (faultPct / 100) * lineLength
}

/**
 * Calculate recommended load blinder impedance setting
 * @param {number} kv       - Line voltage in kV
 * @param {number} cccAmps  - Continuous current capability in Amps
 * @returns {number} Recommended blinder impedance in Ohm (secondary)
 */
export function loadBlinderRecommended(kv, cccAmps) {
  if (!kv || !cccAmps || cccAmps === 0) return NaN
  return 0.8 * (kv * 1000 / Math.sqrt(3)) / (2 * cccAmps)
}

/**
 * Calculate recommended load blinder angle
 * @returns {number} Recommended angle in degrees (arccos(0.8) + 4°)
 */
export function loadBlinderAngle() {
  return (Math.acos(0.8) * 180 / Math.PI) + 4
}

/**
 * Calculate secondary phase voltage
 * @param {number} kvLine - Line-to-line voltage in kV
 * @param {number} vtP    - VT primary voltage
 * @param {number} vtS    - VT secondary voltage
 * @returns {number} Secondary phase voltage in V
 */
export function phaseVoltageSecondary(kvLine, vtP, vtS) {
  if (!vtP || !vtS || vtP === 0) return NaN
  const vtRatio = vtP / vtS
  return (kvLine * 1000 / vtRatio) / Math.sqrt(3)
}

/**
 * Format number to fixed decimal places
 * @param {number} val  - Value to format
 * @param {number} dec  - Decimal places (default 3)
 * @returns {string}
 */
export function fmt(val, dec = 3) {
  if (val == null || isNaN(val)) return '-'
  if (!isFinite(val)) return '∞'
  return val.toFixed(dec)
}

/**
 * Format error percentage with sign
 * @param {number} val - Error percentage value
 * @returns {string}
 */
export function fmtErr(val) {
  if (val == null || isNaN(val)) return '-'
  if (!isFinite(val)) return '∞'
  return (val >= 0 ? '+' : '') + val.toFixed(1) + '%'
}

/**
 * Format time in seconds
 * @param {number} val - Time in seconds
 * @param {number} dec - Decimal places
 */
export function fmtTime(val, dec = 3) {
  if (val == null || isNaN(val)) return '-'
  if (!isFinite(val)) return '∞'
  return val.toFixed(dec) + ' s'
}

/**
 * Convert secondary ohms to primary ohms
 * @param {number} secOhm - Impedance in secondary Ohms
 * @param {number} ctP    - CT primary rating
 * @param {number} ctS    - CT secondary rating
 * @param {number} vtP    - VT primary rating (V)
 * @param {number} vtS    - VT secondary rating (V)
 * @returns {number} Primary impedance in Ohms
 */
export function secToPrimOhm(secOhm, ctP, ctS, vtP, vtS) {
  if (!ctS || !vtP) return NaN
  const ctRatio = ctP / ctS
  const vtRatio = vtP / vtS
  return secOhm * vtRatio / ctRatio
}
