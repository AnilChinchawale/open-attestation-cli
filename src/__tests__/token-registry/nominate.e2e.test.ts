// title-escrow nominate-change-owner --token-registry 0x4933e30eF8A083f49d14759b2eafC94E56F0b3A7 --tokenId 0x951b39bcaddc0e8882883db48ca258ca35ccb01fee328355f0dfda1ff9be9990 --newOwner 0xB26B4941941C51a4885E5B7D3A1B861E54405f90

import { deployTokenRegistry, generateTokenId, mintToken } from "../fixture/e2e/utils";
import { extractLine, LineInfo, run } from "../fixture/e2e/shell";
import { emoji, network, owner, receiver } from "../fixture/e2e/constants";
import { TokenRegistryIssueCommand } from "../../commands/token-registry/token-registry-command.type";
import { TitleEscrowNominateBeneficiaryCommand } from "../../commands/title-escrow/title-escrow-command.type";
import { generateNominateCommand } from "../fixture/e2e/commands";

describe("nominate title-escrow", () => {
  jest.setTimeout(90000);

  let tokenRegistryAddress = "";
  beforeAll(() => {
    tokenRegistryAddress = deployTokenRegistry(owner.privateKey);
  });

  const defaultTitleEscrow = {
    beneficiary: owner.ethAddress,
    holder: owner.ethAddress,
    network: network,
    dryRun: false,
  };

  const defaultTransferHolder = {
    newBeneficiary: receiver.ethAddress,
    network: network,
    dryRun: false,
  };

  it("should be able to nominate title-escrow on token-registry", async () => {
    const tokenId = generateTokenId();
    const titleEscrow: TokenRegistryIssueCommand = {
      address: tokenRegistryAddress,
      tokenId: tokenId,
      ...defaultTitleEscrow,
    };
    mintToken(owner.privateKey, titleEscrow);
    const transferHolder: TitleEscrowNominateBeneficiaryCommand = {
      tokenId: titleEscrow.tokenId,
      tokenRegistry: titleEscrow.address,
      ...defaultTransferHolder,
    };
    const command = generateNominateCommand(transferHolder, owner.privateKey);
    const results = run(command);
    const frontFormat = `${emoji.tick}  success   Transferable record with hash `;
    const middleFormat = `'s holder has been successfully nominated to new owner with address `;
    const queryResults = extractLine(results, frontFormat);
    expect(queryResults).toBeTruthy();
    const filteredLine = (queryResults as LineInfo[])[0].lineContent.trim();
    const checkSuccess = filteredLine.includes(frontFormat);
    const checkContext = filteredLine.includes(middleFormat);
    expect(checkSuccess && checkContext).toBe(true);
    const resultTokenId = filteredLine.trim().substring(frontFormat.length, frontFormat.length + 66);
    expect(resultTokenId).toBe(transferHolder.tokenId);
    const destination = filteredLine.trim().substring(filteredLine.length - 42);
    expect(destination).toBe(transferHolder.newBeneficiary);
  });
});
