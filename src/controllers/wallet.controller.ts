import { Request, Response, NextFunction } from 'express';
import { getWallet, getWalletStock, tradeStock } from '../services/wallets.service';

export async function getWalletHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const wallet_id = req.params.wallet_id as string;
        const wallet = await getWallet(wallet_id);

        if (wallet === null) {
            res.status(404).json({ error: 'Wallet not found' });
            return;
        }

        res.status(200).json(wallet);
    } catch (error) {
        next(error);
    }
}

export async function getWalletStockHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const wallet_id = req.params.wallet_id as string;
        const stock_name = req.params.stock_name as string;
        const quantity = await getWalletStock(wallet_id, stock_name);

        if (quantity === null) {
            res.status(404).json({ error: 'Wallet not found' });
            return;
        }

        res.status(200).json(quantity);
    } catch (error) {
        next(error);
    }
}

export async function tradeStockHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const wallet_id = req.params.wallet_id as string;
        const stock_name = req.params.stock_name as string;
        const type = req.body.type as string;

        if (type !== 'buy' && type !== 'sell') {
            res.status(400).json({ error: 'type must be "buy" or "sell"' });
            return;
        }

        await tradeStock(wallet_id, stock_name, type as 'buy' | 'sell');
        res.status(200).send();
    } catch (error) {
        next(error);
    }
}