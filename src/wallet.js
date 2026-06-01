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

function buildNetworks(evmAddress, tronAddress) {
  return Object.fromEntries(
    Object.entries(USDT_NETWORKS).map(([key, info]) => [
      key,
      {
        network: info.name,
        address: key === 'trc20' ? tronAddress : evmAddress,
        contract: info.contract,
      },
    ])
  );
}

function buildFromMnemonic(mnemonic) {
  const evmWallet = ethers.Wallet.fromPhrase(mnemonic);
  const tronWallet = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, "m/44'/195'/0'/0/0");

  return {
    mnemonic,
    privateKeyEVM: evmWallet.privateKey,
    privateKeyTron: tronWallet.privateKey,
    networks: buildNetworks(evmWallet.address, toTronAddress(tronWallet.address)),
  };
}

function buildFromPrivateKey(privateKey) {
  const evmWallet = new ethers.Wallet(privateKey);

  return {
    mnemonic: null,
    privateKeyEVM: evmWallet.privateKey,
    privateKeyTron: evmWallet.privateKey,
    networks: buildNetworks(evmWallet.address, toTronAddress(evmWallet.address)),
  };
}

export function createUSDTWallets() {
  const { mnemonic: { phrase } } = ethers.Wallet.createRandom();
  return buildFromMnemonic(phrase);
}

export function recoverUSDTWallets({ mnemonic, privateKey }) {
  if (mnemonic) return buildFromMnemonic(mnemonic.trim());
  if (privateKey) return buildFromPrivateKey(privateKey.trim());
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
