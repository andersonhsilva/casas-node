import { ethers } from 'ethers';
import { createHash } from 'crypto';

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

// Deriva o endereço TRC-20 a partir do endereço EVM (mesma curva secp256k1)
function toTronAddress(evmAddress) {
  const raw = Buffer.from('41' + evmAddress.slice(2).toLowerCase(), 'hex');
  const hash1 = createHash('sha256').update(raw).digest();
  const hash2 = createHash('sha256').update(hash1).digest();
  const checksum = hash2.slice(0, 4);
  return base58Encode(Buffer.concat([raw, checksum]));
}

const USDT_NETWORKS = {
  erc20: {
    name: 'Ethereum (ERC-20)',
    contract: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  bep20: {
    name: 'BNB Smart Chain (BEP-20)',
    contract: '0x55d398326f99059fF775485246999027B3197955',
  },
  polygon: {
    name: 'Polygon (PoS)',
    contract: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  },
  arbitrum: {
    name: 'Arbitrum One',
    contract: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  },
  optimism: {
    name: 'Optimism',
    contract: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
  },
  trc20: {
    name: 'Tron (TRC-20)',
    contract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  },
};

const USDC_NETWORKS = {
  erc20: {
    name: 'Ethereum (ERC-20)',
    contract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  bep20: {
    name: 'BNB Smart Chain (BEP-20)',
    contract: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  },
  polygon: {
    name: 'Polygon (PoS)',
    contract: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  },
  arbitrum: {
    name: 'Arbitrum One',
    contract: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  },
  optimism: {
    name: 'Optimism',
    contract: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  },
};

function buildNetworks(networkConfig, evmAddress, tronAddress) {
  return Object.fromEntries(
    Object.entries(networkConfig).map(([key, info]) => [
      key,
      {
        network: info.name,
        address: key === 'trc20' ? tronAddress : evmAddress,
        contract: info.contract,
      },
    ])
  );
}

function buildFromMnemonic(networkConfig, mnemonic) {
  const evmWallet = ethers.Wallet.fromPhrase(mnemonic);
  const hasTron = 'trc20' in networkConfig;
  const tronWallet = hasTron
    ? ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, "m/44'/195'/0'/0/0")
    : null;

  return {
    mnemonic,
    privateKeyEVM: evmWallet.privateKey,
    ...(hasTron && { privateKeyTron: tronWallet.privateKey }),
    networks: buildNetworks(networkConfig, evmWallet.address, hasTron ? toTronAddress(tronWallet.address) : null),
  };
}

function buildFromPrivateKey(networkConfig, privateKey) {
  const evmWallet = new ethers.Wallet(privateKey);
  const hasTron = 'trc20' in networkConfig;

  return {
    mnemonic: null,
    privateKeyEVM: evmWallet.privateKey,
    ...(hasTron && { privateKeyTron: evmWallet.privateKey }),
    networks: buildNetworks(networkConfig, evmWallet.address, hasTron ? toTronAddress(evmWallet.address) : null),
  };
}

export function createUSDTWallets() {
  const { mnemonic: { phrase } } = ethers.Wallet.createRandom();
  return buildFromMnemonic(USDT_NETWORKS, phrase);
}

export function recoverUSDTWallets({ mnemonic, privateKey }) {
  if (mnemonic) return buildFromMnemonic(USDT_NETWORKS, mnemonic.trim());
  if (privateKey) return buildFromPrivateKey(USDT_NETWORKS, privateKey.trim());
  throw new Error('Informe mnemonic ou privateKey');
}

export function createUSDCWallets() {
  const { mnemonic: { phrase } } = ethers.Wallet.createRandom();
  return buildFromMnemonic(USDC_NETWORKS, phrase);
}

export function recoverUSDCWallets({ mnemonic, privateKey }) {
  if (mnemonic) return buildFromMnemonic(USDC_NETWORKS, mnemonic.trim());
  if (privateKey) return buildFromPrivateKey(USDC_NETWORKS, privateKey.trim());
  throw new Error('Informe mnemonic ou privateKey');
}

export function createWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase,
  };
}

export function walletFromMnemonic(mnemonic) {
  const wallet = ethers.Wallet.fromPhrase(mnemonic);
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic,
  };
}

export function walletFromPrivateKey(privateKey) {
  const wallet = new ethers.Wallet(privateKey);
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}
