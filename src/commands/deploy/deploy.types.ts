import { GasOption, NetworkAndWalletSignerOption } from "../shared";

export type DeployDocumentStoreCommand = NetworkAndWalletSignerOption &
  GasOption & {
    storeName: string;
    walletPassword?: string;
  };

export type DeployTokenRegistryCommand = NetworkAndWalletSignerOption &
  GasOption & {
    registryName: string;
    registrySymbol: string;
    verify?: boolean;
    standalone?: boolean;
    factoryAddress?: string;
  };
