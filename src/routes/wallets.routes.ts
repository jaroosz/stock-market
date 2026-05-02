import { Router } from 'express';
import { getWalletHandler, getWalletStockHandler, tradeStockHandler } from '../controllers/wallet.controller';

const router = Router();

router.get('/:wallet_id', getWalletHandler);
router.get('/:wallet_id/stocks/:stock_name', getWalletStockHandler);
router.post('/:wallet_id/stocks/:stock_name', tradeStockHandler);

export default router;