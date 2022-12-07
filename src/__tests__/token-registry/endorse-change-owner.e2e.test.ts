import { deployTokenRegistry, mintNominatedToken } from "../fixture/e2e/utils";
import { extractLine, LineInfo, run } from "../fixture/e2e/shell";
import { emoji, network, owner, receiver } from "../fixture/e2e/constants";
import { TitleEscrowEndorseTransferOfOwnersCommand } from "../../commands/title-escrow/title-escrow-command.type";
import { generateTransferOwnersCommand } from "../fixture/e2e/commands";

describe("nominate title-escrow", () => {
  jest.setTimeout(90000);

  let tokenRegistryAddress = "";
  beforeAll(() => {
    tokenRegistryAddress = deployTokenRegistry(owner.privateKey);
  });

  // const defaultTitleEscrow = {
  //   beneficiary: owner.ethAddress,
  //   holder: owner.ethAddress,
  //   network: network,
  //   dryRun: false,
  // };

  const defaultTransferOwners = {
    newOwner: receiver.ethAddress,
    newHolder: receiver.ethAddress,
    network: network,
    dryRun: false,
  };

  it("should be able to nominate title-escrow on token-registry", async () => {
    const { tokenRegistry, tokenId } = mintNominatedToken(
      owner.privateKey,
      defaultTransferOwners.newOwner,
      tokenRegistryAddress
    );
    const transferOwners: TitleEscrowEndorseTransferOfOwnersCommand = {
      tokenId: tokenId,
      tokenRegistry: tokenRegistry,
      ...defaultTransferOwners,
    };
    const command = generateTransferOwnersCommand(transferOwners, owner.privateKey);
    const results = run(command);
    const frontFormat = `${emoji.tick}  success   Transferable record with hash `;
    const middleFormat = `'s holder has been successfully endorsed to new owner with address `;
    const rearFormat = ` and new holder with address: `;
    const queryResults = extractLine(results, frontFormat);
    expect(queryResults).toBeTruthy();
    const filteredLine = (queryResults as LineInfo[])[0].lineContent.trim();
    const checkSuccess = filteredLine.includes(frontFormat);
    const checkOwner = filteredLine.includes(middleFormat);
    const checkHolder = filteredLine.includes(rearFormat);
    expect(checkSuccess && checkOwner && checkHolder).toBe(true);
    const resultTokenId = filteredLine.trim().substring(frontFormat.length, frontFormat.length + 66);
    expect(resultTokenId).toBe(transferOwners.tokenId);
    const resultOwner = filteredLine
      .trim()
      .substring(frontFormat.length + 66 + middleFormat.length, frontFormat.length + 66 + middleFormat.length + 42);
    expect(resultOwner).toBe(transferOwners.newOwner);
    const destination = filteredLine.trim().substring(filteredLine.length - 42);
    expect(destination).toBe(transferOwners.newHolder);
  });
});
