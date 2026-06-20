import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";

// @noble/ed25519 v2 ships without a hash bound, to stay dependency-free.
// Wire sha512 once so sync sign/verify work.
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

const hexToBytes = (h: string): Uint8Array => {
  const clean = h.startsWith("0x") ? h.slice(2) : h;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
};
const bytesToHex = (b: Uint8Array): string =>
  Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");

/** Signs event ids. The delegate key is the player's/agent's authority — self-sovereign. */
export interface Signer {
  readonly publicKeyHex: string;
  sign(messageHex: string): Promise<string>; // returns signature hex
}

/** Ed25519 signer from a hex private key (same key shape MemWal delegate keys use). */
export class Ed25519Signer implements Signer {
  readonly publicKeyHex: string;
  readonly #priv: Uint8Array;

  constructor(privateKeyHex: string) {
    this.#priv = hexToBytes(privateKeyHex);
    this.publicKeyHex = bytesToHex(ed.getPublicKey(this.#priv));
  }

  static generate(): Ed25519Signer {
    return new Ed25519Signer(bytesToHex(ed.utils.randomPrivateKey()));
  }

  async sign(messageHex: string): Promise<string> {
    return bytesToHex(ed.sign(hexToBytes(messageHex), this.#priv));
  }
}

export function verifySignature(messageHex: string, signatureHex: string, pubKeyHex: string): boolean {
  try {
    return ed.verify(hexToBytes(signatureHex), hexToBytes(messageHex), hexToBytes(pubKeyHex));
  } catch {
    return false;
  }
}
