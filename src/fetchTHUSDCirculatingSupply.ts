import { Decimal } from "@threshold-usd/lib-base";
import { EthersLiquity as EthersThresholdUsd } from "@threshold-usd/lib-ethers";
import { fetchTHUSDTotalSupply } from "./fetchTHUSDTotalSupply";
import { queryDebtToPay } from "./queryDebtToPay";

export const fetchTHUSDCirculatingSupply = async (
  thresholdUsdInstances: EthersThresholdUsd[],
  blockTag?: number
): Promise<Decimal> => {
  const thusdTotalSupply = await fetchTHUSDTotalSupply(thresholdUsdInstances[0])

  return Promise.all(thresholdUsdInstances.map(instance => queryDebtToPay(instance, blockTag))).then(
    debtsToPay => {
      console.log("debtsToPay: ", debtsToPay)
      return debtsToPay.reduce((acc, curr) => acc.sub(curr), thusdTotalSupply)
    }
  )
}
