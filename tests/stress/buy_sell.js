import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const buySuccessCount  = new Counter('trades_buy_success');
const buyFailCount     = new Counter('trades_buy_fail');
const sellSuccessCount = new Counter('trades_sell_success');
const sellFailCount    = new Counter('trades_sell_fail');

const BASE_URL = `http://host.docker.internal:${__ENV.PORT || 3000}`;
const STOCKS  = ['AAPL', 'GOOGL', 'MSFT', 'DJIA', 'SPX'];
const WALLETS = Array.from({ length: 10 }, (_, i) => `wallet-${i + 1}`);
const CHAOS_VU   = 1;
const CHAOS_ITER = 50;

export const options = {
    vus: 10,
    iterations: 1000,
};

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// setup
export function setup() {
    const res = http.post(
        `${BASE_URL}/stocks`,
        JSON.stringify({
            stocks: [
                { name: 'AAPL', quantity: 100  },
                { name: 'GOOGL', quantity: 500  },
                { name: 'MSFT', quantity: 500  },
                { name: 'DJIA', quantity: 1500 },
                { name: 'SPX', quantity: 350  },
            ],
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );
    check(res, { 'bank setup OK': (r) => r.status === 200 });

    const stocksRes   = http.get(`${BASE_URL}/stocks`);
    const stocks      = JSON.parse(stocksRes.body).stocks;
    const initialTotal = stocks.reduce((sum, s) => sum + s.quantity, 0);

    return { initialTotal };
}

// main scenario
export default function () {
    const walletId  = randomItem(WALLETS);
    const stockName = randomItem(STOCKS);

    // kill 1 instance
    if (__VU === CHAOS_VU && __ITER === CHAOS_ITER) {
        const chaosRes = http.post(`${BASE_URL}/chaos`);
        check(chaosRes, { 'chaos accepted': (r) => r.status === 200 || r.status === 503 });
        sleep(1);
        return;
    }

    // incorrect operations
    if (Math.random() < 0.03) {
        if (Math.random() < 0.5) {
            const res = http.post(
                `${BASE_URL}/wallets/ghost-wallet/stocks/${stockName}`,
                JSON.stringify({ type: 'sell' }),
                { headers: { 'Content-Type': 'application/json' } }
            );
            check(res, { 'incorrect sell': (r) => r.status === 400 });
        } else {
            const res = http.post(
                `${BASE_URL}/wallets/${walletId}/stocks/FAKE`,
                JSON.stringify({ type: 'buy' }),
                { headers: { 'Content-Type': 'application/json' } }
            );
            check(res, { 'incorrect buy': (r) => r.status === 404 });
        }
        return;
    }

    // normal operation
    const quantityRes = http.get(`${BASE_URL}/wallets/${walletId}/stocks/${stockName}`);
    const quantity = quantityRes.status === 200 ? JSON.parse(quantityRes.body) : 0;
    const type = (quantity > 0 && Math.random() < 0.5) ? 'sell' : 'buy';

    const res = http.post(
        `${BASE_URL}/wallets/${walletId}/stocks/${stockName}`,
        JSON.stringify({ type }),
        { headers: { 'Content-Type': 'application/json' } }
    );

    if (type === 'buy') {
        check(res, { 'buy': (r) => r.status === 200 || r.status === 400 });
        if (res.status === 200) buySuccessCount.add(1);
        else buyFailCount.add(1);
    } else {
        check(res, { 'sell': (r) => r.status === 200 || r.status === 400 });
        if (res.status === 200) sellSuccessCount.add(1);
        else sellFailCount.add(1);
    }

    sleep(0.1);
}

export function teardown(data) {
    const stocksRes = http.get(`${BASE_URL}/stocks`);
    const bankStocks = JSON.parse(stocksRes.body).stocks;
    const bankTotal  = bankStocks.reduce((sum, s) => sum + s.quantity, 0);

    let walletTotal = 0;
    for (const walletId of WALLETS) {
        for (const stockName of STOCKS) {
            const res = http.get(`${BASE_URL}/wallets/${walletId}/stocks/${stockName}`);
            if (res.status === 200) {
                walletTotal += JSON.parse(res.body);
            }
        }
    }

    const finalTotal = bankTotal + walletTotal;

    // 3. Consistency check — this is the key assertion
    check(null, {
        [`bank(${bankTotal}) + wallets(${walletTotal}) = initial(${data.initialTotal})`]:
            () => finalTotal === data.initialTotal,
    });

    // log summary
    const logRes  = http.get(`${BASE_URL}/log`);
    const log     = JSON.parse(logRes.body).log;
    const logBuys  = log.filter(e => e.type === 'buy').length;
    const logSells = log.filter(e => e.type === 'sell').length;

    console.log(`Stocks in bank:      ${bankTotal}`);
    console.log(`Stocks in wallets:    ${walletTotal}`);
    console.log(`All stocks:     ${finalTotal} (expected: ${data.initialTotal})`);
    console.log(`Log entries:     ${log.length} (buy: ${logBuys}, sell: ${logSells})`);
}