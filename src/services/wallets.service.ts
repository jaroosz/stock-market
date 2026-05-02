import { walletExists } from "../dal/wallets.dal";
import { getAllWalletStocks, getWalletStockQuantity } from "../dal/wallet_stocks.dal";
import { Wallet } from '../models/types';
import { bankStockExists } from "../dal/bank_stocks.dal";
import { AppError } from "../models/errors";
import { executeBuy, executeSell } from "../dal/trade.dal";

export async function getWallet(walletId: string): Promise<Wallet | null> {
    if (!(await walletExists(walletId))) {
        return null;
    }

    const stocks = await getAllWalletStocks(walletId);
    return { id: walletId, stocks };
}

export async function getWalletStock(walletId: string, stockName: string): Promise<number | null> {
    if (!(await walletExists(walletId))) {
        return null;
    }

    const quantity = await getWalletStockQuantity(walletId, stockName);
    return quantity;
}

export async function tradeStock(walletId: string, stockName: string, type: "buy" | "sell"): Promise<void> {
    if (type === "buy") {
        if (!(await bankStockExists(stockName))) {
            throw new AppError(404, 'Stock does not exist');
        }
        await executeBuy(walletId, stockName);
    } else {
        await executeSell(walletId, stockName);
    }
}