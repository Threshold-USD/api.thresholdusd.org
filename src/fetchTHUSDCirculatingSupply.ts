import { Decimal } from "@threshold-usd/lib-base";
import { EthersLiquity as EthersThresholdUsd } from "@threshold-usd/lib-ethers";
import { fetchTHUSDTotalSupply } from "./fetchTHUSDTotalSupply";

export const fetchTHUSDCirculatingSupply = async (
  thresholdUsd: EthersThresholdUsd,
  excludedAddresses: readonly string[],
  blockTag?: number
): Promise<Decimal> => {
  const thusdTotalSupply = await fetchTHUSDTotalSupply(thresholdUsd)
  return Promise.all(excludedAddresses.map(address => thresholdUsd.getTHUSDBalance(address, { blockTag }))).then(
    lockedTHUSD => {
      console.log("lockedTHUSD: ", lockedTHUSD)
      return lockedTHUSD.reduce((a, b) => a.sub(b), thusdTotalSupply)
    }
  )
}
