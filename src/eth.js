import { ethers } from 'ethers';

export function createETHWallet() {
  const { mnemonic: { phrase } } = ethers.Wallet.createRandom();
  return buildETHFromMnemonic(phrase);
}

export function recoverETHWallet({ mnemonic, privateKey }) {
  if (mnemonic) return buildETHFromMnemonic(mnemonic.trim());
  if (privateKey) return buildETHFromPrivateKey(privateKey.trim());
  throw new Error('Informe mnemonic ou privateKey');
}

function buildETHFromMnemonic(mnemonic) {
  const wallet = ethers.Wallet.fromPhrase(mnemonic);

  return {
    mnemonic,
    privateKey: wallet.privateKey,
    networks: {
      eth: {
        network: 'Ethereum',
        address: wallet.address,
        contract: 'native currency',
      },
    },
  };
}

function buildETHFromPrivateKey(privateKey) {
  const wallet = new ethers.Wallet(privateKey);

  return {
    mnemonic: null,
    privateKey: wallet.privateKey,
    networks: {
      eth: {
        network: 'Ethereum',
        address: wallet.address,
        contract: 'native currency',
      },
    },
  };
}
