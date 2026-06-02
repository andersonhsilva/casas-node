import { ethers } from 'ethers';
import { createHash } from 'crypto';

function sha256(data) {
  return createHash('sha256').update(data).digest();
}

function hash160(data) {
  return createHash('ripemd160').update(sha256(data)).digest();
}

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Check(payload) {
  const checksum = sha256(sha256(payload)).slice(0, 4);
  const full = Buffer.concat([payload, checksum]);
  let num = BigInt('0x' + full.toString('hex'));
  let result = '';
  while (num > 0n) {
    result = BASE58_ALPHABET[Number(num % 58n)] + result;
    num /= 58n;
  }
  for (const byte of full) {
    if (byte !== 0) break;
    result = '1' + result;
  }
  return result;
}

function toDogeAddress(pubkeyHex) {
  const pubkey = Buffer.from(pubkeyHex.slice(2), 'hex');
  return base58Check(Buffer.concat([Buffer.from([0x1e]), hash160(pubkey)]));
}

function toWIF(privateKeyHex) {
  const key = Buffer.from(privateKeyHex.slice(2), 'hex');
  return base58Check(Buffer.concat([Buffer.from([0x9e]), key, Buffer.from([0x01])]));
}

export function createDOGEWallet() {
  const { mnemonic: { phrase } } = ethers.Wallet.createRandom();
  return buildDOGEFromMnemonic(phrase);
}

export function recoverDOGEWallet({ mnemonic, privateKey }) {
  if (mnemonic) return buildDOGEFromMnemonic(mnemonic.trim());
  if (privateKey) return buildDOGEFromPrivateKey(privateKey.trim());
  throw new Error('Informe mnemonic ou privateKey');
}

const BEP20_CONTRACT = '0xbA2aE424d960c26247Dd6c32edC70B295c744C43';

function buildDOGEFromMnemonic(mnemonic) {
  const dogeWallet = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, "m/44'/3'/0'/0/0");
  const pubkey = ethers.SigningKey.computePublicKey(dogeWallet.signingKey.publicKey, true);
  const evmWallet = ethers.Wallet.fromPhrase(mnemonic);

  return {
    mnemonic,
    privateKeyWIF: toWIF(dogeWallet.privateKey),
    privateKeyEVM: evmWallet.privateKey,
    networks: {
      doge: {
        network: 'Dogecoin',
        address: toDogeAddress(pubkey),
        contract: 'native currency',
      },
      bep20: {
        network: 'BNB Smart Chain (BEP-20)',
        address: evmWallet.address,
        contract: BEP20_CONTRACT,
      },
    },
  };
}

function buildDOGEFromPrivateKey(privateKey) {
  const wallet = new ethers.Wallet(privateKey);
  const pubkey = ethers.SigningKey.computePublicKey(wallet.signingKey.publicKey, true);

  return {
    mnemonic: null,
    privateKeyWIF: toWIF(privateKey),
    privateKeyEVM: wallet.privateKey,
    networks: {
      doge: {
        network: 'Dogecoin',
        address: toDogeAddress(pubkey),
        contract: 'native currency',
      },
      bep20: {
        network: 'BNB Smart Chain (BEP-20)',
        address: wallet.address,
        contract: BEP20_CONTRACT,
      },
    },
  };
}
