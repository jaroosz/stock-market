import { Router } from 'express';
import { getStocks, postStocks } from '../controllers/stocks.controller';

const router = Router();

router.get('/', getStocks);
router.post('/', postStocks);

export default router;