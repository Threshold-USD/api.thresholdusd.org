import fs from "fs";
import path from "path";

import { connectToThresholdUsd } from "./connection";
import { fetchTHUSDCirculatingSupply } from "./fetchTHUSDCirculatingSupply";
import { fetchTHUSDTotalSupply } from "./fetchTHUSDTotalSupply";

import {
  DEFAULT_NETWORK,
  DEFAULT_OUTPUT_DIR,
  EXCLUDED_THUSD_HOLDERS,
  THUSD_CIRCULATING_SUPPLY_FILE,
  THUSD_TOTAL_SUPPLY_FILE
} from "./constants";

import { Batched, WebSocketAugmented } from "@threshold-usd/providers";
import { getNetwork } from "@ethersproject/networks";
import { AlchemyProvider } from "@ethersproject/providers";

const BatchedWebSocketAugmentedAlchemyProvider = Batched(WebSocketAugmented(AlchemyProvider));

const alchemyApiKey = process.env.ALCHEMY_API_KEY || undefined; // filter out empty string

const outputDir = DEFAULT_OUTPUT_DIR;
const thusdCirculatingSupplyFile = path.join(outputDir, THUSD_CIRCULATING_SUPPLY_FILE);
const thusdTotalSupplyFile = path.join(outputDir, THUSD_TOTAL_SUPPLY_FILE);

const network = getNetwork(DEFAULT_NETWORK);
const provider = new BatchedWebSocketAugmentedAlchemyProvider(network, alchemyApiKey);

connectToThresholdUsd(provider, network.chainId)
  .then(async thresholdUsd => {
    const [thusdCirculatingSupply, thusdTotalSupply] = await Promise.all([
      fetchTHUSDCirculatingSupply(thresholdUsd, EXCLUDED_THUSD_HOLDERS),
      fetchTHUSDTotalSupply(thresholdUsd)
    ]);

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(thusdCirculatingSupplyFile, `${thusdCirculatingSupply}`);
    fs.writeFileSync(thusdTotalSupplyFile, `${thusdTotalSupply}`);

    console.log(`Latest THUSD circulating supply: ${thusdCirculatingSupply}`);
    console.log(`Latest THUSD total supply: ${thusdTotalSupply}`);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
