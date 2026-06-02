import { Router } from 'express';
import connection from './database';
import { createUSDTWallets, recoverUSDTWallets, createUSDCWallets, recoverUSDCWallets } from './wallet';
import { createPEPEWallets, recoverPEPEWallets } from './pepe';
import { createDOGEWallet, recoverDOGEWallet } from './doge';
import { createBTCWallet, recoverBTCWallet } from './btc';
import { createETHWallet, recoverETHWallet } from './eth';
import { createBNBWallet, recoverBNBWallet } from './bnb';

const routes = new Router();

routes.get('/', (req, res) => {
  return res.json({ ok: true });
});

routes.get('/casas', async (req, res) => {
    const [rows] = await connection.query('SELECT * FROM casas');
    return res.json(rows);
});

routes.get('/wallet/usdt/new', (req, res) => {
  const wallets = createUSDTWallets();
  return res.json(wallets);
});

routes.post('/wallet/usdt/recover', (req, res) => {
  const { mnemonic, privateKey } = req.body;

  if (!mnemonic && !privateKey) {
    return res.status(400).json({ error: 'Informe mnemonic ou privateKey no body' });
  }

  try {
    const wallets = recoverUSDTWallets({ mnemonic, privateKey });
    return res.json(wallets);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

routes.get('/wallet/usdc/new', (req, res) => {
  const wallets = createUSDCWallets();
  return res.json(wallets);
});

routes.post('/wallet/usdc/recover', (req, res) => {
  const { mnemonic, privateKey } = req.body;

  if (!mnemonic && !privateKey) {
    return res.status(400).json({ error: 'Informe mnemonic ou privateKey no body' });
  }

  try {
    const wallets = recoverUSDCWallets({ mnemonic, privateKey });
    return res.json(wallets);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

routes.get('/wallet/btc/new', (req, res) => {
  const wallet = createBTCWallet();
  return res.json(wallet);
});

routes.post('/wallet/btc/recover', (req, res) => {
  const { mnemonic, privateKey } = req.body;

  if (!mnemonic && !privateKey) {
    return res.status(400).json({ error: 'Informe mnemonic ou privateKey no body' });
  }

  try {
    const wallet = recoverBTCWallet({ mnemonic, privateKey });
    return res.json(wallet);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

routes.get('/wallet/eth/new', (req, res) => {
  const wallet = createETHWallet();
  return res.json(wallet);
});

routes.post('/wallet/eth/recover', (req, res) => {
  const { mnemonic, privateKey } = req.body;

  if (!mnemonic && !privateKey) {
    return res.status(400).json({ error: 'Informe mnemonic ou privateKey no body' });
  }

  try {
    const wallet = recoverETHWallet({ mnemonic, privateKey });
    return res.json(wallet);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

routes.get('/wallet/bnb/new', (req, res) => {
  const wallet = createBNBWallet();
  return res.json(wallet);
});

routes.post('/wallet/bnb/recover', (req, res) => {
  const { mnemonic, privateKey } = req.body;

  if (!mnemonic && !privateKey) {
    return res.status(400).json({ error: 'Informe mnemonic ou privateKey no body' });
  }

  try {
    const wallet = recoverBNBWallet({ mnemonic, privateKey });
    return res.json(wallet);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

routes.get('/wallet/pepe/new', (req, res) => {
  const wallet = createPEPEWallets();
  return res.json(wallet);
});

routes.post('/wallet/pepe/recover', (req, res) => {
  const { mnemonic, privateKey } = req.body;

  if (!mnemonic && !privateKey) {
    return res.status(400).json({ error: 'Informe mnemonic ou privateKey no body' });
  }

  try {
    const wallet = recoverPEPEWallets({ mnemonic, privateKey });
    return res.json(wallet);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

routes.get('/wallet/doge/new', (req, res) => {
  const wallet = createDOGEWallet();
  return res.json(wallet);
});

routes.post('/wallet/doge/recover', (req, res) => {
  const { mnemonic, privateKey } = req.body;

  if (!mnemonic && !privateKey) {
    return res.status(400).json({ error: 'Informe mnemonic ou privateKey no body' });
  }

  try {
    const wallet = recoverDOGEWallet({ mnemonic, privateKey });
    return res.json(wallet);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

export default routes;