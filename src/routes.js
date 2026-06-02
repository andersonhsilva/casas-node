import { Router } from 'express';
import connection from './database';
import { createUSDTWallets, recoverUSDTWallets, createUSDCWallets, recoverUSDCWallets } from './wallet';
import { createBTCWallet, recoverBTCWallet } from './btc';

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

export default routes;