import { Request, Response, NextFunction } from 'express';
import { getBankStocks, setStocks } from '../services/stocks.service';

export async function getStocks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const stocks = await getBankStocks();
        res.status(200).json({ stocks: stocks });
    } catch (error) {
        next(error);
    }
}

export async function postStocks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { stocks } = req.body;

        if (!Array.isArray(stocks)) {
            res.status(400).json({ error: 'stocks must be an array '});
            return;
        }

        const isValid = stocks.every(s => 
            typeof s.name === 'string' && 
            s.name.trim() !== '' &&
            typeof s.quantity === 'number' && 
            s.quantity >= 0
        );

        if (!isValid) {
            res.status(400).json({ error: 'Invalid stock data' });
            return;
        }

        const names = stocks.map((s: { name: string }) => s.name);
        if (new Set(names).size !== names.length) {
            res.status(400).json({ error: 'Duplicate stock names are not allowed' });
            return;
        }

        await setStocks(stocks);
        res.status(200).send();
    } catch (error) {
        next(error);
    }
}