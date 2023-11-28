import WebSocket from "ws";
import express from "express";

import { EXCLUDED_THUSD_HOLDERS, DEFAULT_NETWORK, DEFAULT_SERVER_PORT } from "./constants";
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
const thresholdUsd = connectToThresholdUsd(provider, network.chainId)

const circulatingSupplyPoller = new THUSDCirculatingSupplyPoller(thresholdUsd, EXCLUDED_THUSD_HOLDERS);
const totalSupplyPoller = new THUSDTotalSupplyPoller(thresholdUsd);

app.get("/circulatingSupply", (_req, res) => {
  res.send(`${circulatingSupplyPoller.latestCirculatingSupply}`);
});

app.get("/totalSupply", (_req, res) => {
  res.send(`${totalSupplyPoller.totalSupply}`);
});

Promise.all([circulatingSupplyPoller.start(), totalSupplyPoller.start()])
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}...`);
    });
  })
  .catch(error => {
    console.error("Error starting pollers:", error);
  });
