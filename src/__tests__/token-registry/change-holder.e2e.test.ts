import { deployTokenRegistry, mintTokenRegistry } from "../fixture/e2e/utils";
import { extractLine, LineInfo, run } from "../fixture/e2e/shell";
import { emoji, network, owner, receiver } from "../fixture/e2e/constants";
import { TitleEscrowTransferHolderCommand } from "../../commands/title-escrow/title-escrow-command.type";
import { generateChangeHolderCommand } from "../fixture/e2e/commands";

describe("transfer holder title-escrow", () => {
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

  const defaultTransferHolder = {
    newHolder: receiver.ethAddress,
    network: network,
    dryRun: false,
  };

  it("should be able to transfer holder title-escrow on token-registry", async () => {
    const { tokenRegistry, tokenId } = mintTokenRegistry(owner.privateKey, tokenRegistryAddress);
    const transferHolder: TitleEscrowTransferHolderCommand = {
      tokenId: tokenId,
      tokenRegistry: tokenRegistry,
      ...defaultTransferHolder,
    };
    const command = generateChangeHolderCommand(transferHolder, owner.privateKey);
    const results = run(command);
    const frontFormat = `${emoji.tick}  success   Transferable record with hash `;
    const middleFormat = `'s holder has been successfully changed to holder with address: `;
    const queryResults = extractLine(results, frontFormat);
    expect(queryResults).toBeTruthy();
    const filteredLine = (queryResults as LineInfo[])[0].lineContent.trim();
    const checkSuccess = filteredLine.includes(frontFormat);
    const checkContext = filteredLine.includes(middleFormat);
    expect(checkSuccess && checkContext).toBe(true);
    const resultTokenId = filteredLine.trim().substring(frontFormat.length, frontFormat.length + 66);
    expect(resultTokenId).toBe(transferHolder.tokenId);
    const destination = filteredLine.trim().substring(filteredLine.length - 42);
    expect(destination).toBe(transferHolder.newHolder);
  });
});
