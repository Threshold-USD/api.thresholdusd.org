import { BigNumber } from "@ethersproject/bignumber";
import { Contract, CallOverrides } from "@ethersproject/contracts";
import { Decimal } from "@threshold-usd/lib-base";
import { EthersLiquity as EthersThresholdUsd } from "@threshold-usd/lib-ethers";

const pcvDebtToPayAbi = ["function debtToPay() view returns (uint256)"];

interface ERC20TotalSupply {
  debtToPay(overrides?: CallOverrides): Promise<BigNumber>;
}

const pcvFrom = (thresholdUsd: EthersThresholdUsd): ERC20TotalSupply =>
  new Contract(
    thresholdUsd.connection.addresses["pcv"],
    pcvDebtToPayAbi,
    thresholdUsd.connection.provider
  ) as unknown as ERC20TotalSupply;

export const queryDebtToPay = async (thresholdUsd: EthersThresholdUsd, blockTag?: number): Promise<Decimal> =>
  {
    const debtToPay = await pcvFrom(thresholdUsd).debtToPay({ blockTag })
    return Decimal.fromBigNumberString(debtToPay.toHexString());
  }
  
