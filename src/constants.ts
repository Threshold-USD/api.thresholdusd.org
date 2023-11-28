export const DEFAULT_SERVER_PORT = 8080;
export const DEFAULT_NETWORK = "mainnet";

export const DEFAULT_OUTPUT_DIR = "docs/v1";
export const THUSD_CIRCULATING_SUPPLY_FILE = "thusd_circulating_supply.txt";
export const THUSD_TOTAL_SUPPLY_FILE = "thusd_total_supply.txt";

export const EXCLUDED_THUSD_HOLDERS = Object.freeze([
  "0xA18Ab4Fa9a44A72c58e64bfB33D425Ec48475a9f", // ETH SP
  "0x1a4739509F50E683927472b03e251e36d07DD872", // ETH PCV Safe
  "0xF6374AEfb1e69a21ee516ea4B803b2eA96d06f29", // tBTC SP
  "0x097f1ee62E63aCFC3Bf64c1a61d96B3771dd06cB", // tBTC PCV Safe
]);
