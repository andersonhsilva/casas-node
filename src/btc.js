import { createHash } from 'crypto';
import { ethers } from 'ethers';

function sha256(data) {
  return createHash('sha256').update(data).digest();
}

function hash160(data) {
  return createHash('ripemd160').update(sha256(data)).digest();
}

function base58Check(payload) {
  const checksum = sha256(sha256(payload)).slice(0, 4);
  const full = Buffer.concat([payload, checksum]);

  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let num = BigInt('0x' + full.toString('hex'));
  let result = '';
  while (num > 0n) {
    result = ALPHABET[Number(num % 58n)] + result;
    num /= 58n;
  }
  for (const byte of full) {
    if (byte !== 0) break;
    result = '1' + result;
  }
  return result;
}

const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const BECH32_GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

function bech32Polymod(values) {
  let chk = 1;
  for (const v of values) {
    const b = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((b >> i) & 1) chk ^= BECH32_GEN[i];
    }
  }
  return chk;
}

function bech32Encode(hrp, data) {
  const hrpExpand = [
    ...hrp.split('').map(c => c.charCodeAt(0) >> 5),
    0,
    ...hrp.split('').map(c => c.charCodeAt(0) & 31),
  ];
  const polymod = bech32Polymod([...hrpExpand, ...data, 0, 0, 0, 0, 0, 0]) ^ 1;
  const checksum = Array.from({ length: 6 }, (_, i) => (polymod >> (5 * (5 - i))) & 31);
  return hrp + '1' + [...data, ...checksum].map(d => BECH32_CHARSET[d]).join('');
}

function convertBits(data, from, to) {
  let acc = 0, bits = 0;
  const result = [];
  const maxv = (1 << to) - 1;
  for (const value of data) {
    acc = (acc << from) | value;
    bits += from;
    while (bits >= to) {
      bits -= to;
      result.push((acc >> bits) & maxv);
    }
  }
  if (bits > 0) result.push((acc << (to - bits)) & maxv);
  return result;
}

function toNativeSegwitAddress(pubkeyHex) {
  const pubkey = Buffer.from(pubkeyHex.slice(2), 'hex');
  const pkHash = hash160(pubkey);
  return bech32Encode('bc', [0, ...convertBits(pkHash, 8, 5)]);
}

function toWIF(privateKeyHex) {
  const key = Buffer.from(privateKeyHex.slice(2), 'hex');
  return base58Check(Buffer.concat([Buffer.from([0x80]), key, Buffer.from([0x01])]));
}

export function createBTCWallet() {
  const { mnemonic: { phrase } } = ethers.Wallet.createRandom();
  return buildBTCFromMnemonic(phrase);
}

export function recoverBTCWallet({ mnemonic, privateKey }) {
  if (mnemonic) return buildBTCFromMnemonic(mnemonic.trim());
  if (privateKey) return buildBTCFromPrivateKey(privateKey.trim());
  throw new Error('Informe mnemonic ou privateKey');
}

function compressedPubkey(wallet) {
  return ethers.SigningKey.computePublicKey(wallet.signingKey.publicKey, true);
}

function buildBTCFromMnemonic(mnemonic) {
  const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, "m/84'/0'/0'/0/0");
  const pubkey = compressedPubkey(wallet);

  return {
    mnemonic,
    privateKeyNativeSegwit: toWIF(wallet.privateKey),
    networks: {
      btc: {
        network: 'Bitcoin Native SegWit (P2WPKH)',
        address: toNativeSegwitAddress(pubkey),
        contract: 'native currency'
      },
    },
  };
}

function buildBTCFromPrivateKey(privateKey) {
  const wallet = new ethers.Wallet(privateKey);
  const pubkey = ethers.SigningKey.computePublicKey(wallet.signingKey.publicKey, true);

  return {
    mnemonic: null,
    privateKeyNativeSegwit: toWIF(privateKey),
    networks: {
      btc: {
        network: 'Bitcoin Native SegWit (P2WPKH)',
        address: toNativeSegwitAddress(pubkey),
        contract: 'native currency'
      },
    },
  };
}
