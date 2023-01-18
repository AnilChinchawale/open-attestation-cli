import { acceptSurrender } from "./accept-surrender.e2e";
import { surrender } from "./surrender.e2e";
import { changeHolder } from "./change-holder.e2e";
import { deployDocumentStore, deployTokenRegistry } from "./deploy.e2e";
import { endorseTransfer } from "./endorse-transfer.e2e";
import { mint } from "./mint.e2e";
import { nominate } from "./nominate.e2e";
import { rejectSurrender } from "./reject-surrender.e2e";
import { endorseChangeOwner } from "./endorse-change-owner.e2e";

const awaitForDuration = async (runFunction: () => void): Promise<void> => {
  await runFunction();
  console.log(runFunction.name);
};

awaitForDuration(deployDocumentStore);
awaitForDuration(deployTokenRegistry);

awaitForDuration(mint);

awaitForDuration(surrender);
awaitForDuration(rejectSurrender);
awaitForDuration(acceptSurrender);

awaitForDuration(nominate);
awaitForDuration(changeHolder);
awaitForDuration(endorseTransfer);
awaitForDuration(endorseChangeOwner);
