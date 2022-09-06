import { TradeTrustERC721__factory } from "@govtechsg/token-registry/contracts";
import { Wallet } from "ethers";
import { join } from "path";
import { TokenRegistryIssueCommand } from "../../commands/token-registry/token-registry-command.type";
import { addAddressPrefix } from "../../utils";
import { issueToTokenRegistry } from "./issue";

jest.mock("@govtechsg/token-registry/contracts");

const deployParams: TokenRegistryIssueCommand = {
  beneficiary: "0xabcd",
  holder: "0xabce",
  tokenId: "0xzyxw",
  address: "0x1234",
  network: "ropsten",
  gasPriceScale: 1,
  dryRun: false,
};

// TODO the following test is very fragile and might break on every interface change of TradeTrustERC721Factory
// ideally must setup ganache, and run the function over it
describe("token-registry", () => {
  describe("issue", () => {
    jest.setTimeout(30000);
    const mockedTradeTrustERC721Factory: jest.Mock<TradeTrustERC721__factory> = TradeTrustERC721__factory as any;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock static method
    const mockedConnectERC721: jest.Mock = mockedTradeTrustERC721Factory.connect;
    const mockedIssue = jest.fn();
    const mockCallStaticSafeMint = jest.fn().mockResolvedValue(undefined);

    mockedIssue.mockReturnValue({
      hash: "hash",
      wait: () => Promise.resolve({ transactionHash: "transactionHash" }),
    });

    const mockTTERC721Contract = {
      mint: mockedIssue,
      callStatic: {
        mint: mockCallStaticSafeMint,
      },
    };

    beforeEach(() => {
      delete process.env.OA_PRIVATE_KEY;
      mockedTradeTrustERC721Factory.mockClear();
      mockCallStaticSafeMint.mockClear();
      mockedConnectERC721.mockReset();
      mockedConnectERC721.mockResolvedValue(mockTTERC721Contract);
    });

    it("should take in the key from environment variable", async () => {
      process.env.OA_PRIVATE_KEY = "0000000000000000000000000000000000000000000000000000000000000002";

      await issueToTokenRegistry(deployParams);
      const passedSigner: Wallet = mockedConnectERC721.mock.calls[0][1];
      expect(passedSigner.privateKey).toBe(`0x${process.env.OA_PRIVATE_KEY}`);
    });

    it("should take in the key from key file", async () => {
      await issueToTokenRegistry({
        ...deployParams,
        keyFile: join(__dirname, "..", "..", "..", "examples", "sample-key"),
      });

      const passedSigner: Wallet = mockedConnectERC721.mock.calls[0][1];
      expect(passedSigner.privateKey).toBe(`0x0000000000000000000000000000000000000000000000000000000000000003`);
    });

    it("should pass in the correct params and return the deployed instance", async () => {
      const privateKey = "0000000000000000000000000000000000000000000000000000000000000001";
      const instance = await issueToTokenRegistry({
        ...deployParams,
        key: privateKey,
      });

      const passedSigner: Wallet = mockedConnectERC721.mock.calls[0][1];
      expect(passedSigner.privateKey).toBe(`0x${privateKey}`);
      expect(mockedConnectERC721.mock.calls[0][0]).toEqual(deployParams.address);
      expect(mockedIssue.mock.calls[0][0]).toEqual(deployParams.beneficiary);
      expect(mockedIssue.mock.calls[0][1]).toEqual(deployParams.holder);
      expect(mockedIssue.mock.calls[0][2]).toEqual(deployParams.tokenId);
      expect(mockCallStaticSafeMint).toHaveBeenCalledTimes(1);
      expect(instance).toStrictEqual({ transactionHash: "transactionHash" });
    });

    it("should accept tokenId without 0x prefix and return deployed instance", async () => {
      const privateKey = "0000000000000000000000000000000000000000000000000000000000000001";
      const instance = await issueToTokenRegistry({
        ...deployParams,
        key: privateKey,
        tokenId: addAddressPrefix("zyxw"),
      });

      const passedSigner: Wallet = mockedConnectERC721.mock.calls[0][1];
      expect(passedSigner.privateKey).toBe(`0x${privateKey}`);
      expect(mockedConnectERC721.mock.calls[0][0]).toEqual(deployParams.address);
      expect(mockedIssue.mock.calls[0][0]).toEqual(deployParams.beneficiary);
      expect(mockedIssue.mock.calls[0][1]).toEqual(deployParams.holder);
      expect(mockedIssue.mock.calls[0][2]).toEqual(deployParams.tokenId);
      expect(mockCallStaticSafeMint).toHaveBeenCalledTimes(1);
      expect(instance).toStrictEqual({ transactionHash: "transactionHash" });
    });

    it("should throw when keys are not found anywhere", async () => {
      await expect(issueToTokenRegistry(deployParams)).rejects.toThrow(
        "No private key found in OA_PRIVATE_KEY, key, key-file, please supply at least one or supply an encrypted wallet path, or provide aws kms signer information"
      );
    });
  });
});
