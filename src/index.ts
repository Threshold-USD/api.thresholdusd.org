import WebSocket from "ws";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { DEFAULT_NETWORK, DEFAULT_SERVER_PORT } from "./constants";
import { connectToThresholdUsd } from "./connection";
import { THUSDCirculatingSupplyPoller } from "./THUSDCirculatingSupplyPoller";
import { getNetwork } from "@ethersproject/networks";
import { AlchemyProvider } from "@ethersproject/providers";

import { Batched, WebSocketAugmented } from "@threshold-usd/providers";
import { THUSDTotalSupplyPoller } from "./THUSDTotalSupplyPoller";

dotenv.config();
Object.assign(globalThis, { WebSocket });
const BatchedWebSocketAugmentedAlchemyProvider = Batched(WebSocketAugmented(AlchemyProvider));

const PORT = process.env.PORT || DEFAULT_SERVER_PORT;
const alchemyApiKey = process.env.ALCHEMY_API_KEY;

const app = express();
const network = getNetwork(DEFAULT_NETWORK);
const provider = new BatchedWebSocketAugmentedAlchemyProvider(network, alchemyApiKey);
app.use(helmet()); // Secure HTTP headers
app.use(express.json()); // Body parsing

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://your-allowed-domain.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const main = async () => {
  try {
    const thresholdUsdInstances = await connectToThresholdUsd(provider, network.chainId);

    const circulatingSupplyPoller = new THUSDCirculatingSupplyPoller(thresholdUsdInstances);
    const totalSupplyPoller = new THUSDTotalSupplyPoller(thresholdUsdInstances[0]);

    app.get("/circulatingSupply", (_req, res) => {
      if (circulatingSupplyPoller.latestCirculatingSupply) {
        res.status(200).send(`${circulatingSupplyPoller.latestCirculatingSupply}`);
      } else {
        res.status(503).send("Circulating supply unavailable.");
      }
    });

    app.get("/totalSupply", (_req, res) => {
      if (totalSupplyPoller.totalSupply) {
        res.status(200).send(`${totalSupplyPoller.totalSupply}`);
      } else {
        res.status(503).send("Total supply unavailable.");
      }
    });

    await Promise.all([circulatingSupplyPoller.start(), totalSupplyPoller.start()]);

    app.use((_req, res) => {
      const path = _req.path;
      if (/[^a-zA-Z0-9/_-]/.test(path)) {
        return res.status(403).send('403 Forbidden: Invalid path');
      }
      res.status(404).send('404 Not Found: The requested resource does not exist.');
    });

    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}...`);
    });
  } catch (error) {
    console.error("Error starting pollers:", error);
  }
}

main();
