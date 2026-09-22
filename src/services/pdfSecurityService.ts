import { PDFDocument, PDFName, PDFNumber, PDFHexString, PDFDict, PDFRawStream } from 'pdf-lib';

/**
 * PDF Security & Password Encryption Service
 * Implements ISO 32000-1 (PDF Standard Specification) Algorithm 3.1, 3.2, 3.3, and 3.5
 * Standard Security Handler (Revision 3 / 128-bit RC4 Encryption)
 */

// 32-byte constant padding defined by ISO 32000-1 (PDF Spec Section 7.6.3.3)
const PADDING = new Uint8Array([
  0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41, 0x64, 0x00, 0x4e, 0x56, 0xff, 0xfa, 0x01, 0x08,
  0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80, 0x2f, 0x0c, 0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a,
]);

/**
 * Pure TypeScript MD5 Hash Function
 */
function md5(bytes: Uint8Array): Uint8Array {
  const K = new Uint32Array([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ]);

  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  const bitLen = bytes.length * 8;
  const paddingLen = bytes.length % 64 < 56 ? 56 - (bytes.length % 64) : 120 - (bytes.length % 64);
  const msg = new Uint8Array(bytes.length + paddingLen + 8);
  msg.set(bytes);
  msg[bytes.length] = 0x80;

  const dv = new DataView(msg.buffer);
  dv.setUint32(msg.length - 8, bitLen & 0xffffffff, true);
  dv.setUint32(msg.length - 4, Math.floor(bitLen / 0x100000000), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let i = 0; i < msg.length; i += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      M[j] = dv.getUint32(i + j * 4, true);
    }

    let A = a0, B = b0, C = c0, D = d0;

    for (let j = 0; j < 64; j++) {
      let F = 0, g = 0;
      if (j < 16) {
        F = (B & C) | (~B & D);
        g = j;
      } else if (j < 32) {
        F = (D & B) | (~D & C);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        F = B ^ C ^ D;
        g = (3 * j + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * j) % 16;
      }

      const temp = D;
      D = C;
      C = B;
      const sum = (A + F + K[j] + M[g]) >>> 0;
      const rot = (sum << S[j]) | (sum >>> (32 - S[j]));
      B = (B + rot) >>> 0;
      A = temp;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const res = new Uint8Array(16);
  const resDv = new DataView(res.buffer);
  resDv.setUint32(0, a0, true);
  resDv.setUint32(4, b0, true);
  resDv.setUint32(8, c0, true);
  resDv.setUint32(12, d0, true);
  return res;
}

/**
 * Pure TypeScript RC4 Stream Cipher
 */
function rc4(key: Uint8Array, data: Uint8Array): Uint8Array {
  const S = new Uint8Array(256);
  for (let i = 0; i < 256; i++) S[i] = i;

  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + key[i % key.length]) & 255;
    const tmp = S[i];
    S[i] = S[j];
    S[j] = tmp;
  }

  let i = 0;
  j = 0;
  const out = new Uint8Array(data.length);
  for (let k = 0; k < data.length; k++) {
    i = (i + 1) & 255;
    j = (j + S[i]) & 255;
    const tmp = S[i];
    S[i] = S[j];
    S[j] = tmp;
    out[k] = data[k] ^ S[(S[i] + S[j]) & 255];
  }
  return out;
}

function padPassword(pwd: string): Uint8Array {
  const enc = new TextEncoder().encode(pwd);
  const out = new Uint8Array(32);
  if (enc.length >= 32) {
    out.set(enc.subarray(0, 32));
  } else {
    out.set(enc);
    out.set(PADDING.subarray(0, 32 - enc.length), enc.length);
  }
  return out;
}

function hexString(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join('');
}

export class PdfSecurityService {
  /**
   * Applies ISO 32000-1 PDF Standard 1.7 Encryption directly to a PDFDocument instance
   */
  static applyPasswordProtectionToDoc(
    pdfDoc: PDFDocument,
    userPassword: string,
    ownerPassword?: string
  ): void {
    if (!userPassword) return;

    const ownerPwd = ownerPassword || userPassword;

    // 1. Extract or register document File ID in trailerInfo.ID
    let fileIdBytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) fileIdBytes[i] = (i * 17 + 42) & 255;

    const existingIdObj = pdfDoc.context.trailerInfo.ID;
    if (existingIdObj && 'size' in existingIdObj && (existingIdObj as any).size() > 0) {
      try {
        const firstId = (existingIdObj as any).get(0);
        if (firstId && typeof firstId.asBytes === 'function') {
          const rawId = firstId.asBytes();
          if (rawId && rawId.length > 0) {
            fileIdBytes = rawId;
          }
        }
      } catch (err) {
        console.warn('Using fallback file ID:', err);
      }
    } else {
      const hexId = PDFHexString.of(hexString(fileIdBytes));
      pdfDoc.context.trailerInfo.ID = pdfDoc.context.obj([hexId, hexId]);
    }

