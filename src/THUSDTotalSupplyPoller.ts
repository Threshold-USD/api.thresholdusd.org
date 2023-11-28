import { Decimal } from "@threshold-usd/lib-base";
import { EthersLiquity as EthersThresholdUsd } from "@threshold-usd/lib-ethers";

import { fetchTHUSDTotalSupply } from "./fetchTHUSDTotalSupply";

export class THUSDTotalSupplyPoller {
  private readonly _thresholdUsd: EthersThresholdUsd | Promise<EthersThresholdUsd>;

  private _totalSupply?: Decimal;
  private _latestBlockTag?: number;

  constructor(
    thresholdUsd: EthersThresholdUsd | Promise<EthersThresholdUsd>,
  ) {
    this._thresholdUsd = thresholdUsd;
  }

  async start(): Promise<void> {
    const thresholdUsd = await this._thresholdUsd;

    this._totalSupply = await fetchTHUSDTotalSupply(
      thresholdUsd
    );

    thresholdUsd.connection.provider.on("block", async (blockTag: number) => {
      const supply = await fetchTHUSDTotalSupply(thresholdUsd, blockTag);

      if (this._latestBlockTag === undefined || blockTag > this._latestBlockTag) {
        this._totalSupply = supply;
        this._latestBlockTag = blockTag;
      }
    });
  }

  get totalSupply(): Decimal {
    if (this._totalSupply === undefined) {
      throw new Error("Premature call (wait for start() to resolve first)");
    }

    return this._totalSupply;
  }
}
