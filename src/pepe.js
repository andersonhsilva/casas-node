import { ethers } from 'ethers';
import { createHmac, createPrivateKey, createPublicKey } from 'crypto';

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(buffer) {
  let num = BigInt('0x' + buffer.toString('hex'));
  let result = '';
  while (num > 0n) {
    result = BASE58_ALPHABET[Number(num % 58n)] + result;
    num /= 58n;
  }
  for (const byte of buffer) {
    if (byte !== 0) break;
    result = '1' + result;
  }
  return result;
}

// SLIP-0010 Ed25519 HD derivation (usado pela Solana)
function deriveEd25519(seed, path) {
  let I = createHmac('sha512', Buffer.from('ed25519 seed')).update(seed).digest();
  let key = Buffer.from(I.slice(0, 32));
  let chainCode = Buffer.from(I.slice(32));

  for (const index of path) {
    const buf = Buffer.allocUnsafe(4);
    buf.writeUInt32BE(index);
    const data = Buffer.concat([Buffer.from([0x00]), key, buf]);
    I = createHmac('sha512', chainCode).update(data).digest();
    key = Buffer.from(I.slice(0, 32));
    chainCode = Buffer.from(I.slice(32));
  }

  return key;
}

// m/44'/501'/0'/0'
const SOL_PATH = [0x8000002c, 0x800001f5, 0x80000000, 0x80000000];

// Prefixo PKCS8 DER para Ed25519 no Node.js crypto
const ED25519_PKCS8_PREFIX = Buffer.from('302e020100300506032b657004220420', 'hex');

function solanaAddressFromPrivKey(privateKeyBytes) {
  const pkcs8 = Buffer.concat([ED25519_PKCS8_PREFIX, privateKeyBytes]);
  const privKeyObj = createPrivateKey({ key: pkcs8, format: 'der', type: 'pkcs8' });
  const pubKeyObj = createPublicKey(privKeyObj);
  const spki = pubKeyObj.export({ format: 'der', type: 'spki' });
  return base58Encode(spki.slice(12)); // 12 bytes de header SPKI + 32 bytes de chave
}

function mnemonicToSeedBytes(mnemonic) {
  const hex = ethers.Mnemonic.fromPhrase(mnemonic).computeSeed();
  return Buffer.from(hex.slice(2), 'hex');
}

const CONTRACTS = {
  erc20: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
  solana: 'HZ1JovNiVvGqSuQkZAoaYnPh9cr7pVjnpKe4BkroAkfg',
};

export function createPEPEWallets() {
  const { mnemonic: { phrase } } = ethers.Wallet.createRandom();
  return buildFromMnemonic(phrase);
}

export function recoverPEPEWallets({ mnemonic, privateKey }) {
  if (mnemonic) return buildFromMnemonic(mnemonic.trim());
  if (privateKey) return buildFromPrivateKey(privateKey.trim());
  throw new Error('Informe mnemonic ou privateKey');
}

function buildFromMnemonic(mnemonic) {
  const evmWallet = ethers.Wallet.fromPhrase(mnemonic);
  const seed = mnemonicToSeedBytes(mnemonic);
  const solPrivKey = deriveEd25519(seed, SOL_PATH);

  return {
    mnemonic,
    privateKeyEVM: evmWallet.privateKey,
    privateKeySolana: base58Encode(solPrivKey),
    networks: {
      erc20: {
        network: 'Ethereum (ERC-20)',
        address: evmWallet.address,
        contract: CONTRACTS.erc20,
      },
      solana: {
        network: 'Solana (SPL)',
        address: solanaAddressFromPrivKey(solPrivKey),
        contract: CONTRACTS.solana,
      },
    },
  };
}

function buildFromPrivateKey(privateKey) {
  const evmWallet = new ethers.Wallet(privateKey);

  return {
    mnemonic: null,
    privateKeyEVM: evmWallet.privateKey,
    privateKeySolana: null,
    networks: {
      erc20: {
        network: 'Ethereum (ERC-20)',
        address: evmWallet.address,
        contract: CONTRACTS.erc20,
      },
      solana: {
        network: 'Solana (SPL)',
        address: null,
        contract: CONTRACTS.solana,
      },
    },
  };
}