    // 2. Prepare padded passwords (Algorithm 3.2 step 1)
    const paddedUser = padPassword(userPassword);
    const paddedOwner = padPassword(ownerPwd);

    // 3. Compute Owner Password Value (/O) - ISO 32000-1 Algorithm 3.3
    let oHash = md5(paddedOwner);
    for (let i = 0; i < 50; i++) {
      oHash = md5(oHash);
    }
    const oKey = oHash.subarray(0, 16);
    let oOut = rc4(oKey, paddedUser);
    for (let i = 1; i <= 19; i++) {
      const keyI = new Uint8Array(16);
      for (let k = 0; k < 16; k++) keyI[k] = oKey[k] ^ i;
      oOut = rc4(keyI, oOut);
    }
    const oEntry = oOut; // 32 bytes

    // 4. Permissions flags P = -1028 (0xFFFFFBE0)
    const pValue = -1028;
    const pBytes = new Uint8Array(4);
    const dv = new DataView(pBytes.buffer);
    dv.setInt32(0, pValue, true); // Little endian

    // 5. Compute User Encryption Key (encryptionKey) - ISO 32000-1 Algorithm 3.2
    const hashBuf = new Uint8Array(32 + 32 + 4 + fileIdBytes.length);
    hashBuf.set(paddedUser, 0);
    hashBuf.set(oEntry, 32);
    hashBuf.set(pBytes, 64);
    hashBuf.set(fileIdBytes, 68);

    let uHashBuf = md5(hashBuf);
    for (let i = 0; i < 50; i++) {
      uHashBuf = md5(uHashBuf);
    }
    const encryptionKey = uHashBuf.subarray(0, 16); // 128-bit key

    // 6. Compute User Password Value (/U) - ISO 32000-1 Algorithm 3.5 (R=3)
    const uInput = new Uint8Array(32 + fileIdBytes.length);
    uInput.set(PADDING, 0);
    uInput.set(fileIdBytes, 32);

    const uMd5 = md5(uInput); // 16 bytes
    let uOut = rc4(encryptionKey, uMd5);
    for (let i = 1; i <= 19; i++) {
      const keyI = new Uint8Array(16);
      for (let k = 0; k < 16; k++) keyI[k] = encryptionKey[k] ^ i;
      uOut = rc4(keyI, uOut);
    }

    const uEntry = new Uint8Array(32);
    uEntry.set(uOut, 0); // First 16 bytes
    uEntry.subarray(16, 32).fill(0); // 16-byte padding per PDF spec

    const hexO = hexString(oEntry);
    const hexU = hexString(uEntry);

    // 7. Register Encrypt PDFDict in pdfDoc.context
    const encryptDict = PDFDict.withContext(pdfDoc.context);
    encryptDict.set(PDFName.of('Filter'), PDFName.of('Standard'));
    encryptDict.set(PDFName.of('V'), PDFNumber.of(2));
    encryptDict.set(PDFName.of('R'), PDFNumber.of(3));
    encryptDict.set(PDFName.of('Length'), PDFNumber.of(128));
    encryptDict.set(PDFName.of('P'), PDFNumber.of(pValue));
    encryptDict.set(PDFName.of('O'), PDFHexString.of(hexO));
    encryptDict.set(PDFName.of('U'), PDFHexString.of(hexU));

    const encryptRef = pdfDoc.context.register(encryptDict);
    pdfDoc.context.trailerInfo.Encrypt = encryptRef;

    // 8. Encrypt all indirect stream object payloads with per-object RC4 keys (ISO 32000-1 Algorithm 3.1)
    const indirectObjects = pdfDoc.context.enumerateIndirectObjects();
    for (const [ref, object] of indirectObjects) {
      if (ref === encryptRef) continue;

      if (object && typeof (object as any).getContents === 'function' && (object as any).dict) {
        try {
          const contents = (object as any).getContents();
          if (contents && contents.length > 0) {
            const objNum = ref.objectNumber;
            const genNum = ref.generationNumber || 0;

            const keyBuf = new Uint8Array(encryptionKey.length + 5);
            keyBuf.set(encryptionKey, 0);
            keyBuf[encryptionKey.length] = objNum & 255;
            keyBuf[encryptionKey.length + 1] = (objNum >> 8) & 255;
            keyBuf[encryptionKey.length + 2] = (objNum >> 16) & 255;
            keyBuf[encryptionKey.length + 3] = genNum & 255;
            keyBuf[encryptionKey.length + 4] = (genNum >> 8) & 255;

            const objKey = md5(keyBuf).subarray(0, 16);
            const encryptedContents = rc4(objKey, contents);

            const rawStream = PDFRawStream.of((object as any).dict, encryptedContents);
            pdfDoc.context.assign(ref, rawStream);
          }
        } catch (err) {
          console.warn('Stream encryption fallback for object', ref, err);
        }
      }
    }
  }
}
