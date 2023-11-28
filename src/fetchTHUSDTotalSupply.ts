import { BigNumber } from "@ethersproject/bignumber";
import { Contract, CallOverrides } from "@ethersproject/contracts";
import { Decimal } from "@threshold-usd/lib-base";
import { EthersLiquity as EthersThresholdUsd } from "@threshold-usd/lib-ethers";

const erc20TotalSupplyAbi = ["function totalSupply() view returns (uint256)"];

interface ERC20TotalSupply {
  totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
}

const thusdTokenFrom = (thresholdUsd: EthersThresholdUsd): ERC20TotalSupply =>
  new Contract(
    thresholdUsd.connection.addresses["thusdToken"],
    erc20TotalSupplyAbi,
    thresholdUsd.connection.provider
  ) as unknown as ERC20TotalSupply;

export const fetchTHUSDTotalSupply = (thresholdUsd: EthersThresholdUsd, blockTag?: number): Promise<Decimal> =>
  thusdTokenFrom(thresholdUsd)
    .totalSupply({ blockTag })
    .then(bigNumber => Decimal.fromBigNumberString(bigNumber.toHexString()));
