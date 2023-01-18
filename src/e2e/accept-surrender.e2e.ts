import {
  checkFailure,
  checkSurrenderAcceptSuccess,
  deployTokenRegistry,
  mintSurrenderToken,
  mintTokenRegistry,
} from "./utils/helpers";
import { generateAcceptSurrenderCommand } from "./utils/commands";
import { BurnAddress, defaultRunParameters, EmptyTokenID, owner, receiver } from "./utils/constants";
import { getSigner, retrieveTitleEscrowOwner } from "./utils/contract-checks";
import { run } from "./utils/shell";

export const acceptSurrender = async (): Promise<void> => {
  const tokenRegistryAddress = deployTokenRegistry(owner.privateKey);
  // const errors: Error[] = [];
  const defaultTitleEscrow = {
    ...defaultRunParameters,
    beneficiary: owner.ethAddress,
    holder: owner.ethAddress,
  };

  //"should be able to accept-surrender title-escrow on token-registry"
  {
    const { tokenRegistry, tokenId } = mintSurrenderToken(owner.privateKey, tokenRegistryAddress);
    const command = generateAcceptSurrenderCommand({ tokenRegistry, tokenId, ...defaultTitleEscrow }, owner.privateKey);
    const signer = await getSigner(defaultTitleEscrow.network, owner.privateKey);
    let titleEscrowOwner: string = await retrieveTitleEscrowOwner(signer, tokenRegistry, tokenId);
    if (!(titleEscrowOwner === tokenRegistry)) throw new Error(`!(titleEscrowOwner === tokenRegistry)`);

    const results = run(command);
    titleEscrowOwner = await retrieveTitleEscrowOwner(signer, tokenRegistry, tokenId);
    if (!(titleEscrowOwner === "0x000000000000000000000000000000000000dEaD"))
      throw new Error(`!(titleEscrowOwner === "0x000000000000000000000000000000000000dEaD")`);
    checkSurrenderAcceptSuccess(results);
  }

  //"should not be able to accept surrender invalid title-escrow on token-registry"
  {
    const { tokenRegistry } = mintSurrenderToken(owner.privateKey, tokenRegistryAddress);
    const command = generateAcceptSurrenderCommand(
      { tokenRegistry, tokenId: EmptyTokenID, ...defaultTitleEscrow },
      owner.privateKey
    );
    const results = run(command);
    checkFailure(results, "missing revert data in call exception");
  }

  //"should not be able to accept surrender title-escrow on invalid token-registry"
  {
    const { tokenId } = mintSurrenderToken(owner.privateKey, tokenRegistryAddress);
    const command = generateAcceptSurrenderCommand(
      { tokenRegistry: BurnAddress, tokenId, ...defaultTitleEscrow },
      owner.privateKey
    );
    const results = run(command);
    checkFailure(results, "null");
  }

  //"should not be able to accept un-owned/held surrendered title-escrow on invalid token-registry"
  {
    const { tokenId } = mintSurrenderToken(owner.privateKey, tokenRegistryAddress);
    const command = generateAcceptSurrenderCommand(
      { tokenRegistry: tokenRegistryAddress, tokenId, ...defaultTitleEscrow },
      receiver.privateKey
    );
    const results = run(command);
    checkFailure(results, "missing revert data in call exception");
  }

  //"should not be able to accept un-surrendered title-escrow on token-registry"
  {
    const { tokenId } = mintTokenRegistry(owner.privateKey, tokenRegistryAddress);
    const command = generateAcceptSurrenderCommand(
      { tokenRegistry: tokenRegistryAddress, tokenId, ...defaultTitleEscrow },
      owner.privateKey
    );
    const results = run(command);
    checkFailure(results, "missing revert data in call exception");
  }
};
