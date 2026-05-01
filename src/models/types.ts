/** Single stock with quantity */
export interface Stock {
    name: string;
    quantity: number;
}

/** API response containing all stocks obtained by wallet */
export interface Wallet {
    id: string;
    stocks: Stock[];
}

/** API response containing all successful operations i order of occurrence */
export interface Log {
    type: 'buy' | 'sell';
    wallet_id: string;
    stock_name: string;
}