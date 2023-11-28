import WebSocket from "ws";
import express from "express";

import { DEFAULT_NETWORK, DEFAULT_SERVER_PORT } from "./constants";
import { connectToThresholdUsd } from "./connection";
import { THUSDCirculatingSupplyPoller } from "./THUSDCirculatingSupplyPoller";
import { getNetwork } from "@ethersproject/networks";
import { AlchemyProvider } from "@ethersproject/providers";

import dotenv from "dotenv";
import { Batched, WebSocketAugmented } from "@threshold-usd/providers";
import { THUSDTotalSupplyPoller } from "./THUSDTotalSupplyPoller";

dotenv.config();
Object.assign(globalThis, { WebSocket });
const BatchedWebSocketAugmentedAlchemyProvider = Batched(WebSocketAugmented(AlchemyProvider));

const PORT = process.env.PORT || DEFAULT_SERVER_PORT;
const alchemyApiKey = process.env.ALCHEMY_API_KEY

const app = express();
const network = getNetwork(DEFAULT_NETWORK);
const provider = new BatchedWebSocketAugmentedAlchemyProvider(network, alchemyApiKey);

const main = async () => {
  try {
    const thresholdUsdInstances = await connectToThresholdUsd(provider, network.chainId);

    const circulatingSupplyPoller = new THUSDCirculatingSupplyPoller(thresholdUsdInstances);
    const totalSupplyPoller = new THUSDTotalSupplyPoller(thresholdUsdInstances[0]);

    app.get("/circulatingSupply", (_req, res) => {
      res.send(`${circulatingSupplyPoller.latestCirculatingSupply}`);
    });

    app.get("/totalSupply", (_req, res) => {
      res.send(`${totalSupplyPoller.totalSupply}`);
    });

    await Promise.all([circulatingSupplyPoller.start(), totalSupplyPoller.start()]);

    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}...`);
    });
  } catch (error) {
    console.error("Error starting pollers:", error);
  }
}

main();
