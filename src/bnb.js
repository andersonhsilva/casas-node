import { ethers } from 'ethers';

export function createBNBWallet() {
  const { mnemonic: { phrase } } = ethers.Wallet.createRandom();
  return buildBNBFromMnemonic(phrase);
}

export function recoverBNBWallet({ mnemonic, privateKey }) {
  if (mnemonic) return buildBNBFromMnemonic(mnemonic.trim());
  if (privateKey) return buildBNBFromPrivateKey(privateKey.trim());
  throw new Error('Informe mnemonic ou privateKey');
}

function buildBNBFromMnemonic(mnemonic) {
  const wallet = ethers.Wallet.fromPhrase(mnemonic);

  return {
    mnemonic,
    privateKey: wallet.privateKey,
    networks: {
      bnb: {
        network: 'BNB Smart Chain',
        address: wallet.address,
        contract: 'native currency',
      },
    },
  };
}

function buildBNBFromPrivateKey(privateKey) {
  const wallet = new ethers.Wallet(privateKey);

  return {
    mnemonic: null,
    privateKey: wallet.privateKey,
    networks: {
      bnb: {
        network: 'BNB Smart Chain',
        address: wallet.address,
        contract: 'native currency',
      },
    },
  };
}
