import signale from "signale";
import { getLogger } from "../../logger";
import { getWallet } from "../utils/wallet";
import { connectToTitleEscrow, validateEndorseTranserOwner } from "./helpers";
import { BaseTitleEscrowCommand as TitleEscrowEndorseTransferOfOwnerCommand } from "../../commands/title-escrow/title-escrow-command.type";

import { dryRunMode } from "../utils/dryRun";
import { TransactionReceipt } from "@ethersproject/providers";

const { trace } = getLogger("token-registry:endorseTransferOfOwner");

export const endorseTransferOfOwner = async ({
  address,
  tokenId,
  network,
  key,
  keyFile,
  gasPriceScale,
  encryptedWalletPath,
  dryRun,
}: TitleEscrowEndorseTransferOfOwnerCommand): Promise<{
  transactionReceipt: TransactionReceipt;
  approvedOwner: string;
  approvedHolder: string;
}> => {
  const wallet = await getWallet({ key, keyFile, network, encryptedWalletPath });
  if (dryRun) {
    const titleEscrow = await connectToTitleEscrow({ tokenId, address, wallet });
    const approvedBeneficiary = await titleEscrow.approvedBeneficiary();
    const approvedHolder = await titleEscrow.approvedHolder();
    await validateEndorseTranserOwner({ approvedOwner: approvedBeneficiary, approvedHolder });
    await dryRunMode({
      gasPriceScale: gasPriceScale,
      estimatedGas: await titleEscrow.estimateGas.transferToNewEscrow(approvedBeneficiary, approvedHolder),
      network,
    });
    process.exit(0);
  }
  const gasPrice = await wallet.provider.getGasPrice();
  signale.await(`Sending transaction to pool`);
  const titleEscrow = await connectToTitleEscrow({ tokenId, address, wallet });
  const approvedBeneficiary = await titleEscrow.approvedBeneficiary();
  const approvedHolder = await titleEscrow.approvedHolder();
  await validateEndorseTranserOwner({ approvedOwner: approvedBeneficiary, approvedHolder });
  const transaction = await titleEscrow.transferToNewEscrow(approvedBeneficiary, approvedHolder, {
    gasPrice: gasPrice.mul(gasPriceScale),
  });
  trace(`Tx hash: ${transaction.hash}`);
  trace(`Block Number: ${transaction.blockNumber}`);
  signale.await(`Waiting for transaction ${transaction.hash} to be mined`);
  const transactionReceipt = await transaction.wait();
  return {
    transactionReceipt,
    approvedOwner: approvedBeneficiary,
    approvedHolder,
  };
};
