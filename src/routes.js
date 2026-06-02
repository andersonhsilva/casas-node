import { Router } from 'express';
import connection from './database';

const routes = new Router();

routes.get('/', (req, res) => {
  return res.json({ ok: true });
});

routes.get('/casas', async (req, res) => {
    const [rows] = await connection.query('SELECT * FROM casas');
    return res.json(rows);
});

export default routes;