import { Request, Response, NextFunction } from 'express';
import { getLogs } from '../services/log.service';

export async function getLog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const logs = await getLogs();
        res.status(200).json({ log: logs });
    } catch (error) {
        next(error);
    }
}