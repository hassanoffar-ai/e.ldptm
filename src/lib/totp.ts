/**
 * RFC 6238 Time-Based One-Time Password (TOTP) and RFC 4648 Base32 implementation.
 * Compatible with Google Authenticator, Microsoft Authenticator, and standard 2FA apps.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateBase32Secret(length = 20): string {
  const chars = BASE32_ALPHABET;
  let secret = '';
  const randomBytes = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  for (let i = 0; i < length; i++) {
    secret += chars[randomBytes[i] % chars.length];
  }
  return secret;
}

export function formatSecretForDisplay(secret: string): string {
  const clean = (secret || '').toUpperCase().replace(/[^A-Z2-7]/g, '');
  return clean.match(/.{1,4}/g)?.join(' ') || clean;
}

export function base32ToBytes(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) {
      continue;
    }
    bits += val.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

/**
 * Pure TypeScript SHA-1 HMAC fallback (ensures 100% reliability in all environments)
 */
function sha1(bytes: Uint8Array): Uint8Array {
  // Pre-processing
  const bitLen = bytes.length * 8;
  const withOne = new Uint8Array(bytes.length + 1);
  withOne.set(bytes);
  withOne[bytes.length] = 0x80;

  let padLen = 64 - ((withOne.length + 8) % 64);
  if (padLen === 64) padLen = 0;
  const totalLen = withOne.length + padLen + 8;
  const padded = new Uint8Array(totalLen);
  padded.set(withOne);

  const view = new DataView(padded.buffer);
  view.setBigUint64(totalLen - 8, BigInt(bitLen), false);

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const w = new Uint32Array(80);

  for (let i = 0; i < padded.length; i += 64) {
    for (let t = 0; t < 16; t++) {
      w[t] = view.getUint32(i + t * 4, false);
    }
    for (let t = 16; t < 80; t++) {
      const v = w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16];
      w[t] = (v << 1) | (v >>> 31);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let t = 0; t < 80; t++) {
      let f = 0;
      let k = 0;
      if (t < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (t < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (t < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[t]) >>> 0;
      e = d;
      d = c;
      c = ((b << 30) | (b >>> 2)) >>> 0;
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  const result = new Uint8Array(20);
  const outView = new DataView(result.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  return result;
}

function hmacSha1(key: Uint8Array, message: Uint8Array): Uint8Array {
  const blockSize = 64;
  let keyBytes = key;
  if (keyBytes.length > blockSize) {
    keyBytes = sha1(keyBytes);
  }
  if (keyBytes.length < blockSize) {
    const paddedKey = new Uint8Array(blockSize);
    paddedKey.set(keyBytes);
    keyBytes = paddedKey;
  }

  const oKeyPad = new Uint8Array(blockSize);
  const iKeyPad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = keyBytes[i] ^ 0x5c;
    iKeyPad[i] = keyBytes[i] ^ 0x36;
  }

  const innerMsg = new Uint8Array(blockSize + message.length);
  innerMsg.set(iKeyPad, 0);
  innerMsg.set(message, blockSize);
  const innerHash = sha1(innerMsg);

  const outerMsg = new Uint8Array(blockSize + innerHash.length);
  outerMsg.set(oKeyPad, 0);
  outerMsg.set(innerHash, blockSize);
  return sha1(outerMsg);
}

/**
 * Generate 6-digit TOTP code for a given timestamp step
 */
export function generateTotpForStep(secretBase32: string, step: number): string {
  const keyBytes = base32ToBytes(secretBase32);
  const counterBytes = new Uint8Array(8);
  const view = new DataView(counterBytes.buffer);
  view.setBigUint64(0, BigInt(step), false);

  const hash = hmacSha1(keyBytes, counterBytes);
  const offset = hash[hash.length - 1] & 0x0f;

  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Generate current TOTP code for a secret
 */
export function getCurrentTotp(secretBase32: string): string {
  const step = Math.floor(Date.now() / 1000 / 30);
  return generateTotpForStep(secretBase32, step);
}

/**
 * Verify 6-digit TOTP code with time drift window (default ±1 step = ±30 seconds)
 */
export function verifyTotpCode(
  inputCode: string,
  secretBase32: string,
  windowSteps = 1
): boolean {
  if (!inputCode || !secretBase32) return false;
  const cleanCode = inputCode.trim().replace(/\s+/g, '');
  if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) return false;

  const currentStep = Math.floor(Date.now() / 1000 / 30);

  // Check current, previous, and next time windows
  for (let offset = -windowSteps; offset <= windowSteps; offset++) {
    const validCode = generateTotpForStep(secretBase32, currentStep + offset);
    if (validCode === cleanCode) {
      return true;
    }
  }

  return false;
}

/**
 * Generate otpauth:// URI for QR code generation
 */
export function getTotpUri(username: string, secretBase32: string, issuer = 'E-LDPTM'): string {
  const encIssuer = encodeURIComponent(issuer);
  const encUser = encodeURIComponent(username);
  return `otpauth://totp/${encIssuer}:${encUser}?secret=${secretBase32.toUpperCase()}&issuer=${encIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Helper to get a ready-to-display QR code image URL
 */
export function getQrCodeImageUrl(otpauthUri: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(
    otpauthUri
  )}`;
}

