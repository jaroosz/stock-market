import { getAllBankStocks, setBankStocks } from "../dal/bank_stocks.dal";
import { Stock } from "../models/types";

export async function getBankStocks(): Promise<Stock[]> {
    return await getAllBankStocks();
}

export async function setStocks(stocks: Stock[]): Promise<void> {
    await setBankStocks(stocks);
}