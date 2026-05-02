import express from "express";
import walletsRouter from "./routes/wallets.routes";
import stocksRouter from "./routes/stocks.routes";
import logRouter from "./routes/log.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());

app.use('/wallets', walletsRouter);
app.use('/stocks', stocksRouter);
app.use('/log', logRouter);

app.post('/chaos', (req, res) => {
    res.status(200).send();
    process.exit(0);
});

app.use(errorHandler);

export default app