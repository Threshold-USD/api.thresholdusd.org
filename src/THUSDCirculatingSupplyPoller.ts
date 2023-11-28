import { Decimal } from "@threshold-usd/lib-base";
import { EthersLiquity as EthersThresholdUsd } from "@threshold-usd/lib-ethers";

import { fetchTHUSDCirculatingSupply } from "./fetchTHUSDCirculatingSupply";

export class THUSDCirculatingSupplyPoller {
  private readonly _thresholdUsdInstances: EthersThresholdUsd[];

  private _latestCirculatingSupply?: Decimal;
  private _latestBlockTag?: number;

  constructor(
    thresholdUsdInstances: EthersThresholdUsd[],
  ) {
    this._thresholdUsdInstances = thresholdUsdInstances;
  }

  async start(): Promise<void> {
    const thresholdUsdInstances = this._thresholdUsdInstances;

    this._latestCirculatingSupply = await fetchTHUSDCirculatingSupply(
      thresholdUsdInstances
    );

    thresholdUsdInstances[0].connection.provider.on("block", async (blockTag: number) => {
      const supply = await fetchTHUSDCirculatingSupply(thresholdUsdInstances, blockTag);

      if (this._latestBlockTag === undefined || blockTag > this._latestBlockTag) {
        this._latestCirculatingSupply = supply;
        this._latestBlockTag = blockTag;
      }
    });
  }

  get latestCirculatingSupply(): Decimal {
    if (this._latestCirculatingSupply === undefined) {
      throw new Error("Premature call (wait for start() to resolve first)");
    }

    return this._latestCirculatingSupply;
  }
}
