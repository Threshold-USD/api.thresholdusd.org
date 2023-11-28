import { Decimal } from "@threshold-usd/lib-base";
import { EthersLiquity as EthersThresholdUsd } from "@threshold-usd/lib-ethers";

import { fetchTHUSDCirculatingSupply } from "./fetchTHUSDCirculatingSupply";

export class THUSDCirculatingSupplyPoller {
  private readonly _thresholdUsd: EthersThresholdUsd | Promise<EthersThresholdUsd>;
  private readonly _excludedAddresses: readonly string[];

  private _latestCirculatingSupply?: Decimal;
  private _latestBlockTag?: number;

  constructor(
    thresholdUsd: EthersThresholdUsd | Promise<EthersThresholdUsd>,
    excludedAddresses: readonly string[]
  ) {
    this._thresholdUsd = thresholdUsd;
    this._excludedAddresses = excludedAddresses;
  }

  async start(): Promise<void> {
    const thresholdUsd = await this._thresholdUsd;

    this._latestCirculatingSupply = await fetchTHUSDCirculatingSupply(
      thresholdUsd,
      this._excludedAddresses
    );

    thresholdUsd.connection.provider.on("block", async (blockTag: number) => {
      const supply = await fetchTHUSDCirculatingSupply(thresholdUsd, this._excludedAddresses, blockTag);

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
