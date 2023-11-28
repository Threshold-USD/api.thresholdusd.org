import { CollateralsVersionedDeployments, EthersLiquity, EthersLiquityConnection, EthersProvider, _connectByChainId, getCollateralsDeployments } from "@threshold-usd/lib-ethers";

type SupportedNetworks = {
  [key: string]: "homestead" | "goerli" | "sepolia";
};

export const supportedNetworks: SupportedNetworks = { 1: "homestead", 5: "goerli", 11155111: "sepolia"};

function iterateVersions(collaterals: CollateralsVersionedDeployments) {
  const result = [];

  for (const collateral in collaterals) {
    if (collaterals[collateral]) {
      const versions = collaterals[collateral];

      for (const version in versions) {
        if (versions[version]) {
          const versionObj = {
            collateral: collateral,
            version: version,
            deployment: versions[version]
          };
          result.push(versionObj);
        }
      }
    }
  }
  return result;
}

const getCollateralVersions = async (chainId: number): Promise<CollateralsVersionedDeployments> => {
  const network = supportedNetworks[chainId];
  return await getCollateralsDeployments(network === "homestead" ? "mainnet" : network);
}

export async function connectToThresholdUsd(
  provider: EthersProvider, 
  chainId: number
) {
  const collaterals = await getCollateralVersions(chainId)
  const versionsArray = iterateVersions(collaterals);

  const connectionsByChainId: (EthersLiquityConnection & { useStore: "blockPolled"; })[] = versionsArray.map(version => 
    _connectByChainId(
      version.collateral,
      version.version, 
      version.deployment, 
      provider, 
      undefined, 
      chainId, 
      { useStore: "blockPolled" }
    )
  )
  const ethersThresholdFromConnection = EthersLiquity._from(connectionsByChainId[0]);
  ethersThresholdFromConnection.store.logging = true;
  return ethersThresholdFromConnection
}
